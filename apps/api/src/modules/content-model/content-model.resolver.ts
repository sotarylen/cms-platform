import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ContentModelEntity } from './content-model.entity.js';
import { ContentModelService } from './content-model.service.js';
import { CreateContentModelInput } from './dto/create-content-model.input.js';
import { UpdateContentModelInput } from './dto/update-content-model.input.js';

@Resolver(() => ContentModelEntity)
export class ContentModelResolver {
  constructor(private readonly service: ContentModelService) {}

  @Query(() => [ContentModelEntity])
  contentModels(@Args('tenantId', { nullable: true }) tenantId?: string) {
    return this.service.findAll(tenantId);
  }

  @Query(() => ContentModelEntity)
  contentModel(@Args('idOrApiName') idOrApiName: string) {
    return this.service.findOne(idOrApiName);
  }

  @Mutation(() => ContentModelEntity)
  createContentModel(@Args('input') input: CreateContentModelInput) {
    return this.service.create(input);
  }

  @Mutation(() => ContentModelEntity)
  updateContentModel(@Args('input') input: UpdateContentModelInput) {
    return this.service.update(input);
  }
}
