"use client";

import { useState, useEffect, useCallback } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { familyManagerAbi, usdcAbi } from "../../../contract/abis";
import { parseUnits } from "viem";

const FAMILY_MANAGER_CONTRACT = process.env.NEXT_PUBLIC_FAMILY_MANAGER_ADDRESS as `0x${string}`;
const USDC_CONTRACT = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`;

interface FundChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotification: (message: string, type: "success" | "error" | "info") => void;
  parentAddress: `0x${string}`;
  childAddress: `0x${string}`;
}

export default function FundChildModal({
  isOpen,
  onClose,
  onNotification,
  parentAddress,
  childAddress,
}: FundChildModalProps) {
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<"approve" | "fund">("approve");
  const [validationError, setValidationError] = useState("");

  const { data: allowance } = useReadContract({
    address: USDC_CONTRACT,
    abi: usdcAbi as any,
    functionName: "allowance",
    args: [parentAddress, FAMILY_MANAGER_CONTRACT],
  }) as { data: bigint | undefined };

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleClose = useCallback(() => {
    if (!isPending && !isConfirming) {
      setAmount("");
      setValidationError("");
      setStep("approve");
      onClose();
    }
  }, [isPending, isConfirming, onClose]);

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
    if (isSuccess && step === "approve") {
      onNotification("Approval successful! Now funding the child account...", "success");
      setStep("fund");
    } else if (isSuccess && step === "fund") {
      onNotification("Child account funded successfully!", "success");
      handleClose();
    }
  }, [isSuccess, step, onNotification, handleClose]);

  useEffect(() => {
    if (writeError) {
      const errorMessage = writeError.message.includes("User rejected")
        ? "Transaction was rejected"
        : writeError.message.includes("insufficient")
        ? "Insufficient balance to fund child account"
        : "Transaction failed. Please try again.";
      onNotification(errorMessage, "error");
    }
  }, [writeError, onNotification]);

  useEffect(() => {
    if (amount && allowance) {
      const amountInUsdc = parseUnits(amount, 6);
      if (allowance >= amountInUsdc) {
        setStep("fund");
      } else {
        setStep("approve");
      }
    }
  }, [amount, allowance]);

  const validateAmount = (value: string): boolean => {
    if (!value) {
      setValidationError("Please enter an amount");
      return false;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      setValidationError("Amount must be greater than 0");
      return false;
    }

    if (numValue > 1000000) {
      setValidationError("Amount is too large");
      return false;
    }

    setValidationError("");
    return true;
  };

  const handleApprove = async () => {
    if (!validateAmount(amount)) return;

    try {
      const amountInUsdc = parseUnits(amount, 6);
      writeContract({
        address: USDC_CONTRACT,
        abi: usdcAbi as any,
        functionName: "approve",
        args: [FAMILY_MANAGER_CONTRACT, amountInUsdc],
      });
    } catch (error) {
      console.error("Error approving:", error);
    }
  };

  const handleFund = async () => {
    if (!validateAmount(amount)) return;

    try {
      const amountInUsdc = parseUnits(amount, 6);
      writeContract({
        address: FAMILY_MANAGER_CONTRACT,
        abi: familyManagerAbi,
        functionName: "fundChild",
        args: [childAddress, amountInUsdc],
      });
    } catch (error) {
      console.error("Error funding child:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === "approve") {
      await handleApprove();
    } else {
      await handleFund();
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
      aria-labelledby="fund-modal-title"
    >
      <div
        className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="fund-modal-title" className="text-2xl font-bold text-gray-900">
            Fund Child Account
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
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount (USDC)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setValidationError("");
                }}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={`w-full pl-8 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  validationError ? "border-red-500" : "border-gray-300"
                }`}
                disabled={isProcessing}
                required
                aria-describedby={validationError ? "amount-error" : undefined}
                aria-invalid={!!validationError}
              />
            </div>
            {validationError && (
              <p id="amount-error" className="mt-1 text-sm text-red-600" role="alert">
                {validationError}
              </p>
            )}
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setAmount("10")}
                disabled={isProcessing}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
              >
                $10
              </button>
              <button
                type="button"
                onClick={() => setAmount("25")}
                disabled={isProcessing}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
              >
                $25
              </button>
              <button
                type="button"
                onClick={() => setAmount("50")}
                disabled={isProcessing}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
              >
                $50
              </button>
              <button
                type="button"
                onClick={() => setAmount("100")}
                disabled={isProcessing}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
              >
                $100
              </button>
            </div>
          </div>

          {step === "approve" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-blue-900">
                  First, you need to approve the contract to transfer USDC on your behalf. This is a standard security measure.
                </p>
              </div>
            </div>
          )}

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
              disabled={isProcessing || !amount}
              className="flex-1 bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? "Processing..." : step === "approve" ? "Approve & Fund" : "Fund Child"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
