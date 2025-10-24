
import React from 'react';
import type { FamilyData, FamilyMember } from '../types';
import FamilyMemberCard from './FamilyMemberCard';
import { AddUserIcon, ClockIcon, HistoryIcon } from './icons';

interface DashboardProps {
  familyData: FamilyData;
  onAddMember: () => void;
  onOpenSettings: (member: FamilyMember) => void;
  onTopUpAllowance: () => void;
  onToggleHistory: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ familyData, onAddMember, onOpenSettings, onTopUpAllowance, onToggleHistory }) => {
  const father = familyData.members.find(m => m.role === 'Father');
  const otherMembers = familyData.members.filter(m => m.role !== 'Father');

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-dark-text">Main Family Wallet</h2>
          <p className="text-4xl font-bold text-base-blue mt-1">${familyData.mainWalletBalance.toLocaleString()}</p>
          <p className="text-light-text text-sm">Managed by {father?.name}</p>
        </div>
        <div className="flex flex-wrap gap-2">
           <button onClick={onTopUpAllowance} className="flex items-center gap-1 sm:gap-2 bg-green-100 text-green-700 font-semibold px-3 sm:px-4 py-2 rounded-lg hover:bg-green-200 transition-colors duration-300 text-sm sm:text-base">
            <ClockIcon className="h-5 w-5 flex-shrink-0"/>
            <span className="hidden xs:inline sm:inline">Daily Allowance</span>
            <span className="inline xs:hidden sm:hidden">Allowance</span>
          </button>
          <button onClick={onToggleHistory} className="flex items-center gap-1 sm:gap-2 bg-gray-100 text-gray-700 font-semibold px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-300 text-sm sm:text-base">
            <HistoryIcon className="h-5 w-5 flex-shrink-0"/>
            <span>History</span>
          </button>
          <button onClick={onAddMember} className="flex items-center gap-1 sm:gap-2 bg-base-blue text-white font-semibold px-3 sm:px-4 py-2 rounded-lg hover:bg-base-blue-dark transition-colors duration-300 text-sm sm:text-base">
            <AddUserIcon className="h-5 w-5 flex-shrink-0"/>
            <span className="hidden xs:inline sm:inline">Add Member</span>
            <span className="inline xs:hidden sm:hidden">Add</span>
          </button>
        </div>
      </div>
      
      <div>
        <h3 className="text-2xl font-semibold text-dark-text mb-4">Family Members</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherMembers.map(member => (
            <FamilyMemberCard key={member.id} member={member} onOpenSettings={onOpenSettings} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
