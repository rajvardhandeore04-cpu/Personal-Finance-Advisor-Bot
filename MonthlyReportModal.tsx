import React, { useState, useEffect } from 'react';
import { UserProfile, ExpenseCategory } from '../types/finance';
import { FileText, Printer, X, Sparkles, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';

interface MonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  essentialExpenses: number;
  discretionaryExpenses: number;
  categorySpends: Array<{
    category: ExpenseCategory;
    spent: number;
    budget: number;
    percent: number;
  }>;
}

export const MonthlyReportModal: React.FC<MonthlyReportModalProps> = ({
  isOpen,
  onClose,
  profile,
  totalIncome,
  totalExpenses,
  netSavings,
  savingsRate,
  essentialExpenses,
  discretionaryExpenses,
  categorySpends,
}) => {
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const currency = profile.currency;

  useEffect(() => {
    if (isOpen) {
      generateReport();
    }
  }, [isOpen]);

  const generateReport = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/advisor/monthly-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          reportData: {
            monthName: 'September',
            year: 2026,
            totalIncome,
            totalExpenses,
            netSavings,
            savingsRate,
            essentialExpenses,
            discretionaryExpenses,
            categoryBreakdown: categorySpends,
          },
        }),
      });
      const data = await response.json();
      setReport(data);
    } catch (err) {
      console.warn('Network call failed, generating report client-side:', err);
      const currency = profile.currency;
      const overspent = categorySpends.filter((c) => c.spent > c.budget);
      setReport({
        executiveSummary: `During this monthly billing cycle, you accumulated ${currency}${totalIncome.toLocaleString()} in total inflows and executed ${currency}${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} in categorized outlays, realizing a net financial surplus of ${currency}${netSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${savingsRate}% savings rate). Essential needs accounted for ${Math.round((essentialExpenses / (totalExpenses || 1)) * 100)}% of total outlays.`,
        financialHealthStatus: savingsRate >= 20 ? 'Optimal' : savingsRate >= 10 ? 'Stable' : 'Attention Needed',
        topOverrunNotes: overspent.map((c) => `${c.category} surpassed budget by ${currency}${(c.spent - c.budget).toFixed(0)}`),
        strategicRecommendations: [
          `Prioritize direct-depositing the ${currency}${Math.round(netSavings * 0.5)} surplus directly into your highest-priority savings goal.`,
          `Rebalance category caps for next month by trimming discretionary dining and impulse purchases.`,
          `Maintain an emergency buffer to withstand at least 3-6 months of essential living expenses.`,
        ],
        nextMonthTargetSavings: Math.max(0, netSavings + 100),
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const overspentItems = categorySpends.filter((c) => c.spent > c.budget);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Monthly Statement
              </span>
              <h2 className="text-lg font-bold">
                Financial Summary Report · September 2026
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Printable Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Statement Meta */}
          <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {profile.name}
              </h1>
              <p className="text-xs text-slate-500">
                {profile.roleTitle} · {profile.description}
              </p>
            </div>
            <div className="text-left sm:text-right text-xs text-slate-500 tabular-nums">
              <div>Statement Period: <strong>Sep 01 – Sep 30, 2026</strong></div>
              <div>Generated via Personal Finance Advisor Bot AI</div>
            </div>
          </div>

          {/* AI Executive Summary Card */}
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 mb-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Executive Financial Analysis</span>
            </div>

            {isLoading ? (
              <div className="space-y-2 py-3 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
              </div>
            ) : report ? (
              <div className="space-y-3">
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {report.executiveSummary}
                </p>

                {report.strategicRecommendations && (
                  <div className="pt-3 border-t border-slate-200">
                    <span className="text-xs font-semibold text-slate-800 block mb-1.5">
                      Strategic Directives for Next Month:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-600">
                      {report.strategicRecommendations.map((rec: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Key Figures Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <span className="text-[11px] text-slate-500 block uppercase">Total Inflow</span>
              <span className="text-lg font-bold text-slate-900 tabular-nums">
                {currency}{totalIncome.toLocaleString()}
              </span>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <span className="text-[11px] text-slate-500 block uppercase">Total Outflow</span>
              <span className="text-lg font-bold text-slate-900 tabular-nums">
                {currency}{totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <span className="text-[11px] text-slate-500 block uppercase">Net Savings</span>
              <span className={`text-lg font-bold tabular-nums ${netSavings >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {currency}{netSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <span className="text-[11px] text-slate-500 block uppercase">Savings Rate</span>
              <span className="text-lg font-bold text-slate-900 tabular-nums">
                {savingsRate}%
              </span>
            </div>
          </div>

          {/* Category Breakdown Table */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Category-by-Category Spend vs Budget Allocation
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Actual Spent</th>
                    <th className="py-2.5 px-3 text-right">Budget Cap</th>
                    <th className="py-2.5 px-3 text-right">Variance</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categorySpends.map((item) => {
                    const diff = item.budget - item.spent;
                    const isOver = diff < 0;
                    return (
                      <tr key={item.category}>
                        <td className="py-2 px-3 font-medium text-slate-800">
                          {item.category}
                        </td>
                        <td className="py-2 px-3 text-right tabular-nums text-slate-900">
                          {currency}{item.spent.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-right tabular-nums text-slate-600">
                          {currency}{item.budget.toLocaleString()}
                        </td>
                        <td className={`py-2 px-3 text-right tabular-nums font-medium ${isOver ? 'text-rose-700' : 'text-emerald-700'}`}>
                          {isOver ? `-${currency}${Math.abs(diff).toFixed(0)}` : `+${currency}${diff.toFixed(0)}`}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {isOver ? (
                            <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                              Overrun
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                              Nominal
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Overrun Flags if any */}
          {overspentItems.length > 0 && (
            <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-lg">
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-800 mb-1">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Overspending Action Flags</span>
              </div>
              <p className="text-xs text-rose-900">
                You exceeded budget caps in {overspentItems.map((o) => o.category).join(', ')}. Trimming discretionary non-essential purchases in these specific categories will restore healthy margin for your upcoming monthly goals.
              </p>
            </div>
          )}

          {/* Footer certification */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
            <span>Report prepared by Personal Finance Advisor Bot</span>
            <span>Confidential & Prepared for Personal Financial Planning</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3 no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900"
          >
            Close Statement
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
          >
            Print Summary Statement
          </button>
        </div>

      </div>
    </div>
  );
};
