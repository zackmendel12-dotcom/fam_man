
import React, { useState, useEffect } from 'react';
import type { FamilyMember } from '../types';
import { CloseIcon } from './icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: FamilyMember;
  onUpdate: (memberId: string, limit: number, allowance: number) => void;
  onRevoke: (memberId: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, member, onUpdate, onRevoke }) => {
  const [limit, setLimit] = useState(member.spendingLimit);
  const [allowance, setAllowance] = useState(member.dailyAllowance || 0);

  useEffect(() => {
    setLimit(member.spendingLimit);
    setAllowance(member.dailyAllowance || 0);
  }, [member]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(member.id, limit, allowance);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-dark-text">Settings for {member.name}</h2>
          <button onClick={onClose} className="text-light-text hover:text-dark-text">
            <CloseIcon className="h-6 w-6"/>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="limit" className="block text-sm font-medium text-light-text">{member.role === 'Kid' ? 'Daily Spending Limit' : 'Monthly Spending Limit'}</label>
            <input
              type="number"
              id="limit"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-base-blue focus:border-base-blue"
              required
              min="0"
            />
          </div>
          {member.role === 'Kid' && (
            <div>
              <label htmlFor="allowance" className="block text-sm font-medium text-light-text">Daily Allowance</label>
              <input
                type="number"
                id="allowance"
                value={allowance}
                onChange={(e) => setAllowance(Number(e.target.value))}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-base-blue focus:border-base-blue"
                required
                min="0"
              />
            </div>
          )}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 pt-4">
            <button type="button" onClick={() => onRevoke(member.id)} className="text-red-600 font-semibold px-4 py-2 rounded-lg hover:bg-red-50 order-last sm:order-first">Revoke Access</button>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="flex-1 sm:flex-none bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
              <button type="submit" className="flex-1 sm:flex-none bg-base-blue text-white font-semibold px-4 py-2 rounded-lg hover:bg-base-blue-dark">Save Changes</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;
