export default () => ({
  environment: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  database: {
    url: process.env.DATABASE_URL ?? '',
  },
  cognito: {
    authority: process.env.COGNITO_AUTHORITY ?? '',
    clientId: process.env.COGNITO_CLIENT_ID ?? '',
  },
});
