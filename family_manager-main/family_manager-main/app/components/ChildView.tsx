"use client";

import { useState, useMemo } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount, useBalance } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { familyManagerAbi, usdcAbi } from "../../contract/abis";
import TxList from "./TxList";

const FAMILY_MANAGER_CONTRACT = process.env.NEXT_PUBLIC_FAMILY_MANAGER_ADDRESS as `0x${string}`;
const USDC_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`;

interface ChildViewProps {
  address: `0x${string}`;
  onNotification: (message: string, type: "success" | "error" | "info") => void;
}

const SPENDING_CATEGORIES = [
  { id: 0, name: "General", emoji: "🛒" },
  { id: 1, name: "Food & Dining", emoji: "🍔" },
  { id: 2, name: "Entertainment", emoji: "🎮" },
  { id: 3, name: "Education", emoji: "📚" },
  { id: 4, name: "Transport", emoji: "🚗" },
  { id: 5, name: "Clothing", emoji: "👕" },
  { id: 6, name: "Health", emoji: "⚕️" },
  { id: 7, name: "Other", emoji: "📦" },
];

export default function ChildView({ address, onNotification }: ChildViewProps) {
  const { address: connectedAddress } = useAccount();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: parentAddress } = useReadContract({
    address: FAMILY_MANAGER_CONTRACT,
    abi: familyManagerAbi,
    functionName: "getChildParent",
    args: [address],
  });

  const { data: limits } = useReadContract({
    address: FAMILY_MANAGER_CONTRACT,
    abi: familyManagerAbi,
    functionName: "getChildLimits",
    args: [address],
  });

  const { data: spent } = useReadContract({
    address: FAMILY_MANAGER_CONTRACT,
    abi: familyManagerAbi,
    functionName: "getChildSpent",
    args: [address],
  });

  const { data: isPaused } = useReadContract({
    address: FAMILY_MANAGER_CONTRACT,
    abi: familyManagerAbi,
    functionName: "isChildPaused",
    args: [address],
  });

  const { data: isCategoryBlocked } = useReadContract({
    address: FAMILY_MANAGER_CONTRACT,
    abi: familyManagerAbi,
    functionName: "isCategoryBlocked",
    args: [address, BigInt(categoryId)],
  });

  const { data: tokenAddress } = useReadContract({
    address: FAMILY_MANAGER_CONTRACT,
    abi: familyManagerAbi,
    functionName: "token",
  });

  const { data: usdcBalance } = useBalance({
    address: address,
    token: tokenAddress as `0x${string}` | undefined,
  });

  const { writeContract, data: hash, error: writeError, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const balanceFormatted = useMemo(() => {
    if (!usdcBalance) return "0.00";
    return parseFloat(formatUnits(usdcBalance.value, usdcBalance.decimals)).toFixed(2);
  }, [usdcBalance]);

  const progressData = useMemo(() => {
    if (!limits || !spent) {
      return {
        daily: { spent: 0n, limit: 0n, percentage: 0 },
        weekly: { spent: 0n, limit: 0n, percentage: 0 },
        monthly: { spent: 0n, limit: 0n, percentage: 0 },
      };
    }

    const [dailyLimit, weeklyLimit, monthlyLimit] = limits as [bigint, bigint, bigint];
    const [dailySpent, weeklySpent, monthlySpent] = spent as [bigint, bigint, bigint];

    const calculatePercentage = (spentVal: bigint, limitVal: bigint) => {
      if (limitVal === 0n) return 0;
      return Math.min(Number((spentVal * 100n) / limitVal), 100);
    };

    return {
      daily: {
        spent: dailySpent,
        limit: dailyLimit,
        percentage: calculatePercentage(dailySpent, dailyLimit),
      },
      weekly: {
        spent: weeklySpent,
        limit: weeklyLimit,
        percentage: calculatePercentage(weeklySpent, weeklyLimit),
      },
      monthly: {
        spent: monthlySpent,
        limit: monthlyLimit,
        percentage: calculatePercentage(monthlySpent, monthlyLimit),
      },
    };
  }, [limits, spent]);

  const formatAmount = (value: bigint) => {
    const formatted = formatUnits(value, 6);
    return `$${parseFloat(formatted).toFixed(2)}`;
  };

  const validateForm = (): string | null => {
    if (!recipient || !recipient.match(/^0x[a-fA-F0-9]{40}$/)) {
      return "Please enter a valid recipient address";
    }
    if (!amount || parseFloat(amount) <= 0) {
      return "Please enter a valid amount greater than 0";
    }
    if (isPaused) {
      return "Your account is currently paused";
    }
    if (isCategoryBlocked) {
      return `The category "${SPENDING_CATEGORIES[categoryId].name}" is blocked by your parent`;
    }

    try {
      const amountInUnits = parseUnits(amount, 6);
      
      if (!usdcBalance || amountInUnits > usdcBalance.value) {
        return "Insufficient balance";
      }

      if (limits && spent) {
        const [dailyLimit, weeklyLimit, monthlyLimit] = limits as [bigint, bigint, bigint];
        const [dailySpent, weeklySpent, monthlySpent] = spent as [bigint, bigint, bigint];

        if (dailyLimit > 0n && dailySpent + amountInUnits > dailyLimit) {
          const remaining = dailyLimit - dailySpent;
          return `Daily limit exceeded. You have ${formatAmount(remaining)} remaining today`;
        }
        if (weeklyLimit > 0n && weeklySpent + amountInUnits > weeklyLimit) {
          const remaining = weeklyLimit - weeklySpent;
          return `Weekly limit exceeded. You have ${formatAmount(remaining)} remaining this week`;
        }
        if (monthlyLimit > 0n && monthlySpent + amountInUnits > monthlyLimit) {
          const remaining = monthlyLimit - monthlySpent;
          return `Monthly limit exceeded. You have ${formatAmount(remaining)} remaining this month`;
        }
      }
    } catch (error) {
      return "Invalid amount format";
    }

    return null;
  };

  const handleSpend = async () => {
    const error = validateForm();
    if (error) {
      onNotification(error, "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const amountInUnits = parseUnits(amount, 6);

      writeContract({
        address: FAMILY_MANAGER_CONTRACT,
        abi: familyManagerAbi,
        functionName: "childSpend",
        args: [recipient as `0x${string}`, amountInUnits, BigInt(categoryId)],
      });
    } catch (error: any) {
      console.error("Spend error:", error);
      
      let errorMessage = "Transaction failed";
      const errorString = error.message || error.toString();
      
      if (errorString.includes("paused") || errorString.includes("Paused")) {
        errorMessage = "Your account is paused by your parent";
      } else if (errorString.includes("limit") || errorString.includes("Limit")) {
        errorMessage = "Spending limit exceeded";
      } else if (errorString.includes("category") || errorString.includes("Category")) {
        errorMessage = "This spending category is blocked";
      } else if (errorString.includes("balance") || errorString.includes("Balance")) {
        errorMessage = "Insufficient balance";
      } else if (errorString.includes("user rejected")) {
        errorMessage = "Transaction rejected";
      }
      
      onNotification(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isConfirmed && hash) {
    onNotification("Transaction confirmed successfully!", "success");
    setRecipient("");
    setAmount("");
    setCategoryId(0);
  }

  if (writeError) {
    const errorString = (writeError as Error).message || writeError.toString();
    let errorMessage = "Transaction failed";
    
    if (errorString.includes("paused") || errorString.includes("Paused")) {
      errorMessage = "Your account is paused by your parent";
    } else if (errorString.includes("limit") || errorString.includes("Limit")) {
      errorMessage = "Spending limit exceeded";
    } else if (errorString.includes("category") || errorString.includes("Category")) {
      errorMessage = "This spending category is blocked";
    } else if (errorString.includes("balance") || errorString.includes("Balance")) {
      errorMessage = "Insufficient balance";
    }
    
    onNotification(errorMessage, "error");
  }

  return (
    <div className="space-y-6">
      {!!isPaused && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-semibold text-red-900">Account Paused</p>
              <p className="text-sm text-red-700">Your account has been temporarily paused by your parent</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Child Account</h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">View your allowance and spending limits</p>
          </div>
          <div className={`px-4 py-2 rounded-lg ${isPaused ? "bg-red-100" : "bg-green-100"} self-start sm:self-auto`}>
            <p className={`text-sm font-medium ${isPaused ? "text-red-900" : "text-green-900"}`}>
              {isPaused ? "Paused" : "Active"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 sm:p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-blue-900">Available Balance</h3>
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-blue-900">${balanceFormatted}</p>
            <p className="text-xs text-blue-700 mt-1">Current wallet balance</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 sm:p-6 border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-purple-900">Parent Account</h3>
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="text-xs sm:text-sm font-mono text-purple-900 break-all">
              {parentAddress ? `${(parentAddress as string).slice(0, 10)}...${(parentAddress as string).slice(-8)}` : "Loading..."}
            </p>
            <p className="text-xs text-purple-700 mt-1">Managed by</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Spending Limits</h3>
        {limits ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-700">Daily Limit</h4>
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatAmount(progressData.daily.limit)}</p>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${progressData.daily.percentage}%` }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{formatAmount(progressData.daily.spent)} spent today</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-700">Weekly Limit</h4>
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatAmount(progressData.weekly.limit)}</p>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${progressData.weekly.percentage}%` }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{formatAmount(progressData.weekly.spent)} spent this week</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-700">Monthly Limit</h4>
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatAmount(progressData.monthly.limit)}</p>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full transition-all" style={{ width: `${progressData.monthly.percentage}%` }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{formatAmount(progressData.monthly.spent)} spent this month</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Spend Funds</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Address
            </label>
            <input
              id="recipient"
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              disabled={!!isPaused || isPending || isConfirming}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed font-mono text-sm"
            />
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount (USDC)
            </label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              disabled={!!isPaused || isPending || isConfirming}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            {usdcBalance && (
              <p className="text-xs text-gray-500 mt-1">
                Balance: ${balanceFormatted} USDC
              </p>
            )}
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              disabled={!!isPaused || isPending || isConfirming}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {SPENDING_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.emoji} {cat.name}
                </option>
              ))}
            </select>
            {!!isCategoryBlocked && (
              <p className="text-xs text-red-600 mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                This category is blocked by your parent
              </p>
            )}
          </div>

          <button
            onClick={handleSpend}
            disabled={!!isPaused || isPending || isConfirming || isSubmitting}
            className={`w-full flex items-center justify-center space-x-2 font-semibold py-3 px-4 rounded-lg transition-colors ${
              isPaused || isPending || isConfirming || isSubmitting
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isPending || isConfirming || isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>{isConfirming ? "Confirming..." : "Processing..."}</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Send Payment</span>
              </>
            )}
          </button>

          {hash && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                Transaction submitted!{" "}
                <a
                  href={`https://sepolia.basescan.org/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-green-900"
                >
                  View on Explorer
                </a>
              </p>
            </div>
          )}
        </div>
      </div>

      <TxList address={address} />
    </div>
  );
}
