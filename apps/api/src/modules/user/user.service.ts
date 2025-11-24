import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async createUser(createUserData: CreateUserInput): Promise<UserEntity> {
    // 检查用户名是否已存在
    const existingUser = await this.userRepository.findOne({
      where: [{ username: createUserData.username }, { email: createUserData.email }],
    });

    if (existingUser) {
      throw new BadRequestException('用户名或邮箱已存在');
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(createUserData.password, 10);

    // 创建用户实体
    const user = this.userRepository.create({
      ...createUserData,
      passwordHash: hashedPassword,
      role: createUserData.role || 'user',
    });

    return this.userRepository.save(user);
  }

  async findAll(): Promise<UserEntity[]> {
    return this.userRepository.find({
      order: {
        id: 'ASC',
      },
    });
  }

  async findOneById(id: number): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findOneByUsername(username: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async updateUser(id: number, updateUserData: UpdateUserInput): Promise<UserEntity> {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException(`用户 #${id} 未找到`);
    }

    Object.assign(user, updateUserData);
    return this.userRepository.save(user);
  }

  async deleteUser(id: number): Promise<boolean> {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException(`用户 #${id} 未找到`);
    }

    await this.userRepository.remove(user);
    return true;
  }

  async validateUserCredentials(username: string, password: string): Promise<UserEntity | null> {
    const user = await this.findOneByUsername(username);
    if (!user) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    return isValidPassword ? user : null;
  }
}