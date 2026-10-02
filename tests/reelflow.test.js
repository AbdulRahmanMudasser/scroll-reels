const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("manifest exposes the Mac navigation commands", () => {
  const manifest = JSON.parse(read("manifest.json"));

  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.name, "Scroll Reels");
  assert.equal(manifest.action.default_title, "Scroll Reels");
  assert.equal(manifest.commands["next-reel"].suggested_key.mac, "MacCtrl+Shift+Down");
  assert.equal(manifest.commands["previous-reel"].suggested_key.mac, "MacCtrl+Shift+Up");
});

test("extension styles use only the four approved theme colors", () => {
  const approved = new Set(["#000000", "#ffffff", "#ff0000", "#0000ff"]);
  const styles = `${read("src/popup.css")}\n${read("src/content.css")}`;
  const colors = [...styles.matchAll(/#[0-9a-fA-F]{6}/g)].map((match) => match[0].toLowerCase());

  assert.ok(colors.length > 0);
  assert.deepEqual([...new Set(colors)].sort(), [...approved].sort());
});

test("popup and floating controls use white surfaces with primary accents", () => {
  const popupStyles = read("src/popup.css");
  const contentStyles = read("src/content.css");

  assert.match(popupStyles, /body \{[\s\S]*background: var\(--white\)/);
  assert.match(popupStyles, /\.primary-button[\s\S]*background: var\(--blue\)/);
  assert.match(popupStyles, /\.secondary-button[\s\S]*border: 1px solid var\(--red\)/);
  assert.match(contentStyles, /\.reelflow-meta \{[\s\S]*background: var\(--white\)/);
});

test("popup exposes labelled controls and live status", () => {
  const popup = read("src/popup.html");

  assert.match(popup, /<title>Scroll Reels<\/title>/);
  assert.match(popup, /<h1>Scroll Reels<\/h1>/);
  assert.doesNotMatch(popup, /Ready on Instagram|Move through Reels with a simple, focused timer|connection-dot/);
  assert.match(popup, /<label for="duration">/);
  assert.match(popup, /id="duration"[^>]*type="number"/);
  assert.match(popup, /id="start-button"/);
  assert.match(popup, /id="stop-button"[^>]*disabled/);
  assert.match(popup, /aria-live="polite"/);
  assert.doesNotMatch(read("src/popup.js"), /pageState/);
});

test("popup tip keeps its label and copy aligned", () => {
  const styles = read("src/popup.css");

  assert.match(styles, /footer \{ display: flex; align-items: baseline;/);
  assert.match(styles, /footer span \{ flex: 0 0 42px;/);
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

  assert.match(content, /class="reelflow-meta"/);
  assert.match(content, /aria-label", "Scroll Reels timer"/);
  assert.doesNotMatch(content, /reelflow-button/);
  assert.doesNotMatch(styles, /\.reelflow-button/);
  assert.match(styles, /top: 24px/);
  assert.match(styles, /right: 24px/);
  assert.doesNotMatch(styles, /box-shadow/);
  assert.match(content, /<span>ready<\/span><strong>--:--<\/strong>/);
});

test("auto scroll advances without user controls", () => {
  const content = read("src/content.js");

  assert.match(content, /function scheduleNextAdvance\(\)/);
  assert.match(content, /scheduleNextAdvance\(\);/);
  assert.match(content, /window\.setTimeout\(\(\) => \{/);
  assert.match(content, /navigate\(1\);/);
  assert.match(content, /event\.target instanceof HTMLVideoElement/);
  assert.doesNotMatch(content, /reelflow-button/);
});

test("popup sends bounded timer values to the page", () => {
  const popup = read("src/popup.js");

  assert.match(popup, /Math\.min\(180, Math\.max\(1/);
  assert.match(popup, /type: "START"/);
  assert.match(popup, /type: "STOP"/);
});
