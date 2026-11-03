import React from 'react';
import { ArrowUpRight, ArrowDownRight, PiggyBank, ShieldCheck, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types/finance';

interface OverviewCardsProps {
  profile: UserProfile;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  essentialExpenses: number;
  discretionaryExpenses: number;
  emergencyRunwayMonths: number;
  overspentCount: number;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({
  profile,
  totalIncome,
  totalExpenses,
  netSavings,
  savingsRate,
  essentialExpenses,
  discretionaryExpenses,
  emergencyRunwayMonths,
  overspentCount,
}) => {
  const currency = profile.currency;

  // 50/30/20 benchmark calculation
  const needsPercent = totalIncome > 0 ? Math.round((essentialExpenses / totalIncome) * 100) : 0;
  const wantsPercent = totalIncome > 0 ? Math.round((discretionaryExpenses / totalIncome) * 100) : 0;
  const actualSavingsPercent = Math.max(0, savingsRate);

  return (
    <div className="space-y-4">
      {/* Persona Context Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Scenario Active</span>
            <span aria-hidden="true">·</span>
            <span className="font-medium text-slate-700">{profile.roleTitle}</span>
            <span aria-hidden="true">·</span>
            <span>Target Monthly Inflow: {currency}{profile.monthlyTargetIncome.toLocaleString()}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {profile.name}’s Financial Overview
          </h1>
          <p className="text-sm text-slate-600 mt-0.5 max-w-3xl">
            {profile.description}
          </p>
        </div>

        {overspentCount > 0 ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg shrink-0 text-amber-800 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>{overspentCount} category {overspentCount === 1 ? 'limit' : 'limits'}</strong> exceeded this month
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg shrink-0 text-emerald-800 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>All categories currently within planned budget caps</span>
          </div>
        )}
      </div>

      {/* 4 Core Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Inflow */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Inflow (Income)
            </span>
            <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {currency}{totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Target: {currency}{profile.monthlyTargetIncome.toLocaleString()} · {totalIncome >= profile.monthlyTargetIncome ? 'Target Achieved' : `${currency}${(profile.monthlyTargetIncome - totalIncome).toFixed(0)} to target`}
          </div>
        </div>

        {/* Total Outflow */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Outflow (Expenses)
            </span>
            <div className="w-7 h-7 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {currency}{totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {currency}{essentialExpenses.toFixed(0)} Needs · {currency}{discretionaryExpenses.toFixed(0)} Discretionary
          </div>
        </div>

        {/* Net Monthly Savings */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Net Savings & Rate
            </span>
            <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-2xl font-bold tabular-nums ${netSavings >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {netSavings >= 0 ? '+' : ''}{currency}{netSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-semibold tabular-nums px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
              {savingsRate}%
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Goal Target: {profile.savingsTargetPercent}% · {savingsRate >= profile.savingsTargetPercent ? 'On Target' : 'Below Target'}
          </div>
        </div>

        {/* Financial Runway / Buffer */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Emergency Runway
            </span>
            <div className="w-7 h-7 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {emergencyRunwayMonths.toFixed(1)}
            </span>
            <span className="text-sm font-medium text-slate-500">months</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Based on {currency}{essentialExpenses.toFixed(0)} essential monthly burn
          </div>
        </div>

      </div>

      {/* 50/30/20 Rule Balance Gauge */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              50/30/20 Budget Framework Distribution
            </h2>
            <p className="text-xs text-slate-500">
              Optimal benchmark: 50% Essential Needs, 30% Discretionary Wants, 20% Savings & Debt Cushion
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium tabular-nums">
            <span className="flex items-center gap-1.5 text-blue-700">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Needs: {needsPercent}%
            </span>
            <span className="flex items-center gap-1.5 text-amber-700">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Wants: {wantsPercent}%
            </span>
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Savings: {actualSavingsPercent}%
            </span>
          </div>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
          <div
            className="bg-blue-500 transition-all duration-500"
            style={{ width: `${Math.min(100, needsPercent)}%` }}
            title={`Needs: ${needsPercent}%`}
          />
          <div
            className="bg-amber-500 transition-all duration-500"
            style={{ width: `${Math.min(100 - needsPercent, wantsPercent)}%` }}
            title={`Wants: ${wantsPercent}%`}
          />
          <div
            className="bg-emerald-500 transition-all duration-500"
            style={{ width: `${Math.min(100 - needsPercent - wantsPercent, actualSavingsPercent)}%` }}
            title={`Savings: ${actualSavingsPercent}%`}
          />
        </div>
      </div>
    </div>
  );
};
