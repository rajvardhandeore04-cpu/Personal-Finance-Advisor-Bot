import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, AdvisorMessage, ExpenseCategory, BudgetLimit, SavingsGoal, Transaction } from '../types/finance';
import { Bot, Send, Sparkles, X, ChevronRight, CheckSquare, Square, AlertCircle, TrendingDown, ArrowRight } from 'lucide-react';
import { generateClientSideFinancialAnalysis } from '../utils/financialAdvisorEngine';

interface AdvisorChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  transactions: Transaction[];
  budgets: BudgetLimit[];
  savingsGoals: SavingsGoal[];
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  overspentCategories: Array<{ category: ExpenseCategory; spent: number; budget: number }>;
}

export const AdvisorChatDrawer: React.FC<AdvisorChatDrawerProps> = ({
  isOpen,
  onClose,
  profile,
  transactions,
  budgets,
  savingsGoals,
  totalIncome,
  totalExpenses,
  netSavings,
  savingsRate,
  overspentCategories,
}) => {
  const [messages, setMessages] = useState<AdvisorMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currency = profile.currency;

  // Initialize or reset chat on scenario change
  useEffect(() => {
    const greeting = getInitialGreeting(profile, totalIncome, totalExpenses, savingsRate, overspentCategories);
    setMessages([greeting]);
  }, [profile.scenario]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  function getInitialGreeting(
    p: UserProfile,
    income: number,
    expenses: number,
    rate: number,
    overruns: Array<{ category: ExpenseCategory; spent: number; budget: number }>
  ): AdvisorMessage {
    const overrunText = overruns.length > 0
      ? ` I notice you've exceeded budget caps in **${overruns.map((o) => o.category).join(', ')}** by ${p.currency}${overruns.reduce((sum, o) => sum + (o.spent - o.budget), 0).toFixed(0)}.`
      : ` Your expenses are currently well balanced within your allocated limits.`;

    let customScenarioTip = '';
    if (p.scenario === 'salaried') {
      customScenarioTip = ' We can focus on dialing in your 50/30/20 balance and accelerating your 6-Month Emergency Buffer.';
    } else if (p.scenario === 'student') {
      customScenarioTip = ' We can look into student discounts, grocery batch cooking, and keeping discretionary dining strictly within your monthly allowance.';
    } else if (p.scenario === 'freelancer') {
      customScenarioTip = ' We should safeguard your 30% quarterly tax reserve and maintain a conservative baseline burn rate for uneven client invoice months.';
    } else if (p.scenario === 'household') {
      customScenarioTip = ' We can optimize shared household utilities, plan bulk grocery purchases, and track your children’s educational funds.';
    }

    return {
      id: 'msg-welcome',
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `Hello ${p.name}! I’m your **Personal Finance Advisor Bot**.${overrunText}${customScenarioTip}\n\nWhat financial questions or adjustments can I help you with today?`,
      structuredAdvice: overruns.length > 0 ? {
        summary: `Current month: ${p.currency}${income.toLocaleString('en-IN')} inflow vs ${p.currency}${expenses.toLocaleString('en-IN')} outflow (${rate}% savings rate).`,
        overspendingAlerts: overruns.map((o) => ({
          category: o.category,
          actual: o.spent,
          budget: o.budget,
          overage: o.spent - o.budget,
          advice: `Trim variable spending in ${o.category} to prevent compounding overruns.`,
        })),
        savingsOpportunities: [
          `Review dining & Swiggy frequency to recover ${p.currency}2,500–${p.currency}4,000 this month.`,
          `Ensure automatic payday SIP transfers to savings before discretionary spending occurs.`,
        ],
        actionItems: [
          {
            id: 'act-audit',
            title: `Cap remaining ${overruns[0]?.category || 'discretionary'} expenditures for the rest of the cycle`,
            impact: 'Restores budget discipline',
            category: 'Budgeting',
            suggestedCut: Math.round(overruns[0]?.spent ? (overruns[0].spent - overruns[0].budget) : 1000),
          },
        ],
        projectedSavingsNextMonth: Math.max(0, income - expenses + 3000),
      } : undefined,
    };
  }

  // Quick suggestions based on active scenario
  const quickPrompts = {
    salaried: [
      'Where am I overspending this month?',
      'How to reach my 6-Month Emergency Buffer faster?',
      'Create a 50/30/20 budget for my ₹95,000 salary',
      'What expenses can I cut to save ₹5,000 more?',
    ],
    student: [
      'How can I stay within my ₹20,000 student allowance?',
      'Tips for reducing canteen and cafe expenses',
      'How to build a ₹15,000 starter emergency fund?',
      'Analyze my essential vs discretionary spending',
    ],
    freelancer: [
      'How much should I set aside for Advance Tax & GST?',
      'Stress test: What if my client payment is delayed 30 days?',
      'Calculate my baseline essential monthly burn rate',
      'How to pace discretionary spending during peak months?',
    ],
    household: [
      'Where can our family cut household expenses?',
      'Audit our D-Mart grocery and electricity bills',
      'How to accelerate our kids’ higher education fund?',
      'Generate a consolidated family monthly budget',
    ],
    custom: [
      'Analyze my monthly spending breakdown',
      'How can I improve my current savings rate?',
      'Suggest realistic category budget limits in Rupees',
    ],
  }[profile.scenario] || [
    'Where am I overspending this month?',
    'How can I improve my savings rate?',
    'Generate an optimized monthly budget',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || inputPrompt;
    if (!messageText.trim() || isGenerating) return;

    const userMessage: AdvisorMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: messageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsGenerating(true);

    try {
      const financialContext = {
        profile,
        metrics: {
          totalIncome,
          totalExpenses,
          netSavings,
          savingsRate,
        },
        budgets,
        savingsGoals,
        overspentCategories,
        recentTransactions: transactions.slice(0, 15),
      };

      const response = await fetch('/api/advisor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          conversationHistory: messages.slice(-5),
          financialContext,
        }),
      });

      const data = await response.json();

      const botMessage: AdvisorMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: data.reply,
        structuredAdvice: data.structuredAdvice,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.warn('Network call failed, utilizing client-side financial engine:', err);
      const fallback = generateClientSideFinancialAnalysis(messageText, {
        profile,
        metrics: { totalIncome, totalExpenses, netSavings, savingsRate },
        budgets,
        savingsGoals,
        overspentCategories,
        recentTransactions: transactions,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-fallback-${Date.now()}`,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: fallback.reply,
          structuredAdvice: fallback.structuredAdvice,
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleActionItem = (actionId: string) => {
    setCompletedActions((prev) => ({
      ...prev,
      [actionId]: !prev[actionId],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-md md:max-w-lg bg-white shadow-2xl border-l border-slate-200 flex flex-col">
      
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight">
              Personal Finance Advisor Bot
            </h2>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              <span>Active Context: {profile.name} ({profile.roleTitle})</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          title="Close advisor drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        
        {/* Context Summary Tag */}
        <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center justify-between">
          <span>Inflow: <strong className="text-slate-900 tabular-nums">{currency}{totalIncome.toLocaleString()}</strong></span>
          <span aria-hidden="true">·</span>
          <span>Outflow: <strong className="text-slate-900 tabular-nums">{currency}{totalExpenses.toFixed(0)}</strong></span>
          <span aria-hidden="true">·</span>
          <span>Rate: <strong className="text-emerald-700 tabular-nums">{savingsRate}%</strong></span>
        </div>

        {/* Conversation Bubbles */}
        {messages.map((msg) => {
          const isBot = msg.sender === 'bot';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
            >
              <div
                className={`max-w-[92%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  isBot
                    ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                    : 'bg-slate-900 text-white rounded-tr-xs'
                }`}
              >
                {/* Message Text with basic markdown rendering */}
                <div className="space-y-2 whitespace-pre-wrap">
                  {msg.text.split('\n\n').map((paragraph, i) => (
                    <p key={i}>
                      {paragraph.split('**').map((chunk, j) =>
                        j % 2 === 1 ? <strong key={j} className="font-semibold">{chunk}</strong> : chunk
                      )}
                    </p>
                  ))}
                </div>

                {/* Structured Advice Card if provided */}
                {isBot && msg.structuredAdvice && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5 text-xs">
                    
                    {/* Overspending Alerts */}
                    {msg.structuredAdvice.overspendingAlerts && msg.structuredAdvice.overspendingAlerts.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="font-semibold text-rose-700 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Overspending Warning Flags:</span>
                        </span>
                        {msg.structuredAdvice.overspendingAlerts.map((alert, idx) => (
                          <div key={idx} className="p-2 bg-rose-50/60 rounded border border-rose-100 text-[11px] text-rose-900">
                            <strong>{alert.category}</strong>: Spent {currency}{alert.actual.toFixed(0)} vs budget {currency}{alert.budget} (Over by {currency}{alert.overage.toFixed(0)}). {alert.advice}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Items Checklist */}
                    {msg.structuredAdvice.actionItems && msg.structuredAdvice.actionItems.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="font-semibold text-slate-800 block text-[11px]">
                          Advisor Action Checklist:
                        </span>
                        {msg.structuredAdvice.actionItems.map((action) => {
                          const isDone = completedActions[action.id];
                          return (
                            <button
                              key={action.id}
                              onClick={() => toggleActionItem(action.id)}
                              className="w-full flex items-start gap-2 p-1.5 rounded hover:bg-slate-50 text-left transition-colors"
                            >
                              {isDone ? (
                                <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                              )}
                              <span className={`text-[11px] ${isDone ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                                {action.title} {action.suggestedCut ? `(Save ~${currency}${action.suggestedCut})` : ''}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Projected Savings */}
                    {msg.structuredAdvice.projectedSavingsNextMonth > 0 && (
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-800 font-medium">
                        <span>Projected Next Month Savings:</span>
                        <span className="font-bold tabular-nums">
                          {currency}{msg.structuredAdvice.projectedSavingsNextMonth.toLocaleString()}
                        </span>
                      </div>
                    )}

                  </div>
                )}
              </div>

              <span className="text-[10px] text-slate-400 mt-1 px-1 tabular-nums">
                {msg.timestamp}
              </span>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isGenerating && (
          <div className="flex items-center gap-2 text-slate-500 text-xs py-2 px-3 bg-white border border-slate-200 rounded-xl w-fit">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
            <span>Personal Finance Advisor is analyzing your numbers...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Carousel */}
      <div className="p-2.5 bg-slate-100/70 border-t border-slate-200 overflow-x-auto whitespace-nowrap space-x-2">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            disabled={isGenerating}
            className="inline-flex items-center text-[11px] px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-full transition-colors font-medium shadow-2xs disabled:opacity-50"
          >
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask about budget, overspending, saving tips..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            disabled={isGenerating}
            className="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isGenerating}
            className="p-2.5 text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 rounded-lg transition-colors shadow-xs"
            title="Send prompt"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
