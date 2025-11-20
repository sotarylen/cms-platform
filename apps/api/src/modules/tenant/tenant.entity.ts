import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ContentModelEntity } from '../content-model/content-model.entity.js';
import { ContentEntryEntity } from '../content-entry/content-entry.entity.js';

@ObjectType('Tenant')
@Entity({ name: 'tenants' })
export class TenantEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field()
  @Column({ unique: true })
  slug!: string;

  @Field()
  @Column({ length: 120 })
  name!: string;

  @Field({ description: '是否启用' })
  @Column({ default: true })
  isActive!: boolean;

  @Field({ nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @Field(() => Date)
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => ContentModelEntity, (model) => model.tenant)
  models!: ContentModelEntity[];

  @OneToMany(() => ContentEntryEntity, (entry) => entry.tenant)
  entries!: ContentEntryEntity[];
}
