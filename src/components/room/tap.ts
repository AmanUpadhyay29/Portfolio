import type { RoomObjectId } from "./objects";

export type TapState = {
  pointer: "touch" | "mouse" | "keyboard";
  previewOpenFor: RoomObjectId | null;
};

/** Touch has no hover: the first tap previews an object, a second tap on the same one follows it. */
export function nextTapAction(s: TapState, id: RoomObjectId): "preview" | "follow" {
  if (s.pointer !== "touch") return "follow";
  return s.previewOpenFor === id ? "follow" : "preview";
}
