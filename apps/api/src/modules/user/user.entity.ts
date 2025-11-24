import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('User')
@Entity({ name: 'users' })
export class UserEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ unique: true })
  username!: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  email?: string;

  @Column()
  passwordHash!: string;

  @Field()
  @Column({ default: 'user' })
  role!: string;

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @Field(() => Date)
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}