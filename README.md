# Scroll Reels

Scroll Reels is a small Chrome extension for timed Instagram Reel auto-scrolling. It adds one compact timer in the top-right corner and leaves Reel navigation controls to Instagram.

## Install locally

1. Open `chrome://extensions` in Chrome.
2. Enable Developer mode.
3. Choose Load unpacked.
4. Select this project folder.
5. Refresh any already open Instagram tab.
6. Open an Instagram Reel, click the Scroll Reels icon, choose a duration, and start auto scroll.

The extension does not log in to Instagram, collect content, or send data anywhere. It only sends page navigation events in the active Instagram tab.

## Project layout

```text
manifest.json          Chrome extension entry point
src/                   Popup, content script, styles, and service worker
tests/                 Node built in regression tests
docs/                  Verification checklist and browser evidence
.agents/skills/        Installed project workflow skills
```

## Controls

The extension adds no custom up/down controls. It places only a flat timer at the top right. When auto-scroll is running, the extension itself advances to the next Reel when the active video ends, or after the Reel's duration; it uses a 9 second fallback when no video duration is available. It stops when the selected duration ends. On Mac, `Command + Shift + Up` and `Command + Shift + Down` can also be used for manual navigation.

Instagram changes its page structure from time to time. If a site update changes how Reels respond to navigation, update `navigate` in `src/content.js`.
