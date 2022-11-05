import migrations from '../migrations';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '../../user/entities/user.entity';

export const databaseOptionsFactory = (config: ConfigService): TypeOrmModuleOptions & PostgresConnectionOptions => ({
  type: config.get<any>('database.type'),
  host: config.get<string>('database.host'),
  port: Number(config.get('database.port')),
  username: config.get<string>('database.username'),
  password: config.get<string>('database.password'),
  database: config.get<string>('database.database'),
  logging: config.get<string>('database.logging') === 'true',
  synchronize: false,
  migrationsRun: true,
  entities: [UserEntity],
  migrationsTableName: config.get<string>('database.migrationsTableName'),
  migrations,
  autoLoadEntities: true,
});
