/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { SCENARIOS } from './data/defaultScenarios';
import { ScenarioType, Transaction, BudgetLimit, SavingsGoal, ExpenseCategory } from './types/finance';
import { Header } from './components/Header';
import { OverviewCards } from './components/OverviewCards';
import { BudgetPlanner } from './components/BudgetPlanner';
import { TransactionLedger } from './components/TransactionLedger';
import { SavingsGoals } from './components/SavingsGoals';
import { MonthlyReportModal } from './components/MonthlyReportModal';
import { AdvisorChatDrawer } from './components/AdvisorChatDrawer';
import { AddTransactionModal } from './components/AddTransactionModal';
import { PredictiveAnalytics } from './components/PredictiveAnalytics';
import { Bot, Sparkles, Plus, FileText, ArrowRight, ShieldCheck } from 'lucide-react';

export default function App() {
  const [currentScenario, setCurrentScenario] = useState<ScenarioType>('salaried');
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Live Scenario Data State
  const [profile, setProfile] = useState(SCENARIOS.salaried.profile);
  const [transactions, setTransactions] = useState<Transaction[]>(SCENARIOS.salaried.transactions);
  const [budgets, setBudgets] = useState<BudgetLimit[]>(SCENARIOS.salaried.budgets);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(SCENARIOS.salaried.savingsGoals);

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Switch Scenario handler
  const handleSelectScenario = (scenario: ScenarioType) => {
    setCurrentScenario(scenario);
    const data = SCENARIOS[scenario];
    setProfile(data.profile);
    setTransactions(data.transactions);
    setBudgets(data.budgets);
    setSavingsGoals(data.savingsGoals);
  };

  // Metrics Calculations
  const {
    totalIncome,
    totalExpenses,
    netSavings,
    savingsRate,
    essentialExpenses,
    discretionaryExpenses,
    categorySpends,
    overspentCategories,
    emergencyRunwayMonths,
  } = useMemo(() => {
    let income = 0;
    let expenses = 0;
    let essential = 0;
    let discretionary = 0;

    const spendMap: Record<string, number> = {};

    transactions.forEach((t) => {
      if (t.type === 'income') {
        income += t.amount;
      } else {
        expenses += t.amount;
        if (t.isEssential) {
          essential += t.amount;
        } else {
          discretionary += t.amount;
        }
        spendMap[t.category] = (spendMap[t.category] || 0) + t.amount;
      }
    });

    const net = income - expenses;
    const rate = income > 0 ? Math.round((net / income) * 100) : 0;

    // Category spend vs budget
    const catSpends = budgets.map((b) => {
      const spent = spendMap[b.category] || 0;
      const percent = b.limit > 0 ? Math.round((spent / b.limit) * 100) : 0;
      return {
        category: b.category,
        spent,
        budget: b.limit,
        percent,
      };
    });

    // Also include any categories spent that didn't have an explicit budget entry
    Object.keys(spendMap).forEach((cat) => {
      if (!budgets.some((b) => b.category === cat)) {
        catSpends.push({
          category: cat as ExpenseCategory,
          spent: spendMap[cat],
          budget: Math.round(spendMap[cat] * 1.1),
          percent: 90,
        });
      }
    });

    const overspent = catSpends.filter((c) => c.spent > c.budget);

    // Calculate emergency fund runway
    const liquidBuffer = savingsGoals
      .filter((g) => g.category === 'Emergency Fund' || g.name.toLowerCase().includes('emergency') || g.name.toLowerCase().includes('buffer'))
      .reduce((sum, g) => sum + g.currentAmount, 0);

    const runway = essential > 0 ? liquidBuffer / essential : 0;

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netSavings: net,
      savingsRate: rate,
      essentialExpenses: essential,
      discretionaryExpenses: discretionary,
      categorySpends: catSpends,
      overspentCategories: overspent,
      emergencyRunwayMonths: runway,
    };
  }, [transactions, budgets, savingsGoals]);

  // CRUD Handlers
  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const tx: Transaction = {
      ...newTx,
      id: `tx-${Date.now()}`,
    };
    setTransactions((prev) => [tx, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUpdateBudget = (category: ExpenseCategory, newLimit: number) => {
    setBudgets((prev) =>
      prev.map((b) => (b.category === category ? { ...b, limit: newLimit } : b))
    );
  };

  const handleApplyNewBudgets = (newBudgets: BudgetLimit[]) => {
    setBudgets(newBudgets);
  };

  const handleUpdateGoalProgress = (goalId: string, addedAmount: number) => {
    setSavingsGoals((prev) =>
      prev.map((g) =>
        g.id === goalId ? { ...g, currentAmount: g.currentAmount + addedAmount } : g
      )
    );
  };

  const handleAddNewGoal = (newGoal: Omit<SavingsGoal, 'id'>) => {
    const goal: SavingsGoal = {
      ...newGoal,
      id: `sg-${Date.now()}`,
    };
    setSavingsGoals((prev) => [...prev, goal]);
  };

  const handleOpenAdvisorWithPrompt = (_promptText: string) => {
    setIsChatOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      
      {/* Universal Top Bar */}
      <Header
        currentScenario={currentScenario}
        onSelectScenario={handleSelectScenario}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        isChatOpen={isChatOpen}
        currency={profile.currency}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Render Tab Views */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <OverviewCards
              profile={profile}
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
              netSavings={netSavings}
              savingsRate={savingsRate}
              essentialExpenses={essentialExpenses}
              discretionaryExpenses={discretionaryExpenses}
              emergencyRunwayMonths={emergencyRunwayMonths}
              overspentCount={overspentCategories.length}
            />

            {/* Quick Actions & AI Advisor Prompt Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-5 sm:p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <Bot className="w-4 h-4" />
                  <span>Personal Finance Advisor Bot Ready</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold">
                  {overspentCategories.length > 0
                    ? `Overrun Alert: ${overspentCategories.length} category caps exceeded this month`
                    : `Your finances are in surplus! Savings rate is ${savingsRate}%`}
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl">
                  Ask the Advisor Bot to rebalance category limits, build an emergency buffer, or plan your next month cash flow.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
                >
                  <FileText className="w-3.5 h-3.5 inline mr-1.5" />
                  Monthly Report
                </button>
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="px-4 py-2 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 inline mr-1.5" />
                  Ask Advisor Bot
                </button>
              </div>
            </div>

            {/* Dual Grid: Recent Transactions Preview + Category Budget Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Category Spend Snapshot */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Budget Caps vs Actual Spending
                    </h3>
                    <p className="text-xs text-slate-500">
                      Real-time category status based on logged transactions
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('budget')}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
                  >
                    <span>Manage All Budgets</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-3">
                  {categorySpends.slice(0, 5).map((cat) => {
                    const isOver = cat.spent > cat.budget;
                    return (
                      <div key={cat.category} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-800 truncate">{cat.category}</span>
                          <span className="tabular-nums text-slate-600">
                            <strong>{profile.currency}{cat.spent.toFixed(0)}</strong> / {profile.currency}{cat.budget.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isOver ? 'bg-rose-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(100, cat.percent)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Savings Goals Snapshot */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900">
                      Active Savings Goals
                    </h3>
                    <button
                      onClick={() => setActiveTab('savings')}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
                    >
                      <span>View All</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="space-y-3.5">
                    {savingsGoals.slice(0, 3).map((goal) => {
                      const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                      return (
                        <div key={goal.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                          <div className="flex items-center justify-between font-semibold text-slate-900">
                            <span className="truncate">{goal.name}</span>
                            <span className="tabular-nums text-emerald-700">{pct}%</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-500 text-[11px] mt-1 tabular-nums">
                            <span>{profile.currency}{goal.currentAmount.toLocaleString()} saved</span>
                            <span>Target: {profile.currency}{goal.targetAmount.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1.5 overflow-hidden">
                            <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                  <span>Runway Buffer: <strong>{emergencyRunwayMonths.toFixed(1)} mo</strong></span>
                  <button
                    onClick={() => setActiveTab('savings')}
                    className="font-semibold text-slate-800 hover:text-slate-900"
                  >
                    + Add Goal
                  </button>
                </div>
              </div>

            </div>

            {/* Predictive Spending Analytics */}
            <PredictiveAnalytics
              profile={profile}
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
              netSavings={netSavings}
              essentialExpenses={essentialExpenses}
              emergencyRunwayMonths={emergencyRunwayMonths}
              onOpenAdvisorWithPrompt={handleOpenAdvisorWithPrompt}
            />
          </div>
        )}

        {activeTab === 'budget' && (
          <BudgetPlanner
            budgets={budgets}
            categorySpends={categorySpends}
            profile={profile}
            monthlyIncome={totalIncome || profile.monthlyTargetIncome}
            onUpdateBudget={handleUpdateBudget}
            onApplyNewBudgets={handleApplyNewBudgets}
            onAskAdvisorAboutCategory={(category) => {
              setIsChatOpen(true);
            }}
          />
        )}

        {activeTab === 'ledger' && (
          <TransactionLedger
            transactions={transactions}
            profile={profile}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}

        {activeTab === 'savings' && (
          <SavingsGoals
            goals={savingsGoals}
            profile={profile}
            netSavings={netSavings}
            onUpdateGoalProgress={handleUpdateGoalProgress}
            onAddNewGoal={handleAddNewGoal}
          />
        )}

        {activeTab === 'advisor' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 min-h-[600px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Personal Finance Advisor Bot
                  </h2>
                  <p className="text-xs text-slate-500">
                    AI-powered financial planning engine analyzing {profile.name}’s live income, budgets, and savings
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
                The Personal Finance Advisor Bot delivers real-time scenario evaluations, overspending remediation, 50/30/20 category optimization, and long-term emergency buffer planning.
              </p>

              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                <span className="text-xs font-bold text-emerald-800 block">
                  Quick Advisor Shortcuts for {profile.roleTitle}:
                </span>
                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="px-3 py-1.5 bg-white text-slate-800 border border-emerald-200 rounded-lg hover:bg-emerald-50 font-medium"
                  >
                    🔍 Where am I overspending this month?
                  </button>
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="px-3 py-1.5 bg-white text-slate-800 border border-emerald-200 rounded-lg hover:bg-emerald-50 font-medium"
                  >
                    📊 Suggest an optimized budget for {profile.currency}{totalIncome.toLocaleString()}
                  </button>
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="px-3 py-1.5 bg-white text-slate-800 border border-emerald-200 rounded-lg hover:bg-emerald-50 font-medium"
                  >
                    🛡️ How to expand my emergency fund runway?
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Server-side Gemini 3.8 Flash model · Zero client-side API exposure
              </span>
              <button
                onClick={() => setIsChatOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Open Conversational Assistant Drawer</span>
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Floating Action Button for AI Advisor Bot on Mobile/Desktop */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-xl border border-slate-700 transition-all hover:scale-105"
          title="Open Personal Finance Advisor Bot"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <Bot className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold pr-1">Ask Advisor</span>
        </button>
      )}

      {/* Modals & Slide-overs */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTransaction}
        profile={profile}
      />

      <MonthlyReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        profile={profile}
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        netSavings={netSavings}
        savingsRate={savingsRate}
        essentialExpenses={essentialExpenses}
        discretionaryExpenses={discretionaryExpenses}
        categorySpends={categorySpends}
      />

      <AdvisorChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        profile={profile}
        transactions={transactions}
        budgets={budgets}
        savingsGoals={savingsGoals}
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        netSavings={netSavings}
        savingsRate={savingsRate}
        overspentCategories={overspentCategories}
      />

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-slate-200 bg-white text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span>Personal Finance Advisor Bot</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>Intelligent Budgeting & Wealth Accumulation</span>
          </div>
          <div>
            <span>Simulated with Gemini 3.8 Flash AI Engine</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
