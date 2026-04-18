import { accentPalette, formatCurrency, iconFor } from "./helpers";
import { colors } from "./tokens";

describe("helpers", () => {
  describe("formatCurrency", () => {
    it("formats positive, zero, and negative numbers", () => {
      expect(formatCurrency(123.45)).toBe("$123.45");
      expect(formatCurrency(0)).toBe("$0.00");
      expect(formatCurrency(-9.5)).toBe("$-9.50");
    });
  });

  describe("iconFor", () => {
    it("returns mapped icons and falls back to payments", () => {
      expect(iconFor("coffee")).toBe("local-cafe");
      expect(iconFor("restaurant")).toBe("restaurant");
      expect(iconFor("unknown-category")).toBe("payments");
    });
  });

  describe("accentPalette", () => {
    it("returns the configured palette and falls back to indigo", () => {
      expect(accentPalette("mint")).toEqual({
        bg: colors.secondaryFixed,
        text: colors.secondary,
      });
      expect(accentPalette("unknown-accent")).toEqual({
        bg: "#dde2ff",
        text: colors.primary,
      });
    });
  });
});
