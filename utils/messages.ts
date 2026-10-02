export type ScrollMessage =
  | { type: "GET_STATUS" }
  | { type: "OPEN_POPUP" }
  | { type: "START"; minutes: number }
  | { type: "STOP" };

export type ScrollStatus = {
  completed: boolean;
  durationMinutes: number;
  isReelsPage: boolean;
  remainingSeconds: number;
  running: boolean;
};

export const isScrollMessage = (value: unknown): value is ScrollMessage => {
  if (!value || typeof value !== "object" || !("type" in value)) return false;
  const message = value as { minutes?: unknown; type?: unknown };
  if (message.type === "START") return typeof message.minutes === "number" && Number.isFinite(message.minutes);
  return message.type === "GET_STATUS" || message.type === "OPEN_POPUP" || message.type === "STOP";
};
