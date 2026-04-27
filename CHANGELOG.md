# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-04-27

> PR #7 — [FEAT] v.0.0.4 -> v.0.1.0

- useIntersectionObserver 훅 추가

---

## [0.0.4] - 2026-04-27

> PR #4 — [FIX] v.0.0.3 -> v.0.0.4

- release workflow 파싱 버그 수정
  : changelog에 백틱, 따옴표 등 특수문자 포함 시 GitHub Actions 스크립트 구문 에러 발생하던 문제 수정
  : 동적 값을 env 블록으로 분리하여 process.env / os.environ으로 안전하게 읽도록 개선

---

## [$VERSION] - $DATE

> PR #$PR_NUMBER — $PR_TITLE

$CHANGELOG

---

## [$VERSION] - $DATE

> PR #$PR_NUMBER — $PR_TITLE

$CHANGELOG

---

## [0.0.1] - 2026-04-27

### Added

- `useDebounce` — Delays function execution until after a specified wait time has elapsed since the last invocation
- `useThrottle` — Limits function execution to at most once per specified time period
- `useBoolean` — Manages boolean state with convenient `setTrue`, `setFalse`, and `toggle` helpers
- `usePrevious` — Returns the value from the previous render
- `useLocalStorage` — Syncs state with `localStorage`, supports cross-tab updates
- `useOutsideClick` — Detects clicks outside a target element
- `useMediaQuery` — Tracks CSS media query match state reactively
