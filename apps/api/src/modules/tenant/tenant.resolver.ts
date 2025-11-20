import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateTenantInput } from './dto/create-tenant.input.js';
import { UpdateTenantInput } from './dto/update-tenant.input.js';
import { TenantEntity } from './tenant.entity.js';
import { TenantService } from './tenant.service.js';

@Resolver(() => TenantEntity)
export class TenantResolver {
  constructor(private readonly tenantService: TenantService) {}

  @Query(() => [TenantEntity])
  tenants() {
    return this.tenantService.findAll();
  }

  @Query(() => TenantEntity)
  tenant(@Args('idOrSlug') idOrSlug: string) {
    return this.tenantService.findOne(idOrSlug);
  }

  @Mutation(() => TenantEntity)
  createTenant(@Args('input') input: CreateTenantInput) {
    return this.tenantService.create(input);
  }

  @Mutation(() => TenantEntity)
  updateTenant(@Args('input') input: UpdateTenantInput) {
    return this.tenantService.update(input);
  }
}
