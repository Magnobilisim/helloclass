# HelloClass Backend

Server-side API for the HelloClass platform. Built with NestJS, Prisma, and PostgreSQL.

## Getting Started

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run start:dev
```

### Environment Variables

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `COGNITO_AUTHORITY` | Cognito issuer URL |
| `COGNITO_CLIENT_ID` | Cognito app client ID |
| `PORT` | HTTP port (default 3000) |

## Available Scripts

- `npm run start:dev` – start the API in watch mode.
- `npm run build` – compile TypeScript to `dist/`.
- `npm run start:prod` – run the compiled app.
- `npm run prisma:generate` – generate Prisma client.
- `npm run prisma:migrate` – run database migrations.
- `npm run lint` – lint the codebase.

## Project Structure

```
src/
  config/            # configuration helpers
  modules/health/    # health check endpoint
prisma/
  schema.prisma      # database schema definition
```

More modules will be added as we implement features (auth, exams, shop, payments, etc.).
