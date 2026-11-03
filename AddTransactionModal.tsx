import React, { useState } from 'react';
import { TransactionType, ExpenseCategory, IncomeCategory, Transaction, UserProfile } from '../types/finance';
import { X, Plus, ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (tx: Omit<Transaction, 'id'>) => void;
  profile: UserProfile;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Housing & Rent',
  'Groceries & Food',
  'Dining & Coffee',
  'Utilities & Bills',
  'Transportation',
  'Entertainment & Leisure',
  'Healthcare & Wellness',
  'Education & Books',
  'Work & Equipment',
  'Shopping & Personal',
  'Subscriptions',
  'Debt & Loans',
  'Miscellaneous',
];

const INCOME_CATEGORIES: IncomeCategory[] = [
  'Salary & Wages',
  'Freelance & Contract',
  'Allowance & Support',
  'Investment & Dividends',
  'Side Gig',
  'Bonus & Commissions',
  'Other Income',
];

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  profile,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('Groceries & Food');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isEssential, setIsEssential] = useState<boolean>(true);
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'Bank Transfer' | 'Cash' | 'Digital Wallet'>('Card');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0 || !description.trim()) return;

    onAdd({
      type,
      amount: numAmount,
      category: category as any,
      description: description.trim(),
      date,
      isEssential: type === 'expense' ? isEssential : true,
      paymentMethod,
      notes: notes.trim() || undefined,
    });

    // Reset and close
    setAmount('');
    setDescription('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold">
              Record Financial Entry
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Type Selector (Income vs Expense) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategory('Groceries & Food');
              }}
              className={`py-2 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors ${
                type === 'expense'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />
              <span>Log Expense</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory('Salary & Wages');
              }}
              className={`py-2 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors ${
                type === 'income'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" />
              <span>Record Income</span>
            </button>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Amount ({profile.currency})
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm tabular-nums font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description / Payee
            </label>
            <input
              type="text"
              placeholder={type === 'income' ? 'e.g. Client Milestone Payout' : 'e.g. Trader Joe’s Weekly Produce'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {(type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method & Essential Toggle */}
          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Card">Debit / Credit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Digital Wallet">Digital Wallet (Apple/Google)</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            {type === 'expense' && (
              <div className="pt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEssential}
                    onChange={(e) => setIsEssential(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-xs font-medium text-slate-700">
                    Essential Need (vs Want)
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
            >
              Save Transaction
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
