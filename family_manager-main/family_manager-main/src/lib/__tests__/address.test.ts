import { describe, it, expect } from "vitest";
import {
  validateAddress,
  validateAddressWithChecksum,
  isValidAddress,
  normalizeAddress,
  isZeroAddress,
  isSameAddress,
} from "../address";

const VALID_ADDRESS = "0x742D35Cc6634C0532925A3B844bC9e7595f0bEB7";
const VALID_ADDRESS_LOWER = "0x742d35cc6634c0532925a3b844bc9e7595f0beb7";
const VALID_ADDRESS_MIXED = "0x742D35cc6634c0532925a3b844bc9e7595f0beb7";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const INVALID_ADDRESS = "0x123";
const INVALID_FORMAT = "not-an-address";

describe("address - validateAddress", () => {
  it("should accept valid checksummed address", () => {
    const result = validateAddress(VALID_ADDRESS);
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  it("should accept valid lowercase address", () => {
    const result = validateAddress(VALID_ADDRESS_LOWER);
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  it("should accept zero address", () => {
    const result = validateAddress(ZERO_ADDRESS);
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  it("should trim whitespace", () => {
    const result = validateAddress(`  ${VALID_ADDRESS}  `);
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  it("should reject empty string", () => {
    const result = validateAddress("");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Address cannot be empty");
  });

  it("should reject whitespace-only string", () => {
    const result = validateAddress("   ");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Address cannot be empty");
  });

  it("should reject invalid address format", () => {
    const result = validateAddress(INVALID_ADDRESS);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Invalid Ethereum address format");
  });

  it("should reject non-address string", () => {
    const result = validateAddress(INVALID_FORMAT);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Invalid Ethereum address format");
  });
});

describe("address - validateAddressWithChecksum", () => {
  it("should accept valid checksummed address", () => {
    const result = validateAddressWithChecksum(VALID_ADDRESS);
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
    expect(result.checksummed).toBe(VALID_ADDRESS);
  });

  it("should accept valid lowercase address", () => {
    const result = validateAddressWithChecksum(VALID_ADDRESS_LOWER);
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
    expect(result.checksummed).toBeDefined();
  });

  it("should reject address with incorrect checksum", () => {
    const result = validateAddressWithChecksum(VALID_ADDRESS_MIXED);
    expect(result.valid).toBe(false);
  });

  it("should provide checksummed version", () => {
    const result = validateAddressWithChecksum(VALID_ADDRESS_LOWER);
    expect(result.checksummed).toBeTruthy();
    expect(result.checksummed).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });

  it("should reject empty string", () => {
    const result = validateAddressWithChecksum("");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Address cannot be empty");
  });

  it("should reject invalid address", () => {
    const result = validateAddressWithChecksum(INVALID_ADDRESS);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Invalid Ethereum address format");
  });
});

describe("address - isValidAddress", () => {
  it("should return true for valid address", () => {
    expect(isValidAddress(VALID_ADDRESS)).toBe(true);
    expect(isValidAddress(VALID_ADDRESS_LOWER)).toBe(true);
  });

  it("should return false for invalid address", () => {
    expect(isValidAddress(INVALID_ADDRESS)).toBe(false);
    expect(isValidAddress(INVALID_FORMAT)).toBe(false);
    expect(isValidAddress("")).toBe(false);
  });
});

describe("address - normalizeAddress", () => {
  it("should normalize valid address to checksummed format", () => {
    const normalized = normalizeAddress(VALID_ADDRESS);
    expect(normalized).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });

  it("should normalize lowercase address", () => {
    const normalized = normalizeAddress(VALID_ADDRESS_LOWER);
    expect(normalized).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });

  it("should trim whitespace", () => {
    const normalized = normalizeAddress(`  ${VALID_ADDRESS}  `);
    expect(normalized).toBe(VALID_ADDRESS);
  });

  it("should throw error for invalid address", () => {
    expect(() => normalizeAddress(INVALID_ADDRESS)).toThrow();
    expect(() => normalizeAddress("")).toThrow();
  });
});

describe("address - isZeroAddress", () => {
  it("should return true for zero address", () => {
    expect(isZeroAddress(ZERO_ADDRESS)).toBe(true);
  });

  it("should return false for non-zero address", () => {
    expect(isZeroAddress(VALID_ADDRESS)).toBe(false);
    expect(isZeroAddress(VALID_ADDRESS_LOWER)).toBe(false);
  });

  it("should return false for invalid address", () => {
    expect(isZeroAddress(INVALID_ADDRESS)).toBe(false);
    expect(isZeroAddress("")).toBe(false);
  });

  it("should be case insensitive", () => {
    expect(isZeroAddress("0x0000000000000000000000000000000000000000")).toBe(true);
    expect(isZeroAddress("0X0000000000000000000000000000000000000000")).toBe(true);
  });
});

describe("address - isSameAddress", () => {
  it("should return true for same addresses", () => {
    expect(isSameAddress(VALID_ADDRESS, VALID_ADDRESS)).toBe(true);
  });

  it("should be case insensitive", () => {
    expect(isSameAddress(VALID_ADDRESS, VALID_ADDRESS_LOWER)).toBe(true);
    expect(isSameAddress(VALID_ADDRESS_LOWER, VALID_ADDRESS)).toBe(true);
  });

  it("should return false for different addresses", () => {
    expect(isSameAddress(VALID_ADDRESS, ZERO_ADDRESS)).toBe(false);
  });

  it("should return false if either address is invalid", () => {
    expect(isSameAddress(VALID_ADDRESS, INVALID_ADDRESS)).toBe(false);
    expect(isSameAddress(INVALID_ADDRESS, VALID_ADDRESS)).toBe(false);
    expect(isSameAddress(INVALID_ADDRESS, INVALID_FORMAT)).toBe(false);
  });

  it("should return false for empty strings", () => {
    expect(isSameAddress("", "")).toBe(false);
    expect(isSameAddress(VALID_ADDRESS, "")).toBe(false);
  });
});

describe("address - edge cases", () => {
  it("should handle addresses with different casing", () => {
    expect(isValidAddress(VALID_ADDRESS_LOWER)).toBe(true);
    expect(isSameAddress(VALID_ADDRESS, VALID_ADDRESS_LOWER)).toBe(true);
  });

  it("should normalize addresses consistently", () => {
    const normalized1 = normalizeAddress(VALID_ADDRESS);
    const normalized2 = normalizeAddress(VALID_ADDRESS_LOWER);
    expect(normalized1).toBe(normalized2);
  });

  it("should handle whitespace correctly", () => {
    expect(isValidAddress(`  ${VALID_ADDRESS}  `)).toBe(true);
    expect(() => normalizeAddress(`\n${VALID_ADDRESS}\t`)).not.toThrow();
  });
});
