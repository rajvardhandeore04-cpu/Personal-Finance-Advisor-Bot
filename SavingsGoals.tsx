import React, { useState } from 'react';
import { SavingsGoal, UserProfile } from '../types/finance';
import { Target, Plus, PiggyBank, Calendar, Check, ArrowRight } from 'lucide-react';

interface SavingsGoalsProps {
  goals: SavingsGoal[];
  profile: UserProfile;
  netSavings: number;
  onUpdateGoalProgress: (goalId: string, addedAmount: number) => void;
  onAddNewGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
}

export const SavingsGoals: React.FC<SavingsGoalsProps> = ({
  goals,
  profile,
  netSavings,
  onUpdateGoalProgress,
  onAddNewGoal,
}) => {
  const [depositModalGoal, setDepositModalGoal] = useState<SavingsGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState<number>(5000);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);

  // New goal state
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState<number>(100000);
  const [currentAmount, setCurrentAmount] = useState<number>(0);
  const [deadline, setDeadline] = useState('2026-12');
  const [category, setCategory] = useState<SavingsGoal['category']>('Emergency Fund');
  const [monthlyContribution, setMonthlyContribution] = useState<number>(10000);
  const [notes, setNotes] = useState('');

  const currency = profile.currency;
  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositModalGoal || depositAmount <= 0) return;
    onUpdateGoalProgress(depositModalGoal.id, depositAmount);
    setDepositModalGoal(null);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || targetAmount <= 0) return;
    onAddNewGoal({
      name,
      targetAmount,
      currentAmount: currentAmount || 0,
      deadline,
      category,
      monthlyContribution: monthlyContribution || Math.round(targetAmount / 12),
      notes,
    });
    setName('');
    setShowAddGoalModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>Goal-Based Savings</span>
              <span aria-hidden="true">·</span>
              <span>Capital Accumulation</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Savings Targets & Emergency Buffers
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Accumulated: <strong className="text-slate-900 tabular-nums">{currency}{totalSaved.toLocaleString()}</strong> of <strong className="text-slate-900 tabular-nums">{currency}{totalTarget.toLocaleString()}</strong> overall targets ({totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}%)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddGoalModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Goal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((goal) => {
          const progressPercent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

          return (
            <div key={goal.id} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      {goal.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      {goal.name}
                    </h3>
                  </div>
                  <span className="text-xs font-bold tabular-nums text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {progressPercent}%
                  </span>
                </div>

                {goal.notes && (
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                    {goal.notes}
                  </p>
                )}

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs tabular-nums text-slate-600 mb-1.5">
                    <span>{currency}{goal.currentAmount.toLocaleString()} saved</span>
                    <span className="font-semibold text-slate-900">Target: {currency}{goal.targetAmount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Monthly Pace</span>
                    <span className="font-semibold text-slate-800 tabular-nums">
                      {currency}{goal.monthlyContribution}/mo
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Target Date</span>
                    <span className="font-semibold text-slate-800 tabular-nums">
                      {goal.deadline}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deposit Button */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 tabular-nums">
                  {currency}{remaining.toLocaleString()} left
                </span>
                <button
                  onClick={() => {
                    setDepositModalGoal(goal);
                    setDepositAmount(Math.min(remaining, Math.max(50, goal.monthlyContribution)));
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                >
                  <PiggyBank className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Deposit Funds</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deposit Modal */}
      {depositModalGoal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Deposit to {depositModalGoal.name}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Currently saved: {currency}{depositModalGoal.currentAmount.toLocaleString()} of {currency}{depositModalGoal.targetAmount.toLocaleString()}
            </p>

            <form onSubmit={handleDepositSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deposit Amount ({currency})
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  min="1"
                  step="1"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDepositModalGoal(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                >
                  Confirm Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Goal Modal */}
      {showAddGoalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">
              Create New Savings Goal
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Define your financial milestone, target capital, and deadline.
            </p>

            <form onSubmit={handleCreateGoal} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Goal Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. 6-Month Emergency Fund"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Amount ({currency})
                  </label>
                  <input
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    min="10"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Balance ({currency})
                  </label>
                  <input
                    type="number"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Date (YYYY-MM)
                  </label>
                  <input
                    type="month"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Emergency Fund">Emergency Fund</option>
                    <option value="Vacation">Vacation</option>
                    <option value="Debt Payoff">Debt Payoff</option>
                    <option value="Education">Education</option>
                    <option value="Major Purchase">Major Purchase</option>
                    <option value="Retirement">Retirement</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Monthly Contribution ({currency})
                </label>
                <input
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes or Purpose
                </label>
                <input
                  type="text"
                  placeholder="Optional brief notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddGoalModal(false)}
                  className="px-3.5 py-2 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
