export default (): Record<string, any> => ({
  mailer: {
    user: process.env.MAILER_USER,
    password: process.env.MAILER_PASSWORD,
    host: process.env.MAILER_HOST,
  },
  app: {
    port: process.env.APP_PORT,
  },
  database: {
    type: process.env.DATABASE_TYPE,
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DATABASE,
    logging: process.env.DATABASE_LOGGING,
    migrationsRun: process.env.DATABASE_MIGRATIONS_RUN,
    migrationsTableName: process.env.DATABASE_MIGRATIONS_TABLE_NAME,
  },
});
