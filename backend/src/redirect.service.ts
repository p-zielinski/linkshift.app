import { Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';

export interface RedirectRule {
  source: string | RegExp;
  destination: string;
}

type Manipulator = (val: string) => string;

@Injectable()
export class RedirectService {
  private readonly logger = new Logger(RedirectService.name);

  // We removed hardcoded rules from here.
  // Now rules are passed directly to the getRedirect method.

  static readonly manipulators: Record<string, Manipulator> = {
    to_lower_case: (val) => val.toLowerCase(),
    to_upper_case: (val) => val.toUpperCase(),
    url_encode: (val) => encodeURIComponent(val),
    url_decode: (val) => decodeURIComponent(val),
    base64_encode: (val) => Buffer.from(val).toString('base64'),
    auto_trailing_slash: (val) => (val && !val.endsWith('/') ? `${val}/` : val),
    // Math manipulators
    multiply_10: (val) => String(Number(val || 0) * 10),
    divide_10: (val) => String(Number(val || 0) / 10),
    add_10: (val) => String(Number(val || 0) + 10),
    multiply_2: (val) => String(Number(val || 0) * 2),
    random: RedirectService.processRandom,
    round: (val) => String(Math.round(Number(val || 0))),
  };

  async getRedirect(
    req: Request,
    rules: RedirectRule[],
  ): Promise<string | null> {
    const url = this.getRequestUrl(req);
    const variables = this.extractVariables(req, url);

    for (const rule of rules) {
      const result = this.processRule(rule, req.path, variables);
      if (result) return result;
    }

    return null;
  }

  private getRequestUrl(req: Request): URL {
    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    return new URL(fullUrl);
  }

  private extractVariables(
    req: Request,
    url: URL,
  ): Record<string, string | undefined> {
    const hostParts = url.hostname.split('.');
    const domainRoot =
      hostParts.length >= 2 ? hostParts[hostParts.length - 2] : hostParts[0];
    const subdomains = hostParts.length > 2 ? hostParts.slice(0, -2) : [];
    const path = url.pathname.replace(/^\//, '');
    const segments = path.split('/').filter(Boolean);

    const variables: Record<string, string | undefined> = {
      'domain.fqdn': url.hostname,
      'domain.label': hostParts.slice(0, -1).join('.'),
      'domain.root': domainRoot,
      'domain.extension': hostParts.slice(1).join('.'),
      'domain.subdomain': subdomains.join('.'),
      path: path,
      method: req.method,
      scheme: req.protocol,
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.get('User-Agent'),
      // Special static variables
      random: String(Math.floor(Math.random() * 1000000)),
    };

    segments.forEach((seg, i) => (variables[`segments.${i}`] = seg));
    subdomains.forEach((sub, i) => (variables[`domain.subdomains.${i}`] = sub));
    url.searchParams.forEach(
      (value, key) => (variables[`query.${key}`] = value),
    );

    return variables;
  }

  private processRule(
    rule: RedirectRule,
    currentPath: string,
    variables: Record<string, string | undefined>,
  ): string | null {
    let target = rule.destination;
    let isMatch = false;

    if (rule.source instanceof RegExp) {
      const match = currentPath.match(rule.source);
      if (match) {
        isMatch = true;
        match.forEach((val, index) => {
          target = target.replace(new RegExp(`\\$${index}`, 'g'), val);
        });
      }
    } else if (rule.source === '*' || currentPath === rule.source) {
      isMatch = true;
    }

    return isMatch ? this.replacePlaceholders(target, variables) : null;
  }

  private replacePlaceholders(
    template: string,
    variables: Record<string, string | undefined>,
  ): string {
    const result = template.replace(
      /(?<!\{)\{([^{}]+)\}(?!\})/g,
      (match, content) => {
        const [key, modifierChain] = content.split(':');

        let value = key ? variables[key] : '';

        if (value === undefined && modifierChain) {
          value = key;
        }

        if (value === undefined && key && !modifierChain) return match;

        if (modifierChain) {
          return this.applyModifiers(value ?? '', modifierChain);
        }

        return value ?? '';
      },
    );

    return result.replace(/\{\{/g, '{').replace(/\}\}/g, '}');
  }

  private applyModifiers(initialValue: string, modifierChain: string): string {
    const modifiers = modifierChain.split('.');
    return modifiers.reduce((acc, mod) => {
      const manipulator = RedirectService.manipulators[mod];
      if (manipulator) {
        try {
          return manipulator(acc);
        } catch (e) {
          this.logger.error(`Error applying manipulator ${mod}`, e.stack);
          return acc;
        }
      }
      this.logger.warn(`Unknown manipulator: ${mod}`);
      return acc;
    }, initialValue);
  }

  /**
   * Helper function to generate random number based on input string.
   * Input formats:
   * - "min:max" (e.g. "-10:20") -> random between -10 and 20
   * - "max" (e.g. "100") -> random between 0 and 100
   * - "" (empty) -> random between 0 and MAX_SAFE_INTEGER
   */
  private static processRandom(val: string): string {
    let min = 0;
    let max = Number.MAX_SAFE_INTEGER;

    if (val && val.includes(':')) {
      const parts = val.split(':');
      if (parts.length === 2) {
        const parsedMin = parseInt(parts[0], 10);
        const parsedMax = parseInt(parts[1], 10);
        if (!isNaN(parsedMin) && !isNaN(parsedMax)) {
          min = parsedMin;
          max = parsedMax;
        }
      }
    } else if (val) {
      const parsedMax = parseInt(val, 10);
      if (!isNaN(parsedMax)) {
        max = parsedMax;
      }
    }

    if (min > max) [min, max] = [max, min];

    return String(Math.floor(Math.random() * (max - min + 1)) + min);
  }
}
