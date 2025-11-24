import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, HttpStatus } from '@nestjs/common';
import { N8nIntegrationService } from './n8n-integration.service';

@Controller('n8n')
export class N8nIntegrationController {
  constructor(private readonly n8nService: N8nIntegrationService) {}

  // 实例管理接口
  @Get('instances')
  async getAllInstances() {
    return {
      statusCode: HttpStatus.OK,
      data: await this.n8nService.findAllInstances(),
    };
  }

  @Post('instances')
  async createInstance(@Body() createInstanceData: any) {
    return {
      statusCode: HttpStatus.CREATED,
      data: await this.n8nService.createInstance(createInstanceData),
    };
  }

  @Put('instances/:id')
  async updateInstance(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInstanceData: any,
  ) {
    return {
      statusCode: HttpStatus.OK,
      data: await this.n8nService.updateInstance(id, updateInstanceData),
    };
  }

  @Delete('instances/:id')
  async deleteInstance(@Param('id', ParseIntPipe) id: number) {
    const result = await this.n8nService.deleteInstance(id);
    return {
      statusCode: HttpStatus.OK,
      data: { success: result },
    };
  }

  @Post('instances/:id/test')
  async testConnection(@Param('id', ParseIntPipe) id: number) {
    const success = await this.n8nService.testConnection(id);
    return {
      statusCode: HttpStatus.OK,
      data: { success },
    };
  }

  // 工作流管理接口
  @Get('instances/:id/workflows')
  async getInstanceWorkflows(@Param('id', ParseIntPipe) id: number) {
    return {
      statusCode: HttpStatus.OK,
      data: await this.n8nService.syncWorkflows(id),
    };
  }

  @Get('workflows')
  async getAllWorkflows() {
    return {
      statusCode: HttpStatus.OK,
      data: await this.n8nService.findAllWorkflows(),
    };
  }

  @Post('workflows/:workflowId/activate')
  async activateWorkflow(
    @Body('instanceId', ParseIntPipe) instanceId: number,
    @Param('workflowId') workflowId: string,
  ) {
    const success = await this.n8nService.toggleWorkflow(instanceId, workflowId, true);
    return {
      statusCode: HttpStatus.OK,
      data: { success },
    };
  }

  @Post('workflows/:workflowId/deactivate')
  async deactivateWorkflow(
    @Body('instanceId', ParseIntPipe) instanceId: number,
    @Param('workflowId') workflowId: string,
  ) {
    const success = await this.n8nService.toggleWorkflow(instanceId, workflowId, false);
    return {
      statusCode: HttpStatus.OK,
      data: { success },
    };
  }
}