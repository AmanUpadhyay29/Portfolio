import { describe, expect, it } from "vitest";
import { nextTapAction } from "../src/components/room/tap";

describe("nextTapAction", () => {
  it("previews on the first touch", () => {
    expect(nextTapAction({ pointer: "touch", previewOpenFor: null }, "rack")).toBe("preview");
  });
  it("follows on the second touch of the same object", () => {
    expect(nextTapAction({ pointer: "touch", previewOpenFor: "rack" }, "rack")).toBe("follow");
  });
  it("previews when a different object is touched", () => {
    expect(nextTapAction({ pointer: "touch", previewOpenFor: "rack" }, "matrix")).toBe("preview");
  });
  it("follows for mouse and keyboard", () => {
    expect(nextTapAction({ pointer: "mouse", previewOpenFor: null }, "rack")).toBe("follow");
    expect(nextTapAction({ pointer: "keyboard", previewOpenFor: null }, "rack")).toBe("follow");
  });
});
