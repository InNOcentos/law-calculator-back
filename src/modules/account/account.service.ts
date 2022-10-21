import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountEntity } from './entities/account.entity';
import { FindAccountParams, SaveAccountParams, UpdateAccountParams } from './account.types';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
  ) {}

  async findOne(params: FindAccountParams): Promise<AccountEntity> {
    return this.accountRepository.findOneBy(params);
  }

  async save(params: SaveAccountParams): Promise<AccountEntity> {
    const account = new AccountEntity();
    account.email = params.email;
    account.password = params.passwordHash;
    account.codeHash = params.codeHash;

    return this.accountRepository.save(account);
  }

  async update(params: UpdateAccountParams): Promise<AccountEntity> {
    return this.accountRepository.save(params);
  }
}
