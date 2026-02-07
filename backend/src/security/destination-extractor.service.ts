import { Injectable } from '@nestjs/common';
import { REDIRECT_ENGINE_LIMITS } from '../constants';
import { Logger } from 'nestjs-pino';

@Injectable()
export class DestinationExtractorService {
  constructor(private readonly logger: Logger) {}

  extractUrls(destination: string): string[] {
    if (!destination) return [];

    const targets = this.collectDestinations(destination, 0);
    const urls = new Set<string>();

    for (const target of targets) {
      const url = this.extractUrl(target);
      if (url) {
        urls.add(url);
      }
    }

    return [...urls];
  }

  extractUrl(target: string): string | null {
    const trimmed = target?.trim();
    if (!trimmed) return null;

    const rawHostMatch = /^https?:\/\/([^\/?#]+)/i.exec(trimmed);
    if (!rawHostMatch) return null;

    const rawHost = rawHostMatch[1];
    if (
      rawHost.includes('{') ||
      rawHost.includes('}') ||
      rawHost.includes('$')
    ) {
      return null;
    }

    const mock = trimmed
      .replace(/\$\d+/g, '1')
      .replace(/(?<!\{)\{([^{}]+)\}(?!\})/g, 'slug');

    if (!mock.startsWith('http://') && !mock.startsWith('https://')) {
      return null;
    }

    try {
      const url = new URL(mock);
      return `${url.hostname}${url.pathname}`.toLowerCase();
    } catch {
      return null;
    }
  }

  private collectDestinations(segment: string, depth: number): string[] {
    if (depth > REDIRECT_ENGINE_LIMITS.MAX_RECURSION_DEPTH) {
      return [];
    }

    let trimmed = segment.trim();

    while (this.hasOuterParentheses(trimmed)) {
      trimmed = trimmed.substring(1, trimmed.length - 1).trim();
    }

    const split = this.splitConditional(trimmed);
    if (split) {
      return [
        ...this.collectDestinations(split.truePart, depth + 1),
        ...this.collectDestinations(split.falsePart, depth + 1),
      ];
    }

    return [trimmed];
  }

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
    let inRegex = false;
    let lastRegexEscape = false;
    let lastNonSpaceChar = '';
    let prevNonSpaceChar = '';

    for (let i = 0; i < template.length; i++) {
      const char = template[i];
      const nextChar = template[i + 1];
      if (char === "'" && !inDoubleQuote) inSingleQuote = !inSingleQuote;
      else if (char === '"' && !inSingleQuote) inDoubleQuote = !inDoubleQuote;

      if (!inSingleQuote && !inDoubleQuote) {
        if (inRegex) {
          if (char === '/' && !lastRegexEscape) {
            inRegex = false;
          }
          lastRegexEscape = char === '\\' && !lastRegexEscape;
        } else if (
          char === '/' &&
          lastNonSpaceChar !== '' &&
          !(/\w/.test(lastNonSpaceChar)) &&
          !(lastNonSpaceChar === '/' && prevNonSpaceChar === ':') &&
          !(lastNonSpaceChar === ':' && nextChar === '/')
        ) {
          inRegex = true;
          lastRegexEscape = false;
        }
      }

      if (!inSingleQuote && !inDoubleQuote && !inRegex) {
        if (char === '(') balance++;
        else if (char === ')') balance--;
        else if (char === '?' && balance === 0) {
          questionMarkIndex = i;
          break;
        }
      }

      if (!/\s/.test(char)) {
        prevNonSpaceChar = lastNonSpaceChar;
        lastNonSpaceChar = char;
      }
    }

    if (questionMarkIndex === -1) return null;

    balance = 0;
    inSingleQuote = false;
    inDoubleQuote = false;
    inRegex = false;
    lastRegexEscape = false;
    lastNonSpaceChar = '';
    prevNonSpaceChar = '';
    for (let i = questionMarkIndex + 1; i < template.length; i++) {
      const char = template[i];
      const nextChar = template[i + 1];
      if (char === "'" && !inDoubleQuote) inSingleQuote = !inSingleQuote;
      else if (char === '"' && !inSingleQuote) inDoubleQuote = !inDoubleQuote;

      if (!inSingleQuote && !inDoubleQuote) {
        if (inRegex) {
          if (char === '/' && !lastRegexEscape) {
            inRegex = false;
          }
          lastRegexEscape = char === '\\' && !lastRegexEscape;
        } else if (
          char === '/' &&
          lastNonSpaceChar !== '' &&
          !(/\w/.test(lastNonSpaceChar)) &&
          !(lastNonSpaceChar === '/' && prevNonSpaceChar === ':') &&
          !(lastNonSpaceChar === ':' && nextChar === '/')
        ) {
          inRegex = true;
          lastRegexEscape = false;
        }
      }

      if (!inSingleQuote && !inDoubleQuote && !inRegex) {
        if (char === '(') balance++;
        else if (char === ')') balance--;
        else if (char === ':' && balance === 0) {
          if (template.substring(i + 1, i + 3) !== '//') {
            colonIndex = i;
            break;
          }
        }
      }

      if (!/\s/.test(char)) {
        prevNonSpaceChar = lastNonSpaceChar;
        lastNonSpaceChar = char;
      }
    }

    if (colonIndex === -1) return null;

    const condition = template.substring(0, questionMarkIndex).trim();
    const truePart = template
      .substring(questionMarkIndex + 1, colonIndex)
      .trim();
    const falsePart = template.substring(colonIndex + 1).trim();

    return { condition, truePart, falsePart };
  }
}
