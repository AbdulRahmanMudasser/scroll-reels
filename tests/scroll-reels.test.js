const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("manifest exposes only automatic scrolling entry points", () => {
  const manifest = JSON.parse(read("manifest.json"));

  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.name, "Scroll Reels");
  assert.equal(manifest.action.default_title, "Scroll Reels");
  assert.match(manifest.description, /Automatically Advance/);
  assert.equal(manifest.commands, undefined);
  assert.equal(manifest.permissions, undefined);
});

test("extension styles use only the four approved theme colors", () => {
  const approved = new Set(["#000000", "#ffffff", "#ff0000", "#0000ff"]);
  const styles = `${read("src/popup.css")}\n${read("src/content.css")}`;
  const colors = [...styles.matchAll(/#[0-9a-fA-F]{6}/g)].map((match) => match[0].toLowerCase());

  assert.ok(colors.length > 0);
  assert.deepEqual([...new Set(colors)].sort(), [...approved].sort());
  assert.doesNotMatch(styles, /opacity:/);
});

test("popup and floating controls use white surfaces with neutral actions", () => {
  const popupStyles = read("src/popup.css");
  const contentStyles = read("src/content.css");

  assert.match(popupStyles, /body \{[\s\S]*background: var\(--white\)/);
  assert.match(popupStyles, /\.primary-button[\s\S]*background: var\(--black\)/);
  assert.match(popupStyles, /\.secondary-button[\s\S]*border: 1px solid var\(--black\)/);
  assert.doesNotMatch(popupStyles, /outline: 2px solid var\(--red\)|var\(--blue\)/);
  assert.match(contentStyles, /\.scroll-reels-meta \{[\s\S]*background: var\(--white\)/);
  assert.doesNotMatch(contentStyles, /outline: 2px solid var\(--red\)|var\(--blue\)/);
});

test("popup exposes labelled controls and live status", () => {
  const popup = read("src/popup.html");

  assert.match(popup, /<title>Scroll Reels<\/title>/);
  assert.match(popup, /<h1>Scroll Reels<\/h1>/);
  assert.doesNotMatch(popup, /Ready on Instagram|Move through Reels with a simple, focused timer|connection-dot|SESSION|Set your session/);
  assert.doesNotMatch(popup, /<footer>|Tip|Instagram keeps its own Reel navigation/);
  assert.match(popup, /<label for="duration">/);
  assert.match(popup, /id="duration"[^>]*type="number"/);
  assert.match(popup, /id="start-button"/);
  assert.match(popup, /id="stop-button"[^>]*disabled/);
  assert.match(popup, />Start Auto Scroll<\/button>/);
  assert.match(popup, />Stop Scrolling<\/button>/);
  assert.match(popup, />5 Min<\/button>/);
  assert.match(popup, />10 Min<\/button>/);
  assert.match(popup, />30 Min<\/button>/);
  assert.match(popup, /aria-live="polite"/);
  assert.doesNotMatch(read("src/popup.js"), /pageState/);
});

test("popup uses a compact settings panel with neutral actions", () => {
  const popup = read("src/popup.html");
  const styles = read("src/popup.css");

  assert.match(popup, /class="timer-panel"/);
  assert.match(styles, /\.timer-panel \{ overflow: hidden; border: 1px solid var\(--black\); border-radius: 10px;/);
  assert.match(styles, /\.primary-button \{ height: 44px; border: 1px solid var\(--black\); background: var\(--black\); color: var\(--white\);/);
  assert.match(styles, /\.secondary-button \{ height: 38px; margin-top: 8px; border: 1px solid var\(--black\); background: var\(--white\); color: var\(--black\);/);
  assert.doesNotMatch(styles, /box-shadow/);
});

test("content navigation prefers Instagram native reel buttons and keeps a fallback", () => {
  const content = read("src/content.js");

  assert.match(content, /aria-label.*title/);
  assert.match(content, /querySelectorAll\('button, \[role="button"\]'\)/);
  assert.match(content, /button\.textContent/);
  assert.match(content, /label\.includes\(`\$\{directionName\} reel`\)/);
  assert.match(content, /function activateNativeControl\(control\)/);
  assert.match(content, /typeof control\.dispatchEvent === "function"/);
  assert.match(content, /new MouseEvent\("click"/);
  assert.match(content, /new KeyboardEvent\("keydown"/);
  assert.match(content, /new WheelEvent\("wheel"/);
  assert.match(content, /isCurrentVideo\(event\.target\)/);
});

test("content UI contains only the top right timer card", () => {
  const content = read("src/content.js");
  const styles = read("src/content.css");

  assert.match(content, /class="scroll-reels-meta"/);
  assert.match(content, /aria-label", "Scroll Reels timer"/);
  assert.doesNotMatch(content, /reelflow/);
  assert.doesNotMatch(styles, /reelflow/);
  assert.match(styles, /top: 24px/);
  assert.match(styles, /right: 24px/);
  assert.doesNotMatch(styles, /box-shadow/);
  assert.match(content, /<button type="button" class="scroll-reels-meta" aria-label="Open Scroll Reels controls"/);
});

test("clicking the timer opens the extension popup", () => {
  const content = read("src/content.js");
  const background = read("src/background.js");

  assert.match(content, /chrome\.runtime\.sendMessage\(\{ type: "OPEN_POPUP" \}\)/);
  assert.match(background, /message\.type !== "OPEN_POPUP"/);
  assert.match(background, /chrome\.action\.openPopup\(\{ windowId \}\)/);
});

test("auto scroll advances without user controls", () => {
  const content = read("src/content.js");

  assert.match(content, /function scheduleNextAdvance\(\)/);
  assert.match(content, /scheduleNextAdvance\(\);/);
  assert.match(content, /window\.setTimeout\(\(\) => \{/);
  assert.match(content, /navigate\(1\);/);
  assert.match(content, /event\.target instanceof HTMLVideoElement/);
  assert.doesNotMatch(content, /scroll-reels-button/);
});

test("auto scroll waits for the active Reel to finish and keeps session time wall clock based", () => {
  const content = read("src/content.js");

  assert.match(content, /sessionEndsAt/);
  assert.match(content, /Date\.now\(\)/);
  assert.match(content, /video\.currentTime/);
  assert.match(content, /if \(!video\)/);
  assert.match(content, /window\.setTimeout\(scheduleNextAdvance, 1000\)/);
  assert.doesNotMatch(content, /Math\.min\(60000/);
  assert.doesNotMatch(content, /!Number\.isFinite\(video\?\.duration\)/);
  assert.match(content, /window\.clearTimeout\(state\.advanceId\)/);
});

test("popup sends bounded timer values to the page", () => {
  const popup = read("src/popup.js");

  assert.match(popup, /Math\.min\(180, Math\.max\(1/);
  assert.match(popup, /type: "START"/);
  assert.match(popup, /type: "STOP"/);
  assert.match(popup, /durationInput\.disabled = running/);
  assert.match(popup, /button\.disabled = running/);
  assert.match(popup, /if \(response\.running && response\.durationMinutes\)/);
  assert.match(popup, /function syncQuickButtons\(\)/);
});
