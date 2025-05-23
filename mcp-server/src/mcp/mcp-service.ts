import { Injectable } from '@nestjs/common';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

@Injectable()
export class McpService {
  registerToolsFromJson(tools: any[], server: McpServer) {
    tools.forEach((tool) => {
      const { name, description, parameters } = tool.function;

      const schema = Object.fromEntries(
        Object.entries(parameters.properties).map(([key, value]) => {
          const type = (value as any).type;
          const description = (value as any).description || '';
          let paramType;

          switch (type) {
            case "integer":
            case "number":
              paramType = z.number().describe(description);
              break;
            case "string":
              paramType = z.string().describe(description);
              break;
            case "boolean":
              paramType = z.boolean().describe(description);
              break;
            default:
              paramType = z.string().describe(description);
          }

          return [key, paramType];
        })
      );

      server.tool(
        name,
        description,
        schema,
        async (args) => {
          // Implement the tool's logic here
          return {
            content: [
              {
                type: "text",
                text: `Tool ${name} executed with args: ${JSON.stringify(args)}`,
              },
            ],
          };
        }
      );
    });

  }
}
