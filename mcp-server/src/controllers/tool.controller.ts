import { Controller, Get, Header } from '@nestjs/common';
import { ToolsService } from '../services/tools-service';

@Controller('tools')
export class ToolController {
  constructor(private readonly toolsService: ToolsService) {}

  @Header('Content-Type', 'text/html')
  @Get('/generate-tools')
  async generateTools() {
    const toolsCreated = await this.toolsService.generateOpenAIToolsFromOpenAPI();
    return `<html><body><h2>Successfully created ${toolsCreated.length} tools</h2></body></html>`;
  }
}
