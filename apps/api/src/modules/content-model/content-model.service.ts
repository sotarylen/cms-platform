import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateContentModelInput } from './dto/create-content-model.input.js';
import { UpdateContentModelInput } from './dto/update-content-model.input.js';
import { ContentModelEntity } from './content-model.entity.js';

@Injectable()
export class ContentModelService {
  constructor(
    @InjectRepository(ContentModelEntity)
    private readonly modelRepo: Repository<ContentModelEntity>,
  ) {}

  findAll(tenantId?: string) {
    return this.modelRepo.find({
      where: tenantId ? { tenantId } : {},
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(idOrApiName: string) {
    const model = await this.modelRepo.findOne({
      where: [{ id: idOrApiName }, { apiName: idOrApiName }],
    });
    if (!model) throw new NotFoundException('Model not found');
    return model;
  }

  create(input: CreateContentModelInput) {
    const entity = this.modelRepo.create(input);
    return this.modelRepo.save(entity);
  }

  async update(input: UpdateContentModelInput) {
    const model = await this.findOne(input.id);
    Object.assign(model, input);
    return this.modelRepo.save(model);
  }
}
