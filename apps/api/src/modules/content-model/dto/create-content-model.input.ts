import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsBoolean, IsOptional, IsString, Matches } from 'class-validator';
import { ContentFieldDefinition } from '../content-field.type.js';

@InputType()
export class CreateContentModelInput {
  @Field()
  @IsString()
  tenantId!: string;

  @Field()
  @Matches(/^[a-zA-Z][A-Za-z0-9_]+$/)
  apiName!: string;

  @Field()
  @IsString()
  displayName!: string;

  @Field({ nullable: true })
  @IsOptional()
  description?: string;

  @Field(() => [String], { nullable: 'itemsAndList' })
  @IsArray()
  @IsOptional()
  locales?: string[];

  @Field(() => [ContentFieldDefinition])
  @IsArray()
  fields!: ContentFieldDefinition[];

  @Field({ defaultValue: false })
  @IsBoolean()
  @IsOptional()
  singleton?: boolean;
}
