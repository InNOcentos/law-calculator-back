import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAccount1666347766916 implements MigrationInterface {
  name = 'AddAccount1666347766916';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."accounts_status_enum" AS ENUM('confirmed', 'Unconfirmed')`);
    await queryRunner.query(
      `CREATE TABLE "accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "status" "public"."accounts_status_enum" DEFAULT 'Unconfirmed', "refresh_token" character varying, "code_hash" character varying, CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id")); COMMENT ON COLUMN "accounts"."email" IS 'Почта'; COMMENT ON COLUMN "accounts"."password" IS 'Хеш пароля'; COMMENT ON COLUMN "accounts"."status" IS 'Статус пользователя'; COMMENT ON COLUMN "accounts"."refresh_token" IS 'Рефреш токен'; COMMENT ON COLUMN "accounts"."code_hash" IS 'Код для подтверждения почты'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "accounts"`);
    await queryRunner.query(`DROP TYPE "public"."accounts_status_enum"`);
  }
}
