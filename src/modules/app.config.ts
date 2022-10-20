export default (): Record<string, any> => ({
  mailer: {
    user: process.env.MAILER_USER,
    password: process.env.MAILER_PASSWORD,
    host: process.env.MAILER_HOST,
  },
  queue: {
    host: process.env.QUEUE_HOST,
    port: process.env.QUEUE_PORT,
  },
  app: {
    httpPort: process.env.APP_PORT,
    httpPrefix: process.env.HTTP_PREFIX,
    httpHost: process.env.HTTP_HOST,
    httpVersion: process.env.HTTP_VERSION,
    seriviceName: process.env.SERVICE_NAME,
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
  jwt: {
    secret: process.env.JWT_SECRET,
    alg: process.env.JWT_ALG,
    iss: process.env.JWT_ISS,
    aud: process.env.JWT_AUD,
    accessExp: process.env.JWT_ACCESS_EXP,
    refreshExp: process.env.JWT_REFRESH_EXP,
  },
});
