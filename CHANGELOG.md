# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
