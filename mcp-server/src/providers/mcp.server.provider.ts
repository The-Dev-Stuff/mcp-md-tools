import { Injectable, OnModuleInit } from '@nestjs/common';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import { McpService } from '../services/mcp-service';
import tools from '../data/mcp-tools.json';

@Injectable()
export class McpServerProvider implements OnModuleInit {
  private server: McpServer;
  public transport: StreamableHTTPServerTransport;

  constructor(private mcpService: McpService) {
    this.server = new McpServer({
      name: 'MCP Server',
      description: 'A server for the Model Context Protocol',
      version: '1.0.0',
    });
    this.transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // set to undefined for stateless servers
    });
  }

  async onModuleInit() {
    console.log('McpServerProvider initialized.');

    console.log('Registering tools...');
    this.server.tool(
      "add",
      "Use this tool to add two numbers together.",
      {
        a: z.number().describe("The first number to add"),
        b: z.number().describe("The second number to add"),
      },
      async ({ a, b }) => {
        return {
          content: [
            {
              type: "text",
              text: `${a + b}`,
            },
          ],
        };
      }
    );

    this.mcpService.registerToolsFromJson(tools, this.server);
    console.log('Tools registered successfully.');

    await this.server.connect(this.transport);
  }
}
