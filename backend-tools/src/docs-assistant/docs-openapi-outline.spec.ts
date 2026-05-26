import { buildOpenApiOutline } from './docs-openapi-outline';

describe('buildOpenApiOutline', () => {
  it('lists operations with method, path, and tag without internal file paths', () => {
    const outline = buildOpenApiOutline({
      openapi: '3.1.0',
      info: { title: 'LinkShift API — Domain Groups', version: '1.0.0' },
      tags: [{ name: 'Domain Groups' }],
      'x-linkshift': { sourceTag: 'Domain Groups' },
      paths: {
        '/api/v1/domain-groups': {
          get: {
            tags: ['Domain Groups'],
            operationId: 'listDomainGroups',
            summary: 'List domain groups',
          },
        },
      },
    });

    expect(outline).toContain('OpenAPI reference (tag: Domain Groups)');
    expect(outline).toContain('**GET /api/v1/domain-groups**');
    expect(outline).toContain('listDomainGroups');
    expect(outline).not.toContain('shared/docs');
    expect(outline).not.toContain('docs-summaries');
  });
});
