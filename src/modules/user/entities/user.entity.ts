import { Exclude } from 'class-transformer';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserStatus } from '../user.types';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
  })
  readonly id: string;

  @Column('varchar', {
    comment: 'Почта',
  })
  email: string;

  @Exclude()
  @Column('varchar', {
    comment: 'Хеш пароля',
    name: 'password',
    nullable: false,
  })
  password?: string;

  @Exclude()
  @Column('enum', {
    comment: 'Статус пользователя',
    name: 'status',
    nullable: true,
    default: UserStatus.Unconfirmed,
    enum: UserStatus,
  })
  status?: UserStatus;

  @Exclude()
  @Column('varchar', {
    comment: 'Рефреш токен',
    name: 'refresh_token',
    nullable: true,
  })
  refreshToken?: string;

  @Exclude()
  @Column('varchar', {
    comment: 'Код для подтверждения почты',
    name: 'code_hash',
    nullable: true,
  })
  codeHash?: string;
}
