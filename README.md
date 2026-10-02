# Scroll Reels

Scroll Reels is a small Chrome extension for timed Instagram Reel auto-scrolling. It adds one compact timer in the top-right corner and leaves Reel navigation controls to Instagram.

## Install locally

1. Open `chrome://extensions` in Chrome.
2. Enable Developer mode.
3. Choose Load unpacked.
4. Select `.output/chrome-mv3` after running `npm run build`.
5. Refresh any already open Instagram tab.
6. Open an Instagram Reel, click the Scroll Reels icon, choose a duration, and start auto scroll.

The extension does not log in to Instagram, collect content, or send data anywhere. It only sends page navigation events in the active Instagram tab.

## Project layout

```text
entrypoints/           WXT popup, content script, and service worker entrypoints
assets/styles/         Shared popup and page styles
utils/                 Typed message and timer session modules
tests/                 Vitest regression tests
wxt.config.ts          WXT manifest configuration
docs/                  Verification checklist and browser evidence
.agents/skills/        Installed project workflow skills
```

## Controls

The extension adds no custom up/down controls. It places only a flat timer at the top right. When auto-scroll is running, the extension itself advances to the next Reel when the active video ends. It uses a 9 second fallback only when no active video is available. It stops when the selected duration ends. Clicking the timer opens the Scroll Reels popup.

The timer is mounted through WXT in an isolated Shadow DOM, so Instagram page styles cannot alter its layout or colors. WXT also owns its content-script lifecycle cleanup when the page or extension reloads.

Instagram changes its page structure from time to time. If a site update changes how Reels respond to navigation, update `navigateToNextReel` in `entrypoints/content.ts`.

## Documentation

- [Product scope](docs/scope/scope.md) records the delivered feature and the remaining browser verification work.
- [Automatic scrolling decision](docs/specs/0001-auto-scroll-lifecycle.md) records the session lifecycle and Reel advancement contract.
- [Timer and popup decision](docs/specs/0002-timer-popup-controls.md) records the timer, popup, and visual interaction contract.
- [WXT migration](docs/specs/0003-wxt-migration.md) records the generated Manifest V3 build architecture.
- [Visual direction](design.md) is the source of truth for the flat four color theme.
- [Verification checklist](docs/verify.md) separates reproducible automated checks from browser checks.
