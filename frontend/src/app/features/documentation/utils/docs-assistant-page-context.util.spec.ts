import { DocumentationContentService } from '../services/documentation-content.service';
import {
  resolveDashboardAssistantPageContext,
  resolveDocsAssistantPageContext,
} from './docs-assistant-page-context.util';

describe('docs-assistant-page-context.util', () => {
  describe('resolveDashboardAssistantPageContext', () => {
    it('maps known dashboard routes', () => {
      expect(resolveDashboardAssistantPageContext('/organization')).toBe('Organization');
      expect(resolveDashboardAssistantPageContext('/organization/api-keys')).toBe(
        'Organization API keys',
      );
      expect(resolveDashboardAssistantPageContext('/domain-groups')).toBe('Domain groups');
    });

    it('maps link map detail routes', () => {
      expect(resolveDashboardAssistantPageContext('/link-maps/abc-123')).toBe('Link map detail');
    });

    it('strips query strings', () => {
      expect(resolveDashboardAssistantPageContext('/domains?group=1')).toBe('Domains');
    });

    it('returns null for routes outside the dashboard shell', () => {
      expect(resolveDashboardAssistantPageContext('/docs/guides/foo')).toBeNull();
    });

    it('maps campaign dashboard routes', () => {
      expect(resolveDashboardAssistantPageContext('/overview')).toBe('Overview');
      expect(resolveDashboardAssistantPageContext('/home')).toBe('Overview');
      expect(resolveDashboardAssistantPageContext('/links')).toBe('Links');
      expect(resolveDashboardAssistantPageContext('/settings')).toBe('Settings');
      expect(resolveDashboardAssistantPageContext('/analytics')).toBe('Analytics');
    });

    it('maps links query flows for the assistant', () => {
      expect(resolveDashboardAssistantPageContext('/links?openCreate=1')).toBe(
        'Links — create link',
      );
      expect(resolveDashboardAssistantPageContext('/links?openConnectDomain=1')).toBe(
        'Links — connect domain',
      );
    });
  });

  describe('resolveDocsAssistantPageContext', () => {
    const docsContent = {
      guidePages: [{ slug: 'redirect-rules', title: 'Redirect rules' }],
      conceptPages: [],
      introPages: [],
    } as unknown as DocumentationContentService;

    it('maps guide slugs to titles', () => {
      expect(
        resolveDocsAssistantPageContext('/docs/guides/redirect-rules', docsContent),
      ).toBe('Guide: Redirect rules');
    });
  });
});
