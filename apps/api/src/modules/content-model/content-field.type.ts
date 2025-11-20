import { Field, ObjectType } from '@nestjs/graphql';
import { registerEnumType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export enum ContentFieldType {
  TEXT = 'TEXT',
  RICH_TEXT = 'RICH_TEXT',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  DATE = 'DATE',
  MEDIA = 'MEDIA',
  RELATION = 'RELATION',
  JSON = 'JSON',
}

registerEnumType(ContentFieldType, { name: 'ContentFieldType' });

@ObjectType('ContentField')
export class ContentFieldDefinition {
  @Field()
  @IsString()
  key!: string;

  @Field()
  @IsString()
  name!: string;

  @Field(() => ContentFieldType)
  type!: ContentFieldType;

  @Field({ defaultValue: false })
  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  helpText?: string;

  @Field({ nullable: true })
  @IsOptional()
  defaultValue?: unknown;
}
