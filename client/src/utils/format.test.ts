import { describe, expect, it } from "vitest";

import { formatDateTime, formatOperation } from "./format";

describe("format helpers", () => {
  it("formats operations", () => {
    expect(formatOperation("add", 5)).toBe("+ 5");
    expect(formatOperation("multiply", 3)).toBe("× 3");
  });

  it("returns ISO when invalid date", () => {
    expect(formatDateTime("abc")).toBe("abc");
  });
});
