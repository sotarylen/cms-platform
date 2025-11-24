import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { N8nInstanceEntity } from './entities/n8n-instance.entity';
import { WorkflowEntity } from './entities/workflow.entity';
import { N8nIntegrationService } from './n8n-integration.service';
import { N8nIntegrationController } from './n8n-integration.controller';

@Module({
  imports: [TypeOrmModule.forFeature([N8nInstanceEntity, WorkflowEntity])],
  controllers: [N8nIntegrationController],
  providers: [N8nIntegrationService],
  exports: [N8nIntegrationService],
})
export class N8nIntegrationModule {}