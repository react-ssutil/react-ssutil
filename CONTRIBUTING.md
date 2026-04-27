# Contributing Guide

## Commit Message Convention

This project enforces [Conventional Commits](https://www.conventionalcommits.org/) via husky + commitlint.

### Format

```
<type>: <subject>
```

- **type** — must be one of the allowed types below (lowercase only)
- **subject** — short description of the change (Korean is allowed)
- **header** — must not exceed 72 characters

### Allowed types

| Type | Description | Appears in CHANGELOG |
|---|---|---|
| `feat` | New hook or feature | ✅ 🚀 Features |
| `fix` | Bug fix | ✅ 🐛 Bug Fixes |
| `perf` | Performance improvement | ✅ ⚡ Performance |
| `refactor` | Code refactoring | ✅ ♻️ Refactors |
| `docs` | Documentation only | ✅ 📝 Documentation |
| `test` | Add or fix tests | hidden |
| `chore` | Config, build, tooling | hidden |
| `ci` | CI/CD changes | hidden |
| `revert` | Revert a previous commit | hidden |

### Examples

```bash
# English
git commit -m "feat: add useWindowSize hook"
git commit -m "fix: resolve useDebounce memory leak on unmount"
git commit -m "docs: update useThrottle usage example"

# Korean is fine too
git commit -m "feat: useWindowSize 훅 추가"
git commit -m "fix: 언마운트 시 useDebounce 메모리 누수 수정"
git commit -m "chore: tsup 설정 업데이트"
```

### What gets blocked

```bash
git commit -m "update: fix something"   # ❌ unknown type
git commit -m "수정함"                   # ❌ missing type
git commit -m "Fix: something"          # ❌ type must be lowercase
```

---

## Pre-commit hooks

Every commit automatically runs:

1. **`pnpm lint`** — TypeScript type check
2. **`pnpm test`** — vitest test suite

If either fails, the commit is rejected.

---

## Setup

Run this once after cloning:

```bash
pnpm install
```

`prepare` script activates husky hooks automatically on install.

---

## Release

When you're ready to publish a new version:

```bash
pnpm release
```

This will:
1. Prompt for version bump (patch / minor / major)
2. Auto-update `CHANGELOG.md` from commit history
3. Bump `package.json` version
4. Create a git tag
5. Create a GitHub Release
6. Publish to npm

> Requires `GITHUB_TOKEN` to be set in your environment.

```bash
# Add to ~/.zshrc or ~/.bashrc
export GITHUB_TOKEN=ghp_xxxxxxxxxxxx
```
