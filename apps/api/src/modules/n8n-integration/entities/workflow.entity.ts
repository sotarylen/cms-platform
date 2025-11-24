import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { N8nInstanceEntity } from './n8n-instance.entity';

@ObjectType('Workflow')
@Entity({ name: 'n8n_workflows' })
export class WorkflowEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  workflowId!: string;

  @Field()
  @Column()
  name!: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field()
  @Column({ default: true })
  enabled!: boolean;

  @Field(() => Date, { nullable: true })
  @Column({ type: 'timestamptz', nullable: true })
  lastExecuted?: Date;

  @Field(() => N8nInstanceEntity)
  @ManyToOne(() => N8nInstanceEntity, (instance) => instance.workflows, { onDelete: 'CASCADE' })
  instance!: N8nInstanceEntity;

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @Field(() => Date)
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}