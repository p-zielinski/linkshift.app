import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { RedirectService } from './redirect.service';
import { RuleValidatorService } from './rule-validator.service';
import { BadRequestException } from '@nestjs/common';
import { CreateRuleDto } from './create-rule.dto';

describe('AppController', () => {
  let appController: AppController;
  let ruleValidator: RuleValidatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        RedirectService, // Assuming it doesn't have complex deps suitable for unit test context or mocking if needed
        RuleValidatorService,
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
    ruleValidator = module.get<RuleValidatorService>(RuleValidatorService);
  });

  describe('addRule', () => {
    it('should add a valid string-based rule', () => {
      const dto: CreateRuleDto = {
        source: '/exact-path',
        destination: 'https://example.com',
      };

      const result = appController.addRule(dto);

      expect(result.message).toBe('Rule added successfully');
      expect(result.rule.source).toBe('/exact-path');
      expect(result.totalRules).toBeGreaterThan(2); // Initial 2 + 1
    });

    it('should correctly parse and add a RegExp rule passed as string', () => {
      const dto: CreateRuleDto = {
        source: '/^\\/api\\/(.+)$/i', // Regex string with flag 'i'
        destination: 'https://api.new.com/$1',
      };

      const result = appController.addRule(dto);

      expect(result.message).toBe('Rule added successfully');
      // The response converts it back to string, but let's check internal state logic
      expect(result.rule.source).toBe('/^\\/api\\/(.+)$/i');

      // Verify it's actually stored as RegExp in private array?
      // Since 'rules' is private, we trust the response logic or integration test behavior.
    });

    it('should throw BadRequestException when validation fails', () => {
      const dto: CreateRuleDto = {
        source: '/broken-regex/(', // Invalid regex
        destination: 'https://example.com',
      };

      // Spy on validator to ensure it's called
      const validateSpy = jest.spyOn(ruleValidator, 'validate');

      expect(() => appController.addRule(dto)).toThrow(BadRequestException);
      expect(validateSpy).toHaveBeenCalledWith(dto.source, dto.destination);
    });

    it('should throw BadRequestException when destination logic is invalid', () => {
      const dto: CreateRuleDto = {
        source: '*',
        destination: 'invalid-url-start', // Must start with http/https or /
      };

      expect(() => appController.addRule(dto)).toThrow(BadRequestException);
    });
  });
});
