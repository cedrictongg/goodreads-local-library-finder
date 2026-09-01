# Contributing

## Commit messages

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/), e.g.:

- `feat: add options page ZIP validation`
- `fix: handle missing ISBN on omnibus editions`
- `docs: clarify offscreen document lifecycle`
- `test: cover WorldCat adapter timeout path`
- `chore: bump eslint`

## Branches

Branch from `main` using `feat/<short-name>`, `fix/<short-name>`, or `docs/<short-name>`.

## A feature is complete only when

1. Non-obvious behavior is commented in code.
2. `npm test` passes.
3. Responsive layout is verified at both a narrow (< 480px) and desktop width.
4. Any new permission is documented in `docs/PERMISSIONS.md`.
5. Any new external endpoint is documented in `docs/EXTERNAL_ENDPOINTS.md`.
6. Commit history is Conventional-Commits-clean (rebase/squash before opening a PR if needed).
7. `README.md` and `docs/ARCHITECTURE.md` are updated if the change affects data flow, permissions, or setup.

## Pull requests

Open PRs against `main`. CI (lint + Jest) must pass before merge. Use the PR template checklist.

## Secrets

Never commit API keys or tokens. If a future adapter needs a credential (e.g. a library's OPAC API key), store it via the extension's options page and `chrome.storage.local`, not in source control.

## Code of conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
