import { useReadContract, useWriteContract, useWatchContractEvent, useAccount, useWaitForTransactionReceipt } from "wagmi";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  familyManagerAbi, 
  usdcAbi, 
  getFamilyManagerAddress, 
  getUsdcAddress,
  toUsdcAmount as contractToUsdcAmount,
  fromUsdcAmount as contractFromUsdcAmount,
  formatUsdcAmount as contractFormatUsdcAmount,
  hasAbiFunction,
  validateAbiFunction
} from "../contracts/family_manager";
import type { Address } from "viem";

export const toUsdcAmount = contractToUsdcAmount;
export const fromUsdcAmount = contractFromUsdcAmount;
export const formatUsdcAmount = contractFormatUsdcAmount;

export type ChildLimits = {
  daily: bigint;
  weekly: bigint;
  monthly: bigint;
};

export type ChildSpent = {
  dailySpent: bigint;
  weeklySpent: bigint;
  monthlySpent: bigint;
};

export type TransactionEvent = {
  type: "ChildRegistered" | "ChildFunded" | "LimitsUpdated" | "CategoryBlocked" | "Spent" | "ChildPaused" | "AuthorizedSpenderSet" | "ChildUnregistered" | "ParentTransferred" | "TokensReclaimed";
  timestamp: number;
  data: Record<string, unknown>;
  txHash?: string | null;
};

const REVERT_MESSAGES: Record<string, string> = {
  "AlreadyRegistered": "This child is already registered",
  "NotRegistered": "This child is not registered",
  "NotParent": "You are not the parent of this child",
  "Paused": "This child account is paused",
  "ExceedsLimit": "This transaction would exceed the spending limit",
  "CategoryBlocked": "This spending category is blocked",
  "InsufficientBalance": "Insufficient balance for this transaction",
  "InvalidAmount": "Invalid amount specified",
  "ZeroAddress": "Invalid address: zero address not allowed",
  "InsufficientAllowance": "Insufficient USDC allowance. Please approve the contract to spend USDC.",
  "NotAuthorized": "You are not authorized to perform this action",
};

function translateError(error: unknown): string {
  if (!error) return "Unknown error occurred";
  
  const err = error as { message?: string; toString?: () => string };
  const errorString = err?.message || err?.toString?.() || "Unknown error";
  
  for (const [key, message] of Object.entries(REVERT_MESSAGES)) {
    if (errorString.includes(key)) {
      return message;
    }
  }

  if (errorString.includes("user rejected") || errorString.includes("User rejected")) {
    return "Transaction was rejected by user";
  }

  if (errorString.includes("insufficient funds")) {
    return "Insufficient funds in your wallet";
  }

  if (errorString.includes("network") || errorString.includes("Network")) {
    return "Network error. Please check your connection and try again.";
  }

  return "Transaction failed. Please try again.";
}

type ReadHookResult<T> = {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
};

type WriteHookResult<TArgs extends unknown[] = []> = {
  write: (...args: TArgs) => Promise<void>;
  hash: `0x${string}` | undefined;
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: string | null;
  reset: () => void;
};

export function useChildBalance(childAddress?: Address): ReadHookResult<bigint> & { balanceFormatted: string } {
  const usdcAddress = getUsdcAddress();

  const { data, isLoading, isError, error, refetch } = useReadContract({
    address: usdcAddress,
    abi: usdcAbi,
    functionName: "balanceOf",
    args: childAddress ? [childAddress] : undefined,
    query: {
      enabled: !!childAddress,
      staleTime: 10_000,
    },
  });

  return {
    data: data as bigint | undefined,
    balanceFormatted: data ? formatUsdcAmount(data as bigint) : "0.00",
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

export function useChildLimits(childAddress?: Address): ReadHookResult<ChildLimits> {
  const familyManagerAddress = getFamilyManagerAddress();

  const { data, isLoading, isError, error, refetch } = useReadContract({
    address: familyManagerAddress,
    abi: familyManagerAbi,
    functionName: "getChildLimits",
    args: childAddress ? [childAddress] : undefined,
    query: {
      enabled: !!childAddress,
      staleTime: 30_000,
    },
  });

  const limits = data as [bigint, bigint, bigint] | undefined;

  return {
    data: limits ? {
      daily: limits[0],
      weekly: limits[1],
      monthly: limits[2],
    } : undefined,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

export function useChildSpent(childAddress?: Address): ReadHookResult<ChildSpent> {
  const familyManagerAddress = getFamilyManagerAddress();

  const { data, isLoading, isError, error, refetch } = useReadContract({
    address: familyManagerAddress,
    abi: familyManagerAbi,
    functionName: "getChildSpent",
    args: childAddress ? [childAddress] : undefined,
    query: {
      enabled: !!childAddress,
      staleTime: 10_000,
    },
  });

  const spent = data as [bigint, bigint, bigint] | undefined;

  return {
    data: spent ? {
      dailySpent: spent[0],
      weeklySpent: spent[1],
      monthlySpent: spent[2],
    } : undefined,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

export function useIsChildPaused(childAddress?: Address): ReadHookResult<boolean> {
  const familyManagerAddress = getFamilyManagerAddress();

  const { data, isLoading, isError, error, refetch } = useReadContract({
    address: familyManagerAddress,
    abi: familyManagerAbi,
    functionName: "isChildPaused",
    args: childAddress ? [childAddress] : undefined,
    query: {
      enabled: !!childAddress,
      staleTime: 30_000,
    },
  });

  return {
    data: data as boolean | undefined,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

export function useIsRegisteredChild(childAddress?: Address): ReadHookResult<boolean> {
  const familyManagerAddress = getFamilyManagerAddress();

  const { data, isLoading, isError, error, refetch } = useReadContract({
    address: familyManagerAddress,
    abi: familyManagerAbi,
    functionName: "isRegisteredChild",
    args: childAddress ? [childAddress] : undefined,
    query: {
      enabled: !!childAddress,
      staleTime: 30_000,
    },
  });

  return {
    data: data as boolean | undefined,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

export function useChildParent(childAddress?: Address): ReadHookResult<Address> {
  const familyManagerAddress = getFamilyManagerAddress();

  const { data, isLoading, isError, error, refetch } = useReadContract({
    address: familyManagerAddress,
    abi: familyManagerAbi,
    functionName: "getChildParent",
    args: childAddress ? [childAddress] : undefined,
    query: {
      enabled: !!childAddress,
      staleTime: 30_000,
    },
  });

  return {
    data: data as Address | undefined,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

export function useIsCategoryBlocked(childAddress?: Address, categoryId?: number): ReadHookResult<boolean> {
  const familyManagerAddress = getFamilyManagerAddress();

  const { data, isLoading, isError, error, refetch } = useReadContract({
    address: familyManagerAddress,
    abi: familyManagerAbi,
    functionName: "isCategoryBlocked",
    args: childAddress && categoryId !== undefined ? [childAddress, BigInt(categoryId)] : undefined,
    query: {
      enabled: !!childAddress && categoryId !== undefined,
      staleTime: 30_000,
    },
  });

  return {
    data: data as boolean | undefined,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

export function useParentChildren(parentAddress?: Address, index?: number): ReadHookResult<Address> {
  const familyManagerAddress = getFamilyManagerAddress();

  const { data, isLoading, isError, error, refetch } = useReadContract({
    address: familyManagerAddress,
    abi: familyManagerAbi,
    functionName: "parentToChildren",
    args: parentAddress && index !== undefined ? [parentAddress, BigInt(index)] : undefined,
    query: {
      enabled: !!parentAddress && index !== undefined,
    },
  });

  return {
    data: data as Address | undefined,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

export function useUsdcAllowance(owner?: Address, spender?: Address): ReadHookResult<bigint> {
  const usdcAddress = getUsdcAddress();

  const { data, isLoading, isError, error, refetch } = useReadContract({
    address: usdcAddress,
    abi: usdcAbi,
    functionName: "allowance",
    args: owner && spender ? [owner, spender] : undefined,
    query: {
      enabled: !!owner && !!spender,
      staleTime: 5_000,
    },
  });

  return {
    data: data as bigint | undefined,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

export function useIsAuthorizedSpender(childAddress?: Address, spenderAddress?: Address): ReadHookResult<boolean> {
  const familyManagerAddress = getFamilyManagerAddress();

  const { data, isLoading, isError, error, refetch } = useReadContract({
    address: familyManagerAddress,
    abi: familyManagerAbi,
    functionName: "authorizedSpenders",
    args: childAddress && spenderAddress ? [childAddress, spenderAddress] : undefined,
    query: {
      enabled: !!childAddress && !!spenderAddress,
      staleTime: 30_000,
    },
  });

  return {
    data: data as boolean | undefined,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

export function useRegisterChild(): WriteHookResult<[Address]> {
  const familyManagerAddress = getFamilyManagerAddress();
  const queryClient = useQueryClient();
  const { writeContractAsync, data: hash, isPending, reset } = useWriteContract();
  const [friendlyError, setFriendlyError] = useState<string | null>(null);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries({ queryKey: ["readContract"] });
    }
  }, [isSuccess, queryClient]);

  const registerChild = useCallback(
    async (childAddress: Address) => {
      try {
        setFriendlyError(null);
        validateAbiFunction(familyManagerAbi, "registerChild");
        
        await writeContractAsync({
          address: familyManagerAddress,
          abi: familyManagerAbi,
          functionName: "registerChild",
          args: [childAddress],
        });
      } catch (err) {
        const message = translateError(err);
        setFriendlyError(message);
        console.error("[FamilyManager] registerChild error:", err);
        throw new Error(message);
      }
    },
    [writeContractAsync, familyManagerAddress]
  );

  return {
    write: registerChild,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError: !!friendlyError,
    error: friendlyError,
    reset: () => {
      reset();
      setFriendlyError(null);
    },
  };
}

export function useApproveUsdc(): WriteHookResult<[Address, bigint]> {
  const usdcAddress = getUsdcAddress();
  const queryClient = useQueryClient();
  const { writeContractAsync, data: hash, isPending, reset } = useWriteContract();
  const [friendlyError, setFriendlyError] = useState<string | null>(null);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries({ queryKey: ["readContract"] });
    }
  }, [isSuccess, queryClient]);

  const approve = useCallback(
    async (spender: Address, amount: bigint) => {
      try {
        setFriendlyError(null);
        await writeContractAsync({
          address: usdcAddress,
          abi: usdcAbi,
          functionName: "approve",
          args: [spender, amount],
        });
      } catch (err) {
        const message = translateError(err);
        setFriendlyError(message);
        console.error("[FamilyManager] approve error:", err);
        throw new Error(message);
      }
    },
    [writeContractAsync, usdcAddress]
  );

  return {
    write: approve,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError: !!friendlyError,
    error: friendlyError,
    reset: () => {
      reset();
      setFriendlyError(null);
    },
  };
}

export function useFundChild(): WriteHookResult<[Address, bigint, boolean?]> {
  const familyManagerAddress = getFamilyManagerAddress();
  const queryClient = useQueryClient();
  const { address: userAddress } = useAccount();
  const { writeContractAsync, data: hash, isPending, reset } = useWriteContract();
  const [friendlyError, setFriendlyError] = useState<string | null>(null);
  const { data: allowance, refetch: refetchAllowance } = useUsdcAllowance(userAddress, familyManagerAddress);
  const { write: approve, isPending: isApproving } = useApproveUsdc();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries({ queryKey: ["readContract"] });
    }
  }, [isSuccess, queryClient]);

  const fundChild = useCallback(
    async (childAddress: Address, amount: bigint, autoApprove: boolean = true) => {
      try {
        setFriendlyError(null);
        validateAbiFunction(familyManagerAbi, "fundChild");

        if (autoApprove && userAddress) {
          await refetchAllowance();
          const currentAllowance = allowance || BigInt(0);
          
          if (currentAllowance < amount) {
            console.log(`[FamilyManager] Insufficient allowance (${currentAllowance}). Requesting approval for ${amount}...`);
            await approve(familyManagerAddress, amount);
            await new Promise(resolve => setTimeout(resolve, 2000));
            await refetchAllowance();
          }
        }
        
        await writeContractAsync({
          address: familyManagerAddress,
          abi: familyManagerAbi,
          functionName: "fundChild",
          args: [childAddress, amount],
        });
      } catch (err) {
        const message = translateError(err);
        setFriendlyError(message);
        console.error("[FamilyManager] fundChild error:", err);
        throw new Error(message);
      }
    },
    [writeContractAsync, familyManagerAddress, userAddress, allowance, approve, refetchAllowance]
  );

  return {
    write: fundChild,
    hash,
    isPending: isPending || isApproving,
    isConfirming,
    isSuccess,
    isError: !!friendlyError,
    error: friendlyError,
    reset: () => {
      reset();
      setFriendlyError(null);
    },
  };
}

export function useUpdateChildLimits(): WriteHookResult<[Address, ChildLimits]> {
  const familyManagerAddress = getFamilyManagerAddress();
  const queryClient = useQueryClient();
  const { writeContractAsync, data: hash, isPending, reset } = useWriteContract();
  const [friendlyError, setFriendlyError] = useState<string | null>(null);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries({ queryKey: ["readContract"] });
    }
  }, [isSuccess, queryClient]);

  const updateLimits = useCallback(
    async (childAddress: Address, limits: ChildLimits) => {
      try {
        setFriendlyError(null);
        validateAbiFunction(familyManagerAbi, "updateChildLimits");
        
        await writeContractAsync({
          address: familyManagerAddress,
          abi: familyManagerAbi,
          functionName: "updateChildLimits",
          args: [childAddress, limits.daily, limits.weekly, limits.monthly],
        });
      } catch (err) {
        const message = translateError(err);
        setFriendlyError(message);
        console.error("[FamilyManager] updateLimits error:", err);
        throw new Error(message);
      }
    },
    [writeContractAsync, familyManagerAddress]
  );

  return {
    write: updateLimits,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError: !!friendlyError,
    error: friendlyError,
    reset: () => {
      reset();
      setFriendlyError(null);
    },
  };
}

export function usePauseChild(): WriteHookResult<[Address, boolean]> {
  const familyManagerAddress = getFamilyManagerAddress();
  const queryClient = useQueryClient();
  const { writeContractAsync, data: hash, isPending, reset } = useWriteContract();
  const [friendlyError, setFriendlyError] = useState<string | null>(null);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries({ queryKey: ["readContract"] });
    }
  }, [isSuccess, queryClient]);

  const pauseChild = useCallback(
    async (childAddress: Address, paused: boolean) => {
      try {
        setFriendlyError(null);
        validateAbiFunction(familyManagerAbi, "pauseChild");
        
        await writeContractAsync({
          address: familyManagerAddress,
          abi: familyManagerAbi,
          functionName: "pauseChild",
          args: [childAddress, paused],
        });
      } catch (err) {
        const message = translateError(err);
        setFriendlyError(message);
        console.error("[FamilyManager] pauseChild error:", err);
        throw new Error(message);
      }
    },
    [writeContractAsync, familyManagerAddress]
  );

  return {
    write: pauseChild,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError: !!friendlyError,
    error: friendlyError,
    reset: () => {
      reset();
      setFriendlyError(null);
    },
  };
}

export function useChildSpend(): WriteHookResult<[Address, bigint, number]> {
  const familyManagerAddress = getFamilyManagerAddress();
  const queryClient = useQueryClient();
  const { writeContractAsync, data: hash, isPending, reset } = useWriteContract();
  const [friendlyError, setFriendlyError] = useState<string | null>(null);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries({ queryKey: ["readContract"] });
    }
  }, [isSuccess, queryClient]);

  const spend = useCallback(
    async (recipient: Address, amount: bigint, categoryId: number) => {
      try {
        setFriendlyError(null);
        validateAbiFunction(familyManagerAbi, "childSpend");
        
        await writeContractAsync({
          address: familyManagerAddress,
          abi: familyManagerAbi,
          functionName: "childSpend",
          args: [recipient, amount, BigInt(categoryId)],
        });
      } catch (err) {
        const message = translateError(err);
        setFriendlyError(message);
        console.error("[FamilyManager] childSpend error:", err);
        throw new Error(message);
      }
    },
    [writeContractAsync, familyManagerAddress]
  );

  return {
    write: spend,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError: !!friendlyError,
    error: friendlyError,
    reset: () => {
      reset();
      setFriendlyError(null);
    },
  };
}

export function useReclaimTokens(): WriteHookResult<[Address]> {
  const familyManagerAddress = getFamilyManagerAddress();
  const queryClient = useQueryClient();
  const { writeContractAsync, data: hash, isPending, reset } = useWriteContract();
  const [friendlyError, setFriendlyError] = useState<string | null>(null);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries({ queryKey: ["readContract"] });
    }
  }, [isSuccess, queryClient]);

  const reclaim = useCallback(
    async (to: Address) => {
      try {
        setFriendlyError(null);
        validateAbiFunction(familyManagerAbi, "recoverUnallocatedTokens");
        
        await writeContractAsync({
          address: familyManagerAddress,
          abi: familyManagerAbi,
          functionName: "recoverUnallocatedTokens",
          args: [to],
        });
      } catch (err) {
        const message = translateError(err);
        setFriendlyError(message);
        console.error("[FamilyManager] reclaim error:", err);
        throw new Error(message);
      }
    },
    [writeContractAsync, familyManagerAddress]
  );

  return {
    write: reclaim,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError: !!friendlyError,
    error: friendlyError,
    reset: () => {
      reset();
      setFriendlyError(null);
    },
  };
}

export function useUnregisterChild(): WriteHookResult<[Address]> {
  const familyManagerAddress = getFamilyManagerAddress();
  const queryClient = useQueryClient();
  const { writeContractAsync, data: hash, isPending, reset } = useWriteContract();
  const [friendlyError, setFriendlyError] = useState<string | null>(null);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries({ queryKey: ["readContract"] });
    }
  }, [isSuccess, queryClient]);

  const unregisterChild = useCallback(
    async (childAddress: Address) => {
      try {
        setFriendlyError(null);
        validateAbiFunction(familyManagerAbi, "unregisterChild");
        
        await writeContractAsync({
          address: familyManagerAddress,
          abi: familyManagerAbi,
          functionName: "unregisterChild",
          args: [childAddress],
        });
      } catch (err) {
        const message = translateError(err);
        setFriendlyError(message);
        console.error("[FamilyManager] unregisterChild error:", err);
        throw new Error(message);
      }
    },
    [writeContractAsync, familyManagerAddress]
  );

  return {
    write: unregisterChild,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError: !!friendlyError,
    error: friendlyError,
    reset: () => {
      reset();
      setFriendlyError(null);
    },
  };
}

export function useSetAuthorizedSpender(): WriteHookResult<[Address, Address, boolean]> {
  const familyManagerAddress = getFamilyManagerAddress();
  const queryClient = useQueryClient();
  const { writeContractAsync, data: hash, isPending, reset } = useWriteContract();
  const [friendlyError, setFriendlyError] = useState<string | null>(null);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries({ queryKey: ["readContract"] });
    }
  }, [isSuccess, queryClient]);

  const setAuthorizedSpender = useCallback(
    async (childAddress: Address, spenderAddress: Address, authorized: boolean) => {
      try {
        setFriendlyError(null);
        validateAbiFunction(familyManagerAbi, "setAuthorizedSpender");
        
        await writeContractAsync({
          address: familyManagerAddress,
          abi: familyManagerAbi,
          functionName: "setAuthorizedSpender",
          args: [childAddress, spenderAddress, authorized],
        });
      } catch (err) {
        const message = translateError(err);
        setFriendlyError(message);
        console.error("[FamilyManager] setAuthorizedSpender error:", err);
        throw new Error(message);
      }
    },
    [writeContractAsync, familyManagerAddress]
  );

  return {
    write: setAuthorizedSpender,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError: !!friendlyError,
    error: friendlyError,
    reset: () => {
      reset();
      setFriendlyError(null);
    },
  };
}

export function useTransferChildParent(): WriteHookResult<[Address, Address]> {
  const familyManagerAddress = getFamilyManagerAddress();
  const queryClient = useQueryClient();
  const { writeContractAsync, data: hash, isPending, reset } = useWriteContract();
  const [friendlyError, setFriendlyError] = useState<string | null>(null);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries({ queryKey: ["readContract"] });
    }
  }, [isSuccess, queryClient]);

  const transferChildParent = useCallback(
    async (childAddress: Address, newParentAddress: Address) => {
      try {
        setFriendlyError(null);
        validateAbiFunction(familyManagerAbi, "transferChildParent");
        
        await writeContractAsync({
          address: familyManagerAddress,
          abi: familyManagerAbi,
          functionName: "transferChildParent",
          args: [childAddress, newParentAddress],
        });
      } catch (err) {
        const message = translateError(err);
        setFriendlyError(message);
        console.error("[FamilyManager] transferChildParent error:", err);
        throw new Error(message);
      }
    },
    [writeContractAsync, familyManagerAddress]
  );

  return {
    write: transferChildParent,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError: !!friendlyError,
    error: friendlyError,
    reset: () => {
      reset();
      setFriendlyError(null);
    },
  };
}

export function useBlockCategory(): WriteHookResult<never> {
  const [error] = useState<string>(
    "Block category function not found in ABI. This feature may not be available on this contract version."
  );

  useEffect(() => {
    if (!hasAbiFunction(familyManagerAbi, "blockCategory") && !hasAbiFunction(familyManagerAbi, "setCategoryBlocked")) {
      console.warn(
        "[FamilyManager] useBlockCategory: No blockCategory or setCategoryBlocked function found in the FamilyManager ABI. " +
        "Category blocking may need to be handled differently or is not available in this contract version."
      );
    }
  }, []);

  return {
    write: async () => {
      throw new Error(error);
    },
    hash: undefined,
    isPending: false,
    isConfirming: false,
    isSuccess: false,
    isError: true,
    error,
    reset: () => {},
  };
}

export function useFamilyManagerEvents() {
  const familyManagerAddress = getFamilyManagerAddress();
  const [events, setEvents] = useState<TransactionEvent[]>([]);

  useWatchContractEvent({
    address: familyManagerAddress,
    abi: familyManagerAbi,
    eventName: "ChildRegistered",
    onLogs(logs) {
      logs.forEach((log) => {
        const logWithArgs = log as typeof log & { args?: { parent?: Address; child?: Address } };
        setEvents((prev) => [
          ...prev,
          {
            type: "ChildRegistered",
            timestamp: Date.now(),
            data: {
              parent: logWithArgs.args?.parent,
              child: logWithArgs.args?.child,
            },
            txHash: log.transactionHash || undefined,
          },
        ]);
      });
    },
  });

  useWatchContractEvent({
    address: familyManagerAddress,
    abi: familyManagerAbi,
    eventName: "ChildFunded",
    onLogs(logs) {
      logs.forEach((log) => {
        const logWithArgs = log as typeof log & { args?: { parent?: Address; child?: Address; amount?: bigint } };
        setEvents((prev) => [
          ...prev,
          {
            type: "ChildFunded",
            timestamp: Date.now(),
            data: {
              parent: logWithArgs.args?.parent,
              child: logWithArgs.args?.child,
              amount: logWithArgs.args?.amount,
            },
            txHash: log.transactionHash || undefined,
          },
        ]);
      });
    },
  });

  useWatchContractEvent({
    address: familyManagerAddress,
    abi: familyManagerAbi,
    eventName: "LimitsUpdated",
    onLogs(logs) {
      logs.forEach((log) => {
        const logWithArgs = log as typeof log & { args?: { parent?: Address; child?: Address; daily?: bigint; weekly?: bigint; monthly?: bigint } };
        setEvents((prev) => [
          ...prev,
          {
            type: "LimitsUpdated",
            timestamp: Date.now(),
            data: {
              parent: logWithArgs.args?.parent,
              child: logWithArgs.args?.child,
              daily: logWithArgs.args?.daily,
              weekly: logWithArgs.args?.weekly,
              monthly: logWithArgs.args?.monthly,
            },
            txHash: log.transactionHash || undefined,
          },
        ]);
      });
    },
  });

  useWatchContractEvent({
    address: familyManagerAddress,
    abi: familyManagerAbi,
    eventName: "CategoryBlocked",
    onLogs(logs) {
      logs.forEach((log) => {
        const logWithArgs = log as typeof log & { args?: { parent?: Address; child?: Address; categoryId?: bigint; blocked?: boolean } };
        setEvents((prev) => [
          ...prev,
          {
            type: "CategoryBlocked",
            timestamp: Date.now(),
            data: {
              parent: logWithArgs.args?.parent,
              child: logWithArgs.args?.child,
              categoryId: logWithArgs.args?.categoryId,
              blocked: logWithArgs.args?.blocked,
            },
            txHash: log.transactionHash || undefined,
          },
        ]);
      });
    },
  });

  useWatchContractEvent({
    address: familyManagerAddress,
    abi: familyManagerAbi,
    eventName: "Spent",
    onLogs(logs) {
      logs.forEach((log) => {
        const logWithArgs = log as typeof log & { args?: { child?: Address; recipient?: Address; amount?: bigint; categoryId?: bigint } };
        setEvents((prev) => [
          ...prev,
          {
            type: "Spent",
            timestamp: Date.now(),
            data: {
              child: logWithArgs.args?.child,
              recipient: logWithArgs.args?.recipient,
              amount: logWithArgs.args?.amount,
              categoryId: logWithArgs.args?.categoryId,
            },
            txHash: log.transactionHash || undefined,
          },
        ]);
      });
    },
  });

  useWatchContractEvent({
    address: familyManagerAddress,
    abi: familyManagerAbi,
    eventName: "ChildPaused",
    onLogs(logs) {
      logs.forEach((log) => {
        const logWithArgs = log as typeof log & { args?: { parent?: Address; child?: Address; paused?: boolean } };
        setEvents((prev) => [
          ...prev,
          {
            type: "ChildPaused",
            timestamp: Date.now(),
            data: {
              parent: logWithArgs.args?.parent,
              child: logWithArgs.args?.child,
              paused: logWithArgs.args?.paused,
            },
            txHash: log.transactionHash || undefined,
          },
        ]);
      });
    },
  });

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  return {
    events,
    clearEvents,
  };
}

export function useTransactionStream() {
  const { events } = useFamilyManagerEvents();
  
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => b.timestamp - a.timestamp);
  }, [events]);

  return {
    transactions: sortedEvents,
    count: events.length,
  };
}

export function useFamilyManager() {
  return {
    useChildBalance,
    useChildLimits,
    useChildSpent,
    useIsChildPaused,
    useIsRegisteredChild,
    useChildParent,
    useIsCategoryBlocked,
    useParentChildren,
    useUsdcAllowance,
    useIsAuthorizedSpender,
    useRegisterChild,
    useApproveUsdc,
    useFundChild,
    useUpdateChildLimits,
    usePauseChild,
    useChildSpend,
    useReclaimTokens,
    useUnregisterChild,
    useSetAuthorizedSpender,
    useTransferChildParent,
    useBlockCategory,
    useFamilyManagerEvents,
    useTransactionStream,
  };
}
