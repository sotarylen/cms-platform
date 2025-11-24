import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { N8nInstanceEntity } from './entities/n8n-instance.entity';
import { WorkflowEntity } from './entities/workflow.entity';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class N8nIntegrationService {
  private readonly logger = new Logger(N8nIntegrationService.name);

  constructor(
    @InjectRepository(N8nInstanceEntity)
    private instanceRepository: Repository<N8nInstanceEntity>,
    @InjectRepository(WorkflowEntity)
    private workflowRepository: Repository<WorkflowEntity>,
  ) {}

  async createInstance(createInstanceData: any): Promise<N8nInstanceEntity> {
    // 创建实例实体
    const instance = this.instanceRepository.create(createInstanceData);
    return this.instanceRepository.save(instance);
  }

  async findAllInstances(): Promise<N8nInstanceEntity[]> {
    return this.instanceRepository.find({
      order: {
        id: 'ASC',
      },
    });
  }

  async findOneInstance(id: number): Promise<N8nInstanceEntity | null> {
    return this.instanceRepository.findOne({ where: { id } });
  }

  async updateInstance(id: number, updateInstanceData: any): Promise<N8nInstanceEntity> {
    const instance = await this.findOneInstance(id);
    if (!instance) {
      throw new NotFoundException(`n8n实例 #${id} 未找到`);
    }

    Object.assign(instance, updateInstanceData);
    return this.instanceRepository.save(instance);
  }

  async deleteInstance(id: number): Promise<boolean> {
    const instance = await this.findOneInstance(id);
    if (!instance) {
      throw new NotFoundException(`n8n实例 #${id} 未找到`);
    }

    await this.instanceRepository.remove(instance);
    return true;
  }

  async testConnection(instanceId: number): Promise<boolean> {
    const instance = await this.findOneInstance(instanceId);
    if (!instance) {
      throw new NotFoundException(`n8n实例 #${instanceId} 未找到`);
    }

    try {
      // 测试连接n8n实例
      const response = await axios.get(`${instance.url}/api/v1/workflows`, {
        headers: {
          'X-N8N-API-KEY': instance.apiKey,
        },
      });

      return response.status === 200;
    } catch (error) {
      this.logger.error(`连接测试失败: ${error.message}`, error.stack);
      return false;
    }
  }

  async syncWorkflows(instanceId: number): Promise<WorkflowEntity[]> {
    const instance = await this.findOneInstance(instanceId);
    if (!instance) {
      throw new NotFoundException(`n8n实例 #${instanceId} 未找到`);
    }

    try {
      // 从n8n实例获取工作流列表
      const response = await axios.get(`${instance.url}/api/v1/workflows`, {
        headers: {
          'X-N8N-API-KEY': instance.apiKey,
        },
      });

      const workflows = response.data.data || [];
      const savedWorkflows: WorkflowEntity[] = [];

      for (const wf of workflows) {
        // 查找是否已存在该工作流
        let workflow = await this.workflowRepository.findOne({
          where: {
            workflowId: wf.id,
            instance: { id: instanceId },
          },
        });

        if (!workflow) {
          // 创建新工作流
          workflow = this.workflowRepository.create({
            workflowId: wf.id,
            name: wf.name,
            description: wf?.nodes?.[0]?.parameters?.description || '',
            instance: { id: instanceId },
          });
        } else {
          // 更新现有工作流
          workflow.name = wf.name;
          workflow.description = wf?.nodes?.[0]?.parameters?.description || '';
        }

        savedWorkflows.push(await this.workflowRepository.save(workflow));
      }

      return savedWorkflows;
    } catch (error) {
      this.logger.error(`同步工作流失败: ${error.message}`, error.stack);
      throw new BadRequestException('同步工作流失败');
    }
  }

  async findAllWorkflows(instanceId?: number): Promise<WorkflowEntity[]> {
    const whereCondition = instanceId ? { instance: { id: instanceId } } : {};
    return this.workflowRepository.find({
      where: whereCondition,
      order: {
        id: 'ASC',
      },
      relations: ['instance'],
    });
  }

  async toggleWorkflow(instanceId: number, workflowId: string, enabled: boolean): Promise<boolean> {
    try {
      const instance = await this.findOneInstance(instanceId);
      if (!instance) {
        throw new NotFoundException(`n8n实例 #${instanceId} 未找到`);
      }

      // 更新n8n中的工作流状态
      await axios.post(
        `${instance.url}/api/v1/workflows/${workflowId}/${enabled ? 'activate' : 'deactivate'}`,
        {},
        {
          headers: {
            'X-N8N-API-KEY': instance.apiKey,
          },
        },
      );

      // 更新本地数据库
      await this.workflowRepository.update(
        { workflowId, instance: { id: instanceId } },
        { enabled },
      );

      return true;
    } catch (error) {
      this.logger.error(`切换工作流状态失败: ${error.message}`, error.stack);
      throw new BadRequestException('切换工作流状态失败');
    }
  }
}