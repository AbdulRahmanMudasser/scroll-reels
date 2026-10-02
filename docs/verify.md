# Scroll Reels verification

This checklist covers the Chrome extension behavior on macOS and the four color theme requirement.

## Automated checks

- [x] `node --test tests/reelflow.test.js` passes (9 tests).
- [x] `node --check src/popup.js && node --check src/content.js && node --check src/background.js` passes.

## Browser checks

- [ ] Load the unpacked folder in Chrome at `chrome://extensions`.
- [ ] Refresh the open Instagram tab after loading the extension.
- [ ] Open an Instagram Reel and confirm only the timer card appears at the top right.
- [ ] Confirm Instagram's own previous and next Reel controls remain available.
- [ ] Open the extension popup, choose 1 minute, start auto scroll, and confirm the status changes to running.
- [ ] Confirm the extension itself advances to the next Reel when the Reel ends or the duration fallback expires; no user click should be required.
- [ ] Stop scrolling and confirm the timer stops and the status returns to not running.
- [ ] Start a short timer and confirm auto scroll stops when the timer reaches zero.
- [ ] Confirm the popup and floating dock use only black, white, red, and blue.
- [ ] Confirm Command + Shift + Up and Command + Shift + Down navigate Reels on macOS.

## Evidence

Record the date, Chrome version, Instagram URL, observed results, and any console errors here after the live browser run.

## Test log

Date: 2026 10 03

Automated checks passed with 9 tests. The live Instagram tab at `https://www.instagram.com/reels/Dd3oajcp524/` exposed native previous and next Reel controls. Clicking next changed the URL to `https://www.instagram.com/reels/DdJbwCChGHt/`.

Debug finding: Instagram renders its navigation controls as `div[role="button"]`, not HTML `button` elements. The content script now finds both shapes and dispatches a click event when the control does not expose `.click()`.

The Chrome automation policy blocked direct access to `chrome://extensions`, so loading the unpacked extension and exercising its popup must be completed manually in Chrome. The project folder is ready for `Load unpacked`. The live Instagram tab confirmed Instagram's native Reel navigation buttons and no page errors; extension injection remains pending the manual load step.
