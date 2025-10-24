"use client";

import { useState, useEffect, useCallback } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { familyManagerAbi } from "../../../contract/abis";
import { isAddress } from "viem";

const FAMILY_MANAGER_CONTRACT = process.env.NEXT_PUBLIC_FAMILY_MANAGER_ADDRESS as `0x${string}`;

interface RegisterChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotification: (message: string, type: "success" | "error" | "info") => void;
  parentAddress: `0x${string}`;
}

export default function RegisterChildModal({
  isOpen,
  onClose,
  onNotification,
  parentAddress,
}: RegisterChildModalProps) {
  const [childAddress, setChildAddress] = useState("");
  const [validationError, setValidationError] = useState("");

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleClose = useCallback(() => {
    if (!isPending && !isConfirming) {
      setChildAddress("");
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
      onNotification("Child account registered successfully!", "success");
      handleClose();
    }
  }, [isSuccess, onNotification, handleClose]);

  useEffect(() => {
    if (writeError) {
      const errorMessage = writeError.message.includes("User rejected")
        ? "Transaction was rejected"
        : writeError.message.includes("already registered")
        ? "This address is already registered as a child"
        : "Failed to register child. Please try again.";
      onNotification(errorMessage, "error");
    }
  }, [writeError, onNotification]);

  const validateAddress = (address: string): boolean => {
    if (!address) {
      setValidationError("Please enter a child address");
      return false;
    }
    
    if (!isAddress(address)) {
      setValidationError("Invalid Ethereum address");
      return false;
    }

    if (address.toLowerCase() === parentAddress.toLowerCase()) {
      setValidationError("Child address cannot be the same as parent address");
      return false;
    }

    setValidationError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAddress(childAddress)) {
      return;
    }

    try {
      writeContract({
        address: FAMILY_MANAGER_CONTRACT,
        abi: familyManagerAbi,
        functionName: "registerChild",
        args: [childAddress as `0x${string}`],
      });
    } catch (error) {
      console.error("Error registering child:", error);
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
      aria-labelledby="register-modal-title"
    >
      <div
        className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="register-modal-title" className="text-2xl font-bold text-gray-900">
            Register Child Account
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="childAddress" className="block text-sm font-medium text-gray-700 mb-1">
              Child Wallet Address
            </label>
            <input
              type="text"
              id="childAddress"
              value={childAddress}
              onChange={(e) => {
                setChildAddress(e.target.value);
                setValidationError("");
              }}
              placeholder="0x..."
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationError ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isProcessing}
              required
              aria-describedby={validationError ? "address-error" : undefined}
              aria-invalid={!!validationError}
            />
            {validationError && (
              <p id="address-error" className="mt-1 text-sm text-red-600" role="alert">
                {validationError}
              </p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Important:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>The child address must be a valid Ethereum address</li>
                  <li>You'll need to set spending limits after registration</li>
                  <li>Child can spend only after you fund their account</li>
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
              disabled={isProcessing || !childAddress}
              className="flex-1 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? "Processing..." : "Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
