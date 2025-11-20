import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTenantInput } from './dto/create-tenant.input.js';
import { UpdateTenantInput } from './dto/update-tenant.input.js';
import { TenantEntity } from './tenant.entity.js';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(TenantEntity)
    private readonly tenantRepo: Repository<TenantEntity>,
  ) {}

  findAll() {
    return this.tenantRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(idOrSlug: string) {
    const tenant = await this.tenantRepo.findOne({
      where: [{ id: idOrSlug }, { slug: idOrSlug }],
    });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    return tenant;
  }

  create(input: CreateTenantInput) {
    const entity = this.tenantRepo.create(input);
    return this.tenantRepo.save(entity);
  }

  async update(input: UpdateTenantInput) {
    const tenant = await this.findOne(input.id);
    Object.assign(tenant, input);
    return this.tenantRepo.save(tenant);
  }
}
