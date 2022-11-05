import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUser1666347766916 implements MigrationInterface {
  name = 'AddUser1666347766916';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."users_status_enum" AS ENUM('confirmed', 'Unconfirmed')`);
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "status" "public"."users_status_enum" DEFAULT 'Unconfirmed', "refresh_token" character varying, "code_hash" character varying, CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id")); COMMENT ON COLUMN "users"."email" IS 'Почта'; COMMENT ON COLUMN "users"."password" IS 'Хеш пароля'; COMMENT ON COLUMN "users"."status" IS 'Статус пользователя'; COMMENT ON COLUMN "users"."refresh_token" IS 'Рефреш токен'; COMMENT ON COLUMN "users"."code_hash" IS 'Код для подтверждения почты'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
  }
}
