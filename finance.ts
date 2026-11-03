export type ScenarioType = 'salaried' | 'student' | 'freelancer' | 'household' | 'custom';

export type TransactionType = 'income' | 'expense';

export type ExpenseCategory =
  | 'Housing & Rent'
  | 'Groceries & Food'
  | 'Dining & Coffee'
  | 'Utilities & Bills'
  | 'Transportation'
  | 'Entertainment & Leisure'
  | 'Healthcare & Wellness'
  | 'Education & Books'
  | 'Work & Equipment'
  | 'Shopping & Personal'
  | 'Subscriptions'
  | 'Debt & Loans'
  | 'Miscellaneous';

export type IncomeCategory =
  | 'Salary & Wages'
  | 'Freelance & Contract'
  | 'Allowance & Support'
  | 'Investment & Dividends'
  | 'Side Gig'
  | 'Bonus & Commissions'
  | 'Other Income';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  category: ExpenseCategory | IncomeCategory;
  description: string;
  amount: number;
  isEssential: boolean;
  paymentMethod?: 'Card' | 'Bank Transfer' | 'Cash' | 'Digital Wallet';
  notes?: string;
}

export interface BudgetLimit {
  category: ExpenseCategory;
  limit: number;
  period: 'monthly';
  color: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM
  category: 'Emergency Fund' | 'Vacation' | 'Debt Payoff' | 'Education' | 'Major Purchase' | 'Retirement';
  monthlyContribution: number;
  notes?: string;
}

export interface UserProfile {
  name: string;
  scenario: ScenarioType;
  roleTitle: string;
  description: string;
  currency: string;
  monthlyTargetIncome: number;
  riskTolerance: 'conservative' | 'balanced' | 'growth';
  savingsTargetPercent: number;
  notes: string;
}

export interface ActionItem {
  id: string;
  title: string;
  impact: string;
  category?: string;
  suggestedCut?: number;
  completed?: boolean;
}

export interface StructuredAdvice {
  summary: string;
  overspendingAlerts: Array<{
    category: string;
    actual: number;
    budget: number;
    overage: number;
    advice: string;
  }>;
  savingsOpportunities: string[];
  actionItems: ActionItem[];
  projectedSavingsNextMonth: number;
}

export interface AdvisorMessage {
  id: string;
  sender: 'user' | 'bot';
  timestamp: string;
  text: string;
  structuredAdvice?: StructuredAdvice;
  isGenerating?: boolean;
}

export interface MonthlyReportData {
  monthName: string;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  essentialExpenses: number;
  discretionaryExpenses: number;
  categoryBreakdown: Array<{
    category: ExpenseCategory;
    spent: number;
    budget: number;
    percentOfBudget: number;
    percentOfTotalExpenses: number;
  }>;
  aiExecutiveSummary?: string;
  strategicRecommendations?: string[];
}
