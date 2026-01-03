# Repository Guidelines

## Project Structure & Module Organization
- Vite + React + TypeScript app with entry points in `index.html`, `index.tsx`, and `App.tsx`.
- Route-level UI lives in `pages/` with role-based sections under `pages/student/`, `pages/teacher/`, and `pages/admin/`.
- Shared UI components are in `components/`; shared state is in `context/`.
- API and integration logic lives in `services/`; helpers live in `utils/`.
- Shared types and constants live in `types.ts`, `constants.ts`, and `translations.ts`.
- Global styles are in `index.css`; `dist/` is the build output from Vite (do not edit by hand).

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run dev`: start the local Vite dev server.
- `npm run build`: create a production build in `dist/`.
- `npm run preview`: serve the production build locally.

## Coding Style & Naming Conventions
- TypeScript with React function components; keep file and component names in PascalCase (e.g., `StudentDashboard.tsx`).
- Use consistent 2-space indentation and semicolons, matching existing files.
- Prefer `camelCase` for functions/variables, `PascalCase` for types and components, and `UPPER_SNAKE_CASE` for constants.
- Styles are mostly inline `className` strings plus global rules in `index.css`; keep JSX readable and avoid overly long class lists when possible.
- No formatter/linter is configured; follow existing patterns in the file you edit.

## Testing Guidelines
- No test framework or `npm test` script is configured currently.
- If you add tests, introduce a script in `package.json` and use a clear naming pattern (e.g., `*.test.tsx`) so they are easy to discover.

## Commit & Pull Request Guidelines
- Recent commits use short, imperative subjects; some include Conventional Commit prefixes like `chore:`. Follow that pattern and keep messages concise.
- PRs should include a brief summary, testing notes (what you ran), and screenshots for UI changes.
- Call out configuration changes (new env vars, API keys) explicitly in the PR description.

## Security & Configuration Tips
- Configure `VITE_OPENAI_API_KEY` in `.env.local` (optionally `VITE_OPENAI_TEXT_MODEL` / `VITE_OPENAI_IMAGE_MODEL`).
- Never commit secrets; keep `.env.local` local to your machine.
