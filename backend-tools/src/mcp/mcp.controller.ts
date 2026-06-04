import { All, Controller, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ClsService } from 'nestjs-cls';
import { Logger } from 'nestjs-pino';
import { extractClientIp } from '../utils/client-ip.util';
import { MCP_HTTP_PATH } from './mcp.constants';
import { McpHttpService } from './mcp-http.service';
import { McpRateLimitService } from './mcp-rate-limit.service';

@Controller('api/v1/public')
export class McpController {
  constructor(
    private readonly mcpHttpService: McpHttpService,
    private readonly mcpRateLimitService: McpRateLimitService,
    private readonly clsService: ClsService,
    private readonly logger: Logger,
  ) {}

  @All(MCP_HTTP_PATH)
  async handleMcp(@Req() request: Request, @Res() response: Response): Promise<void> {
    const clientIp = extractClientIp(request);
    await this.mcpRateLimitService.check(clientIp);

    this.logger.log('MCP request received', {
      requestId: this.clsService.getId(),
      clientIp,
      method: request.method,
    });

    response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.setHeader('Pragma', 'no-cache');
    response.setHeader('Expires', '0');

    if (request.method === 'GET') {
      response.status(405).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Method not allowed. Use POST for stateless MCP requests.',
        },
        id: null,
      });
      return;
    }

    if (request.method !== 'POST') {
      response.status(405).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Method not allowed.',
        },
        id: null,
      });
      return;
    }

    await this.mcpHttpService.handleRequest(request, response);
  }
}
