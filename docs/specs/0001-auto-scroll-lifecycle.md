# Automatic scrolling lifecycle

**Status:** In Progress
**Date:** 2026 10 03

## Summary

Scroll Reels automatically advances Instagram Reels for a selected session duration. The content script owns the running state and stops every scheduled task when the session finishes or is stopped.

## Requirements

- The user can run a session for a bounded duration from 1 to 180 minutes.
- The active Reel advances automatically when its video ends or when the next advance fallback expires.
- The extension prefers Instagram's native next Reel control when it is available.
- The extension does not add custom direction controls or require the user to trigger advancement.
- Stopping or completing a session clears all advance and countdown timers.

## Decision

Keep the lifecycle in `src/content.js`, close to the Instagram DOM it controls. `startAutoScroll` creates a countdown and schedules the next advancement. `stopAutoScroll` is the single cleanup path for completing and user requested stops.

The navigation routine first looks for Instagram's native next Reel control across `button` and `[role="button"]` elements. When native control markup cannot be activated, it uses scrolling fallbacks. The page timer is status only and does not replace Instagram navigation.

This design follows the requested core behavior: scrolling must happen automatically, remain time limited, and avoid duplicate controls.

## Build plan

1. Keep bounded duration state and cleanup handles in the content script.
2. Wait for active video metadata and completion, with a 9 second fallback only when no active video is available.
3. Advance through Instagram's native next Reel control before using fallbacks.
4. Update the on page timer from the same lifecycle state.
5. Verify the running, stopped, and completed states with the regression suite and browser checklist.

## Consequences

Instagram can change its control markup without notice. The native lookup handles the currently supported button and role based control shapes, and the fallback path avoids dependence on a single DOM structure.

## Verification

- Run `node --test tests/scroll-reels.test.js`.
- Follow the automatic advancement and expiry checks in [docs/verify.md](../verify.md).
