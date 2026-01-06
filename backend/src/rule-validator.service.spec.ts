import { Test, TestingModule } from '@nestjs/testing';
import { RuleValidatorService } from './rule-validator.service';

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
      // Missing closing parenthesis in the regex group
      const result = service.validate('/^\\/blog\\/(.+$/', '/dest');
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Invalid Regex');
    });
  });

  describe('Destination Validation', () => {
    it('should pass valid variables and manipulators', () => {
      const result = service.validate(
        '*',
        'https://site.com/{domain.root:to_upper_case}/{query.id:add_10}',
      );
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect unknown variables and suggest corrections', () => {
      // Typo: "domain.rot" instead of "domain.root"
      const result = service.validate('*', 'https://site.com/{domain.rot}');
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Unknown variable: "domain.rot"');
      expect(result.errors[0]).toContain('Did you mean "domain.root"?');
    });

    it('should detect unknown manipulators and suggest corrections', () => {
      // Typo: "to_uper_case" instead of "to_upper_case"
      const result = service.validate('*', '{path:to_uper_case}');
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Unknown manipulator: "to_uper_case"');
      expect(result.errors[0]).toContain('Did you mean "to_upper_case"?');
    });

    it('should validate regex capture groups usage', () => {
      // Source has 1 group, but destination tries to use $2
      const result = service.validate('/^\\/blog\\/(.+)$/', '/posts/$1/$2');

      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((e) => e.includes('only has 1 capturing group')),
      ).toBe(true);
    });

    it('should allow valid dynamic variables (query, segments, subdomains)', () => {
      const result = service.validate(
        '*',
        '{query.foo}|{segments.0}|{domain.subdomains.1}',
      );
      expect(result.isValid).toBe(true);
    });

    it('should handle chained manipulators', () => {
      const result = service.validate('*', '{random:multiply_10.round}');
      expect(result.isValid).toBe(true);
    });

    it('should fail if at least one manipulator in a chain is invalid', () => {
      const result = service.validate(
        '*',
        '{random:multiply_10.invalid_one.round}',
      );
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Unknown manipulator: "invalid_one"');
    });
  });
});
