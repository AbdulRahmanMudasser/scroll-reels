# Scope: Scroll Reels

Scroll Reels is a local Chrome extension for people who want a time limited Instagram Reels session. It automatically advances Reels and leaves Instagram navigation controls untouched.

**Build approach:** Skateboard (deliver the smallest complete timed scrolling loop, then harden it).
**Workflow:** Beta (verify in the browser, then keep a regression suite). The project default level of rigor.

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| 1 | Timed Reel navigation | Slice 1 | in-progress |
| 2 | Flat timer controls | Slice 1 | in-progress |
| 3 | Browser verification | Slice 2 | planned |

## Current delivery

### 1. Timed Reel navigation · in-progress

Advance the active Reel automatically and stop cleanly when the selected timer reaches zero.

Done when: auto scrolling follows Instagram native navigation where available, advances after video completion or a fallback interval, and stops at the selected limit.

- [x] Design it: [spec 0001](../specs/0001-auto-scroll-lifecycle.md)
- [x] Build it: automatic next Reel scheduling and timer lifecycle
- [x] Test it: `npm test`
- [ ] Verify it: `/check verify timed Reel navigation`

### 2. Flat timer controls · in-progress

Keep the on page control limited to a top right timer and provide duration, start, stop, and status controls in the extension popup.

Done when: the theme uses only black, white, red, and blue; no custom Reel direction controls, shadows, elevations, session block, or tip block appear; clicking the timer opens the popup.

- [x] Design it: [spec 0002](../specs/0002-timer-popup-controls.md)
- [x] Build it: popup controls and timer to popup message path
- [x] Test it: `npm test`
- [ ] Verify it: `/check verify flat timer controls`

## Next verification slice

### 3. Browser verification · planned

Prove the shipped behavior against a current Instagram Reel after the unpacked extension is reloaded in Chrome.

Done when: the local checklist passes, including the popup opening from the timer, automatic advancement, and duration expiry.

- [ ] Verify it: follow [docs/verify.md](../verify.md)

## Deferred

No external data collection, account automation, publishing, likes, comments, or custom Instagram navigation controls are in scope.
