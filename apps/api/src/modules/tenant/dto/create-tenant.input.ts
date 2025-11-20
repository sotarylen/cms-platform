import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

@InputType()
export class CreateTenantInput {
  @Field()
  @IsString()
  @Length(2, 60)
  name!: string;

  @Field()
  @IsString()
  @Length(2, 60)
  slug!: string;

  @Field({ nullable: true })
  @IsOptional()
  metadata?: Record<string, unknown>;

  @Field({ defaultValue: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
