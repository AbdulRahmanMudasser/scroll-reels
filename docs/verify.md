# Scroll Reels verification

This checklist covers the Chrome extension behavior on macOS and the four color theme requirement.

## Automated checks

- [x] `npm run check` passes.
- [x] `npm run lint` passes.
- [x] `npm test` passes.
- [x] `npm run build` produces `.output/chrome-mv3/manifest.json`.

## Browser checks

- [ ] Load `.output/chrome-mv3` as the unpacked extension in Chrome at `chrome://extensions`.
- [ ] Refresh the open Instagram tab after loading the extension.
- [ ] Open an Instagram Reel and confirm only the timer card appears at the top right.
- [ ] Click the timer card and confirm the Scroll Reels popup opens in the same Chrome window.
- [ ] Confirm Instagram's own previous and next Reel controls remain available.
- [ ] Open the extension popup, choose 1 minute, start auto scroll, and confirm the status changes to running.
- [ ] Confirm the extension itself advances to the next Reel when the Reel ends or the duration fallback expires; no user click should be required.
- [ ] Stop scrolling and confirm the timer stops and the status returns to not running.
- [ ] Start a short timer and confirm auto scroll stops when the timer reaches zero.
- [ ] Confirm the popup and floating dock use only black, white, red, and blue.

## Recorded evidence

Date: 2026 10 03

The WXT migration passed ESLint, TypeScript checking, five Vitest tests for the shared message and timer session contracts, and the production Manifest V3 build. The generated manifest contains only the required tabs permission, Instagram host permission, popup, background service worker, and Instagram content script.

The implementation supports Instagram controls exposed as either native buttons or elements with `role="button"`. It uses the native next Reel control first, then automatic wheel and scrolling fallbacks when Instagram changes its control markup.

No browser account details, Reel URLs, visited content, or personal session data are recorded in this public repository. Complete the Browser checks above locally after reloading the unpacked extension.
