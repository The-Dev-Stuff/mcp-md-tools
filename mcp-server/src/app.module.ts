import { Module } from '@nestjs/common';
import { ToolController } from './controllers/tool.controller';
import { McpController } from './controllers/mcp.controller';

import { McpServerProvider } from './providers/mcp.server.provider';

import { McpService } from './services/mcp-service';
import { ToolsService } from './services/tools-service';

@Module({
  imports: [],
  controllers: [ToolController, McpController],
  providers: [
    McpServerProvider,
    McpService,
    ToolsService
  ],
})
export class AppModule {}
