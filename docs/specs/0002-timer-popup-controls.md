# Timer and popup controls

**Status:** In Progress
**Date:** 2026 10 03

## Summary

Scroll Reels provides one top right timer on Instagram and a compact extension popup for selecting duration, starting, stopping, and checking status.

## Requirements

- The page contains one timer card at the top right and no custom previous or next controls.
- Clicking the timer opens the Scroll Reels extension popup in the same Chrome window.
- The popup provides a duration input, 5 Min, 10 Min, and 30 Min quick choices, Start Auto Scroll, Stop Scrolling, and a live status display.
- The visual system uses only black, white, red, and blue.
- The popup has no shadows, elevation effects, session block, connection status block, or tip block.

## Decision

The content script injects a single button styled as the timer card. Its click sends `OPEN_POPUP` to `entrypoints/background.ts`. The service worker calls `browser.action.openPopup` for the source tab's window.

The popup owns duration selection and sends `START` or `STOP` messages to the active Instagram tab. It polls the content script for session status so the countdown and action states reflect the automatic scrolling lifecycle. Duration controls are disabled while a session runs, so a selected preset always matches the active session.

`design.md`, `assets/styles/content.css`, and `assets/styles/popup.css` define the flat white surface, black controls and running state, red completion accent, and the strict four color palette.

## Build plan

1. Inject the timer card as the only page level extension control.
2. Relay timer clicks through the service worker to open the action popup.
3. Implement bounded duration input, quick choices, start and stop actions, and status polling.
4. Apply the shared flat visual rules and remove all extra popup content.
5. Verify popup opening, timer alignment, and the four color theme with the regression suite and browser checklist.

## Consequences

Opening a popup from the timer requires a Chrome version that supports `browser.action.openPopup`. The extension action icon remains an equivalent way to open the same controls when Chrome rejects the request.

## Verification

- Run `npm test` and `npm run build`.
- Follow the timer and popup checks in [docs/verify.md](../verify.md).
