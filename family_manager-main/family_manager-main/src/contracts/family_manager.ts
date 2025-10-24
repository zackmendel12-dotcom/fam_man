import { familyManagerAbi, usdcAbi } from "../../contract/abis";
import { baseSepolia } from "wagmi/chains";
import { 
  USDC_DECIMALS as LIB_USDC_DECIMALS,
  toUsdcAmount as libToUsdcAmount,
  fromUsdcAmount as libFromUsdcAmount,
  formatUsdcAmount as libFormatUsdcAmount,
  parseUsdcInput,
  isZeroUsdc,
  isNegativeUsdc,
  isPositiveUsdc,
  addUsdc,
  subtractUsdc,
  compareUsdc,
  minUsdc,
  maxUsdc
} from "../lib/units";

export { familyManagerAbi, usdcAbi };

const DEFAULT_USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const;
const DEFAULT_FAMILY_MANAGER_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const;
const BASE_SEPOLIA_CHAIN_ID = baseSepolia.id;

export function getFamilyManagerAddress(): `0x${string}` {
  const chainId = typeof window !== "undefined" 
    ? Number(process.env.NEXT_PUBLIC_CHAIN_ID || BASE_SEPOLIA_CHAIN_ID)
    : BASE_SEPOLIA_CHAIN_ID;

  if (chainId !== BASE_SEPOLIA_CHAIN_ID) {
    console.warn(
      `[FamilyManager] Chain ${chainId} is not Base Sepolia (${BASE_SEPOLIA_CHAIN_ID}). ` +
      `Family Manager may not be deployed on this network.`
    );
  }

  const address = process.env.NEXT_PUBLIC_FAMILY_MANAGER_ADDRESS;
  
  if (!address) {
    console.warn(
      "[FamilyManager] NEXT_PUBLIC_FAMILY_MANAGER_ADDRESS not set in environment. " +
      `Falling back to default: ${DEFAULT_FAMILY_MANAGER_ADDRESS}. ` +
      "Please set this variable for production use."
    );
    return DEFAULT_FAMILY_MANAGER_ADDRESS;
  }

  return address as `0x${string}`;
}

export function getUsdcAddress(): `0x${string}` {
  const chainId = typeof window !== "undefined" 
    ? Number(process.env.NEXT_PUBLIC_CHAIN_ID || BASE_SEPOLIA_CHAIN_ID)
    : BASE_SEPOLIA_CHAIN_ID;

  if (chainId !== BASE_SEPOLIA_CHAIN_ID) {
    console.warn(
      `[FamilyManager] Chain ${chainId} is not Base Sepolia (${BASE_SEPOLIA_CHAIN_ID}). ` +
      `USDC may not be available on this network.`
    );
  }

  const address = process.env.NEXT_PUBLIC_USDC_ADDRESS;
  
  if (!address) {
    console.warn(
      "[FamilyManager] NEXT_PUBLIC_USDC_ADDRESS not set in environment. " +
      `Using default Base Sepolia USDC address: ${DEFAULT_USDC_ADDRESS}. ` +
      "Please set this variable for production use."
    );
    return DEFAULT_USDC_ADDRESS;
  }

  return address as `0x${string}`;
}

export const USDC_DECIMALS = LIB_USDC_DECIMALS;
export const toUsdcAmount = libToUsdcAmount;
export const fromUsdcAmount = libFromUsdcAmount;
export const formatUsdcAmount = libFormatUsdcAmount;
export { 
  parseUsdcInput,
  isZeroUsdc,
  isNegativeUsdc,
  isPositiveUsdc,
  addUsdc,
  subtractUsdc,
  compareUsdc,
  minUsdc,
  maxUsdc
};

export function hasAbiFunction(abi: readonly unknown[], functionName: string): boolean {
  return abi.some(
    (item: unknown) => {
      const abiItem = item as { type?: string; name?: string };
      return abiItem.type === "function" && abiItem.name === functionName;
    }
  );
}

export function validateAbiFunction(abi: readonly unknown[], functionName: string): void {
  if (!hasAbiFunction(abi, functionName)) {
    const warningMessage = 
      `[FamilyManager] Function "${functionName}" not found in contract ABI. ` +
      `This feature may not be available on the deployed contract version. ` +
      `Please check your contract deployment and ABI version.`;
    console.warn(warningMessage);
    throw new Error(`Function "${functionName}" not available in this contract version`);
  }
}
