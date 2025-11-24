import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UserEntity } from './user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';

@Resolver(() => UserEntity)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [UserEntity], { name: 'users' })
  async getAllUsers(): Promise<UserEntity[]> {
    return this.userService.findAll();
  }

  @Query(() => UserEntity, { name: 'user' })
  async getUserById(@Args('id', { type: () => ID }) id: number): Promise<UserEntity | null> {
    return this.userService.findOneById(id);
  }

  @Mutation(() => UserEntity)
  async createUser(@Args('input') createUserData: CreateUserInput): Promise<UserEntity> {
    return this.userService.createUser(createUserData);
  }

  @Mutation(() => UserEntity)
  async updateUser(@Args('input') updateUserData: UpdateUserInput): Promise<UserEntity> {
    return this.userService.updateUser(updateUserData.id, updateUserData);
  }

  @Mutation(() => Boolean)
  async deleteUser(@Args('id', { type: () => ID }) id: number): Promise<boolean> {
    return this.userService.deleteUser(id);
  }
}