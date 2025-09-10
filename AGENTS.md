# Repository Guidelines

This guide helps contributors work consistently in this repository. It favors small, reviewable changes and clear structure. When in doubt, ask in the PR.

## Project Structure & Module Organization
- Content lives under `content/` (e.g., `content/recipes/lasagna.md`).
- Assets live under `assets/` (images, icons), mirroring content slugs (e.g., `assets/images/lasagna/step-1.jpg`).
- Automation and utilities go in `tools/` (scripts, data cleaners) with self‑contained README notes.
- If application code is added, prefer `src/` with feature‑oriented folders; tests beside code in `__tests__/` or `tests/`.

## Build, Test, and Development Commands
This repo is currently lightweight. If/when tooling is added, use these conventional targets:
- `make dev` — run a local preview or watcher.
- `make build` — produce a production build/site export.
- `make test` — run all tests and linters.
If using npm instead of Make, mirror with `npm run dev|build|test`.

## Coding Style & Naming Conventions
- Markdown: use sentence‑case headings, wrap lines at ~100 chars, and include frontmatter (`title`, `servings`, `time`, `tags`).
- Filenames: kebab‑case for slugs (e.g., `quick-chicken-soup.md`).
- Images: JPEG for photos, PNG for diagrams; keep widths ≤ 1600px; name as `step-1.jpg`, `hero.jpg`.
- Scripts: prefer Python 3.11+ or Node 18+; 2‑space indentation; avoid one‑letter variables; add docstrings/comments sparingly but clearly.

## Testing Guidelines
- Content checks: run a Markdown linter and a link checker (e.g., `markdownlint`, `lychee`) via `make test`.
- Scripts: add unit tests (e.g., `pytest` or `vitest`) under `tests/` with names like `test_slugify.py` or `slugify.spec.ts`.
- Aim for coverage on utility functions; snapshot content rendering where applicable.

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`.
- Keep commits scoped and descriptive: "docs(recipes): add vegetarian chili with photos".
- PRs must include: purpose, scope, before/after (screenshots or sample output), and any follow‑ups. Link issues with `Closes #123`.

## Security & Configuration Tips
- Do not commit large binaries or secrets. Use `.env.example` for configuration and `.gitignore` for local files.
- Optimize media (lossy JPEG where acceptable). Consider `tools/optimize-images.*` for batch compression.
