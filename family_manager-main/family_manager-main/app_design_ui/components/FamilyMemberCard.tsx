
import React from 'react';
import type { FamilyMember } from '../types';
import { SettingsIcon } from './icons';

interface FamilyMemberCardProps {
  member: FamilyMember;
  onOpenSettings: (member: FamilyMember) => void;
}

const FamilyMemberCard: React.FC<FamilyMemberCardProps> = ({ member, onOpenSettings }) => {
  const isKid = member.role === 'Kid';
  const limitLabel = isKid ? 'Daily Limit' : 'Monthly Limit';
  
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <img src={member.avatarUrl} alt={member.name} className="h-16 w-16 rounded-full border-4 border-base-blue/20" />
            <div>
              <h4 className="text-xl font-bold text-dark-text">{member.name}</h4>
              <p className="text-sm font-medium text-light-text bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-1">{member.role}</p>
            </div>
          </div>
          <button onClick={() => onOpenSettings(member)} className="text-light-text hover:text-base-blue transition-colors duration-300">
            <SettingsIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="mt-6">
          <p className="text-sm text-light-text">Current Balance</p>
          <p className="text-3xl font-bold text-dark-text">${member.balance.toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm">
          <span className="text-light-text font-medium">{limitLabel}</span>
          <span className="font-bold text-dark-text">${member.spendingLimit.toLocaleString()}</span>
        </div>
        {isKid && member.dailyAllowance && (
          <div className="flex justify-between items-center text-sm mt-2">
            <span className="text-light-text font-medium">Daily Allowance</span>
            <span className="font-bold text-green-600">+${member.dailyAllowance.toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyMemberCard;
