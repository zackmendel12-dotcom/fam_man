import { describe, it, expect } from "vitest";
import {
  USDC_DECIMALS,
  toUsdcAmount,
  fromUsdcAmount,
  formatUsdcAmount,
  parseUsdcInput,
  isZeroUsdc,
  isNegativeUsdc,
  isPositiveUsdc,
  addUsdc,
  subtractUsdc,
  compareUsdc,
  minUsdc,
  maxUsdc,
} from "../units";

describe("units - USDC constants", () => {
  it("should export correct USDC decimals", () => {
    expect(USDC_DECIMALS).toBe(6);
  });
});

describe("units - toUsdcAmount", () => {
  it("should convert integer to bigint", () => {
    expect(toUsdcAmount(1)).toBe(1000000n);
    expect(toUsdcAmount(100)).toBe(100000000n);
    expect(toUsdcAmount(0)).toBe(0n);
  });

  it("should convert decimal to bigint", () => {
    expect(toUsdcAmount(1.5)).toBe(1500000n);
    expect(toUsdcAmount(0.1)).toBe(100000n);
    expect(toUsdcAmount(0.000001)).toBe(1n);
  });

  it("should convert string integer to bigint", () => {
    expect(toUsdcAmount("1")).toBe(1000000n);
    expect(toUsdcAmount("100")).toBe(100000000n);
    expect(toUsdcAmount("0")).toBe(0n);
  });

  it("should convert string decimal to bigint", () => {
    expect(toUsdcAmount("1.5")).toBe(1500000n);
    expect(toUsdcAmount("0.1")).toBe(100000n);
    expect(toUsdcAmount("0.000001")).toBe(1n);
  });

  it("should handle strings with leading/trailing whitespace", () => {
    expect(toUsdcAmount(" 1.5 ")).toBe(1500000n);
    expect(toUsdcAmount("  100  ")).toBe(100000000n);
  });

  it("should truncate extra decimal places", () => {
    expect(toUsdcAmount("1.1234567")).toBe(1123456n);
    expect(toUsdcAmount("0.0000009")).toBe(0n);
  });

  it("should handle string with only decimal point", () => {
    expect(() => toUsdcAmount(".5")).not.toThrow();
    expect(toUsdcAmount(".5")).toBe(500000n);
  });

  it("should handle string ending with decimal point", () => {
    expect(toUsdcAmount("1.")).toBe(1000000n);
  });

  it("should throw error for negative numbers", () => {
    expect(() => toUsdcAmount(-1)).toThrow("Amount cannot be negative");
  });

  it("should throw error for empty string", () => {
    expect(() => toUsdcAmount("")).toThrow("Amount cannot be empty");
    expect(() => toUsdcAmount("   ")).toThrow("Amount cannot be empty");
  });

  it("should throw error for invalid string", () => {
    expect(() => toUsdcAmount("abc")).toThrow("Amount must be a valid number");
    expect(() => toUsdcAmount("1.2.3")).toThrow("Amount must be a valid number");
    expect(() => toUsdcAmount("1a")).toThrow("Amount must be a valid number");
  });

  it("should throw error for Infinity", () => {
    expect(() => toUsdcAmount(Infinity)).toThrow("Amount must be a finite number");
  });

  it("should throw error for NaN", () => {
    expect(() => toUsdcAmount(NaN)).toThrow("Amount must be a finite number");
  });
});

describe("units - fromUsdcAmount", () => {
  it("should convert bigint to decimal string", () => {
    expect(fromUsdcAmount(1000000n)).toBe("1.000000");
    expect(fromUsdcAmount(100000000n)).toBe("100.000000");
    expect(fromUsdcAmount(0n)).toBe("0.000000");
  });

  it("should handle amounts with decimals", () => {
    expect(fromUsdcAmount(1500000n)).toBe("1.500000");
    expect(fromUsdcAmount(100000n)).toBe("0.100000");
    expect(fromUsdcAmount(1n)).toBe("0.000001");
  });

  it("should handle small amounts", () => {
    expect(fromUsdcAmount(123n)).toBe("0.000123");
    expect(fromUsdcAmount(1n)).toBe("0.000001");
  });

  it("should throw error for negative amounts", () => {
    expect(() => fromUsdcAmount(-1n)).toThrow("Amount cannot be negative");
  });
});

describe("units - formatUsdcAmount", () => {
  it("should format with default 2 decimals", () => {
    expect(formatUsdcAmount(1000000n)).toBe("1.00");
    expect(formatUsdcAmount(1500000n)).toBe("1.50");
    expect(formatUsdcAmount(1123456n)).toBe("1.12");
  });

  it("should format with custom decimals", () => {
    expect(formatUsdcAmount(1123456n, 4)).toBe("1.1234");
    expect(formatUsdcAmount(1123456n, 6)).toBe("1.123456");
    expect(formatUsdcAmount(1123456n, 0)).toBe("1");
  });

  it("should pad decimals if needed", () => {
    expect(formatUsdcAmount(1000000n, 4)).toBe("1.0000");
    expect(formatUsdcAmount(1500000n, 6)).toBe("1.500000");
  });

  it("should handle zero", () => {
    expect(formatUsdcAmount(0n)).toBe("0.00");
    expect(formatUsdcAmount(0n, 4)).toBe("0.0000");
  });
});

describe("units - parseUsdcInput", () => {
  it("should parse valid input and return value with no error", () => {
    const result = parseUsdcInput("1.5");
    expect(result.value).toBe(1500000n);
    expect(result.error).toBeNull();
  });

  it("should return error for invalid input", () => {
    const result = parseUsdcInput("abc");
    expect(result.value).toBe(0n);
    expect(result.error).toBeTruthy();
  });

  it("should return error for empty input", () => {
    const result = parseUsdcInput("");
    expect(result.value).toBe(0n);
    expect(result.error).toBeTruthy();
  });
});

describe("units - round trip conversions", () => {
  it("should maintain precision for round trips", () => {
    const testCases = ["1", "1.5", "0.000001", "100", "0.123456"];
    
    testCases.forEach((input) => {
      const bigIntValue = toUsdcAmount(input);
      const stringValue = fromUsdcAmount(bigIntValue);
      const roundTrip = toUsdcAmount(stringValue);
      expect(roundTrip).toBe(bigIntValue);
    });
  });

  it("should handle maximum precision", () => {
    const input = "123.456789";
    const bigIntValue = toUsdcAmount(input);
    expect(bigIntValue).toBe(123456789n);
    const back = fromUsdcAmount(bigIntValue);
    expect(back).toBe("123.456789");
  });
});

describe("units - validation helpers", () => {
  it("should correctly identify zero amounts", () => {
    expect(isZeroUsdc(0n)).toBe(true);
    expect(isZeroUsdc(1n)).toBe(false);
    expect(isZeroUsdc(1000000n)).toBe(false);
  });

  it("should correctly identify negative amounts", () => {
    expect(isNegativeUsdc(-1n)).toBe(true);
    expect(isNegativeUsdc(0n)).toBe(false);
    expect(isNegativeUsdc(1n)).toBe(false);
  });

  it("should correctly identify positive amounts", () => {
    expect(isPositiveUsdc(1n)).toBe(true);
    expect(isPositiveUsdc(1000000n)).toBe(true);
    expect(isPositiveUsdc(0n)).toBe(false);
    expect(isPositiveUsdc(-1n)).toBe(false);
  });
});

describe("units - arithmetic operations", () => {
  it("should add USDC amounts", () => {
    expect(addUsdc(1000000n, 500000n)).toBe(1500000n);
    expect(addUsdc(0n, 1000000n)).toBe(1000000n);
  });

  it("should subtract USDC amounts", () => {
    expect(subtractUsdc(1500000n, 500000n)).toBe(1000000n);
    expect(subtractUsdc(1000000n, 1000000n)).toBe(0n);
  });

  it("should throw error when subtraction results in negative", () => {
    expect(() => subtractUsdc(500000n, 1000000n)).toThrow(
      "Subtraction would result in negative amount"
    );
  });

  it("should compare USDC amounts", () => {
    expect(compareUsdc(1000000n, 500000n)).toBe(1);
    expect(compareUsdc(500000n, 1000000n)).toBe(-1);
    expect(compareUsdc(1000000n, 1000000n)).toBe(0);
  });

  it("should find minimum USDC amount", () => {
    expect(minUsdc(1000000n, 500000n)).toBe(500000n);
    expect(minUsdc(500000n, 1000000n)).toBe(500000n);
    expect(minUsdc(1000000n, 1000000n)).toBe(1000000n);
  });

  it("should find maximum USDC amount", () => {
    expect(maxUsdc(1000000n, 500000n)).toBe(1000000n);
    expect(maxUsdc(500000n, 1000000n)).toBe(1000000n);
    expect(maxUsdc(1000000n, 1000000n)).toBe(1000000n);
  });
});

describe("units - precision edge cases", () => {
  it("should handle very large amounts", () => {
    const largeAmount = toUsdcAmount("999999999999");
    expect(largeAmount).toBe(999999999999000000n);
    expect(fromUsdcAmount(largeAmount)).toBe("999999999999.000000");
  });

  it("should handle very small amounts", () => {
    const smallAmount = toUsdcAmount("0.000001");
    expect(smallAmount).toBe(1n);
    expect(fromUsdcAmount(smallAmount)).toBe("0.000001");
  });

  it("should handle amounts with all 6 decimal places", () => {
    const amount = toUsdcAmount("12.345678");
    expect(amount).toBe(12345678n);
    expect(fromUsdcAmount(amount)).toBe("12.345678");
  });
});
