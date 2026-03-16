# Repository Guidelines

## Project Structure & Module Organization
`src/` contains the application code for the TanStack Start site: routes live in `src/routes`, shared UI in `src/components`, reusable logic in `src/hooks` and `src/lib`, and global styles in `src/styles`. `public/` holds static assets served as-is. `default/` is the blog content source configured in `blog.config.json`; keep Markdown content and Obsidian folders there. `docs/` is for project notes, and `dist/` is generated build output. Do not hand-edit `src/routeTree.gen.ts`; treat it as generated code.

## Build, Test, and Development Commands
Use `pnpm` with the lockfile checked in.

- `pnpm dev` starts the local Vite dev server on port `3000`.
- `pnpm build` creates the production bundle in `dist/`.
- `pnpm preview` serves the built app on port `4000`.
- `pnpm check` runs Biome formatting and lint checks.
- `pnpm lint` runs Biome lint rules only.
- `pnpm format` applies Biome formatting.
- `pnpm type-check` runs `tsc --noEmit`.
- `pnpm test` runs Vitest.

## Coding Style & Naming Conventions
Biome is the source of truth. This repo uses tabs for indentation and double quotes in TS/TSX. Keep route files in `src/routes` aligned with URL structure, prefer lowercase file names for utilities, and use `PascalCase` for React component exports. Avoid editing excluded vendor-style folders such as `src/components/ui` unless the change is intentional and reviewed.

## Testing Guidelines
Vitest and Testing Library are installed. Co-locate tests next to the code they cover using `*.test.ts` or `*.test.tsx`. Focus on route behavior, component rendering, and hook edge cases. Run `pnpm test` before opening a PR, and always pair it with `pnpm check` and `pnpm type-check`. If a change touches `default/` content parsing or routing, add a regression test.

## Commit & Pull Request Guidelines
History is still minimal (`init`), so keep commit subjects short, imperative, and specific, for example: `add blog search input`. PRs should summarize the user-visible change, list validation performed, and include screenshots for UI or route updates. Link related issues when available, and call out any changes to `default/`, `.env`, or build configuration.

## Configuration Notes
Client environment variables must use the `VITE_` prefix and belong in `.env`. Pre-commit hooks run `pnpm check` and `pnpm type-check` via Lefthook, so keep both green before pushing.
