import { describe, expect, it } from "vitest";
import { isScrollMessage, type ScrollMessage, type ScrollStatus } from "../utils/messages";

describe("Scroll Reels message contract", () => {
  it("defines the actions shared by the popup, background, and content entrypoints", () => {
    const start: ScrollMessage = { type: "START", minutes: 5 };
    const stop: ScrollMessage = { type: "STOP" };
    const status: ScrollStatus = {
      completed: false,
      durationMinutes: 5,
      isReelsPage: true,
      remainingSeconds: 300,
      running: true
    };

    expect(start).toEqual({ type: "START", minutes: 5 });
    expect(stop.type).toBe("STOP");
    expect(status.remainingSeconds).toBe(300);
  });

  it("rejects malformed messages before they reach extension entrypoints", () => {
    expect(isScrollMessage({ type: "START", minutes: 5 })).toBe(true);
    expect(isScrollMessage({ type: "START", minutes: "5" })).toBe(false);
    expect(isScrollMessage({ type: "UNKNOWN" })).toBe(false);
    expect(isScrollMessage(null)).toBe(false);
  });
});
