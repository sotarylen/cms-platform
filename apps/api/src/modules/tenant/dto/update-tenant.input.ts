import { Field, InputType, PartialType } from '@nestjs/graphql';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateTenantInput } from './create-tenant.input.js';

@InputType()
export class UpdateTenantInput extends PartialType(CreateTenantInput) {
  @Field()
  id!: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
