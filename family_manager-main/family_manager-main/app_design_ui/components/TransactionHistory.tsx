
import React from 'react';
import type { Transaction } from '../types';

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  return (
    <div className="mt-8 bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200">
      <h3 className="text-xl sm:text-2xl font-semibold text-dark-text mb-4">Transaction History</h3>
      {transactions.length === 0 ? (
        <p className="text-center text-light-text py-8">No transactions yet</p>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-left min-w-[600px] sm:min-w-0">
            <thead className="border-b-2 border-gray-200">
              <tr>
                <th className="p-2 sm:p-3 text-xs sm:text-sm font-semibold text-light-text">Date</th>
                <th className="p-2 sm:p-3 text-xs sm:text-sm font-semibold text-light-text">Member</th>
                <th className="p-2 sm:p-3 text-xs sm:text-sm font-semibold text-light-text">Store / Description</th>
                <th className="p-2 sm:p-3 text-xs sm:text-sm font-semibold text-light-text text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.id} className="border-b border-gray-100 last:border-b-0">
                  <td className="p-2 sm:p-3 text-sm text-dark-text whitespace-nowrap">{new Date(tx.date).toLocaleDateString()}</td>
                  <td className="p-2 sm:p-3 text-sm text-dark-text font-medium">{tx.memberName}</td>
                  <td className="p-2 sm:p-3 text-sm text-dark-text">{tx.store}</td>
                  <td className="p-2 sm:p-3 text-sm font-semibold text-right text-dark-text">
                    -${tx.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
