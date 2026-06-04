import { HttpException, Injectable } from '@nestjs/common';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { DocsContentLoaderService } from '../docs-assistant/docs-content-loader.service';
import { DocsCatalogService } from '../docs-assistant/docs-catalog.service';
import { QrCodeService } from '../qr-code/qr-code.service';
import { RedirectTraceService } from '../redirect-trace/redirect-trace.service';
import * as mcpToolsSchemas from '../zod-schemas/mcp-tools.schemas';
import { MCP_SERVER_NAME, MCP_SERVER_VERSION } from './mcp.constants';
import { McpDocsCatalogSearchService } from './mcp-docs-catalog-search.service';

@Injectable()
export class McpHttpService {
  constructor(
    private readonly docsCatalogSearchService: McpDocsCatalogSearchService,
    private readonly docsCatalogService: DocsCatalogService,
    private readonly docsContentLoaderService: DocsContentLoaderService,
    private readonly redirectTraceService: RedirectTraceService,
    private readonly qrCodeService: QrCodeService,
  ) {}

  async handleRequest(request: Request, response: Response): Promise<void> {
    const server = this.createServer();

    try {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true,
      });

      await server.connect(transport);
      await transport.handleRequest(request, response, request.body);

      response.on('close', () => {
        void transport.close();
        void server.close();
      });
    } catch (error) {
      if (!response.headersSent) {
        response.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal server error',
          },
          id: null,
        });
      }

      void server.close();
      throw error;
    }
  }

  private createServer(): McpServer {
    const server = new McpServer(
      { name: MCP_SERVER_NAME, version: MCP_SERVER_VERSION },
      {
        instructions:
          'Read-only LinkShift documentation tools plus public redirect trace and QR code generation. Use docs_search_catalog to find pages, then docs_get_page for full content.',
      },
    );

    server.registerTool(
      'docs_search_catalog',
      {
        description:
          'Search the LinkShift documentation catalog by query (matches catalogId, userFacingRef, summary). Returns up to 20 entries as JSON.',
        inputSchema: mcpToolsSchemas.DocsSearchCatalogInputSchema,
        annotations: { readOnlyHint: true },
      },
      async (input): Promise<CallToolResult> => {
        try {
          const parsed = mcpToolsSchemas.DocsSearchCatalogInputSchema.parse(input);
          const results = this.docsCatalogSearchService.searchCatalog(parsed.query, parsed.limit);
          return this.textResult(JSON.stringify({ results }, null, 2));
        } catch (error) {
          return this.toolError(error);
        }
      },
    );

    server.registerTool(
      'docs_get_page',
      {
        description:
          'Load full documentation text for a catalog entry by catalogId (from docs_search_catalog).',
        inputSchema: mcpToolsSchemas.DocsGetPageInputSchema,
        annotations: { readOnlyHint: true },
      },
      async (input): Promise<CallToolResult> => {
        try {
          const parsed = mcpToolsSchemas.DocsGetPageInputSchema.parse(input);
          const entries = this.docsCatalogService.getByIds([parsed.catalogId]);
          if (entries.length === 0) {
            return this.toolErrorMessage(`Unknown catalogId: ${parsed.catalogId}`);
          }

          const content = this.docsContentLoaderService.loadContext(entries);
          if (!content.trim()) {
            return this.toolErrorMessage(`No content loaded for catalogId: ${parsed.catalogId}`);
          }

          return this.textResult(content);
        } catch (error) {
          return this.toolError(error);
        }
      },
    );

    server.registerTool(
      'trace_redirect',
      {
        description:
          'Trace a single HTTP redirect hop for a URL (same SSRF guards as the public trace API). Returns one hop as JSON.',
        inputSchema: mcpToolsSchemas.TraceRedirectInputSchema,
        annotations: { readOnlyHint: true },
      },
      async (input): Promise<CallToolResult> => {
        try {
          const parsed = mcpToolsSchemas.TraceRedirectInputSchema.parse(input);
          const step = await this.redirectTraceService.traceStep(parsed.url, parsed.userAgent);
          return this.textResult(JSON.stringify(step, null, 2));
        } catch (error) {
          return this.toolError(error);
        }
      },
    );

    server.registerTool(
      'generate_qr_code',
      {
        description:
          'Generate a QR code for a URL. Returns JSON with contentType and base64 payload (text formats are UTF-8 encoded).',
        inputSchema: mcpToolsSchemas.GenerateQrCodeInputSchema,
        annotations: { readOnlyHint: true },
      },
      async (input): Promise<CallToolResult> => {
        try {
          const parsed = mcpToolsSchemas.GenerateQrCodeInputSchema.parse(input);
          const generated = await this.qrCodeService.generate(
            parsed.url,
            parsed.format,
            parsed.size,
          );

          const base64 =
            typeof generated.payload === 'string'
              ? Buffer.from(generated.payload, 'utf8').toString('base64')
              : generated.payload.toString('base64');

          return this.textResult(
            JSON.stringify(
              {
                format: generated.extension,
                contentType: generated.contentType,
                base64,
              },
              null,
              2,
            ),
          );
        } catch (error) {
          return this.toolError(error);
        }
      },
    );

    return server;
  }

  private textResult(text: string): CallToolResult {
    return { content: [{ type: 'text', text }] };
  }

  private toolErrorMessage(message: string): CallToolResult {
    return {
      content: [{ type: 'text', text: message }],
      isError: true,
    };
  }

  private toolError(error: unknown): CallToolResult {
    if (error instanceof z.ZodError) {
      return this.toolErrorMessage(error.issues.map((issue) => issue.message).join('; '));
    }

    if (error instanceof HttpException) {
      const response = error.getResponse();
      const message =
        typeof response === 'string'
          ? response
          : typeof response === 'object' && response !== null && 'message' in response
            ? String((response as { message: unknown }).message)
            : error.message;
      return this.toolErrorMessage(message);
    }

    if (error instanceof Error) {
      return this.toolErrorMessage(error.message);
    }

    return this.toolErrorMessage('Unexpected error');
  }
}
