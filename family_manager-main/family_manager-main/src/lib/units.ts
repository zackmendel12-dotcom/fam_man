/**
 * USDC Unit Conversion Utilities
 * 
 * USDC uses 6 decimal precision (1 USDC = 1,000,000 units).
 * These utilities provide safe conversion, validation, and arithmetic operations
 * for USDC amounts, ensuring proper handling of the 6-decimal precision.
 * 
 * @module lib/units
 */

export const USDC_DECIMALS = 6;

const USDC_MULTIPLIER = 10n ** BigInt(USDC_DECIMALS);

export function toUsdcAmount(amount: number | string): bigint {
  if (typeof amount === "number") {
    if (!Number.isFinite(amount)) {
      throw new Error("Amount must be a finite number");
    }
    if (amount < 0) {
      throw new Error("Amount cannot be negative");
    }
    return BigInt(Math.floor(amount * Number(USDC_MULTIPLIER)));
  }

  const trimmed = amount.trim();
  if (trimmed === "" || trimmed === ".") {
    throw new Error("Amount cannot be empty");
  }

  if (!/^[0-9]*\.?[0-9]*$/.test(trimmed)) {
    throw new Error("Amount must be a valid number");
  }

  const parts = trimmed.split(".");
  const wholePart = parts[0] || "0";
  let fractionalPart = parts[1] || "";

  if (fractionalPart.length > USDC_DECIMALS) {
    fractionalPart = fractionalPart.substring(0, USDC_DECIMALS);
  } else {
    fractionalPart = fractionalPart.padEnd(USDC_DECIMALS, "0");
  }

  const wholeAmount = BigInt(wholePart) * USDC_MULTIPLIER;
  const fractionalAmount = BigInt(fractionalPart);

  return wholeAmount + fractionalAmount;
}

export function fromUsdcAmount(amount: bigint): string {
  if (amount < 0n) {
    throw new Error("Amount cannot be negative");
  }

  const amountStr = amount.toString();
  const len = amountStr.length;

  if (len <= USDC_DECIMALS) {
    const paddedAmount = amountStr.padStart(USDC_DECIMALS, "0");
    return `0.${paddedAmount}`;
  }

  const wholePart = amountStr.slice(0, len - USDC_DECIMALS);
  const fractionalPart = amountStr.slice(len - USDC_DECIMALS);

  return `${wholePart}.${fractionalPart}`;
}

export function formatUsdcAmount(amount: bigint, decimals: number = 2): string {
  const fullStr = fromUsdcAmount(amount);
  const parts = fullStr.split(".");
  const wholePart = parts[0];
  const fractionalPart = parts[1];

  if (decimals === 0) {
    return wholePart;
  }

  const truncated = fractionalPart.substring(0, decimals);
  const padded = truncated.padEnd(decimals, "0");

  return `${wholePart}.${padded}`;
}

export function parseUsdcInput(input: string): { value: bigint; error: string | null } {
  try {
    const value = toUsdcAmount(input);
    return { value, error: null };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Invalid input";
    return { value: 0n, error };
  }
}

export function isZeroUsdc(amount: bigint): boolean {
  return amount === 0n;
}

export function isNegativeUsdc(amount: bigint): boolean {
  return amount < 0n;
}

export function isPositiveUsdc(amount: bigint): boolean {
  return amount > 0n;
}

export function addUsdc(a: bigint, b: bigint): bigint {
  return a + b;
}

export function subtractUsdc(a: bigint, b: bigint): bigint {
  const result = a - b;
  if (result < 0n) {
    throw new Error("Subtraction would result in negative amount");
  }
  return result;
}

export function compareUsdc(a: bigint, b: bigint): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

export function minUsdc(a: bigint, b: bigint): bigint {
  return a < b ? a : b;
}

export function maxUsdc(a: bigint, b: bigint): bigint {
  return a > b ? a : b;
}
