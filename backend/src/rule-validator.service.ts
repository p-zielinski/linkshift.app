import { Injectable } from '@nestjs/common';
import { RedirectService } from './redirect.service';
import dayjs from "dayjs";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

@Injectable()
export class RuleValidatorService {
  private readonly KNOWN_VARIABLES = [
    'domain.fqdn',
    'domain.label',
    'domain.root',
    'domain.extension',
    'domain.subdomain',
    'path',
    'method',
    'scheme',
    'ip',
    'userAgent',
    'random',
    'geo.country',
  ];

  validate(source: string, destination: string): ValidationResult {

    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    const captureGroupCount = this.validateSource(source, result);
    this.validateDestination(destination, result, captureGroupCount);

    if (result.errors.length > 0) {
      result.isValid = false;
    }

    return result;
  }

  private validateSource(source: string, result: ValidationResult): number {
    if (!source) {
      result.errors.push('Source cannot be empty');
      return 0;
    }

    // Check if it's a Regex
    if (source.startsWith('/') && source.lastIndexOf('/') > 0) {
      try {
        // Extract regex body and flags
        const lastSlashIndex = source.lastIndexOf('/');
        const pattern = source.substring(1, lastSlashIndex);
        const flags = source.substring(lastSlashIndex + 1);

        // Attempt compilation
        new RegExp(pattern, flags);

        // Count capturing groups (primitive approach, but sufficient for most cases)
        // Look for opening parentheses that are not escaped and not non-capturing groups (?:)
        const capturingGroups = pattern.match(/(?<!\\)\((?!\?:)/g);
        return capturingGroups ? capturingGroups.length : 0;
      } catch (e) {
        result.errors.push(`Invalid Regex in source: ${e.message}`);
        return 0;
      }
    }

    return 0;
  }

  private validateDestination(
    destination: string,
    result: ValidationResult,
    maxCaptureGroups: number,
  ): void {
    if (!destination) {
      result.errors.push('Destination cannot be empty');
      return;
    }

    // 0. Validate Conditional Logic (Brackets, time/date functions)
    this.validateConditionalSyntax(destination, result);

    // 1. Check regex groups ($1, $2...)
    const regexGroups = destination.match(/\$(\d+)/g);

    if (regexGroups) {
      regexGroups.forEach((group) => {
        const index = parseInt(group.substring(1), 10);
        if (index > maxCaptureGroups) {
          result.errors.push(
            `Destination uses group $${index}, but source only has ${maxCaptureGroups} capturing group(s).`,
          );
        }
      });
    }

    // 2. Analyze placeholders {variable:modifiers}
    // Using the same regex as in RedirectService
    const placeholderRegex = /(?<!\{)\{([^{}]+)\}(?!\})/g;
    let match;

    while ((match = placeholderRegex.exec(destination)) !== null) {
      const content = match[1];
      // Ignore empty brackets if they occur, though the regex above requires at least 1 character
      if (!content) continue;

      const [key, modifierChain] = content.split(':');

      // Key (variable) validation
      this.validateVariable(key, result);

      // Modifier chain validation
      if (modifierChain) {
        this.validateModifiers(modifierChain, result);
      }
    }
  }

  private validateVariable(key: string, result: ValidationResult): void {
    if (!key) return; // Empty key is OK if only modifiers are present (e.g., {:random})

    // Check dynamic prefixes
    if (
      key.startsWith('query.') ||
      key.startsWith('segments.') ||
      key.startsWith('domain.subdomains.')
    ) {
      return; // Dynamic variables are always valid
    }

    if (!this.KNOWN_VARIABLES.includes(key)) {
      // Suggest a fix?
      const suggestion = this.findClosestMatch(key, this.KNOWN_VARIABLES);
      const msg = `Unknown variable: "${key}".`;
      result.errors.push(
        suggestion ? `${msg} Did you mean "${suggestion}"?` : msg,
      );
    }
  }

  private validateConditionalSyntax(
      destination: string,
      result: ValidationResult,
  ): void {
    // Only strictly validate if it looks like a conditional
    if (!destination.includes('?') || !destination.includes(':')) {
      return;
    }

    // Validate datetime() calls
    const datetimeRegex = /datetime\s*\(\s*(['"])(.*?)\1\s*(?:,\s*(['"])(.*?)\3)?\s*\)/g;
    let match;
    while ((match = datetimeRegex.exec(destination)) !== null) {
      const dateStr = match[2];
      const tz = match[4];

      if (!dateStr) {
        result.errors.push(`datetime() requires at least one argument.`);
        continue;
      }

      // Check date validity
      const isValidDate = dayjs(dateStr).isValid();
      if (!isValidDate) {
        result.errors.push(`Invalid date format in datetime(): "${dateStr}".`);
      }

      // Check timezone validity if present
      if (tz) {
        try {
          // This throws if TZ is invalid and timezone plugin is loaded
          // However, dayjs.tz() usually just returns invalid date or UTC fallback depending on config.
          // A reliable check is:
          if (dayjs.tz(dateStr, tz).toString() === 'Invalid Date') {
            // It might be the date or the tz. Since we checked date above (loosely),
            // let's assume strict TZ check if possible.
            // But actually Intl.DateTimeFormat is the underlying engine
            Intl.DateTimeFormat(undefined, { timeZone: tz });
          }
        } catch (e) {
          result.errors.push(`Invalid timezone in datetime(): "${tz}".`);
        }
      }
    }
  }

  private validateModifiers(chain: string, result: ValidationResult): void {
    const modifiers = chain.split('.');
    const availableManipulators = Object.keys(RedirectService.manipulators);

    modifiers.forEach((mod) => {
      if (!availableManipulators.includes(mod)) {
        const suggestion = this.findClosestMatch(mod, availableManipulators);
        const msg = `Unknown manipulator: "${mod}".`;
        result.errors.push(
          suggestion ? `${msg} Did you mean "${suggestion}"?` : msg,
        );
      }
    });
  }

  // Simple Levenshtein algorithm for suggestions
  private findClosestMatch(input: string, candidates: string[]): string | null {
    if (!input) return null;

    let bestMatch: string | null = null;
    let bestDistance = Infinity;

    for (const candidate of candidates) {
      const dist = this.levenshtein(input, candidate);
      if (dist < bestDistance) {
        bestDistance = dist;
        bestMatch = candidate;
      }
    }

    // Return suggestion only if it's close enough (e.g., less than 3 changes for short words)
    return bestDistance <= 3 ? bestMatch : null;
  }

  private levenshtein(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1),
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }
}
