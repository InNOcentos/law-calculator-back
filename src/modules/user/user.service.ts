import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findOne(params: { email?: string; userId?: string }): Promise<UserEntity> {
    return this.userRepository.findOneBy(params);
  }

  async save(params: { email: string; passwordHash: string }): Promise<UserEntity> {
    const user = new UserEntity();
    user.email = params.email;
    user.password = params.passwordHash;

    return this.userRepository.save(user);
  }

  async update(params: { userId?: string; email?: string; refreshToken?: string }): Promise<UserEntity> {
    return this.userRepository.save(params);
  }
}
