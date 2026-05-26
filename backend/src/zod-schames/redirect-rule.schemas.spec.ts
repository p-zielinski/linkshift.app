import {
  CreateRedirectRuleSchema,
  UpdateRedirectRuleSchema,
} from './redirect-rule.schemas';

const domainGroupId = 'dmg_test1234567890123456789012';
const linkMapId = 'lmap_test123456789012345678901';

const linkMapCreateBase = {
  source: '/go',
  domainGroupId,
  linkMapId,
  pathMatch: 'prefix' as const,
  queryMatch: 'ignore' as const,
};

describe('redirect-rule.schemas', () => {
  describe('CreateRedirectRuleSchema', () => {
    it('rejects destination empty string when linkMapId is set', () => {
      const result = CreateRedirectRuleSchema.safeParse({
        ...linkMapCreateBase,
        destination: '',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some(
            (issue) =>
              issue.path.join('.') === 'destination' &&
              issue.message ===
                'Destination must be empty when linkMapId is provided.',
          ),
        ).toBe(true);
      }
    });

    it('rejects non-empty destination when linkMapId is set', () => {
      const result = CreateRedirectRuleSchema.safeParse({
        ...linkMapCreateBase,
        destination: 'https://example.com',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some(
            (issue) =>
              issue.message ===
              'Destination must be empty when linkMapId is provided.',
          ),
        ).toBe(true);
      }
    });

    it('accepts omitted destination when linkMapId is set', () => {
      const result = CreateRedirectRuleSchema.safeParse(linkMapCreateBase);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.destination).toBeUndefined();
      }
    });

    it('accepts null destination when linkMapId is set', () => {
      const result = CreateRedirectRuleSchema.safeParse({
        ...linkMapCreateBase,
        destination: null,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.destination).toBeNull();
      }
    });

    it('requires destination when linkMapId is not set', () => {
      const result = CreateRedirectRuleSchema.safeParse({
        source: '/go',
        domainGroupId,
        destination: '',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some(
            (issue) =>
              issue.path.join('.') === 'destination' &&
              issue.message ===
                'Destination is required when no link map is selected.',
          ),
        ).toBe(true);
      }
    });

    it('accepts normal create without link map', () => {
      const result = CreateRedirectRuleSchema.safeParse({
        source: '/go',
        domainGroupId,
        destination: 'https://example.com',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('UpdateRedirectRuleSchema', () => {
    it('rejects destination empty string when linkMapId is set', () => {
      const result = UpdateRedirectRuleSchema.safeParse({
        linkMapId,
        destination: '',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some(
            (issue) =>
              issue.message ===
              'Destination must be empty when linkMapId is provided.',
          ),
        ).toBe(true);
      }
    });
  });
});
