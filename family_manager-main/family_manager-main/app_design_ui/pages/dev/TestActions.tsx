import React, { useState } from 'react';
import { familyService } from '../../services/baseSubaccountService';
import { formatUnits, parseUnits, formatEther } from '../../utils/units';
import type { FamilyData } from '../../types';

interface ActionResult {
  action: string;
  timestamp: string;
  success: boolean;
  data?: any;
  error?: string;
  txHash?: string;
}

const TestActions: React.FC = () => {
  const [results, setResults] = useState<ActionResult[]>([]);
  const [isWarningDismissed, setIsWarningDismissed] = useState(false);

  const [addMemberName, setAddMemberName] = useState('');
  const [addMemberRole, setAddMemberRole] = useState<'Mom' | 'Kid'>('Kid');
  const [addMemberLimit, setAddMemberLimit] = useState('100');
  const [addMemberAllowance, setAddMemberAllowance] = useState('10');

  const [updateMemberId, setUpdateMemberId] = useState('');
  const [updateLimit, setUpdateLimit] = useState('50');
  const [updateAllowance, setUpdateAllowance] = useState('15');

  const [revokeMemberId, setRevokeMemberId] = useState('');

  const [fundChildAddress, setFundChildAddress] = useState('');
  const [fundAmount, setFundAmount] = useState('1.0');

  const addResult = (result: ActionResult) => {
    setResults(prev => [result, ...prev.slice(0, 9)]);
  };

  const handleGetFamilyData = async () => {
    try {
      const data = await familyService.getFamilyData();
      addResult({
        action: 'getFamilyData',
        timestamp: new Date().toISOString(),
        success: true,
        data,
      });
    } catch (error) {
      addResult({
        action: 'getFamilyData',
        timestamp: new Date().toISOString(),
        success: false,
        error: String(error),
      });
    }
  };

  const handleAddFamilyMember = async () => {
    if (!addMemberName) {
      alert('Please enter a member name');
      return;
    }

    try {
      const data = await familyService.addFamilyMember(
        addMemberName,
        addMemberRole,
        parseFloat(addMemberLimit),
        parseFloat(addMemberAllowance)
      );
      addResult({
        action: 'addFamilyMember',
        timestamp: new Date().toISOString(),
        success: true,
        data,
      });
      setAddMemberName('');
    } catch (error) {
      addResult({
        action: 'addFamilyMember',
        timestamp: new Date().toISOString(),
        success: false,
        error: String(error),
      });
    }
  };

  const handleUpdateMemberSettings = async () => {
    if (!updateMemberId) {
      alert('Please enter a member ID');
      return;
    }

    try {
      const data = await familyService.updateMemberSettings(updateMemberId, {
        spendingLimit: parseFloat(updateLimit),
        dailyAllowance: parseFloat(updateAllowance),
      });
      addResult({
        action: 'updateMemberSettings',
        timestamp: new Date().toISOString(),
        success: true,
        data,
      });
    } catch (error) {
      addResult({
        action: 'updateMemberSettings',
        timestamp: new Date().toISOString(),
        success: false,
        error: String(error),
      });
    }
  };

  const handleRevokeAccess = async () => {
    if (!revokeMemberId) {
      alert('Please enter a member ID');
      return;
    }

    try {
      const data = await familyService.revokeAccess(revokeMemberId);
      addResult({
        action: 'revokeAccess',
        timestamp: new Date().toISOString(),
        success: true,
        data,
      });
      setRevokeMemberId('');
    } catch (error) {
      addResult({
        action: 'revokeAccess',
        timestamp: new Date().toISOString(),
        success: false,
        error: String(error),
      });
    }
  };

  const handleProcessDailyAllowances = async () => {
    try {
      const data = await familyService.processDailyAllowances();
      addResult({
        action: 'processDailyAllowances',
        timestamp: new Date().toISOString(),
        success: true,
        data,
      });
    } catch (error) {
      addResult({
        action: 'processDailyAllowances',
        timestamp: new Date().toISOString(),
        success: false,
        error: String(error),
      });
    }
  };

  const handleTestUnitsHelpers = () => {
    const testValue = fundAmount;
    const parsed = parseUnits(testValue, 18);
    const formatted = formatUnits(parsed, 18);
    const etherFormatted = formatEther(parsed);

    addResult({
      action: 'testUnitsHelpers',
      timestamp: new Date().toISOString(),
      success: true,
      data: {
        input: testValue,
        parsedWei: parsed.toString(),
        formattedBack: formatted,
        formatEther: etherFormatted,
      },
    });
  };

  const clearResults = () => {
    setResults([]);
  };

  if (!isWarningDismissed) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center p-4">
        <div className="max-w-2xl bg-white rounded-lg shadow-xl p-8 border-4 border-yellow-400">
          <div className="flex items-center justify-center mb-6">
            <svg className="w-20 h-20 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-center mb-4 text-gray-900">⚠️ DEV TEST HARNESS ⚠️</h1>
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
            <p className="text-lg font-semibold text-yellow-800 mb-2">Development Environment Only</p>
            <ul className="list-disc list-inside text-yellow-700 space-y-1">
              <li>This page is for testing and development purposes only</li>
              <li>Do not use in production environments</li>
              <li>Actions may modify in-memory data stores</li>
              <li>Some functions simulate blockchain transactions</li>
              <li>Raw responses and transaction data will be displayed</li>
            </ul>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setIsWarningDismissed(true)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              I Understand, Continue
            </button>
            <button
              onClick={() => window.history.back()}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-yellow-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-semibold text-yellow-800">DEV MODE - Test Harness Active</span>
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-8 text-gray-900">BaseFam Test Actions</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Family Service Actions</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Get Family Data</h3>
                  <button
                    onClick={handleGetFamilyData}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
                  >
                    Load Family Data
                  </button>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Add Family Member</h3>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Name"
                      value={addMemberName}
                      onChange={(e) => setAddMemberName(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                    <select
                      value={addMemberRole}
                      onChange={(e) => setAddMemberRole(e.target.value as 'Mom' | 'Kid')}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="Kid">Kid</option>
                      <option value="Mom">Mom</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Spending Limit"
                      value={addMemberLimit}
                      onChange={(e) => setAddMemberLimit(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                    <input
                      type="number"
                      placeholder="Daily Allowance"
                      value={addMemberAllowance}
                      onChange={(e) => setAddMemberAllowance(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                    <button
                      onClick={handleAddFamilyMember}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
                    >
                      Add Member
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Update Member Settings</h3>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Member ID (e.g., kid-01)"
                      value={updateMemberId}
                      onChange={(e) => setUpdateMemberId(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                    <input
                      type="number"
                      placeholder="New Spending Limit"
                      value={updateLimit}
                      onChange={(e) => setUpdateLimit(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                    <input
                      type="number"
                      placeholder="New Daily Allowance"
                      value={updateAllowance}
                      onChange={(e) => setUpdateAllowance(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                    <button
                      onClick={handleUpdateMemberSettings}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
                    >
                      Update Settings
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Revoke Access</h3>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Member ID to revoke"
                      value={revokeMemberId}
                      onChange={(e) => setRevokeMemberId(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                    <button
                      onClick={handleRevokeAccess}
                      className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
                    >
                      Revoke Access
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Process Daily Allowances</h3>
                  <button
                    onClick={handleProcessDailyAllowances}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
                  >
                    Process Allowances
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Units Helpers</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Test Units Conversion</h3>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Amount (e.g., 1.5)"
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                    <button
                      onClick={handleTestUnitsHelpers}
                      className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
                    >
                      Test parseUnits/formatUnits
                    </button>
                  </div>
                  <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    <p className="font-semibold mb-1">Helper Functions Available:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>parseUnits(value, decimals) - Convert to Wei</li>
                      <li>formatUnits(value, decimals) - Convert from Wei</li>
                      <li>parseEther(value) - Convert ETH to Wei</li>
                      <li>formatEther(value) - Convert Wei to ETH</li>
                      <li>parseUsdc(value) - Convert USDC (6 decimals)</li>
                      <li>formatUsdc(value) - Format USDC (6 decimals)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Contract Simulation</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Fund Child (Simulated)</h3>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Child Address (0x...)"
                      value={fundChildAddress}
                      onChange={(e) => setFundChildAddress(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                    <input
                      type="text"
                      placeholder="Amount in ETH"
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                    <button
                      onClick={() => {
                        if (!fundChildAddress) {
                          alert('Please enter a child address');
                          return;
                        }
                        const weiAmount = parseUnits(fundAmount, 18);
                        addResult({
                          action: 'fundChild (simulated)',
                          timestamp: new Date().toISOString(),
                          success: true,
                          data: {
                            childAddress: fundChildAddress,
                            amountEth: fundAmount,
                            amountWei: weiAmount.toString(),
                          },
                          txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
                        });
                      }}
                      className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
                    >
                      Simulate Fund Child
                    </button>
                  </div>
                </div>

                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded border border-blue-200">
                  <p className="font-semibold mb-1">ℹ️ Contract Functions Available:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>registerChild(address)</li>
                    <li>unregisterChild(address)</li>
                    <li>fundChild(address, amount)</li>
                    <li>setAuthorizedSpender(child, spender, bool)</li>
                    <li>getChildLimits(address)</li>
                    <li>isRegisteredChild(address)</li>
                    <li>adminWithdraw(to, amount)</li>
                  </ul>
                  <p className="mt-2 text-xs italic">Note: Only fundChild is simulated above. Others would require contract integration.</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-xl font-bold text-gray-800">Live Results</h2>
                <button
                  onClick={clearResults}
                  className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-3 rounded transition-colors duration-200"
                >
                  Clear
                </button>
              </div>
              
              <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                {results.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>No results yet. Execute an action to see results here.</p>
                  </div>
                )}
                
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${
                      result.success
                        ? 'border-green-300 bg-green-50'
                        : 'border-red-300 bg-red-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`font-bold ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                        {result.action}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        result.success
                          ? 'bg-green-200 text-green-800'
                          : 'bg-red-200 text-red-800'
                      }`}>
                        {result.success ? '✓ Success' : '✗ Error'}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-600 mb-2">
                      {new Date(result.timestamp).toLocaleString()}
                    </div>
                    
                    {result.txHash && (
                      <div className="mb-2 p-2 bg-white rounded border border-gray-200">
                        <div className="text-xs font-semibold text-gray-700 mb-1">Transaction Hash:</div>
                        <div className="text-xs font-mono text-blue-600 break-all">{result.txHash}</div>
                      </div>
                    )}
                    
                    {result.data && (
                      <div className="mt-2">
                        <div className="text-xs font-semibold text-gray-700 mb-1">Response Data:</div>
                        <pre className="text-xs bg-white p-2 rounded border border-gray-200 overflow-x-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </div>
                    )}
                    
                    {result.error && (
                      <div className="mt-2">
                        <div className="text-xs font-semibold text-red-700 mb-1">Error:</div>
                        <pre className="text-xs bg-white p-2 rounded border border-red-200 overflow-x-auto text-red-600">
                          {result.error}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestActions;
