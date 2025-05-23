import { Injectable, OnModuleInit } from '@nestjs/common';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';

@Injectable()
export class McpServerProvider implements OnModuleInit {
  private server: McpServer;
  public transport: StreamableHTTPServerTransport;

  constructor() {
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
    // Initialize the server or perform any setup needed
    console.log('McpServerProvider initialized.');

    // Ideally we load the available tools from a configuration or a database
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

    await this.server.connect(this.transport);
  }
}
