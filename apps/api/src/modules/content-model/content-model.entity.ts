import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { TenantEntity } from '../tenant/tenant.entity.js';
import { ContentEntryEntity } from '../content-entry/content-entry.entity.js';
import { ContentFieldDefinition, ContentFieldType } from './content-field.type.js';

@ObjectType('ContentModel')
@Entity({ name: 'content_models' })
export class ContentModelEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field()
  @Column()
  tenantId!: string;

  @Field()
  @Column({ unique: true })
  apiName!: string;

  @Field()
  @Column()
  displayName!: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field(() => [ContentFieldDefinition])
  @Column({ type: 'jsonb', default: [] })
  fields!: ContentFieldDefinition[];

  @Field(() => [String])
  @Column({ type: 'jsonb', default: [] })
  locales!: string[];

  @Field(() => [ContentFieldType])
  @Column({ type: 'jsonb', default: [] })
  uniqueFields!: ContentFieldType[];

  @Field()
  @Column({ default: false })
  singleton!: boolean;

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @Field(() => Date)
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => TenantEntity, (tenant) => tenant.models, { onDelete: 'CASCADE' })
  tenant!: TenantEntity;

  @OneToMany(() => ContentEntryEntity, (entry) => entry.model)
  entries!: ContentEntryEntity[];
}
