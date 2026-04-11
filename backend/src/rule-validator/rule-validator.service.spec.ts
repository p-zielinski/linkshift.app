import { Test, TestingModule } from '@nestjs/testing';
import { RuleValidatorService } from './rule-validator.service';
import { REDIRECT_ENGINE_LIMITS } from '../constants';
import { Logger } from 'nestjs-pino';

describe('RuleValidatorService', () => {
  let service: RuleValidatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RuleValidatorService,
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            setContext: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RuleValidatorService>(RuleValidatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Source Validation', () => {
    it('should pass valid plain strings', () => {
      const result = service.validate('/home', 'https://example.com/dashboard');
      expect(result.isValid).toBe(true);
    });

    it('should pass valid regex strings', () => {
      const result = service.validate(
        '/^\\/blog\\/(.+)$/',
        'https://example.com/new-blog/$1',
      );
      expect(result.isValid).toBe(true);
    });

    it('should detect malformed regex', () => {
      // Missing closing parenthesis
      const result = service.validate(
        '/^\\/blog\\/(.+$/',
        'https://example.com/dest',
      );
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Invalid Regex');
    });
  });

  describe('Destination Validation (Standard)', () => {
    it('should pass valid URLs', () => {
      const result = service.validate('*', 'https://google.com');
      expect(result.isValid).toBe(true);
    });

    it('should reject relative paths', () => {
      const result = service.validate('*', '/local/path');
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain(
        "Destination must start with 'http://' or 'https://'",
      );
    });

    it('should fail if destination does not start with http/https', () => {
      const result = service.validate('*', 'google.com');
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain(
        "Destination must start with 'http://' or 'https://'",
      );
    });

    it('should fail if destination is obviously invalid URL structure', () => {
      const result = service.validate('*', 'http://[invalid-url');
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('not a valid URL structure');
    });

    it('should validate regex capture groups usage', () => {
      // Source has 1 group, but destination tries to use $2
      const result = service.validate(
        '/^\\/blog\\/(.+)$/',
        'https://example.com/posts/$1/$2',
      );
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain(
        'source only has 1 capturing group(s)',
      );
    });

    it('should allow $2 and $3 when source has multiple capture groups', () => {
      const result = service.validate(
        '/^\\/go\\/([^/]+)\\/([^/]+)\\/([^/]+)$/',
        'https://example.com/$1/$2/$3',
      );
      expect(result.isValid).toBe(true);
    });

    it('should allow www to apex regex pattern with path and query forwarding', () => {
      const result = service.validate(
        '/^\\/(.*)$/',
        'https://{domain.extension}/$1',
      );
      expect(result.isValid).toBe(true);
    });
  });

  describe('Variable & Manipulator Validation', () => {
    it('should pass valid variables and manipulators', () => {
      const result = service.validate(
        '*',
        'https://site.com/{domain.root:to_upper_case}/{query.id:add_10}?ts={time():to_iso_string}',
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

  describe('Function Placeholder Validation', () => {
    it('should allow time() placeholder in destination', () => {
      const result = service.validate('*', 'https://site.com?ts={time()}');
      expect(result.isValid).toBe(true);
    });

    it('should allow time() placeholder with to_iso_string manipulator', () => {
      const result = service.validate(
        '*',
        'https://site.com?ts={time():to_iso_string}',
      );
      expect(result.isValid).toBe(true);
    });

    it('should allow random() placeholder with range', () => {
      const result = service.validate(
        '*',
        'https://site.com?bucket={random(0,100)}',
      );
      expect(result.isValid).toBe(true);
    });

    it('should allow random() placeholder with negative minimum', () => {
      const result = service.validate(
        '*',
        'https://site.com?bucket={random(-10,10)}',
      );
      expect(result.isValid).toBe(true);
    });

    it('should reject random() placeholder with invalid arguments', () => {
      const result = service.validate(
        '*',
        'https://site.com?bucket={random(foo)}',
      );
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('random() arguments must be numbers');
    });

    it('should reject random() placeholder with unsafe integers', () => {
      const result = service.validate(
        '*',
        'https://site.com?bucket={random(9007199254740992)}',
      );
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain(
        'random() arguments must be safe integers',
      );
    });
  });

  describe('Conditional Logic Validation', () => {
    it('should pass valid conditional logic', () => {
      const result = service.validate(
        '*',
        'random(0,100) > 5 ? https://a.com : https://b.com',
      );
      expect(result.isValid).toBe(true);
    });

    it('should validate nested conditionals', () => {
      const result = service.validate(
        '*',
        'random(0,100) > 5 ? ({ip} == "127.0.0.1" ? https://example.com/local : https://example.com/remote) : https://example.com/fallback',
      );
      expect(result.isValid).toBe(true);
    });

    it('should handle https in ternary branches', () => {
      const result = service.validate(
        '*',
        "path == '/a' ? https://a.example.com : https://b.example.com/path",
      );
      expect(result.isValid).toBe(true);
    });

    it('should validate logic recursively (check leaves)', () => {
      // Logic valid, but leaf "broken" is invalid URL
      const result = service.validate(
        '*',
        'random(0,100) > 5 ? https://valid.com : broken',
      );
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Destination must start with');
    });

    it('should reject non-http(s) branches in conditionals', () => {
      const result = service.validate(
        '*',
        'random(0,100) < 30 ? https://example.com/ok : /fallback',
      );
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Destination must start with');
    });

    it('should fail if conditional has no operator', () => {
      // Service logic requires operator (==, !=, etc)
      const result = service.validate(
        '*',
        'random(0,100) ? https://example.com/a : https://example.com/b',
      );
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('missing a valid operator');
    });

    it('should validate datetime syntax', () => {
      const result = service.validate(
        '*',
        "time() > datetime('2024-01-01') ? https://example.com/new : https://example.com/old",
      );
      expect(result.isValid).toBe(true);
    });

    it('should fail on invalid date in datetime', () => {
      const result = service.validate(
        '*',
        "time() > datetime('invalid') ? https://example.com/a : https://example.com/b",
      );
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Invalid date format');
    });

    it('should fail on invalid timezone in datetime', () => {
      const result = service.validate(
        '*',
        "time() > datetime('2024-01-01', 'Mars/City') ? https://example.com/a : https://example.com/b",
      );
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Invalid timezone');
    });

    it('should fail if missing colon in ternary', () => {
      // It will look like a malformed URL with '?' usually, unless it fails split
      const result = service.validate(
        '*',
        'random(0,100) > 5 ? /missing-colon',
      );

      // Our logic might interpret this as leaf if split fails,
      // but warn about suspicious '?' usage.
      // Or if it thinks it's a URL, it checks prefixes.

      // In this case: it has '?', splitConditional will fail (no colon).
      // It falls back to leaf. Leaf starts with '{'. '{' is not valid prefix.
      expect(result.isValid).toBe(false);
    });

    it('should handle parentheses correctly', () => {
      const result = service.validate(
        '*',
        '( random(0,100) > 5 ) ? https://example.com/a : https://example.com/b',
      );
      expect(result.isValid).toBe(true);
    });

    describe('Complex Operators Support', () => {
      it('should validate inequality operator (!=)', () => {
        const result = service.validate(
          '*',
          'random(0,100) != 0 ? https://example.com/nonzero : https://example.com/zero',
        );
        expect(result.isValid).toBe(true);
      });

      it('should validate comparison operators (>=, <=)', () => {
        const result = service.validate(
          '*',
          'random(0,100) >= 10 ? https://example.com/high : (random(0,100) <= 5 ? https://example.com/low : https://example.com/mid)',
        );
        expect(result.isValid).toBe(true);
      });

      it('should allow modifiers on random placeholders inside conditions', () => {
        const result = service.validate(
          '*',
          '{random(0,100):divide_10} >= 5 ? https://example.com/high : https://example.com/low',
        );
        expect(result.isValid).toBe(true);
      });

      it('should validate regex match operator (~=)', () => {
        // Checks if syntax like '{var} ~= /pattern/flags' passes
        const result = service.validate(
          '*',
          "'{user-agent}' ~= /mobile/i ? https://example.com/mobile : https://example.com/desktop",
        );
        expect(result.isValid).toBe(true);
      });

      it('should validate includes operator', () => {
        const result = service.validate(
          '*',
          "'{path}' includes 'admin' ? https://example.com/login : https://example.com/guest",
        );
        expect(result.isValid).toBe(true);
      });

      it('should fail when using unsupported operators', () => {
        // e.g. "===" is not in our ALLOWED_OPERATORS list (we use "==")
        const result = service.validate(
          '*',
          'random(0,100) === 5 ? https://example.com/a : https://example.com/b',
        );
        expect(result.isValid).toBe(false);
        expect(result.errors[0]).toContain(
          'Condition "random(0,100) === 5" uses unsupported operator "===". Only "==" is supported.',
        );
      });

      it('should validate complex nested logic with mixed operators', () => {
        const result = service.validate(
          '*',
          "('{path}' includes 'api') ? (time() > datetime('2024-01-01') ? https://example.com/v2 : https://example.com/v1) : https://example.com/static",
        );
        expect(result.isValid).toBe(true);
      });
    });

    describe('Deep Nesting & Parentheses', () => {
      it('should handle deeply nested parentheses in condition', () => {
        const result = service.validate(
          '*',
          '(((( random(0,100) > 5 )))) ? https://example.com/a : https://example.com/b',
        );
        expect(result.isValid).toBe(true);
      });

      it('should handle deeply nested parentheses in ternary branches', () => {
        const result = service.validate(
          '*',
          'random(0,100) > 5 ? (((( https://example.com/a )))) : (((( https://example.com/b ))))',
        );
        expect(result.isValid).toBe(true);
      });

      it('should handle operators inside strings and ignored by parser', () => {
        // Here '>' is inside the string, the real operator is 'includes'
        const result = service.validate(
          '*',
          "'{user-agent}' includes 'MSIE > 6' ? https://example.com/legacy : https://example.com/modern",
        );
        expect(result.isValid).toBe(true);
      });

      it('should handle multiple nested ternary operators', () => {
        const result = service.validate(
          '*',
          '{a} > 1 ? ({b} > 1 ? https://example.com/nested-true : https://example.com/nested-false) : ({c} > 1 ? https://example.com/c-true : https://example.com/c-false)',
        );
        expect(result.isValid).toBe(true);
      });

      it('should fail if logic nesting exceeds MAX_RECURSION_DEPTH', () => {
        // Create a rule nested - higher than defined limit;
        let deepRule = '1==1 ? https://example.com/t : https://example.com/f';
        for (
          let i = 0;
          i < REDIRECT_ENGINE_LIMITS.MAX_RECURSION_DEPTH + 1;
          i++
        ) {
          deepRule = `1==1 ? (${deepRule}) : https://example.com/f`;
        }

        const result = service.validate('*', deepRule);
        expect(result.isValid).toBe(false);
        expect(result.errors[0]).toContain('Maximum nesting depth');
      });
    });
  });
});
