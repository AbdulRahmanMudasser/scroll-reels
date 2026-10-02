# Scroll Reels

## Stack

- **Language / Runtime**: TypeScript, Chrome extension runtime, Node.js
- **Framework**: WXT with Chrome Manifest V3
- **Key dependencies**: WXT, Vite, Vitest, Chrome extension APIs, Instagram page controls
- **Package manager**: npm

## Build approach

Skateboard, keep the smallest complete extension usable, then improve reliability in focused slices.

## Commands

```bash
# Install
none required

# Dev server
npm run dev

# Build
npm run build

# Test
npm test

# Lint
npm run lint
```

## Specs

The automatic scrolling decision lives in `docs/specs/0001-auto-scroll-lifecycle.md`. The timer and popup decision lives in `docs/specs/0002-timer-popup-controls.md`. Product scope lives in `docs/scope/scope.md`. Verification steps live in `docs/verify.md`. The visual direction lives in `design.md`.

## Rules

- Use plain TypeScript functions and `const` by default. Keep browser side effects at the entrypoint edges.
- Keep extension runtime files in `entrypoints/`, shared contracts in `utils/`, styles in `assets/styles/`, tests in `tests/`, and durable workflow docs in `docs/`.
- Keep manifest configuration in `wxt.config.ts`; load Chrome from `.output/chrome-mv3` after a build.
- Use Instagram's native Reel navigation controls first, then use the fallback navigation path.
- The extension theme may use only black, white, red, and blue from the CSS token declarations.
- Use semantic buttons, persistent labels, accessible names, and visible focus states.
- Keep auto scrolling bounded by the selected timer and stop all timers when the run ends.
- Use WXT content-script lifecycle timers and Shadow DOM UI helpers instead of unmanaged page injections.
- Keep dependency versions ranged from the verified lockfile and run lint, type checking, tests, and the production build before handoff.
- Use consistent naming and conventional commit messages if Git is added later.

## Agent skills

- [architect](.agents/skills/architect/): `jsmastery-pro/skills`, records load bearing architecture decisions
- [audit](.agents/skills/audit/): `jsmastery-pro/skills`, maintains project context files
- [check](.agents/skills/check/): `jsmastery-pro/skills`, verifies behavior before merge
- [debug](.agents/skills/debug/): `jsmastery-pro/skills`, diagnoses and fixes confirmed bugs
- [develop](.agents/skills/develop/): `jsmastery-pro/skills`, builds features and UI
- [document](.agents/skills/document/): `jsmastery-pro/skills`, writes human facing change documents
- [scope](.agents/skills/scope/): `jsmastery-pro/skills`, maintains coarse product scope
- [sync](.agents/skills/sync/): `jsmastery-pro/skills`, reconciles durable context after changes
- [test](.agents/skills/test/): `jsmastery-pro/skills`, writes and runs regression tests

## Context files

- [design.md](design.md): visual direction and palette mandate

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
