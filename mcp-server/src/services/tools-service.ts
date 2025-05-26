import { Injectable } from '@nestjs/common';
import SwaggerParser from '@apidevtools/swagger-parser';
import fs from 'fs/promises';
import path from 'path';

// @ts-nocheck
@Injectable()
export class ToolsService {
  constructor() {
  }

  /**
   * Parses an OpenAPI spec file and returns an array of OpenAI-compatible tools.
   * @param {string} specPath - Path to the OpenAPI JSON or YAML file.
   * @returns {Promise<Array<Object>>} Array of tool definitions.
   */
  async generateOpenAIToolsFromOpenAPI(specPath: string = path.resolve(__dirname, '../data/swagger.json')): Promise<Array<Object>> {
    const api = await SwaggerParser.dereference(path.resolve(specPath));
    const tools = [];

    for (const [route, methods] of Object.entries(api.paths || {})) {
      for (const [method, details] of Object.entries(methods)) {
        // @ts-expect-error
        tools.push(this.createTool(route, method, details));
      }
    }

    console.log('tools are: ', JSON.stringify(tools, null, 2));
    await fs.writeFile(path.resolve(__dirname, '../data/tools-4.json'), JSON.stringify(tools, null, 2));

    return tools;
  };


  getSchemaPropertiesWithRequired(schema) {
    if (schema.type === 'array') {
      return this.getSchemaPropertiesWithRequired(schema.items);
    }

    const props = schema.properties || {};
    const requiredProps = new Set();

    for (const [key, val] of Object.entries(props)) {
      // @ts-expect-error
      const isNullable = val.nullable === true;
      if (!isNullable) {
        requiredProps.add(key);
      }
    }

    return {properties: props, required: Array.from(requiredProps)};
  };

  processParameters(parameters, requiredParams) {
    const result = {};
    for (const param of parameters) {
      result[param.name] = {
        type: param.schema?.type || 'string',
        description: param.description || ''
      };
      if (param.required && param.schema?.nullable !== true) {
        requiredParams.add(param.name);
      }
    }
    return result;
  };

  processRequestBody(requestBody, parameters, requiredParams) {
    const jsonBody =
      requestBody?.['application/json'] ||
      requestBody?.['application/json; v=1.0'] ||
      requestBody?.['text/json; v=1.0'] ||
      requestBody?.['application/*+json; v=1.0'];

    if (jsonBody?.schema) {
      const {properties: bodyProps, required: bodyRequired} =
        this.getSchemaPropertiesWithRequired(jsonBody.schema);
      for (const [key, val] of Object.entries(bodyProps)) {
        parameters[key] = {
          // @ts-expect-error
          type: val.type || 'string',
          // @ts-expect-error
          description: val.description || ''
        };
      }
      bodyRequired.forEach((key) => requiredParams.add(key));
    }
  };

  createTool(route, method, details) {
    const name = `${method.toUpperCase()} ${route}`;
    const description = details.description || `${method.toUpperCase()} request to ${route}`;
    const parameters = {};
    const requiredParams = new Set();

    if (details.parameters) {
      Object.assign(parameters, this.processParameters(details.parameters, requiredParams));
    }

    if (details.requestBody?.content) {
      this.processRequestBody(details.requestBody.content, parameters, requiredParams);
    }

    return {
      type: 'function',
      function: {
        name: name.replace(/[^a-zA-Z0-9_]/g, '_'),
        description,
        parameters: {
          type: 'object',
          properties: parameters,
          ...(requiredParams.size > 0 && {required: Array.from(requiredParams)}),
        },
        invokeInfo: {
          'x-oas-path': route,
          'x-oas-method': method.toLowerCase(),
          'x-auth-required': details.security?.length > 0
        }
      }
    };
  };
}
