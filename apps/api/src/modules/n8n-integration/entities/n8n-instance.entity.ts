import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { WorkflowEntity } from './workflow.entity';

@ObjectType('N8nInstance')
@Entity({ name: 'n8n_instances' })
export class N8nInstanceEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  name!: string;

  @Field()
  @Column()
  url!: string;

  @Column()
  apiKey!: string;

  @Field()
  @Column({ default: true })
  enabled!: boolean;

  @Field(() => [WorkflowEntity], { nullable: true })
  @OneToMany(() => WorkflowEntity, (workflow) => workflow.instance)
  workflows!: WorkflowEntity[];

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @Field(() => Date)
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}