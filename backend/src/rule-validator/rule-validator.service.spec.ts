import { Test, TestingModule } from '@nestjs/testing';
import { RuleValidatorService } from './rule-validator.service';
import { REDIRECT_ENGINE_LIMITS } from '../constants';

describe('RuleValidatorService', () => {
  let service: RuleValidatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RuleValidatorService],
    }).compile();

    service = module.get<RuleValidatorService>(RuleValidatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Source Validation', () => {
    it('should pass valid plain strings', () => {
      const result = service.validate('/home', '/dashboard');
      expect(result.isValid).toBe(true);
    });

    it('should pass valid regex strings', () => {
      const result = service.validate('/^\\/blog\\/(.+)$/', '/new-blog/$1');
      expect(result.isValid).toBe(true);
    });

    it('should detect malformed regex', () => {
      // Missing closing parenthesis
      const result = service.validate('/^\\/blog\\/(.+$/', '/dest');
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Invalid Regex');
    });
  });

  describe('Destination Validation (Standard)', () => {
    it('should pass valid URLs', () => {
      const result = service.validate('*', 'https://google.com');
      expect(result.isValid).toBe(true);
    });

    it('should pass valid relative paths', () => {
      const result = service.validate('*', '/local/path');
      expect(result.isValid).toBe(true);
    });

    it('should fail if destination does not start with http/https or /', () => {
      const result = service.validate('*', 'google.com');
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain(
        "Destination must start with 'http://', 'https://' or '/'",
      );
    });

    it('should fail if destination is obviously invalid URL structure', () => {
      const result = service.validate('*', 'http://[invalid-url');
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('not a valid URL structure');
    });

    it('should validate regex capture groups usage', () => {
      // Source has 1 group, but destination tries to use $2
      const result = service.validate('/^\\/blog\\/(.+)$/', '/posts/$1/$2');
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain(
        'source only has 1 capturing group(s)',
      );
    });
  });

  describe('Variable & Manipulator Validation', () => {
    it('should pass valid variables and manipulators', () => {
      const result = service.validate(
        '*',
        'https://site.com/{domain.root:to_upper_case}/{query.id:add_10}',
      );
      expect(result.isValid).toBe(true);
    });

    it('should detect unknown variables and suggest corrections', () => {
      const result = service.validate('*', 'https://site.com/{domain.rot}');
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Unknown variable: "domain.rot"');
      expect(result.errors[0]).toContain('Did you mean "domain.root"?');
    });

    it('should detect unknown manipulators', () => {
      const result = service.validate('*', '{path:to_uper_case}');
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Unknown manipulator: "to_uper_case"');
    });
  });

  describe('Conditional Logic Validation', () => {
    it('should pass valid conditional logic', () => {
      const result = service.validate(
        '*',
        '{random} > 5 ? https://a.com : https://b.com',
      );
      expect(result.isValid).toBe(true);
    });

    it('should validate nested conditionals', () => {
      const result = service.validate(
        '*',
        '{random} > 5 ? ({ip} == "127.0.0.1" ? /local : /remote) : /fallback',
      );
      expect(result.isValid).toBe(true);
    });

    it('should validate logic recursively (check leaves)', () => {
      // Logic valid, but leaf "broken" is invalid URL
      const result = service.validate(
        '*',
        '{random} > 5 ? https://valid.com : broken',
      );
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Destination must start with');
    });

    it('should fail if conditional has no operator', () => {
      // Service logic requires operator (==, !=, etc)
      const result = service.validate('*', '{random} ? /a : /b');
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('missing a valid operator');
    });

    it('should validate datetime syntax', () => {
      const result = service.validate(
        '*',
        "time() > datetime('2024-01-01') ? /new : /old",
      );
      expect(result.isValid).toBe(true);
    });

    it('should fail on invalid date in datetime', () => {
      const result = service.validate(
        '*',
        "time() > datetime('invalid') ? /a : /b",
      );
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Invalid date format');
    });

    it('should fail on invalid timezone in datetime', () => {
      const result = service.validate(
        '*',
        "time() > datetime('2024-01-01', 'Mars/City') ? /a : /b",
      );
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Invalid timezone');
    });

    it('should fail if missing colon in ternary', () => {
      // It will look like a malformed URL with '?' usually, unless it fails split
      const result = service.validate('*', '{random} > 5 ? /missing-colon');

      // Our logic might interpret this as leaf if split fails,
      // but warn about suspicious '?' usage.
      // Or if it thinks it's a URL, it checks prefixes.

      // In this case: it has '?', splitConditional will fail (no colon).
      // It falls back to leaf. Leaf starts with '{'. '{' is not valid prefix.
      expect(result.isValid).toBe(false);
    });

    it('should handle parentheses correctly', () => {
      const result = service.validate('*', '( {random} > 5 ) ? /a : /b');
      expect(result.isValid).toBe(true);
    });

    describe('Complex Operators Support', () => {
      it('should validate inequality operator (!=)', () => {
        const result = service.validate(
          '*',
          '{random} != 0 ? /nonzero : /zero',
        );
        expect(result.isValid).toBe(true);
      });

      it('should validate comparison operators (>=, <=)', () => {
        const result = service.validate(
          '*',
          '{random} >= 10 ? /high : ({random} <= 5 ? /low : /mid)',
        );
        expect(result.isValid).toBe(true);
      });

      it('should validate regex match operator (~=)', () => {
        // Checks if syntax like '{var} ~= /pattern/flags' passes
        const result = service.validate(
          '*',
          "'{userAgent}' ~= /mobile/i ? /mobile : /desktop",
        );
        expect(result.isValid).toBe(true);
      });

      it('should validate includes operator', () => {
        const result = service.validate(
          '*',
          "'{path}' includes 'admin' ? /login : /guest",
        );
        expect(result.isValid).toBe(true);
      });

      it('should fail when using unsupported operators', () => {
        // e.g. "===" is not in our ALLOWED_OPERATORS list (we use "==")
        const result = service.validate('*', '{random} === 5 ? /a : /b');
        expect(result.isValid).toBe(false);
        expect(result.errors[0]).toContain(
          'Condition "{random} === 5" uses unsupported operator "===". Only "==" is supported.',
        );
      });

      it('should validate complex nested logic with mixed operators', () => {
        const result = service.validate(
          '*',
          "('{path}' includes 'api') ? (time() > datetime('2024-01-01') ? /v2 : /v1) : /static",
        );
        expect(result.isValid).toBe(true);
      });
    });

    describe('Deep Nesting & Parentheses', () => {
      it('should handle deeply nested parentheses in condition', () => {
        const result = service.validate(
          '*',
          '(((( {random} > 5 )))) ? /a : /b',
        );
        expect(result.isValid).toBe(true);
      });

      it('should handle deeply nested parentheses in ternary branches', () => {
        const result = service.validate(
          '*',
          '{random} > 5 ? (((( /a )))) : (((( /b ))))',
        );
        expect(result.isValid).toBe(true);
      });

      it('should handle operators inside strings and ignored by parser', () => {
        // Here '>' is inside the string, the real operator is 'includes'
        const result = service.validate(
          '*',
          "'{userAgent}' includes 'MSIE > 6' ? /legacy : /modern",
        );
        expect(result.isValid).toBe(true);
      });

      it('should handle multiple nested ternary operators', () => {
        const result = service.validate(
          '*',
          '{a} > 1 ? ({b} > 1 ? /nested-true : /nested-false) : ({c} > 1 ? /c-true : /c-false)',
        );
        expect(result.isValid).toBe(true);
      });

      it('should fail if logic nesting exceeds MAX_RECURSION_DEPTH', () => {
        // Create a rule nested - higher than defined limit;
        let deepRule = '1==1 ? /t : /f';
        for (
          let i = 0;
          i < REDIRECT_ENGINE_LIMITS.MAX_RECURSION_DEPTH + 1;
          i++
        ) {
          deepRule = `1==1 ? (${deepRule}) : /f`;
        }

        const result = service.validate('*', deepRule);
        expect(result.isValid).toBe(false);
        expect(result.errors[0]).toContain('Maximum nesting depth');
      });
    });
  });
});
