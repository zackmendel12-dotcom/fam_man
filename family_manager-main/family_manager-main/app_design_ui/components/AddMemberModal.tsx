
import React, { useState, useEffect } from 'react';
import { CloseIcon } from './icons';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (name: string, role: 'Mom' | 'Kid', limit: number, allowance: number) => void;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({ isOpen, onClose, onAddMember }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Mom' | 'Kid'>('Kid');
  const [limit, setLimit] = useState(20);
  const [allowance, setAllowance] = useState(10);

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
    if (name.trim() && limit > 0) {
      onAddMember(name, role, limit, role === 'Kid' ? allowance : 0);
      setName('');
      setRole('Kid');
      setLimit(20);
      setAllowance(10);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md transform transition-all"  onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-dark-text">Add New Family Member</h2>
          <button onClick={onClose} className="text-light-text hover:text-dark-text">
            <CloseIcon className="h-6 w-6"/>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-light-text">Name</label>
            <input 
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-base-blue focus:border-base-blue"
              required 
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-light-text">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'Mom' | 'Kid')}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-base-blue focus:border-base-blue"
            >
              <option value="Kid">Kid</option>
              <option value="Mom">Mom</option>
            </select>
          </div>
          <div>
            <label htmlFor="limit" className="block text-sm font-medium text-light-text">{role === 'Kid' ? 'Daily Spending Limit' : 'Monthly Spending Limit'}</label>
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
          {role === 'Kid' && (
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
          <div className="flex gap-2 justify-end pt-4">
            <button type="button" onClick={onClose} className="flex-1 sm:flex-none bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
            <button type="submit" className="flex-1 sm:flex-none bg-base-blue text-white font-semibold px-4 py-2 rounded-lg hover:bg-base-blue-dark">Add Member</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;
