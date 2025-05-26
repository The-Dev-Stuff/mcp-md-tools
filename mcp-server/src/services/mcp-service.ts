import { Injectable } from '@nestjs/common';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

@Injectable()
export class McpService {
  registerToolsFromJson(tools: any[], server: McpServer) {
    tools.forEach((tool) => {
      const { name, description, parameters } = tool.function;

      const schema = Object.fromEntries(
        Object.entries(parameters?.properties || {}).map(([key, value]) => {
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

          if (!parameters?.required?.includes(key)) {
            paramType = paramType.optional();
          }

          return [key, paramType];
        })
      );

      server.tool(
        name,
        description,
        schema,
        async (args) => {
          console.log('data available at invoke time: ', {
            name,
            description,
            parameters,
            args,
          });

          /*

          data available at invoke time:  {
              name: 'POST__api_v1_Books',
              description: 'Creates a new book.',
              parameters: {
                type: 'object',
                properties: {
                  id: [Object],
                  title: [Object],
                  description: [Object],
                  pageCount: [Object],
                  excerpt: [Object],
                  publishDate: [Object]
                },
                required: [ 'id', 'pageCount', 'publishDate' ]
              },
              args: { id: 12, pageCount: 12, publishDate: '12-26-2023' }
            }

            We can use the name from this data to find the matching tool and invoke it.
            The invokeInfo of the tool contains the API information.

             {
                "type": "function",
                "function": {
                  "name": "POST__api_v1_Books",
                  "description": "Creates a new book.",
                  "parameters": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "integer",
                        "description": ""
                      },
                      "title": {
                        "type": "string",
                        "description": ""
                      },
                      "description": {
                        "type": "string",
                        "description": ""
                      },
                      "pageCount": {
                        "type": "integer",
                        "description": ""
                      },
                      "excerpt": {
                        "type": "string",
                        "description": ""
                      },
                      "publishDate": {
                        "type": "string",
                        "description": ""
                      }
                    },
                    "required": [
                      "id",
                      "pageCount",
                      "publishDate"
                    ]
                  },
                  "invokeInfo": {
                    "x-oas-path": "/api/v1/Books",
                    "x-oas-method": "post",
                    "x-auth-required": false
                  }
                }
              }

              **Note:
              Tweak the function that creates tools so we can add information to know where the required properties go
              - headers {}, query {}, path {}, body {}

              Something like:

              "invokeInfo": {
                "base-api": "https://api.example.com",
                "x-oas-path": "/api/v1/Books",
                "x-oas-method": "post",
                "x-auth-required": false,
                "headers": {

                },
                "path": {

                },
                "query": {

                },

                "body": {

                }
              }
           */
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
