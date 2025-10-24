import { familyManagerAbi, usdcAbi } from "../../contract/abis";
import { baseSepolia } from "wagmi/chains";

export { familyManagerAbi, usdcAbi };

const DEFAULT_USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const;
const BASE_SEPOLIA_CHAIN_ID = baseSepolia.id;

export function getFamilyManagerAddress(): `0x${string}` {
  const chainId = typeof window !== "undefined" 
    ? Number(process.env.NEXT_PUBLIC_CHAIN_ID || BASE_SEPOLIA_CHAIN_ID)
    : BASE_SEPOLIA_CHAIN_ID;

  if (chainId !== BASE_SEPOLIA_CHAIN_ID) {
    console.warn(`Chain ${chainId} is not Base Sepolia. Family Manager may not be deployed.`);
  }

  const address = process.env.NEXT_PUBLIC_FAMILY_MANAGER_ADDRESS;
  
  if (!address) {
    console.warn("NEXT_PUBLIC_FAMILY_MANAGER_ADDRESS not set, falling back to default USDC address");
    return DEFAULT_USDC_ADDRESS;
  }

  return address as `0x${string}`;
}

export function getUsdcAddress(): `0x${string}` {
  const chainId = typeof window !== "undefined" 
    ? Number(process.env.NEXT_PUBLIC_CHAIN_ID || BASE_SEPOLIA_CHAIN_ID)
    : BASE_SEPOLIA_CHAIN_ID;

  if (chainId !== BASE_SEPOLIA_CHAIN_ID) {
    console.warn(`Chain ${chainId} is not Base Sepolia. USDC may not be available.`);
  }

  const address = process.env.NEXT_PUBLIC_USDC_ADDRESS;
  
  if (!address) {
    console.warn("NEXT_PUBLIC_USDC_ADDRESS not set, using default Base Sepolia USDC address");
    return DEFAULT_USDC_ADDRESS;
  }

  return address as `0x${string}`;
}

export const USDC_DECIMALS = 6;

export function toUsdcAmount(amount: number | string): bigint {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return BigInt(Math.floor(num * 10 ** USDC_DECIMALS));
}

export function fromUsdcAmount(amount: bigint): number {
  return Number(amount) / 10 ** USDC_DECIMALS;
}

export function formatUsdcAmount(amount: bigint): string {
  return fromUsdcAmount(amount).toFixed(2);
}
