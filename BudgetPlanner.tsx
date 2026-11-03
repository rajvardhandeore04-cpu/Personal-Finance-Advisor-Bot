import React, { useState } from 'react';
import { BudgetLimit, ExpenseCategory, UserProfile } from '../types/finance';
import { Sparkles, Sliders, Check, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';

interface CategorySpend {
  category: ExpenseCategory;
  spent: number;
  budget: number;
  percent: number;
}

interface BudgetPlannerProps {
  budgets: BudgetLimit[];
  categorySpends: CategorySpend[];
  profile: UserProfile;
  monthlyIncome: number;
  onUpdateBudget: (category: ExpenseCategory, newLimit: number) => void;
  onApplyNewBudgets: (newBudgets: BudgetLimit[]) => void;
  onAskAdvisorAboutCategory: (category: string) => void;
}

export const BudgetPlanner: React.FC<BudgetPlannerProps> = ({
  budgets,
  categorySpends,
  profile,
  monthlyIncome,
  onUpdateBudget,
  onApplyNewBudgets,
  onAskAdvisorAboutCategory,
}) => {
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [tempLimit, setTempLimit] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState<'50_30_20' | 'aggressive_savings' | 'lean_budget' | 'freelancer_buffer'>('50_30_20');
  const [aiProposal, setAiProposal] = useState<{
    rationale: string;
    recommendedBudgets: Array<{ category: ExpenseCategory; limit: number; reason: string }>;
    savingsTarget: number;
  } | null>(null);

  const currency = profile.currency;
  const totalAllocated = budgets.reduce((acc, b) => acc + b.limit, 0);
  const totalSpent = categorySpends.reduce((acc, c) => acc + c.spent, 0);

  const handleStartEdit = (category: ExpenseCategory, currentLimit: number) => {
    setEditingCategory(category);
    setTempLimit(currentLimit);
  };

  const handleSaveEdit = (category: ExpenseCategory) => {
    onUpdateBudget(category, Number(tempLimit) || 0);
    setEditingCategory(null);
  };

  const handleGenerateAiBudget = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/advisor/generate-budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          monthlyIncome,
          currentExpenses: categorySpends,
          framework: selectedFramework,
        }),
      });
      const data = await response.json();
      setAiProposal(data);
    } catch (err) {
      console.warn('Network call failed, applying client-side budget framework:', err);
      const income = monthlyIncome || profile?.monthlyTargetIncome || 4000;
      let multiplierHousing = 0.30;
      let multiplierFood = 0.12;
      let multiplierDining = 0.05;
      let multiplierUtilities = 0.06;
      let multiplierTransport = 0.08;

      if (selectedFramework === 'aggressive_savings') {
        multiplierHousing = 0.25;
        multiplierFood = 0.10;
        multiplierDining = 0.03;
        multiplierUtilities = 0.05;
        multiplierTransport = 0.06;
      } else if (selectedFramework === 'lean_budget') {
        multiplierHousing = 0.35;
        multiplierFood = 0.15;
        multiplierDining = 0.02;
        multiplierUtilities = 0.06;
        multiplierTransport = 0.05;
      }

      const clientRecs = [
        { category: 'Housing & Rent' as ExpenseCategory, limit: Math.round(income * multiplierHousing), reason: 'Essential baseline shelter' },
        { category: 'Groceries & Food' as ExpenseCategory, limit: Math.round(income * multiplierFood), reason: 'Home nutrition and staples' },
        { category: 'Dining & Coffee' as ExpenseCategory, limit: Math.round(income * multiplierDining), reason: 'Social eating and discretionary treats' },
        { category: 'Utilities & Bills' as ExpenseCategory, limit: Math.round(income * multiplierUtilities), reason: 'Connectivity, electric, gas' },
        { category: 'Transportation' as ExpenseCategory, limit: Math.round(income * multiplierTransport), reason: 'Commute, fuel or transit pass' },
        { category: 'Healthcare & Wellness' as ExpenseCategory, limit: Math.round(income * 0.05), reason: 'Health maintenance and fitness' },
        { category: 'Entertainment & Leisure' as ExpenseCategory, limit: Math.round(income * 0.04), reason: 'Recreation & balance' },
        { category: 'Subscriptions' as ExpenseCategory, limit: Math.round(income * 0.02), reason: 'Essential digital tools' },
        { category: 'Miscellaneous' as ExpenseCategory, limit: Math.round(income * 0.04), reason: 'Unforeseen buffer' },
      ];

      setAiProposal({
        framework: selectedFramework,
        monthlyIncome: income,
        recommendedBudgets: clientRecs,
        savingsTarget: Math.round(income * 0.25),
        rationale: `Personalized ${selectedFramework.replace('_', ' ')} budget tailored to ${profile.roleTitle}. Balances core necessities while safeguarding surplus growth.`,
      } as any);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyAiProposal = () => {
    if (!aiProposal) return;
    const newBudgets: BudgetLimit[] = budgets.map((b) => {
      const match = aiProposal.recommendedBudgets.find((r) => r.category === b.category);
      return match ? { ...b, limit: match.limit } : b;
    });

    // Also include any newly suggested categories not in current list
    aiProposal.recommendedBudgets.forEach((r) => {
      if (!newBudgets.some((b) => b.category === r.category)) {
        newBudgets.push({
          category: r.category,
          limit: r.limit,
          period: 'monthly',
          color: '#64748b',
        });
      }
    });

    onApplyNewBudgets(newBudgets);
    setAiProposal(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Automated AI Generator CTA */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>Financial Planning</span>
              <span aria-hidden="true">·</span>
              <span>Category Allocation</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Personalized Monthly Budget Plan
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Total Budget Allocated: <strong className="text-slate-900 tabular-nums">{currency}{totalAllocated.toLocaleString()}</strong> / Total Spent: <strong className="text-slate-900 tabular-nums">{currency}{totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedFramework}
              onChange={(e) => setSelectedFramework(e.target.value as any)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="50_30_20">50/30/20 Standard Framework</option>
              <option value="aggressive_savings">Aggressive 70/30 Wealth Build</option>
              <option value="lean_budget">Lean Essential Budget (Student/Debt)</option>
              <option value="freelancer_buffer">Freelancer Volatility Buffer</option>
            </select>

            <button
              onClick={handleGenerateAiBudget}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Generating...' : 'AI Auto-Generate Budget'}</span>
            </button>
          </div>
        </div>

        {/* AI Proposal Drawer / Banner if generated */}
        {aiProposal && (
          <div className="mt-5 p-4 bg-emerald-50/70 border border-emerald-200 rounded-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>AI Budget Recommendation Ready</span>
                </div>
                <p className="text-xs text-emerald-900 mt-1 max-w-3xl leading-relaxed">
                  {aiProposal.rationale}
                </p>
                <div className="mt-3 flex items-center gap-4 text-xs font-medium text-emerald-800">
                  <span>Projected Savings Target: <strong>{currency}{aiProposal.savingsTarget.toLocaleString()}/mo</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setAiProposal(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Dismiss
                </button>
                <button
                  onClick={handleApplyAiProposal}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
                >
                  Apply AI Budget
                </button>
              </div>
            </div>

            {/* Proposed Category Limit Changes */}
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 pt-3 border-t border-emerald-200/60">
              {aiProposal.recommendedBudgets.slice(0, 8).map((rec) => {
                const current = budgets.find((b) => b.category === rec.category)?.limit || 0;
                const diff = rec.limit - current;
                return (
                  <div key={rec.category} className="p-2 bg-white rounded border border-emerald-100 text-xs">
                    <span className="font-medium text-slate-800 block truncate">{rec.category}</span>
                    <div className="flex items-center justify-between mt-1 text-slate-600 tabular-nums">
                      <span>{currency}{rec.limit.toLocaleString()}</span>
                      <span className={`text-[10px] ${diff < 0 ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                        {diff < 0 ? `-${currency}${Math.abs(diff)}` : `+${currency}${diff}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Category Progress Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categorySpends.map((item) => {
          const isOverrun = item.spent > item.budget;
          const isWarning = item.spent >= item.budget * 0.8 && !isOverrun;
          const isEditing = editingCategory === item.category;

          return (
            <div
              key={item.category}
              className={`bg-white border rounded-xl p-4 transition-all ${
                isOverrun
                  ? 'border-rose-300 ring-1 ring-rose-200'
                  : isWarning
                  ? 'border-amber-300'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-900 truncate">
                      {item.category}
                    </h3>
                    {isOverrun && (
                      <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                        Overrun by {currency}{(item.spent - item.budget).toFixed(0)}
                      </span>
                    )}
                    {isWarning && (
                      <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                        {item.percent}% Used
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Spent: <strong className="text-slate-900 tabular-nums">{currency}{item.spent.toFixed(2)}</strong> of budget limit
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={tempLimit}
                        onChange={(e) => setTempLimit(Number(e.target.value))}
                        className="w-20 text-xs border border-slate-300 rounded px-2 py-1 tabular-nums focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        min="0"
                      />
                      <button
                        onClick={() => handleSaveEdit(item.category)}
                        className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                        title="Save limit"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 tabular-nums">
                        {currency}{item.budget.toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleStartEdit(item.category, item.budget)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded"
                        title="Adjust budget limit"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOverrun
                        ? 'bg-rose-500'
                        : isWarning
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, item.percent)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 tabular-nums">
                  <span>{item.percent}% consumed</span>
                  <span>
                    {isOverrun
                      ? 'Exceeded budget cap'
                      : `${currency}${(item.budget - item.spent).toFixed(0)} remaining`}
                  </span>
                </div>
              </div>

              {/* Action hint / Ask Bot CTA */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => onAskAdvisorAboutCategory(item.category)}
                  className="text-emerald-700 hover:text-emerald-800 font-medium inline-flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Analyze {item.category} spend</span>
                </button>
                <span className="text-slate-400 text-[11px]">Monthly cycle</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
