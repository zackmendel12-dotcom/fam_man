"use client";

import { useState, useEffect } from "react";
import { useReadContract, useBalance } from "wagmi";
import { familyManagerAbi } from "../../contract/abis";
import RegisterChildModal from "./modals/RegisterChildModal";
import FundChildModal from "./modals/FundChildModal";
import SetLimitsModal from "./modals/SetLimitsModal";
import PauseChildModal from "./modals/PauseChildModal";
import ReclaimModal from "./modals/ReclaimModal";

const FAMILY_MANAGER_CONTRACT = process.env.NEXT_PUBLIC_FAMILY_MANAGER_ADDRESS as `0x${string}`;

interface ParentDashboardProps {
  address: `0x${string}`;
  onNotification: (message: string, type: "success" | "error" | "info") => void;
}

export default function ParentDashboard({ address, onNotification }: ParentDashboardProps) {
  const [children, setChildren] = useState<`0x${string}`[]>([]);
  const [isLoadingChildren, setIsLoadingChildren] = useState(true);
  const [selectedChild, setSelectedChild] = useState<`0x${string}` | null>(null);
  
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [isLimitsModalOpen, setIsLimitsModalOpen] = useState(false);
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const [isReclaimModalOpen, setIsReclaimModalOpen] = useState(false);

  const { data: parentBalance } = useBalance({
    address,
  });

  const { data: child0 } = useReadContract({
    address: FAMILY_MANAGER_CONTRACT,
    abi: familyManagerAbi,
    functionName: "parentToChildren",
    args: [address, 0n],
  });

  const { data: child1 } = useReadContract({
    address: FAMILY_MANAGER_CONTRACT,
    abi: familyManagerAbi,
    functionName: "parentToChildren",
    args: [address, 1n],
  });

  const { data: child2 } = useReadContract({
    address: FAMILY_MANAGER_CONTRACT,
    abi: familyManagerAbi,
    functionName: "parentToChildren",
    args: [address, 2n],
  });

  useEffect(() => {
    const childAddresses: `0x${string}`[] = [];
    
    if (child0 && child0 !== "0x0000000000000000000000000000000000000000") {
      childAddresses.push(child0 as `0x${string}`);
    }
    if (child1 && child1 !== "0x0000000000000000000000000000000000000000") {
      childAddresses.push(child1 as `0x${string}`);
    }
    if (child2 && child2 !== "0x0000000000000000000000000000000000000000") {
      childAddresses.push(child2 as `0x${string}`);
    }

    setChildren(childAddresses);
    setIsLoadingChildren(false);
  }, [child0, child1, child2]);

  const handleOpenFund = (child: `0x${string}`) => {
    setSelectedChild(child);
    setIsFundModalOpen(true);
  };

  const handleOpenLimits = (child: `0x${string}`) => {
    setSelectedChild(child);
    setIsLimitsModalOpen(true);
  };

  const handleOpenPause = (child: `0x${string}`) => {
    setSelectedChild(child);
    setIsPauseModalOpen(true);
  };

  const handleOpenReclaim = (child: `0x${string}`) => {
    setSelectedChild(child);
    setIsReclaimModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsRegisterModalOpen(false);
    setIsFundModalOpen(false);
    setIsLimitsModalOpen(false);
    setIsPauseModalOpen(false);
    setIsReclaimModalOpen(false);
    setSelectedChild(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Parent Dashboard</h2>
            <p className="text-gray-600 mt-1">Manage your family wallet and child accounts</p>
          </div>
          <div className="bg-blue-100 px-4 py-2 rounded-lg">
            <p className="text-sm font-medium text-blue-900">
              {children.length} {children.length === 1 ? "Child" : "Children"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-blue-900">Wallet Balance</h3>
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-blue-900">
              {parentBalance ? `${Number(parentBalance.formatted).toFixed(4)} ${parentBalance.symbol}` : "0.00"}
            </p>
            <p className="text-xs text-blue-700 mt-1">Main wallet balance</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-green-900">Active Children</h3>
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-green-900">{children.length}</p>
            <p className="text-xs text-green-700 mt-1">Registered accounts</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-purple-900">Contract</h3>
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <p className="text-sm font-mono text-purple-900">
              {FAMILY_MANAGER_CONTRACT?.slice(0, 6)}...{FAMILY_MANAGER_CONTRACT?.slice(-4)}
            </p>
            <p className="text-xs text-purple-700 mt-1">Family Manager</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Child Accounts</h3>
        {isLoadingChildren ? (
          <div className="flex justify-center py-8" role="status" aria-label="Loading child accounts">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : children.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-600">No child accounts registered yet</p>
            <p className="text-sm text-gray-500 mt-2">Register a child account to get started</p>
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              aria-label="Register your first child account"
            >
              Register First Child
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {children.map((child, index) => (
              <ChildCard
                key={child}
                childAddress={child}
                index={index}
                onFund={handleOpenFund}
                onSetLimits={handleOpenLimits}
                onPause={handleOpenPause}
                onReclaim={handleOpenReclaim}
              />
            ))}
          </div>
        )}
      </div>

      {children.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              aria-label="Register a new child account"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span>Register Child</span>
            </button>
          </div>
        </div>
      )}

      <RegisterChildModal
        isOpen={isRegisterModalOpen}
        onClose={handleCloseModals}
        onNotification={onNotification}
        parentAddress={address}
      />
      
      {selectedChild && (
        <>
          <FundChildModal
            isOpen={isFundModalOpen}
            onClose={handleCloseModals}
            onNotification={onNotification}
            parentAddress={address}
            childAddress={selectedChild}
          />
          
          <SetLimitsModal
            isOpen={isLimitsModalOpen}
            onClose={handleCloseModals}
            onNotification={onNotification}
            parentAddress={address}
            childAddress={selectedChild}
          />
          
          <PauseChildModal
            isOpen={isPauseModalOpen}
            onClose={handleCloseModals}
            onNotification={onNotification}
            parentAddress={address}
            childAddress={selectedChild}
          />
          
          <ReclaimModal
            isOpen={isReclaimModalOpen}
            onClose={handleCloseModals}
            onNotification={onNotification}
            parentAddress={address}
            childAddress={selectedChild}
          />
        </>
      )}
    </div>
  );
}

interface ChildCardProps {
  childAddress: `0x${string}`;
  index: number;
  onFund: (child: `0x${string}`) => void;
  onSetLimits: (child: `0x${string}`) => void;
  onPause: (child: `0x${string}`) => void;
  onReclaim: (child: `0x${string}`) => void;
}

function ChildCard({ childAddress, index, onFund, onSetLimits, onPause, onReclaim }: ChildCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: limits } = useReadContract({
    address: FAMILY_MANAGER_CONTRACT,
    abi: familyManagerAbi,
    functionName: "getChildLimits",
    args: [childAddress],
  }) as { data: readonly [bigint, bigint, bigint] | undefined };

  const { data: spent } = useReadContract({
    address: FAMILY_MANAGER_CONTRACT,
    abi: familyManagerAbi,
    functionName: "getChildSpent",
    args: [childAddress],
  }) as { data: readonly [bigint, bigint, bigint] | undefined };

  const { data: isPaused } = useReadContract({
    address: FAMILY_MANAGER_CONTRACT,
    abi: familyManagerAbi,
    functionName: "isChildPaused",
    args: [childAddress],
  });

  const { data: childBalance } = useBalance({
    address: childAddress,
  });

  const formatLimit = (value: bigint | undefined) => {
    if (!value) return "0";
    return (Number(value) / 1e6).toFixed(2);
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {index + 1}
            </div>
            <div>
              <p className="font-medium text-gray-900">Child {index + 1}</p>
              <p className="text-xs text-gray-500 font-mono">
                {childAddress.slice(0, 6)}...{childAddress.slice(-4)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isPaused ? (
              <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded" aria-label="Child account is paused">
                Paused
              </span>
            ) : (
              <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded" aria-label="Child account is active">
                Active
              </span>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={isExpanded ? "Collapse child details" : "Expand child details"}
              aria-expanded={isExpanded}
            >
              <svg
                className={`w-5 h-5 text-gray-600 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {childBalance && (
          <div className="mt-3 bg-gray-50 rounded p-3">
            <p className="text-xs text-gray-600">Balance</p>
            <p className="text-lg font-bold text-gray-900">
              {Number(childBalance.formatted).toFixed(4)} {childBalance.symbol}
            </p>
          </div>
        )}

        {limits && (
          <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
            <div className="bg-gray-50 rounded p-2">
              <p className="text-xs text-gray-600">Daily Limit</p>
              <p className="font-semibold text-gray-900">${formatLimit(limits[0])}</p>
              {spent && <p className="text-xs text-gray-500">Spent: ${formatLimit(spent[0])}</p>}
            </div>
            <div className="bg-gray-50 rounded p-2">
              <p className="text-xs text-gray-600">Weekly Limit</p>
              <p className="font-semibold text-gray-900">${formatLimit(limits[1])}</p>
              {spent && <p className="text-xs text-gray-500">Spent: ${formatLimit(spent[1])}</p>}
            </div>
            <div className="bg-gray-50 rounded p-2">
              <p className="text-xs text-gray-600">Monthly Limit</p>
              <p className="font-semibold text-gray-900">${formatLimit(limits[2])}</p>
              {spent && <p className="text-xs text-gray-500">Spent: ${formatLimit(spent[2])}</p>}
            </div>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Manage Child</h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onFund(childAddress)}
              className="flex items-center justify-center space-x-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors"
              aria-label={`Fund child account ${index + 1}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Fund</span>
            </button>
            <button
              onClick={() => onSetLimits(childAddress)}
              className="flex items-center justify-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors"
              aria-label={`Set spending limits for child ${index + 1}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span>Limits</span>
            </button>
            <button
              onClick={() => onPause(childAddress)}
              className="flex items-center justify-center space-x-1 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors"
              aria-label={`${isPaused ? "Resume" : "Pause"} child account ${index + 1}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isPaused ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                )}
              </svg>
              <span>{isPaused ? "Resume" : "Pause"}</span>
            </button>
            <button
              onClick={() => onReclaim(childAddress)}
              className="flex items-center justify-center space-x-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors"
              aria-label={`Unregister child account ${index + 1}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Unregister</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
