import { Controller, Post, Get, Req, Res, HttpStatus, Query } from '@nestjs/common';
import { Request, Response } from 'express';
import { McpServerProvider } from '../mcp/mcp.server.provider';

@Controller('mcp')
export class McpController {
  constructor(private readonly mcpProvider: McpServerProvider) {}

  @Post()
  async handleMcpRequests(@Req() req: Request, @Res() res: Response) {
    try {
      console.log('[MCP Controller] Received MCP request:', req.body);
      await this.mcpProvider.transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.log('[MCP Controller] Error handling MCP request:', JSON.stringify(error, null, 2));
    }
  }
}
