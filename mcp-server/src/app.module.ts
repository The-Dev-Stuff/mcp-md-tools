import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { McpController } from './controllers/mcp.controller';
import { McpServerProvider } from './mcp/mcp.server.provider';

@Module({
  imports: [],
  controllers: [AppController, McpController],
  providers: [
    AppService,
    McpServerProvider
  ],
})
export class AppModule {}
