import { describe, expect, it } from "vitest";
import { createScrollSession } from "../utils/scroll-session";

describe("Scroll Reels session", () => {
  it("uses the selected duration as a wall clock deadline", () => {
    let time = 1_000_000;
    const session = createScrollSession(() => time);

    expect(session.start(5).remainingSeconds).toBe(300);
    time += 61_000;
    expect(session.syncRemainingTime()).toBe(239);
    expect(session.getStatus(true).durationMinutes).toBe(5);
  });

  it("clamps invalid durations and marks completed sessions as finished", () => {
    const session = createScrollSession(() => 0);

    expect(session.start(0).durationMinutes).toBe(10);
    expect(session.start(999).durationMinutes).toBe(180);
    expect(session.stop(true)).toMatchObject({ completed: true, remainingSeconds: 0, running: false });
  });

  it("keeps a user stopped session distinct from a completed session", () => {
    const session = createScrollSession(() => 0);

    session.start(10);
    expect(session.stop()).toMatchObject({ completed: false, remainingSeconds: 600, running: false });
  });
});
