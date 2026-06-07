import { ListLinksQuerySchema } from './links.schemas';

const domainGroupId = 'dmg_test1234567890123456789012';
const linkMapId = 'lmap_test123456789012345678901';
const startAfterId = 'lme_entry123456789012345678901';

describe('links.schemas', () => {
  describe('ListLinksQuerySchema', () => {
    it('accepts a valid query with optional filters', () => {
      const result = ListLinksQuerySchema.safeParse({
        domainGroupId,
        linkMapId,
        search: 'summer',
        limit: 25,
        startAfterId,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          domainGroupId,
          linkMapId,
          search: 'summer',
          limit: 25,
          startAfterId,
        });
      }
    });

    it('rejects search shorter than two characters', () => {
      const result = ListLinksQuerySchema.safeParse({
        limit: 20,
        search: 'a',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some(
            (issue) =>
              issue.path.join('.') === 'search' &&
              issue.message === 'Search must be at least 2 characters',
          ),
        ).toBe(true);
      }
    });

    it('trims search before validating minimum length', () => {
      const result = ListLinksQuerySchema.safeParse({
        limit: 20,
        search: '  a  ',
      });

      expect(result.success).toBe(false);
    });

    it('defaults limit to 20 when omitted', () => {
      const result = ListLinksQuerySchema.safeParse({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(20);
      }
    });
  });
});
