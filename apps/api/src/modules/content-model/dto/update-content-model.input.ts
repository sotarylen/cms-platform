import { Field, InputType, PartialType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { CreateContentModelInput } from './create-content-model.input.js';

@InputType()
export class UpdateContentModelInput extends PartialType(CreateContentModelInput) {
  @Field()
  @IsString()
  id!: string;
}
