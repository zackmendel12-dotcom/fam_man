
import type { FamilyData, FamilyMember, Transaction } from '../types';

// In-memory store to simulate a backend database
let familyDataStore: FamilyData = {
  mainWalletBalance: 10000,
  members: [
    {
      id: 'dad-01',
      name: 'Michael',
      role: 'Father',
      balance: 10000,
      spendingLimit: Infinity,
      avatarUrl: `https://i.pravatar.cc/150?u=dad-01`,
    },
    {
      id: 'mom-01',
      name: 'Sarah',
      role: 'Mom',
      balance: 500,
      spendingLimit: 2000, // Monthly limit for shopping
      avatarUrl: `https://i.pravatar.cc/150?u=mom-01`,
    },
    {
      id: 'kid-01',
      name: 'Leo',
      role: 'Kid',
      balance: 15,
      spendingLimit: 20, // Daily spending limit
      dailyAllowance: 10,
      avatarUrl: `https://i.pravatar.cc/150?u=kid-01`,
    },
     {
      id: 'kid-02',
      name: 'Mia',
      role: 'Kid',
      balance: 25,
      spendingLimit: 30, // Daily spending limit
      dailyAllowance: 15,
      avatarUrl: `https://i.pravatar.cc/150?u=kid-02`,
    },
  ],
  transactions: [
    {
      id: 'txn-01',
      memberId: 'mom-01',
      memberName: 'Sarah',
      store: 'Whole Foods',
      amount: 154.21,
      date: new Date(Date.now() - 86400000).toISOString(),
      status: 'Approved',
    },
    {
      id: 'txn-02',
      memberId: 'kid-01',
      memberName: 'Leo',
      store: 'Ice Cream Shop',
      amount: 5.50,
      date: new Date(Date.now() - 172800000).toISOString(),
      status: 'Approved',
    },
     {
      id: 'txn-03',
      memberId: 'kid-02',
      memberName: 'Mia',
      store: 'Book Store',
      amount: 18.99,
      date: new Date(Date.now() - 3 * 86400000).toISOString(),
      status: 'Approved',
    },
     {
      id: 'txn-04',
      memberId: 'mom-01',
      memberName: 'Sarah',
      store: 'Target',
      amount: 88.50,
      date: new Date(Date.now() - 4 * 86400000).toISOString(),
      status: 'Approved',
    },
  ],
};

// Simulate API call latency
const simulateApiCall = <T,>(data: T): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), 500));
};

const recordTransaction = (member: FamilyMember, amount: number, store: string) => {
    // This is a simplified transaction simulation. 
    // In a real app, this would involve complex logic with the Base SDK.
    const newTxn: Transaction = {
        id: `txn-${Date.now()}`,
        memberId: member.id,
        memberName: member.name,
        store: store,
        amount: amount,
        date: new Date().toISOString(),
        status: 'Approved' // Simplified for demo
    };
    familyDataStore.transactions.unshift(newTxn);
};

export const familyService = {
  getFamilyData: (): Promise<FamilyData> => {
    return simulateApiCall(familyDataStore);
  },

  addFamilyMember: (name: string, role: 'Mom' | 'Kid', limit: number, allowance: number): Promise<FamilyData> => {
    const newMember: FamilyMember = {
      id: `${role.toLowerCase()}-${Date.now()}`,
      name,
      role,
      balance: role === 'Kid' ? allowance : 0, // Kids start with their first allowance
      spendingLimit: limit,
      avatarUrl: `https://i.pravatar.cc/150?u=${Date.now()}`,
      ...(role === 'Kid' && { dailyAllowance: allowance }),
    };
    familyDataStore.members.push(newMember);
    if (role === 'Kid') {
        familyDataStore.mainWalletBalance -= allowance;
        recordTransaction(newMember, allowance, 'First Allowance');
    }
    return simulateApiCall(familyDataStore);
  },

  updateMemberSettings: (memberId: string, settings: { spendingLimit: number, dailyAllowance: number }): Promise<FamilyData> => {
    const memberIndex = familyDataStore.members.findIndex(m => m.id === memberId);
    if (memberIndex !== -1) {
      familyDataStore.members[memberIndex].spendingLimit = settings.spendingLimit;
      if (familyDataStore.members[memberIndex].role === 'Kid') {
        familyDataStore.members[memberIndex].dailyAllowance = settings.dailyAllowance;
      }
    }
    return simulateApiCall(familyDataStore);
  },

  revokeAccess: (memberId: string): Promise<FamilyData> => {
    familyDataStore.members = familyDataStore.members.filter(m => m.id !== memberId);
    return simulateApiCall(familyDataStore);
  },

  processDailyAllowances: (): Promise<FamilyData> => {
    familyDataStore.members.forEach(member => {
      if (member.role === 'Kid' && member.dailyAllowance) {
        if (familyDataStore.mainWalletBalance >= member.dailyAllowance) {
          member.balance += member.dailyAllowance;
          familyDataStore.mainWalletBalance -= member.dailyAllowance;
          recordTransaction(member, member.dailyAllowance, 'Daily Allowance');
        }
      }
    });
    return simulateApiCall(familyDataStore);
  },
};
