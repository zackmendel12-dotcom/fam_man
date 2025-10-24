
import React, { useState, useEffect, useCallback } from 'react';
import type { FamilyData, FamilyMember, Transaction } from './types';
import { familyService } from './services/baseSubaccountService';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AddMemberModal from './components/AddMemberModal';
import SettingsModal from './components/SettingsModal';
import TransactionHistory from './components/TransactionHistory';
import TestActions from './pages/dev/TestActions';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'main' | 'dev'>('main');
  const [familyData, setFamilyData] = useState<FamilyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isAddMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const [isHistoryVisible, setHistoryVisible] = useState(false);
  
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  useEffect(() => {
    const checkDevMode = () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(window.location.search);
      
      if (hash === '#dev' || params.get('dev') === 'true') {
        setCurrentView('dev');
      } else {
        setCurrentView('main');
      }
    };

    checkDevMode();

    window.addEventListener('hashchange', checkDevMode);
    
    return () => {
      window.removeEventListener('hashchange', checkDevMode);
    };
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await familyService.getFamilyData();
      setFamilyData(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch family data.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddMember = async (name: string, role: 'Mom' | 'Kid', limit: number, allowance: number) => {
    try {
      const updatedData = await familyService.addFamilyMember(name, role, limit, allowance);
      setFamilyData(updatedData);
      setAddMemberModalOpen(false);
    } catch (err) {
      setError('Failed to add family member.');
    }
  };

  const handleUpdateSettings = async (memberId: string, limit: number, allowance: number) => {
    try {
      const updatedData = await familyService.updateMemberSettings(memberId, { spendingLimit: limit, dailyAllowance: allowance });
      setFamilyData(updatedData);
      setSettingsModalOpen(false);
      setSelectedMember(null);
    } catch (err) {
      setError('Failed to update settings.');
    }
  };
  
  const handleRevokeAccess = async (memberId: string) => {
    if(window.confirm('Are you sure you want to revoke access for this member?')) {
      try {
        const updatedData = await familyService.revokeAccess(memberId);
        setFamilyData(updatedData);
        setSettingsModalOpen(false);
        setSelectedMember(null);
      } catch (err) {
        setError('Failed to revoke access.');
      }
    }
  };

  const handleTopUpAllowance = async () => {
    try {
      const updatedData = await familyService.processDailyAllowances();
      setFamilyData(updatedData);
    } catch (err) {
      setError('Failed to process allowances.');
    }
  };

  const handleOpenSettings = (member: FamilyMember) => {
    setSelectedMember(member);
    setSettingsModalOpen(true);
  };
  
  const handleCloseModals = () => {
    setAddMemberModalOpen(false);
    setSettingsModalOpen(false);
    setSelectedMember(null);
  };

  if (currentView === 'dev') {
    return <TestActions />;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-4">
        <div className="animate-pulse text-base-blue mb-4">
          <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-xl font-semibold text-base-blue">Loading BaseFam...</p>
        <p className="text-sm text-light-text mt-2">Preparing your family wallet</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-4 text-center">
        <div className="text-red-500 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-dark-text mb-2">Oops! Something went wrong</h2>
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-base-blue text-white font-semibold px-6 py-2 rounded-lg hover:bg-base-blue-dark transition-colors duration-300"
        >
          Reload Page
        </button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-light-bg font-sans text-dark-text">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        {familyData && (
          <Dashboard 
            familyData={familyData}
            onAddMember={() => setAddMemberModalOpen(true)}
            onOpenSettings={handleOpenSettings}
            onTopUpAllowance={handleTopUpAllowance}
            onToggleHistory={() => setHistoryVisible(!isHistoryVisible)}
          />
        )}
        {familyData && isHistoryVisible && <TransactionHistory transactions={familyData.transactions} />}
      </main>
      
      <AddMemberModal 
        isOpen={isAddMemberModalOpen}
        onClose={handleCloseModals}
        onAddMember={handleAddMember}
      />
      
      {selectedMember && (
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={handleCloseModals}
          member={selectedMember}
          onUpdate={handleUpdateSettings}
          onRevoke={handleRevokeAccess}
        />
      )}
    </div>
  );
};

export default App;
