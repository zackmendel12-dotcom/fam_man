"use client";

import { useState, useEffect, useCallback } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { familyManagerAbi } from "../../../contract/abis";
import { parseUnits } from "viem";

const FAMILY_MANAGER_CONTRACT = process.env.NEXT_PUBLIC_FAMILY_MANAGER_ADDRESS as `0x${string}`;

interface SetLimitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotification: (message: string, type: "success" | "error" | "info") => void;
  parentAddress: `0x${string}`;
  childAddress: `0x${string}`;
}

export default function SetLimitsModal({
  isOpen,
  onClose,
  onNotification,
  parentAddress,
  childAddress,
}: SetLimitsModalProps) {
  const [dailyLimit, setDailyLimit] = useState("");
  const [weeklyLimit, setWeeklyLimit] = useState("");
  const [monthlyLimit, setMonthlyLimit] = useState("");
  const [validationError, setValidationError] = useState("");

  const { data: currentLimits } = useReadContract({
    address: FAMILY_MANAGER_CONTRACT,
    abi: familyManagerAbi,
    functionName: "getChildLimits",
    args: [childAddress],
  }) as { data: readonly [bigint, bigint, bigint] | undefined };

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleClose = useCallback(() => {
    if (!isPending && !isConfirming) {
      setDailyLimit("");
      setWeeklyLimit("");
      setMonthlyLimit("");
      setValidationError("");
      onClose();
    }
  }, [isPending, isConfirming, onClose]);

  useEffect(() => {
    if (currentLimits && isOpen) {
      setDailyLimit((Number(currentLimits[0]) / 1e6).toString());
      setWeeklyLimit((Number(currentLimits[1]) / 1e6).toString());
      setMonthlyLimit((Number(currentLimits[2]) / 1e6).toString());
    }
  }, [currentLimits, isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending && !isConfirming) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isPending, isConfirming, handleClose]);

  useEffect(() => {
    if (isSuccess) {
      onNotification("Spending limits updated successfully!", "success");
      handleClose();
    }
  }, [isSuccess, onNotification, handleClose]);

  useEffect(() => {
    if (writeError) {
      const errorMessage = writeError.message.includes("User rejected")
        ? "Transaction was rejected"
        : writeError.message.includes("limits")
        ? "Invalid limit values. Weekly must be >= daily, monthly >= weekly"
        : "Failed to update limits. Please try again.";
      onNotification(errorMessage, "error");
    }
  }, [writeError, onNotification]);

  const validateLimits = (): boolean => {
    const daily = parseFloat(dailyLimit);
    const weekly = parseFloat(weeklyLimit);
    const monthly = parseFloat(monthlyLimit);

    if (isNaN(daily) || daily < 0) {
      setValidationError("Daily limit must be a valid positive number");
      return false;
    }

    if (isNaN(weekly) || weekly < 0) {
      setValidationError("Weekly limit must be a valid positive number");
      return false;
    }

    if (isNaN(monthly) || monthly < 0) {
      setValidationError("Monthly limit must be a valid positive number");
      return false;
    }

    if (weekly < daily) {
      setValidationError("Weekly limit must be greater than or equal to daily limit");
      return false;
    }

    if (monthly < weekly) {
      setValidationError("Monthly limit must be greater than or equal to weekly limit");
      return false;
    }

    setValidationError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLimits()) {
      return;
    }

    try {
      const dailyInUsdc = parseUnits(dailyLimit, 6);
      const weeklyInUsdc = parseUnits(weeklyLimit, 6);
      const monthlyInUsdc = parseUnits(monthlyLimit, 6);

      writeContract({
        address: FAMILY_MANAGER_CONTRACT,
        abi: familyManagerAbi,
        functionName: "updateChildLimits",
        args: [childAddress, dailyInUsdc, weeklyInUsdc, monthlyInUsdc],
      });
    } catch (error) {
      console.error("Error updating limits:", error);
    }
  };

  if (!isOpen) return null;

  const isProcessing = isPending || isConfirming;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="limits-modal-title"
    >
      <div
        className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="limits-modal-title" className="text-2xl font-bold text-gray-900">
            Set Spending Limits
          </h2>
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Child Address</p>
          <p className="text-sm font-mono text-gray-900 break-all">{childAddress}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="dailyLimit" className="block text-sm font-medium text-gray-700 mb-1">
              Daily Spending Limit (USDC)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                id="dailyLimit"
                value={dailyLimit}
                onChange={(e) => {
                  setDailyLimit(e.target.value);
                  setValidationError("");
                }}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="weeklyLimit" className="block text-sm font-medium text-gray-700 mb-1">
              Weekly Spending Limit (USDC)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                id="weeklyLimit"
                value={weeklyLimit}
                onChange={(e) => {
                  setWeeklyLimit(e.target.value);
                  setValidationError("");
                }}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="monthlyLimit" className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Spending Limit (USDC)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                id="monthlyLimit"
                value={monthlyLimit}
                onChange={(e) => {
                  setMonthlyLimit(e.target.value);
                  setValidationError("");
                }}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
                required
              />
            </div>
          </div>

          {validationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3" role="alert">
              <p className="text-sm text-red-800">{validationError}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Limit Rules:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Weekly limit must be ≥ daily limit</li>
                  <li>Monthly limit must be ≥ weekly limit</li>
                  <li>Limits are enforced automatically by the contract</li>
                </ul>
              </div>
            </div>
          </div>

          {isProcessing && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
                <p className="text-sm text-yellow-900">
                  {isPending ? "Waiting for wallet approval..." : "Transaction confirming..."}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isProcessing}
              className="flex-1 bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || !dailyLimit || !weeklyLimit || !monthlyLimit}
              className="flex-1 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? "Processing..." : "Update Limits"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
