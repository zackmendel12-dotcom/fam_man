import { useReadContract, useWriteContract, useWatchContractEvent, useAccount, useWaitForTransactionReceipt } from "wagmi";
import { useState, useEffect, useCallback } from "react";
import { 
  familyManagerAbi, 
  usdcAbi, 
  getFamilyManagerAddress, 
  getUsdcAddress,
  toUsdcAmount as contractToUsdcAmount,
  fromUsdcAmount as contractFromUsdcAmount,
  formatUsdcAmount as contractFormatUsdcAmount 
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
  type: "ChildRegistered" | "ChildFunded" | "LimitsUpdated" | "CategoryBlocked" | "Spent" | "ChildPaused";
  timestamp: number;
  data: any;
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
};

function translateError(error: any): string {
  const errorString = error?.message || error?.toString() || "Unknown error";
  
  for (const [key, message] of Object.entries(REVERT_MESSAGES)) {
    if (errorString.includes(key)) {
      return message;
    }
  }

  if (errorString.includes("user rejected")) {
    return "Transaction was rejected by user";
  }

  if (errorString.includes("insufficient funds")) {
    return "Insufficient funds in your wallet";
  }

  return "Transaction failed. Please try again.";
}

export function useChildBalance(childAddress?: Address) {
  const familyManagerAddress = getFamilyManagerAddress();
  const usdcAddress = getUsdcAddress();

  const { data, isLoading, isError, error, refetch } = useReadContract({
    address: usdcAddress,
    abi: usdcAbi,
    functionName: "balanceOf",
    args: childAddress ? [childAddress] : undefined,
    query: {
      enabled: !!childAddress,
    },
  });

  return {
    balance: data as bigint | undefined,
    balanceFormatted: data ? formatUsdcAmount(data as bigint) : "0.00",
    isLoading,
    isError,
    error,
    refetch,
  };
}

export function useChildLimits(childAddress?: Address) {
  const familyManagerAddress = getFamilyManagerAddress();

  const { data, isLoading, isError, error, refetch } = useReadContract({
    address: familyManagerAddress,
    abi: familyManagerAbi,
    functionName: "getChildLimits",
    args: childAddress ? [childAddress] : undefined,
    query: {
      enabled: !!childAddress,
    },
  });

  const limits = data as [bigint, bigint, bigint] | undefined;

  return {
    limits: limits ? {
      daily: limits[0],
      weekly: limits[1],
      monthly: limits[2],
    } : undefined,
    isLoading,
    isError,
    error,
    refetch,
  };
}

export function useChildSpent(childAddress?: Address) {
  const familyManagerAddress = getFamilyManagerAddress();

  const { data, isLoading, isError, error, refetch } = useReadContract({
    address: familyManagerAddress,
    abi: familyManagerAbi,
    functionName: "getChildSpent",
    args: childAddress ? [childAddress] : undefined,
    query: {
      enabled: !!childAddress,
    },
  });

  const spent = data as [bigint, bigint, bigint] | undefined;

  return {
    spent: spent ? {
      dailySpent: spent[0],
      weeklySpent: spent[1],
      monthlySpent: spent[2],
    } : undefined,
    isLoading,
    isError,
    error,
    refetch,
  };
}

export function useIsChildPaused(childAddress?: Address) {
  const familyManagerAddress = getFamilyManagerAddress();

  const { data, isLoading, isError, error, refetch } = useReadContract({
    address: familyManagerAddress,
    abi: familyManagerAbi,
    functionName: "isChildPaused",
    args: childAddress ? [childAddress] : undefined,
    query: {
      enabled: !!childAddress,
    },
  });

  return {
    isPaused: data as boolean | undefined,
    isLoading,
    isError,
    error,
    refetch,
  };
}

export function useIsRegisteredChild(childAddress?: Address) {
  const familyManagerAddress = getFamilyManagerAddress();

  const { data, isLoading, isError, error, refetch } = useReadContract({
    address: familyManagerAddress,
    abi: familyManagerAbi,
    functionName: "isRegisteredChild",
    args: childAddress ? [childAddress] : undefined,
    query: {
      enabled: !!childAddress,
    },
  });

  return {
    isRegistered: data as boolean | undefined,
    isLoading,
    isError,
    error,
    refetch,
  };
}

export function useChildParent(childAddress?: Address) {
  const familyManagerAddress = getFamilyManagerAddress();

  const { data, isLoading, isError, error, refetch } = useReadContract({
    address: familyManagerAddress,
    abi: familyManagerAbi,
    functionName: "getChildParent",
    args: childAddress ? [childAddress] : undefined,
    query: {
      enabled: !!childAddress,
    },
  });

  return {
    parent: data as Address | undefined,
    isLoading,
    isError,
    error,
    refetch,
  };
}

export function useIsCategoryBlocked(childAddress?: Address, categoryId?: number) {
  const familyManagerAddress = getFamilyManagerAddress();

  const { data, isLoading, isError, error, refetch } = useReadContract({
    address: familyManagerAddress,
    abi: familyManagerAbi,
    functionName: "isCategoryBlocked",
    args: childAddress && categoryId !== undefined ? [childAddress, BigInt(categoryId)] : undefined,
    query: {
      enabled: !!childAddress && categoryId !== undefined,
    },
  });

  return {
    isBlocked: data as boolean | undefined,
    isLoading,
    isError,
    error,
    refetch,
  };
}

export function useParentChildren(parentAddress?: Address, index?: number) {
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
    child: data as Address | undefined,
    isLoading,
    isError,
    error,
    refetch,
  };
}

export function useUsdcAllowance(owner?: Address, spender?: Address) {
  const usdcAddress = getUsdcAddress();

  const { data, isLoading, isError, error, refetch } = useReadContract({
    address: usdcAddress,
    abi: usdcAbi,
    functionName: "allowance",
    args: owner && spender ? [owner, spender] : undefined,
    query: {
      enabled: !!owner && !!spender,
    },
  });

  return {
    allowance: data as bigint | undefined,
    isLoading,
    isError,
    error,
    refetch,
  };
}

export function useRegisterChild() {
  const familyManagerAddress = getFamilyManagerAddress();
  const { writeContract, data: hash, isPending, isError, error } = useWriteContract();
  const [friendlyError, setFriendlyError] = useState<string | null>(null);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const registerChild = useCallback(
    async (childAddress: Address) => {
      try {
        setFriendlyError(null);
        await writeContract({
          address: familyManagerAddress,
          abi: familyManagerAbi,
          functionName: "registerChild",
          args: [childAddress],
        });
      } catch (err) {
        const message = translateError(err);
        setFriendlyError(message);
        console.error("registerChild error:", err);
        throw new Error(message);
      }
    },
    [writeContract, familyManagerAddress]
  );

  return {
    registerChild,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error: friendlyError || (error ? translateError(error) : null),
  };
}

export function useApproveUsdc() {
  const usdcAddress = getUsdcAddress();
  const { writeContract, data: hash, isPending, isError, error } = useWriteContract();
  const [friendlyError, setFriendlyError] = useState<string | null>(null);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const approve = useCallback(
    async (spender: Address, amount: bigint) => {
      try {
        setFriendlyError(null);
        await writeContract({
          address: usdcAddress,
          abi: usdcAbi,
          functionName: "approve",
          args: [spender, amount],
        });
      } catch (err) {
        const message = translateError(err);
        setFriendlyError(message);
        console.error("approve error:", err);
        throw new Error(message);
      }
    },
    [writeContract, usdcAddress]
  );

  return {
    approve,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error: friendlyError || (error ? translateError(error) : null),
  };
}

export function useFundChild() {
  const familyManagerAddress = getFamilyManagerAddress();
  const { writeContract, data: hash, isPending, isError, error } = useWriteContract();
  const [friendlyError, setFriendlyError] = useState<string | null>(null);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const fundChild = useCallback(
    async (childAddress: Address, amount: bigint) => {
      try {
        setFriendlyError(null);
        await writeContract({
          address: familyManagerAddress,
          abi: familyManagerAbi,
          functionName: "fundChild",
          args: [childAddress, amount],
        });
      } catch (err) {
        const message = translateError(err);
        setFriendlyError(message);
        console.error("fundChild error:", err);
        throw new Error(message);
      }
    },
    [writeContract, familyManagerAddress]
  );

  return {
    fundChild,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error: friendlyError || (error ? translateError(error) : null),
  };
}

export function useFundChildWithApproval() {
  const { address } = useAccount();
  const familyManagerAddress = getFamilyManagerAddress();
  const { allowance, refetch: refetchAllowance } = useUsdcAllowance(address, familyManagerAddress);
  const { approve, isPending: isApproving, isConfirming: isApprovingConfirming, isSuccess: isApproveSuccess } = useApproveUsdc();
  const { fundChild, isPending: isFunding, isConfirming: isFundingConfirming, isSuccess: isFundSuccess } = useFundChild();
  const [error, setError] = useState<string | null>(null);

  const fundWithApproval = useCallback(
    async (childAddress: Address, amount: bigint) => {
      try {
        setError(null);

        const currentAllowance = allowance || BigInt(0);
        if (currentAllowance < amount) {
          await approve(familyManagerAddress, amount);
          await refetchAllowance();
        }

        await fundChild(childAddress, amount);
      } catch (err) {
        const message = translateError(err);
        setError(message);
        console.error("fundWithApproval error:", err);
        throw new Error(message);
      }
    },
    [allowance, approve, fundChild, familyManagerAddress, refetchAllowance]
  );

  return {
    fundWithApproval,
    isPending: isApproving || isFunding,
    isConfirming: isApprovingConfirming || isFundingConfirming,
    isSuccess: isFundSuccess,
    isError: !!error,
    error,
  };
}

export function useUpdateChildLimits() {
  const familyManagerAddress = getFamilyManagerAddress();
  const { writeContract, data: hash, isPending, isError, error } = useWriteContract();
  const [friendlyError, setFriendlyError] = useState<string | null>(null);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const updateLimits = useCallback(
    async (childAddress: Address, limits: ChildLimits) => {
      try {
        setFriendlyError(null);
        await writeContract({
          address: familyManagerAddress,
          abi: familyManagerAbi,
          functionName: "updateChildLimits",
          args: [childAddress, limits.daily, limits.weekly, limits.monthly],
        });
      } catch (err) {
        const message = translateError(err);
        setFriendlyError(message);
        console.error("updateLimits error:", err);
        throw new Error(message);
      }
    },
    [writeContract, familyManagerAddress]
  );

  return {
    updateLimits,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error: friendlyError || (error ? translateError(error) : null),
  };
}

export function usePauseChild() {
  const familyManagerAddress = getFamilyManagerAddress();
  const { writeContract, data: hash, isPending, isError, error } = useWriteContract();
  const [friendlyError, setFriendlyError] = useState<string | null>(null);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const pauseChild = useCallback(
    async (childAddress: Address, paused: boolean) => {
      try {
        setFriendlyError(null);
        await writeContract({
          address: familyManagerAddress,
          abi: familyManagerAbi,
          functionName: "pauseChild",
          args: [childAddress, paused],
        });
      } catch (err) {
        const message = translateError(err);
        setFriendlyError(message);
        console.error("pauseChild error:", err);
        throw new Error(message);
      }
    },
    [writeContract, familyManagerAddress]
  );

  return {
    pauseChild,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error: friendlyError || (error ? translateError(error) : null),
  };
}

export function useChildSpend() {
  const familyManagerAddress = getFamilyManagerAddress();
  const { writeContract, data: hash, isPending, isError, error } = useWriteContract();
  const [friendlyError, setFriendlyError] = useState<string | null>(null);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const spend = useCallback(
    async (recipient: Address, amount: bigint, categoryId: number) => {
      try {
        setFriendlyError(null);
        await writeContract({
          address: familyManagerAddress,
          abi: familyManagerAbi,
          functionName: "childSpend",
          args: [recipient, amount, BigInt(categoryId)],
        });
      } catch (err) {
        const message = translateError(err);
        setFriendlyError(message);
        console.error("childSpend error:", err);
        throw new Error(message);
      }
    },
    [writeContract, familyManagerAddress]
  );

  return {
    spend,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error: friendlyError || (error ? translateError(error) : null),
  };
}

export function useReclaimTokens() {
  const familyManagerAddress = getFamilyManagerAddress();
  const { writeContract, data: hash, isPending, isError, error } = useWriteContract();
  const [friendlyError, setFriendlyError] = useState<string | null>(null);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const reclaim = useCallback(
    async (to: Address) => {
      try {
        setFriendlyError(null);
        await writeContract({
          address: familyManagerAddress,
          abi: familyManagerAbi,
          functionName: "recoverUnallocatedTokens",
          args: [to],
        });
      } catch (err) {
        const message = translateError(err);
        setFriendlyError(message);
        console.error("reclaim error:", err);
        throw new Error(message);
      }
    },
    [writeContract, familyManagerAddress]
  );

  return {
    reclaim,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error: friendlyError || (error ? translateError(error) : null),
  };
}

export function useUnregisterChild() {
  const familyManagerAddress = getFamilyManagerAddress();
  const { writeContract, data: hash, isPending, isError, error } = useWriteContract();
  const [friendlyError, setFriendlyError] = useState<string | null>(null);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const unregisterChild = useCallback(
    async (childAddress: Address) => {
      try {
        setFriendlyError(null);
        await writeContract({
          address: familyManagerAddress,
          abi: familyManagerAbi,
          functionName: "unregisterChild",
          args: [childAddress],
        });
      } catch (err) {
        const message = translateError(err);
        setFriendlyError(message);
        console.error("unregisterChild error:", err);
        throw new Error(message);
      }
    },
    [writeContract, familyManagerAddress]
  );

  return {
    unregisterChild,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error: friendlyError || (error ? translateError(error) : null),
  };
}

export function useSetAuthorizedSpender() {
  const familyManagerAddress = getFamilyManagerAddress();
  const { writeContract, data: hash, isPending, isError, error } = useWriteContract();
  const [friendlyError, setFriendlyError] = useState<string | null>(null);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const setAuthorizedSpender = useCallback(
    async (childAddress: Address, spenderAddress: Address, authorized: boolean) => {
      try {
        setFriendlyError(null);
        await writeContract({
          address: familyManagerAddress,
          abi: familyManagerAbi,
          functionName: "setAuthorizedSpender",
          args: [childAddress, spenderAddress, authorized],
        });
      } catch (err) {
        const message = translateError(err);
        setFriendlyError(message);
        console.error("setAuthorizedSpender error:", err);
        throw new Error(message);
      }
    },
    [writeContract, familyManagerAddress]
  );

  return {
    setAuthorizedSpender,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error: friendlyError || (error ? translateError(error) : null),
  };
}

export function useTransferChildParent() {
  const familyManagerAddress = getFamilyManagerAddress();
  const { writeContract, data: hash, isPending, isError, error } = useWriteContract();
  const [friendlyError, setFriendlyError] = useState<string | null>(null);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const transferChildParent = useCallback(
    async (childAddress: Address, newParentAddress: Address) => {
      try {
        setFriendlyError(null);
        await writeContract({
          address: familyManagerAddress,
          abi: familyManagerAbi,
          functionName: "transferChildParent",
          args: [childAddress, newParentAddress],
        });
      } catch (err) {
        const message = translateError(err);
        setFriendlyError(message);
        console.error("transferChildParent error:", err);
        throw new Error(message);
      }
    },
    [writeContract, familyManagerAddress]
  );

  return {
    transferChildParent,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error: friendlyError || (error ? translateError(error) : null),
  };
}

export function useBlockCategory() {
  const familyManagerAddress = getFamilyManagerAddress();
  const [error] = useState<string>("Block category function not found in ABI. This feature may not be available on this contract version.");

  console.warn("useBlockCategory: No blockCategory or setCategoryBlocked function found in the FamilyManager ABI. Category blocking may need to be handled differently.");

  return {
    blockCategory: async () => {
      throw new Error(error);
    },
    hash: undefined,
    isPending: false,
    isConfirming: false,
    isSuccess: false,
    isError: true,
    error,
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
      logs.forEach((log: any) => {
        setEvents((prev) => [
          ...prev,
          {
            type: "ChildRegistered",
            timestamp: Date.now(),
            data: {
              parent: log.args?.parent,
              child: log.args?.child,
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
      logs.forEach((log: any) => {
        setEvents((prev) => [
          ...prev,
          {
            type: "ChildFunded",
            timestamp: Date.now(),
            data: {
              parent: log.args?.parent,
              child: log.args?.child,
              amount: log.args?.amount,
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
      logs.forEach((log: any) => {
        setEvents((prev) => [
          ...prev,
          {
            type: "LimitsUpdated",
            timestamp: Date.now(),
            data: {
              parent: log.args?.parent,
              child: log.args?.child,
              daily: log.args?.daily,
              weekly: log.args?.weekly,
              monthly: log.args?.monthly,
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
      logs.forEach((log: any) => {
        setEvents((prev) => [
          ...prev,
          {
            type: "CategoryBlocked",
            timestamp: Date.now(),
            data: {
              parent: log.args?.parent,
              child: log.args?.child,
              categoryId: log.args?.categoryId,
              blocked: log.args?.blocked,
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
      logs.forEach((log: any) => {
        setEvents((prev) => [
          ...prev,
          {
            type: "Spent",
            timestamp: Date.now(),
            data: {
              child: log.args?.child,
              recipient: log.args?.recipient,
              amount: log.args?.amount,
              categoryId: log.args?.categoryId,
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
      logs.forEach((log: any) => {
        setEvents((prev) => [
          ...prev,
          {
            type: "ChildPaused",
            timestamp: Date.now(),
            data: {
              parent: log.args?.parent,
              child: log.args?.child,
              paused: log.args?.paused,
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
    useRegisterChild,
    useApproveUsdc,
    useFundChild,
    useFundChildWithApproval,
    useUpdateChildLimits,
    usePauseChild,
    useChildSpend,
    useReclaimTokens,
    useUnregisterChild,
    useSetAuthorizedSpender,
    useTransferChildParent,
    useBlockCategory,
    useFamilyManagerEvents,
  };
}
