import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, ExpenseCategory, IncomeCategory, UserProfile } from '../types/finance';
import { Plus, Search, Filter, Trash2, Download, ArrowUpRight, ArrowDownRight, Tag } from 'lucide-react';

interface TransactionLedgerProps {
  transactions: Transaction[];
  profile: UserProfile;
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenAddModal: () => void;
}

export const TransactionLedger: React.FC<TransactionLedgerProps> = ({
  transactions,
  profile,
  onAddTransaction,
  onDeleteTransaction,
  onOpenAddModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [essentialFilter, setEssentialFilter] = useState<'all' | 'essential' | 'discretionary'>('all');

  const currency = profile.currency;

  const categories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => set.add(t.category));
    return Array.from(set).sort();
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        if (typeFilter !== 'all' && t.type !== typeFilter) return false;
        if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
        if (essentialFilter === 'essential' && !t.isEssential) return false;
        if (essentialFilter === 'discretionary' && t.isEssential) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            t.description.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q) ||
            (t.notes && t.notes.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, typeFilter, categoryFilter, essentialFilter, searchQuery]);

  const exportCSV = () => {
    const headers = ['ID', 'Date', 'Type', 'Category', 'Description', 'Amount', 'Essential', 'Payment Method'];
    const rows = filteredTransactions.map((t) => [
      t.id,
      t.date,
      t.type,
      `"${t.category}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      t.amount.toFixed(2),
      t.isEssential ? 'Yes' : 'No',
      t.paymentMethod || 'N/A',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${profile.name.toLowerCase().replace(/\s+/g, '_')}_finance_ledger.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Financial Ledger & Expense Log
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {filteredTransactions.length} of {transactions.length} entries · Tabular alignment
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Entry</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search description or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Type filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full py-1.5 px-3 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Inflow & Outflow</option>
              <option value="income">Inflow Only (Income)</option>
              <option value="expense">Outflow Only (Expenses)</option>
            </select>
          </div>

          {/* Category filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full py-1.5 px-3 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Essential vs Discretionary */}
          <div>
            <select
              value={essentialFilter}
              onChange={(e) => setEssentialFilter(e.target.value as any)}
              className="w-full py-1.5 px-3 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Essential & Discretionary</option>
              <option value="essential">Needs (Essential Only)</option>
              <option value="discretionary">Wants (Discretionary Only)</option>
            </select>
          </div>
        </div>
      </div>

      {/* High-density Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No transactions match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 tabular-nums text-slate-600 whitespace-nowrap">
                        {tx.date}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900 max-w-xs sm:max-w-md truncate">
                          {tx.description}
                        </div>
                        {tx.paymentMethod && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            via {tx.paymentMethod}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-700">
                        {tx.category}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isIncome ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                            <ArrowDownRight className="w-3.5 h-3.5" />
                            <span>Inflow</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-600">
                            <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />
                            <span>{tx.isEssential ? 'Essential Need' : 'Discretionary'}</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums whitespace-nowrap font-bold">
                        <span className={isIncome ? 'text-emerald-700' : 'text-slate-900'}>
                          {isIncome ? '+' : '-'}{currency}{tx.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
