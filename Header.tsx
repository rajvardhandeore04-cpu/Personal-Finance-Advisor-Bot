import React from 'react';
import { ScenarioType } from '../types/finance';
import { Bot, Plus, FileText, Sparkles, Download } from 'lucide-react';

interface HeaderProps {
  currentScenario: ScenarioType;
  onSelectScenario: (scenario: ScenarioType) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAddModal: () => void;
  onOpenReportModal: () => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
  currency: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentScenario,
  onSelectScenario,
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenReportModal,
  onToggleChat,
  isChatOpen,
  currency,
}) => {
  const scenarios: { id: ScenarioType; label: string; badge: string }[] = [
    { id: 'salaried', label: 'Salaried Pro', badge: 'Rahul' },
    { id: 'student', label: 'College Student', badge: 'Ananya' },
    { id: 'freelancer', label: 'Freelancer', badge: 'Vikram' },
    { id: 'household', label: 'Household Manager', badge: 'Kulkarni Family' },
  ];

  const navLinks = [
    { id: 'overview', label: 'Dashboard' },
    { id: 'budget', label: 'Budget Planner' },
    { id: 'ledger', label: 'Ledger' },
    { id: 'savings', label: 'Savings Goals' },
    { id: 'advisor', label: 'AI Advisor' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Bar Contract: 3 zones */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Single element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <a href="/" className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
              Finance Advisor Bot
            </a>
          </div>

          {/* Zone 2: 4-6 clean text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`py-1 transition-colors whitespace-nowrap ${
                  activeTab === link.id
                    ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                    : 'hover:text-slate-900 border-b-2 border-transparent'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-2">
            <a
              href="/api/download-project"
              download="personal-finance-advisor-bot.tar.gz"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
              title="Download project code archive (.tar.gz) for local run & GitHub"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Code</span>
            </a>

            <button
              onClick={onOpenReportModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
              title="Generate Monthly Financial Report"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Monthly Report</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Entry</span>
            </button>

            <button
              onClick={onToggleChat}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap border ${
                isChatOpen
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">AI Assistant</span>
            </button>
          </div>
        </div>

        {/* Secondary Sub-Bar: Clean Scenario Switcher for the 4 core requested scenarios */}
        <div className="py-2 border-t border-slate-100 flex items-center justify-between overflow-x-auto gap-4 text-xs">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-slate-400 font-medium">Scenario Mode:</span>
            <div className="inline-flex p-0.5 bg-slate-100 rounded-lg">
              {scenarios.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onSelectScenario(s.id)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all whitespace-nowrap ${
                    currentScenario === s.id
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {s.label} ({s.badge})
                </button>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-slate-500 shrink-0">
            <span>Currency: <strong>{currency} (INR)</strong></span>
            <span aria-hidden="true">·</span>
            <span>Real-time AI Planning Engine</span>
          </div>
        </div>
      </div>
    </header>
  );
};
