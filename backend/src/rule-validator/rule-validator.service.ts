import { Injectable } from '@nestjs/common';
import { RedirectService } from '../redirect/redirect.service';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { REDIRECT_ENGINE_LIMITS } from '../constants';

dayjs.extend(utc);
dayjs.extend(timezone);

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
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
    'user-agent',
    'geo.country',
  ];

  private readonly ALLOWED_OPERATORS = [
    '==',
    '!=',
    '<=',
    '>=',
    '~=',
    'includes',
    '<',
    '>',
  ];

  validate(source: string, destination: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
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
      } catch (e: any) {
        result.errors.push(`Invalid Regex in source: ${e?.message}`);
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

    // Recursive validation of logic structure
    this.processDestinationLogic(destination, result, maxCaptureGroups, 0);
  }

  private processDestinationLogic(
    segment: string,
    result: ValidationResult,
    maxCaptureGroups: number,
    depth: number,
  ): void {
    if (depth > REDIRECT_ENGINE_LIMITS.MAX_RECURSION_DEPTH) {
      result.errors.push(
        `Logic is too complex. Maximum nesting depth of ${REDIRECT_ENGINE_LIMITS.MAX_RECURSION_DEPTH} exceeded.`,
      );
      return;
    }

    let trimmed = segment.trim();

    // Unwrap outer parentheses carefully
    while (this.hasOuterParentheses(trimmed)) {
      trimmed = trimmed.substring(1, trimmed.length - 1).trim();
    }

    const isUrlLike =
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('/');
    if (isUrlLike) {
      this.validateLeaf(trimmed, result, maxCaptureGroups);
      return;
    }

    // Check for conditional logic (Top-level ternary split)
    if (trimmed.includes('?')) {
      const split = this.splitConditional(trimmed);

      if (split) {
        // It's a valid conditional structure
        this.validateCondition(split.condition, result);
        this.processDestinationLogic(
          split.truePart,
          result,
          maxCaptureGroups,
          depth + 1,
        );
        this.processDestinationLogic(
          split.falsePart,
          result,
          maxCaptureGroups,
          depth + 1,
        );
        return;
      } else {
        // Contains '?' but failed to split properly.
        // It could be a valid URL with query params, OR broken logic.

        const isUrlLike =
          trimmed.startsWith('http') ||
          trimmed.startsWith('https') ||
          trimmed.startsWith('/');

        // If it DOES NOT start like a URL, assume it was meant to be logic but failed
        if (!isUrlLike) {
          result.errors.push(
            `Invalid conditional logic structure. Found '?' but could not determine condition and branches. Check for matching parentheses or missing ':' operator in: "${trimmed}"`,
          );
          // Stop processing this branch to avoid cascading "invalid URL" errors
          return;
        }

        // If it looks like a URL, we proceed to validateLeaf,
        // effectively treating '?' as part of the query string.
      }
    }

    // It's a leaf (final destination string)
    this.validateLeaf(trimmed, result, maxCaptureGroups);
  }

  private validateLeaf(
    target: string,
    result: ValidationResult,
    maxCaptureGroups: number,
  ): void {
    // 1. Regex Groups
    const regexGroups = target.match(/\$(\d+)/g);
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

    // 2. Placeholders {variable:modifiers}
    const placeholderRegex = /(?<!\{)\{([^{}]+)\}(?!\})/g;
    let match;
    while ((match = placeholderRegex.exec(target)) !== null) {
      const content = match[1];
      if (!content) continue;

      const [key, modifierChain] = content.split(':');
      this.validateVariable(key, result);

      if (modifierChain) {
        this.validateModifiers(modifierChain, result);
      }
    }

    // 3. URL Structure Validation
    this.validateUrlStructure(target, result);
  }

  private validateUrlStructure(
    destination: string,
    result: ValidationResult,
  ): void {
    // We create a mock version of the string where variables/groups are replaced
    // to check the structural validity of the URL.
    let mock = destination.replace(/\$\d+/g, '1'); // Replace $1, $2 with '1'
    mock = mock.replace(/(?<!\{)\{([^{}]+)\}(?!\})/g, 'slug'); // Replace {var} with 'slug'
    mock = mock.trim();

    if (!mock) return;

    // Rule: Destination must parse to an external URL.
    // We enforce starting with http:// or https:// only.
    const allowedPrefixes = ['http://', 'https://'];
    const hasValidPrefix = allowedPrefixes.some((p) => mock.startsWith(p));

    if (!hasValidPrefix) {
      result.errors.push(
        `Destination must start with 'http://' or 'https://'. Found: "${destination}"`,
      );
      return;
    }

    // Try parsing as URL
    try {
      if (mock.startsWith('/')) {
        // Relative path validation
        new URL(mock, 'http://example.com');
      } else {
        // Absolute URL validation
        new URL(mock);
      }
    } catch (e) {
      result.errors.push(
        `Destination is not a valid URL structure: ${e.message}`,
      );
    }
  }

  private validateCondition(condition: string, result: ValidationResult): void {
    // 1. Preprocess: remove outer parentheses to get to the core logic
    let trimmed = condition.trim();
    while (this.hasOuterParentheses(trimmed)) {
      trimmed = trimmed.substring(1, trimmed.length - 1).trim();
    }

    // 2. Find operator using the exact same logic as RedirectService
    const opMatch = this.findOperatorPosition(trimmed);

    if (!opMatch) {
      result.errors.push(
        `Condition "${trimmed}" is missing a valid operator (${this.ALLOWED_OPERATORS.join(
          ', ',
        )}).`,
      );
      return; // Stop further checks if no operator
    }

    const { operator, rightPart } = opMatch;

    // 3. Strict Check: Detect unsupported JS-style operators (===, !==)
    // If we found '==' but the right part starts with '=', user likely wrote '==='
    if (operator === '==' && rightPart.startsWith('=')) {
      result.errors.push(
        `Condition "${trimmed}" uses unsupported operator "===". Only "==" is supported.`,
      );
    } else if (operator === '!=' && rightPart.startsWith('=')) {
      result.errors.push(
        `Condition "${trimmed}" uses unsupported operator "!==". Only "!=" is supported.`,
      );
    }

    // 4. Validate datetime() usage if present (existing logic)
    const datetimeRegex =
      /datetime\s*\(\s*(['"])(.*?)\1\s*(?:,\s*(['"])(.*?)\3)?\s*\)/g;
    let match: RegExpExecArray | null;
    while ((match = datetimeRegex.exec(trimmed)) !== null) {
      const dateStr = match[2];
      const tz = match[4];

      if (!dateStr) {
        result.errors.push(`datetime() requires at least one argument.`);
        continue;
      }

      if (!dayjs(dateStr).isValid()) {
        result.errors.push(`Invalid date format in datetime(): "${dateStr}".`);
      }

      if (tz) {
        try {
          Intl.DateTimeFormat(undefined, { timeZone: tz });
        } catch {
          result.errors.push(`Invalid timezone in datetime(): "${tz}".`);
        }
      }
    }

    const randomRegex = /random\s*\(\s*([^)]+?)?\s*\)/g;
    while ((match = randomRegex.exec(trimmed)) !== null) {
      const args = (match[1] ?? '').trim();
      this.validateRandomArguments(args, result);
    }
  }

  /**
   * Find operator position respecting quotes and parentheses.
   * Logic duplicated from RedirectService to ensure consistency.
   */
  private findOperatorPosition(condition: string): {
    leftPart: string;
    operator: string;
    rightPart: string;
  } | null {
    // Order matters: longest match first
    const operators = ['==', '!=', '<=', '>=', '~=', 'includes', '<', '>'];

    let inSingleQuote = false;
    let inDoubleQuote = false;
    let parenDepth = 0;

    for (let i = 0; i < condition.length; i++) {
      const char = condition[i];

      if (char === "'" && !inDoubleQuote) {
        inSingleQuote = !inSingleQuote;
      } else if (char === '"' && !inSingleQuote) {
        inDoubleQuote = !inDoubleQuote;
      }

      if (!inSingleQuote && !inDoubleQuote) {
        if (char === '(') parenDepth++;
        else if (char === ')') parenDepth--;
      }

      // Look for operators only when not in quotes/parens
      if (!inSingleQuote && !inDoubleQuote && parenDepth === 0) {
        for (const op of operators) {
          if (condition.substring(i, i + op.length) === op) {
            return {
              leftPart: condition.substring(0, i).trim(),
              operator: op,
              rightPart: condition.substring(i + op.length).trim(),
            };
          }
        }
      }
    }

    return null;
  }

  private validateVariable(key: string, result: ValidationResult): void {
    if (!key) return;

    if (this.isFunctionKey(key)) {
      this.validateFunctionKey(key, result);
      return;
    }

    if (
      key.startsWith('query.') ||
      key.startsWith('segments.') ||
      key.startsWith('domain.subdomains.')
    ) {
      return;
    }

    if (!this.KNOWN_VARIABLES.includes(key)) {
      const suggestion = this.findClosestMatch(key, this.KNOWN_VARIABLES);
      const msg = `Unknown variable: "${key}".`;
      result.errors.push(
        suggestion ? `${msg} Did you mean "${suggestion}"?` : msg,
      );
    }
  }

  private isFunctionKey(key: string): boolean {
    const trimmed = key.trim();
    return (
      /^time\s*\(\s*\)$/.test(trimmed) ||
      /^random\s*\(\s*.*\s*\)$/.test(trimmed)
    );
  }

  private validateFunctionKey(key: string, result: ValidationResult): void {
    const trimmed = key.trim();
    if (/^time\s*\(\s*\)$/.test(trimmed)) {
      return;
    }

    const randomMatch = trimmed.match(/^random\s*\(\s*(.*?)\s*\)$/);
    if (randomMatch) {
      const args = (randomMatch[1] ?? '').trim();
      this.validateRandomArguments(args, result);
      return;
    }

    result.errors.push(`Unknown function: "${key}".`);
  }

  private validateRandomArguments(
    args: string,
    result: ValidationResult,
  ): void {
    if (!args) {
      return;
    }

    const parts = args
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
    if (parts.length === 0 || parts.length > 2) {
      result.errors.push(
        `random() accepts 0, 1, or 2 numeric arguments. Received: "${args}".`,
      );
      return;
    }

    const hasInvalid = parts.some((part) => Number.isNaN(Number(part)));
    if (hasInvalid) {
      result.errors.push(
        `random() arguments must be numbers. Received: "${args}".`,
      );
      return;
    }

    const hasUnsafe = parts.some((part) => !Number.isSafeInteger(Number(part)));
    if (hasUnsafe) {
      result.errors.push(
        `random() arguments must be safe integers between ${Number.MIN_SAFE_INTEGER} and ${Number.MAX_SAFE_INTEGER}.`,
      );
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

  // --- Helpers Duplicated/Adapted from RedirectService for Parsing ---

  private hasOuterParentheses(str: string): boolean {
    const trimmed = str.trim();
    if (!trimmed.startsWith('(') || !trimmed.endsWith(')')) {
      return false;
    }
    let balance = 0;
    for (let i = 0; i < trimmed.length; i++) {
      if (trimmed[i] === '(') balance++;
      else if (trimmed[i] === ')') balance--;
      if (balance === 0 && i < trimmed.length - 1) {
        return false;
      }
    }
    return true;
  }

  private splitConditional(
    template: string,
  ): { condition: string; truePart: string; falsePart: string } | null {
    let balance = 0;
    let questionMarkIndex = -1;
    let colonIndex = -1;
    let inSingleQuote = false;
    let inDoubleQuote = false;

    // 1. Find (?)
    for (let i = 0; i < template.length; i++) {
      const char = template[i];
      if (char === "'" && !inDoubleQuote) inSingleQuote = !inSingleQuote;
      else if (char === '"' && !inSingleQuote) inDoubleQuote = !inDoubleQuote;

      if (!inSingleQuote && !inDoubleQuote) {
        if (char === '(') balance++;
        else if (char === ')') balance--;
        else if (char === '?' && balance === 0) {
          questionMarkIndex = i;
          break;
        }
      }
    }

    if (questionMarkIndex === -1) return null;

    // 2. Find (:)
    balance = 0;
    inSingleQuote = false;
    inDoubleQuote = false;
    for (let i = questionMarkIndex + 1; i < template.length; i++) {
      const char = template[i];
      if (char === "'" && !inDoubleQuote) inSingleQuote = !inSingleQuote;
      else if (char === '"' && !inSingleQuote) inDoubleQuote = !inDoubleQuote;

      if (!inSingleQuote && !inDoubleQuote) {
        if (char === '(') balance++;
        else if (char === ')') balance--;
        else if (char === ':' && balance === 0) {
          // Skip URL colons
          if (template.substring(i + 1, i + 3) === '//') continue;
          colonIndex = i;
          break;
        }
      }
    }

    if (colonIndex === -1) return null;

    return {
      condition: template.substring(0, questionMarkIndex).trim(),
      truePart: template.substring(questionMarkIndex + 1, colonIndex).trim(),
      falsePart: template.substring(colonIndex + 1).trim(),
    };
  }

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
    return bestDistance <= 3 ? bestMatch : null;
  }

  private levenshtein(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

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
