"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useSwitchChain } from "wagmi";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { baseSepolia } from "wagmi/chains";
import { familyManagerAbi } from "../contract/abis";
import ParentDashboard from "./components/ParentDashboard";
import ChildView from "./components/ChildView";
import TxList from "./components/TxList";
import Notifications from "./components/Notifications";

const FAMILY_MANAGER_CONTRACT = process.env.NEXT_PUBLIC_FAMILY_MANAGER_ADDRESS as `0x${string}`;

type UserRole = "parent" | "child" | "unknown";

export default function Home() {
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  
  const [userRole, setUserRole] = useState<UserRole>("unknown");
  const [isLoadingRole, setIsLoadingRole] = useState(false);
  const [manualOverride, setManualOverride] = useState<UserRole | null>(null);
  const [notifications, setNotifications] = useState<Array<{ id: string; message: string; type: "success" | "error" | "info" }>>([]);

  const isCorrectNetwork = chain?.id === baseSepolia.id;

  const { data: isRegisteredChild, isLoading: isLoadingChild } = useReadContract({
    address: FAMILY_MANAGER_CONTRACT,
    abi: familyManagerAbi,
    functionName: "isRegisteredChild",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isCorrectNetwork,
    },
  });

  const { data: hasChildren, isLoading: isLoadingParent } = useReadContract({
    address: FAMILY_MANAGER_CONTRACT,
    abi: familyManagerAbi,
    functionName: "parentToChildren",
    args: address ? [address, 0n] : undefined,
    query: {
      enabled: !!address && isCorrectNetwork && !isRegisteredChild,
    },
  });

  useEffect(() => {
    if (!address || !isCorrectNetwork) {
      setUserRole("unknown");
      return;
    }

    if (manualOverride) {
      setUserRole(manualOverride);
      return;
    }

    setIsLoadingRole(true);

    if (isLoadingChild || isLoadingParent) {
      return;
    }

    if (isRegisteredChild) {
      setUserRole("child");
    } else if (hasChildren && hasChildren !== "0x0000000000000000000000000000000000000000") {
      setUserRole("parent");
    } else {
      setUserRole("unknown");
    }

    setIsLoadingRole(false);
  }, [address, isCorrectNetwork, isRegisteredChild, hasChildren, isLoadingChild, isLoadingParent, manualOverride]);

  const handleSwitchNetwork = async () => {
    try {
      await switchChain?.({ chainId: baseSepolia.id });
      addNotification("Switched to Base Sepolia", "success");
    } catch (error) {
      addNotification("Failed to switch network", "error");
    }
  };

  const addNotification = (message: string, type: "success" | "error" | "info") => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  const handleManualOverride = (role: UserRole | null) => {
    setManualOverride(role);
    if (role) {
      addNotification(`Manually overridden to ${role} mode`, "info");
    } else {
      addNotification("Override cleared, detecting role from contract", "info");
    }
  };

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-blue-500 rounded-full mx-auto flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to BaseFam
          </h1>
          <p className="text-gray-600 mb-8">
            Connect your wallet to access your family smart wallet
          </p>
          <div className="flex justify-center">
            <Wallet>
              <></>
            </Wallet>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            Powered by Base Sepolia
          </p>
        </div>
        <Notifications notifications={notifications} />
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-red-500 rounded-full mx-auto flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Wrong Network
          </h2>
          <p className="text-gray-600 mb-6">
            Please switch to Base Sepolia network to continue
          </p>
          <button
            onClick={handleSwitchNetwork}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Switch to Base Sepolia
          </button>
          <div className="mt-6 flex justify-end">
            <Wallet>
              <></>
            </Wallet>
          </div>
        </div>
        <Notifications notifications={notifications} />
      </div>
    );
  }

  if (isLoadingRole || isLoadingChild || isLoadingParent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Detecting Your Role
          </h2>
          <p className="text-gray-600">
            Checking contract to determine if you're a parent or child...
          </p>
        </div>
        <Notifications notifications={notifications} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">BaseFam</h1>
                <p className="text-xs text-gray-500">Smart Family Wallet</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {userRole === "parent" ? "Parent Account" : userRole === "child" ? "Child Account" : "Unknown Role"}
                </p>
                <p className="text-xs text-gray-500">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </p>
              </div>
              <Wallet>
                <></>
              </Wallet>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {process.env.NODE_ENV === "development" && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-yellow-900 mb-2">
              Development Mode - Role Override
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleManualOverride(null)}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  !manualOverride
                    ? "bg-gray-800 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Auto-detect
              </button>
              <button
                onClick={() => handleManualOverride("parent")}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  manualOverride === "parent"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
              >
                Override as Parent
              </button>
              <button
                onClick={() => handleManualOverride("child")}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  manualOverride === "child"
                    ? "bg-green-600 text-white"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
              >
                Override as Child
              </button>
            </div>
          </div>
        )}

        {userRole === "parent" && (
          <ParentDashboard address={address} onNotification={addNotification} />
        )}

        {userRole === "child" && (
          <ChildView address={address} onNotification={addNotification} />
        )}

        {userRole === "unknown" && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Role Detected
            </h2>
            <p className="text-gray-600 mb-6">
              Your account is not registered as a parent or child in the family wallet system.
            </p>
            <p className="text-sm text-gray-500">
              Please register your account or contact the family administrator.
            </p>
          </div>
        )}

        <div className="mt-8">
          <TxList address={address} />
        </div>
      </main>

      <Notifications notifications={notifications} />
    </div>
  );
}
