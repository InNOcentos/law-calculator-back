import { Exclude } from 'class-transformer';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'user_id',
  })
  readonly userId: string;

  @Column('varchar', {
    comment: 'Почта',
  })
  email: string;

  @Exclude()
  @Column('varchar', {
    comment: 'Хеш пароля',
    name: 'password',
    nullable: true,
  })
  password?: string;

  @Exclude()
  @Column('varchar', {
    comment: 'Рефреш токен',
    name: 'refresh_token',
    nullable: true,
  })
  refreshToken?: string;
}
