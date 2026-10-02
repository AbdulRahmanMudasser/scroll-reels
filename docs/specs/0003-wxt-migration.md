# WXT migration

**Status:** Proposed
**Date:** 2026 10 03

## Summary

Scroll Reels will move from hand maintained Manifest V3 files to WXT with TypeScript. WXT keeps the extension APIs visible while generating the manifest and managing development reloads. The popup remains a small native HTML surface, so React and Plasmo are not needed.

## Context

The current extension is small but has coupled manifest, popup, content script, and background script files. This makes reload and message issues harder to isolate. The migration keeps the product behavior, timer design, and Instagram only scope intact while adding a Vite based build and type checking.

## Options considered

- WXT with TypeScript. It has file based extension entrypoints, Vite development, and leaves browser APIs accessible.
- Plasmo with React. It is useful for large React based content interfaces, but this project has one compact popup and one timer control.
- Continue with plain JavaScript. It has no generated manifest validation, type checking, or managed development build.

## Decision

Use WXT with TypeScript and its vanilla HTML popup entrypoint. Keep the content script responsible for the session lifecycle, the background entrypoint responsible for opening the popup, and the popup responsible for requesting state and sending actions. Mount the page timer with WXT's Shadow DOM helper and use its content script timers so Instagram styles and reloads cannot leak into the extension lifecycle.

The generated Manifest V3 output must contain only the required Instagram host permission and Chrome tabs permission. The previous runtime layout is retired after the WXT build produces equivalent entrypoints.

**Implementation skills**: develop (`jsmastery-pro/skills`, `.agents/skills/develop/`) and test (`jsmastery-pro/skills`, `.agents/skills/test/`).

## Requirements

- The project builds with WXT and TypeScript.
- The generated extension has a background entrypoint, an Instagram content entrypoint, and a popup entrypoint.
- The automatic scrolling lifecycle remains bounded by the selected timer and advances only after the active Reel finishes.
- The popup must not show a selected preset that differs from a running session duration.
- The visual controls remain black and white, with red limited to completion and the logo dot.

## Consequences

WXT adds Node dependencies and a build output directory. Developers use the generated development or production output rather than loading the repository root directly. The project will use typed browser messages and a shared message contract to prevent popup and content script drift.

Tailwind is intentionally not part of this extension. WXT documents that Tailwind's `rem` units are not fully isolated inside content script Shadow DOMs. The small fixed size four color control is more reliable as a scoped stylesheet than as a utility CSS build.

## References

- [WXT migration guide](https://wxt.dev/guide/resources/migrate.html)
- [WXT entrypoints guide](https://wxt.dev/guide/essentials/entrypoints)
- [WXT extension APIs guide](https://wxt.dev/guide/essentials/extension-apis)
