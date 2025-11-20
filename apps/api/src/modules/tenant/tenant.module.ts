import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantEntity } from './tenant.entity.js';
import { TenantResolver } from './tenant.resolver.js';
import { TenantService } from './tenant.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([TenantEntity])],
  providers: [TenantResolver, TenantService],
  exports: [TenantService],
})
export class TenantModule {}
