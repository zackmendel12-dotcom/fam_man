
export interface FamilyMember {
  id: string;
  name: string;
  role: 'Father' | 'Mom' | 'Kid';
  balance: number;
  spendingLimit: number; // For Mom, this could be per month. For Kids, per day.
  dailyAllowance?: number; // Only for kids
  avatarUrl: string;
}

export interface Transaction {
  id: string;
  memberId: string;
  memberName: string;
  store: string;
  amount: number;
  date: string;
  status: 'Approved' | 'Declined';
}

export interface FamilyData {
  mainWalletBalance: number;
  members: FamilyMember[];
  transactions: Transaction[];
}
