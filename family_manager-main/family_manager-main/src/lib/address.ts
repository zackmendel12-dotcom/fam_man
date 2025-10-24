/**
 * Ethereum Address Validation Utilities
 * 
 * Provides address validation, normalization, and comparison utilities
 * using viem for proper checksum handling and format validation.
 * 
 * @module lib/address
 */

import { isAddress, getAddress, type Address } from "viem";

export function validateAddress(address: string): { valid: boolean; error: string | null } {
  if (!address || address.trim() === "") {
    return { valid: false, error: "Address cannot be empty" };
  }

  const trimmed = address.trim();

  if (!isAddress(trimmed)) {
    return { valid: false, error: "Invalid Ethereum address format" };
  }

  return { valid: true, error: null };
}

export function validateAddressWithChecksum(address: string): { 
  valid: boolean; 
  error: string | null;
  checksummed?: Address;
} {
  const basicValidation = validateAddress(address);
  
  if (!basicValidation.valid) {
    return basicValidation;
  }

  try {
    const checksummed = getAddress(address.trim());
    
    if (address.trim() !== checksummed && address.trim().toLowerCase() !== address.trim()) {
      return { 
        valid: false, 
        error: `Address has incorrect checksum. Expected: ${checksummed}`,
        checksummed
      };
    }

    return { valid: true, error: null, checksummed };
  } catch (err) {
    return { 
      valid: false, 
      error: err instanceof Error ? err.message : "Checksum validation failed" 
    };
  }
}

export function isValidAddress(address: string): address is Address {
  return validateAddress(address).valid;
}

export function normalizeAddress(address: string): Address {
  const validation = validateAddress(address);
  
  if (!validation.valid) {
    throw new Error(validation.error || "Invalid address");
  }

  return getAddress(address.trim());
}

export function isZeroAddress(address: string): boolean {
  const trimmed = address.trim().toLowerCase();
  if (!isAddress(trimmed)) {
    return false;
  }
  return trimmed === "0x0000000000000000000000000000000000000000";
}

export function isSameAddress(a: string, b: string): boolean {
  const aTrimmed = a.trim().toLowerCase();
  const bTrimmed = b.trim().toLowerCase();
  if (!isAddress(aTrimmed) || !isAddress(bTrimmed)) {
    return false;
  }
  return aTrimmed === bTrimmed;
}
