"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { usePublicClient, useBlockNumber } from "wagmi";
import { formatUnits } from "viem";
import { familyManagerAbi } from "../../contract/abis";

const FAMILY_MANAGER_CONTRACT = process.env.NEXT_PUBLIC_FAMILY_MANAGER_ADDRESS as `0x${string}`;
const BASE_SEPOLIA_EXPLORER = "https://sepolia.basescan.org";
const DEFAULT_POLLING_INTERVAL = 8000;
const BLOCKS_TO_FETCH = 10000n;

interface TxListProps {
  address: `0x${string}`;
  pollingInterval?: number;
}

interface ContractEvent {
  eventName: string;
  transactionHash: string;
  blockNumber: bigint;
  timestamp: number;
  args: Record<string, any>;
}

export default function TxList({ address, pollingInterval = DEFAULT_POLLING_INTERVAL }: TxListProps) {
  const [events, setEvents] = useState<ContractEvent[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [lastFetchedBlock, setLastFetchedBlock] = useState<bigint | null>(null);
  
  const publicClient = usePublicClient();
  const { data: currentBlockNumber } = useBlockNumber({ watch: true });

  const fetchEvents = useCallback(async () => {
    if (!publicClient || !FAMILY_MANAGER_CONTRACT) return;

    try {
      setIsLoading(true);
      const latestBlock = await publicClient.getBlockNumber();
      const fromBlock = lastFetchedBlock || (latestBlock > BLOCKS_TO_FETCH ? latestBlock - BLOCKS_TO_FETCH : 0n);

      const eventNames = [
        "ChildRegistered",
        "ChildFunded",
        "Spent",
        "ChildUnregistered",
        "LimitsUpdated",
        "ChildPaused",
        "AuthorizedSpenderSet",
        "ParentTransferred",
        "AdminWithdraw",
      ];

      const allEvents: ContractEvent[] = [];

      for (const eventName of eventNames) {
        try {
          const logs = await publicClient.getContractEvents({
            address: FAMILY_MANAGER_CONTRACT,
            abi: familyManagerAbi,
            eventName: eventName as any,
            fromBlock,
            toBlock: latestBlock,
          });

          for (const log of logs) {
            const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
            
            allEvents.push({
              eventName,
              transactionHash: log.transactionHash,
              blockNumber: log.blockNumber,
              timestamp: Number(block.timestamp) * 1000,
              args: (log as any).args as Record<string, any>,
            });
          }
        } catch (error) {
          console.error(`Error fetching ${eventName} events:`, error);
        }
      }

      setEvents((prevEvents) => {
        const combined = [...prevEvents, ...allEvents];
        const uniqueEvents = Array.from(
          new Map(combined.map((event) => [event.transactionHash + event.eventName, event])).values()
        );
        return uniqueEvents.sort((a, b) => b.timestamp - a.timestamp);
      });

      setLastFetchedBlock(latestBlock);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, lastFetchedBlock]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchEvents();
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [fetchEvents, pollingInterval]);

  const handleRefresh = useCallback(() => {
    setLastFetchedBlock(null);
    setEvents([]);
    fetchEvents();
  }, [fetchEvents]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  }, []);

  const getRelativeTime = useCallback((timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  }, []);

  const formatAmount = useCallback((amount: bigint) => {
    const formatted = formatUnits(amount, 6);
    return `${parseFloat(formatted).toFixed(2)} USDC`;
  }, []);

  const getEventDescription = useCallback((event: ContractEvent) => {
    const { eventName, args } = event;

    switch (eventName) {
      case "ChildRegistered":
        return {
          title: "Child Registered",
          description: `Parent ${args.parent?.slice(0, 6)}...${args.parent?.slice(-4)} registered child ${args.child?.slice(0, 6)}...${args.child?.slice(-4)}`,
          icon: "👨‍👩‍👧‍👦",
          color: "bg-green-100 text-green-800",
        };
      case "ChildFunded":
        return {
          title: "Child Funded",
          description: `Parent funded child ${args.child?.slice(0, 6)}...${args.child?.slice(-4)} with ${formatAmount(args.amount)}`,
          icon: "💰",
          color: "bg-blue-100 text-blue-800",
        };
      case "Spent":
        return {
          title: "Spending Transaction",
          description: `Child ${args.child?.slice(0, 6)}...${args.child?.slice(-4)} spent ${formatAmount(args.amount)} to ${args.recipient?.slice(0, 6)}...${args.recipient?.slice(-4)}`,
          icon: "💸",
          color: "bg-purple-100 text-purple-800",
        };
      case "ChildUnregistered":
        return {
          title: "Child Unregistered",
          description: `Parent ${args.parent?.slice(0, 6)}...${args.parent?.slice(-4)} unregistered child ${args.child?.slice(0, 6)}...${args.child?.slice(-4)}`,
          icon: "❌",
          color: "bg-red-100 text-red-800",
        };
      case "LimitsUpdated":
        return {
          title: "Limits Updated",
          description: `Child ${args.child?.slice(0, 6)}...${args.child?.slice(-4)} limits updated: Daily ${formatAmount(args.daily)}, Weekly ${formatAmount(args.weekly)}, Monthly ${formatAmount(args.monthly)}`,
          icon: "⚙️",
          color: "bg-yellow-100 text-yellow-800",
        };
      case "ChildPaused":
        return {
          title: args.paused ? "Child Paused" : "Child Unpaused",
          description: `Child ${args.child?.slice(0, 6)}...${args.child?.slice(-4)} ${args.paused ? "paused" : "unpaused"}`,
          icon: args.paused ? "⏸️" : "▶️",
          color: args.paused ? "bg-orange-100 text-orange-800" : "bg-green-100 text-green-800",
        };
      case "AuthorizedSpenderSet":
        return {
          title: "Authorized Spender Set",
          description: `Spender ${args.spender?.slice(0, 6)}...${args.spender?.slice(-4)} ${args.authorized ? "authorized" : "unauthorized"} for child ${args.child?.slice(0, 6)}...${args.child?.slice(-4)}`,
          icon: "🔑",
          color: "bg-indigo-100 text-indigo-800",
        };
      case "ParentTransferred":
        return {
          title: "Parent Transferred",
          description: `Child ${args.child?.slice(0, 6)}...${args.child?.slice(-4)} transferred from ${args.oldParent?.slice(0, 6)}...${args.oldParent?.slice(-4)} to ${args.newParent?.slice(0, 6)}...${args.newParent?.slice(-4)}`,
          icon: "🔄",
          color: "bg-pink-100 text-pink-800",
        };
      case "AdminWithdraw":
        return {
          title: "Admin Withdrawal",
          description: `Admin withdrew ${formatAmount(args.amount)} to ${args.to?.slice(0, 6)}...${args.to?.slice(-4)}`,
          icon: "🏦",
          color: "bg-gray-100 text-gray-800",
        };
      default:
        return {
          title: eventName,
          description: "Event occurred",
          icon: "📋",
          color: "bg-gray-100 text-gray-800",
        };
    }
  }, [formatAmount]);

  const filteredEvents = useMemo(() => {
    return events;
  }, [events]);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div
        className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Activity Feed</h3>
            <p className="text-sm text-gray-500">
              {filteredEvents.length} {filteredEvents.length === 1 ? "event" : "events"}
              {isLoading && " • Loading..."}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRefresh();
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Refresh events"
          >
            <svg
              className={`w-5 h-5 text-gray-600 ${isLoading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <svg
            className={`w-6 h-6 text-gray-500 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 p-6">
          {isLoading && filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading events...</p>
              <p className="text-sm text-gray-500 mt-2">
                Fetching recent blockchain activity
              </p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600 font-medium">No events yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Activity will appear here as transactions occur
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents.map((event) => {
                const eventInfo = getEventDescription(event);
                return (
                  <div
                    key={`${event.transactionHash}-${event.eventName}`}
                    className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${eventInfo.color}`}>
                        {eventInfo.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-semibold text-gray-900">{eventInfo.title}</p>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${eventInfo.color}`}>
                            {event.eventName}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2 break-words">{eventInfo.description}</p>
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span className="font-mono flex items-center space-x-1">
                            <span>Tx:</span>
                            <a
                              href={`${BASE_SEPOLIA_EXPLORER}/tx/${event.transactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-blue-600 underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {event.transactionHash.slice(0, 10)}...{event.transactionHash.slice(-8)}
                            </a>
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(event.transactionHash);
                            }}
                            className="hover:text-blue-600 transition-colors"
                            title="Copy transaction hash"
                          >
                            {copiedHash === event.transactionHash ? (
                              <span className="text-green-600">✓ Copied</span>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-xs text-gray-500 whitespace-nowrap">{getRelativeTime(event.timestamp)}</p>
                      <p className="text-xs text-gray-400 whitespace-nowrap">Block {event.blockNumber.toString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
