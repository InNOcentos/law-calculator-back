import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { DeleteUserParams, FindUserParams, SaveUserParams, UpdateUserParams } from './user.types';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findOne(params: FindUserParams): Promise<UserEntity> {
    return this.userRepository.findOneBy(params);
  }

  async save(params: SaveUserParams): Promise<UserEntity> {
    const user = new UserEntity();
    user.email = params.email;
    user.password = params.passwordHash;
    user.codeHash = params.codeHash;

    return this.userRepository.save(user);
  }

  async update(params: UpdateUserParams): Promise<UserEntity> {
    return this.userRepository.save(params);
  }

  async delete(params: DeleteUserParams): Promise<DeleteResult> {
    return this.userRepository.delete(params);
  }
}
