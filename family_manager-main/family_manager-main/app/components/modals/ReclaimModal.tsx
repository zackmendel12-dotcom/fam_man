"use client";

import { useState, useEffect, useCallback } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useBalance } from "wagmi";
import { familyManagerAbi } from "../../../contract/abis";

const FAMILY_MANAGER_CONTRACT = process.env.NEXT_PUBLIC_FAMILY_MANAGER_ADDRESS as `0x${string}`;

interface ReclaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotification: (message: string, type: "success" | "error" | "info") => void;
  parentAddress: `0x${string}`;
  childAddress: `0x${string}`;
}

export default function ReclaimModal({
  isOpen,
  onClose,
  onNotification,
  parentAddress,
  childAddress,
}: ReclaimModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const [validationError, setValidationError] = useState("");

  const { data: childBalance } = useBalance({
    address: childAddress,
  });

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleClose = useCallback(() => {
    if (!isPending && !isConfirming) {
      setConfirmText("");
      setValidationError("");
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
    if (isSuccess) {
      onNotification("Child account unregistered successfully!", "success");
      handleClose();
    }
  }, [isSuccess, onNotification, handleClose]);

  useEffect(() => {
    if (writeError) {
      const errorMessage = writeError.message.includes("User rejected")
        ? "Transaction was rejected"
        : writeError.message.includes("not registered")
        ? "Child account is not registered"
        : "Failed to unregister child account. Please try again.";
      onNotification(errorMessage, "error");
    }
  }, [writeError, onNotification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (confirmText.toUpperCase() !== "UNREGISTER") {
      setValidationError('Please type "UNREGISTER" to confirm');
      return;
    }

    try {
      writeContract({
        address: FAMILY_MANAGER_CONTRACT,
        abi: familyManagerAbi,
        functionName: "unregisterChild",
        args: [childAddress],
      });
    } catch (error) {
      console.error("Error unregistering child:", error);
    }
  };

  if (!isOpen) return null;

  const isProcessing = isPending || isConfirming;
  const hasBalance = childBalance && Number(childBalance.formatted) > 0;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reclaim-modal-title"
    >
      <div
        className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="reclaim-modal-title" className="text-2xl font-bold text-gray-900">
            Unregister Child Account
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

        {hasBalance && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-yellow-900">Child has balance</p>
                <p className="text-sm text-yellow-800 mt-1">
                  Balance: {Number(childBalance.formatted).toFixed(4)} {childBalance.symbol}
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Consider withdrawing funds before unregistering
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="text-sm text-red-900">
              <p className="font-semibold mb-1">Warning: This action is permanent</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Child will lose access to spend funds</li>
                <li>All spending limits will be removed</li>
                <li>You'll need to register again to restore access</li>
                <li>Any remaining balance will stay in their wallet</li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="confirmText" className="block text-sm font-medium text-gray-700 mb-1">
              Type <strong>UNREGISTER</strong> to confirm
            </label>
            <input
              type="text"
              id="confirmText"
              value={confirmText}
              onChange={(e) => {
                setConfirmText(e.target.value);
                setValidationError("");
              }}
              placeholder="UNREGISTER"
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${
                validationError ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isProcessing}
              required
              aria-describedby={validationError ? "confirm-error" : undefined}
              aria-invalid={!!validationError}
            />
            {validationError && (
              <p id="confirm-error" className="mt-1 text-sm text-red-600" role="alert">
                {validationError}
              </p>
            )}
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
              disabled={isProcessing || confirmText.toUpperCase() !== "UNREGISTER"}
              className="flex-1 bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? "Processing..." : "Unregister Child"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
