import React, { useState } from 'react';
import { UserProfile, ExpenseCategory } from '../types/finance';
import { TrendingUp, ShieldAlert, Sparkles, Activity, Compass, ArrowRight } from 'lucide-react';

interface PredictiveAnalyticsProps {
  profile: UserProfile;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  essentialExpenses: number;
  emergencyRunwayMonths: number;
  onOpenAdvisorWithPrompt: (prompt: string) => void;
}

export const PredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({
  profile,
  totalIncome,
  totalExpenses,
  netSavings,
  essentialExpenses,
  emergencyRunwayMonths,
  onOpenAdvisorWithPrompt,
}) => {
  const [incomeShockPercent, setIncomeShockPercent] = useState<number>(20);
  const [simulatedEmergencyExpense, setSimulatedEmergencyExpense] = useState<number>(15000);

  const currency = profile.currency;

  // Run-rate projection: assume current elapsed days = 28 of 30 days in September
  const elapsedDays = 28;
  const daysInMonth = 30;
  const dailyRunRate = totalExpenses / elapsedDays;
  const projectedMonthEndExpenses = dailyRunRate * daysInMonth;
  const projectedNetSavings = totalIncome - projectedMonthEndExpenses;

  // Stress-test: simulated income drop
  const simulatedReducedIncome = totalIncome * (1 - incomeShockPercent / 100);
  const simulatedShockNet = simulatedReducedIncome - totalExpenses - simulatedEmergencyExpense;

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>Forward Intelligence</span>
              <span aria-hidden="true">·</span>
              <span>Predictive Run-Rate & Stress Tests</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Spending Trajectory & Financial Health Monitor
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Simulate cash flow resilience, project end-of-month surpluses, and test unforeseen market scenarios.
            </p>
          </div>

          <button
            onClick={() => onOpenAdvisorWithPrompt('Perform an in-depth financial health check and predictive risk audit for my profile.')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200 self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI Health Audit</span>
          </button>
        </div>

        {/* Projection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          
          {/* Daily Burn & Projection */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Daily Spending Velocity</span>
              <Activity className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-xl font-bold text-slate-900 tabular-nums">
              {currency}{dailyRunRate.toFixed(2)}/day
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Projected end-of-month total outlays: <strong className="text-slate-800 tabular-nums">{currency}{projectedMonthEndExpenses.toFixed(0)}</strong>
            </p>
          </div>

          {/* Projected Month-End Net Surplus */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Projected Month-End Surplus</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className={`text-xl font-bold tabular-nums ${projectedNetSavings >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {projectedNetSavings >= 0 ? '+' : ''}{currency}{projectedNetSavings.toFixed(0)}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {projectedNetSavings >= 0 ? 'On pace to achieve surplus target' : 'Warning: projected to exceed monthly inflow'}
            </p>
          </div>

          {/* Essential Baseline Runway */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Essential Survival Buffer</span>
              <Compass className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl font-bold text-slate-900 tabular-nums">
              {emergencyRunwayMonths.toFixed(1)} Months
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Can sustain {emergencyRunwayMonths.toFixed(1)} months of strictly essential shelter & food
            </p>
          </div>

        </div>

        {/* Stress-Testing Simulator */}
        <div className="mt-6 pt-5 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">
              Interactive Volatility & Emergency Stress-Test
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Sliders */}
            <div className="space-y-4 p-4 bg-white rounded-lg border border-slate-200 text-xs">
              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span>Simulated Income Contraction:</span>
                  <span className="tabular-nums font-bold text-rose-600">-{incomeShockPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={incomeShockPercent}
                  onChange={(e) => setIncomeShockPercent(Number(e.target.value))}
                  className="w-full accent-rose-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span>Unforeseen Urgent Outlay (medical/repair):</span>
                  <span className="tabular-nums font-bold text-rose-600">+{currency}{simulatedEmergencyExpense.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100000"
                  step="5000"
                  value={simulatedEmergencyExpense}
                  onChange={(e) => setSimulatedEmergencyExpense(Number(e.target.value))}
                  className="w-full accent-slate-800"
                />
              </div>
            </div>

            {/* Simulation Outcome */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Simulated Monthly Balance Under Stress
                </span>
                <div className="text-2xl font-bold mt-1 tabular-nums">
                  <span className={simulatedShockNet >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                    {simulatedShockNet >= 0 ? '+' : ''}{currency}{simulatedShockNet.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <p className="text-slate-600 mt-2 leading-relaxed">
                  {simulatedShockNet >= 0
                    ? `Your current financial structure is resilient! Even with a ${incomeShockPercent}% drop in revenue and a surprise ${currency}${simulatedEmergencyExpense.toLocaleString('en-IN')} expense, you still retain a positive surplus.`
                    : `Warning: This scenario would result in a ${currency}${Math.abs(simulatedShockNet).toLocaleString('en-IN', { maximumFractionDigits: 0 })} deficit. The Advisor Bot recommends expanding your liquid Emergency Fund to absorb client invoice volatility.`}
                </p>
              </div>

              <button
                onClick={() => onOpenAdvisorWithPrompt(`How should I protect my finances against a ${incomeShockPercent}% income drop and unexpected ${currency}${simulatedEmergencyExpense.toLocaleString('en-IN')} expense?`)}
                className="mt-3 text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1"
              >
                <span>Ask Advisor for Stress-Defense Strategy</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
