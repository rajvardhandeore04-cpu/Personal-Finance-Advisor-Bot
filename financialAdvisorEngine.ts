import { UserProfile, ExpenseCategory, BudgetLimit, SavingsGoal, Transaction, StructuredAdvice } from '../types/finance';

export interface AdvisorContext {
  profile: UserProfile;
  metrics: {
    totalIncome: number;
    totalExpenses: number;
    netSavings: number;
    savingsRate: number;
  };
  budgets: BudgetLimit[];
  savingsGoals: SavingsGoal[];
  overspentCategories: Array<{ category: ExpenseCategory; spent: number; budget: number }>;
  recentTransactions?: Transaction[];
}

export function generateClientSideFinancialAnalysis(
  userPrompt: string,
  context: AdvisorContext
): { reply: string; structuredAdvice: StructuredAdvice } {
  const { profile, metrics, budgets, overspentCategories } = context;
  const currency = profile?.currency || '$';
  const totalIncome = metrics?.totalIncome || 0;
  const totalExpenses = metrics?.totalExpenses || 0;
  const netSavings = metrics?.netSavings ?? (totalIncome - totalExpenses);
  const savingsRate = metrics?.savingsRate ?? (totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0);
  const lowerPrompt = userPrompt.toLowerCase();

  // Overspending alerts
  const overspendingAlerts = (overspentCategories || []).map((o) => ({
    category: o.category,
    actual: o.spent,
    budget: o.budget,
    overage: o.spent - o.budget,
    advice: `Cap variable spending in ${o.category} at ${currency}${Math.round(o.budget / 4)}/week to stop overages.`,
  }));

  // Contextual savings opportunities based on scenario
  let savingsOpportunities: string[] = [];
  let actionItems: Array<{ id: string; title: string; impact: string; category: string; suggestedCut?: number }> = [];

  if (profile.scenario === 'student') {
    savingsOpportunities = [
      `Batch cook 3 dinners weekly to cut dining & coffee outlays by ~${currency}65/mo.`,
      `Leverage student discount portals for subscriptions, transit passes, and digital course access.`,
      `Direct any part-time lab bonus immediately into your Starter Emergency Buffer.`,
    ];
    actionItems = [
      { id: 'act-s1', title: 'Limit coffee shop takeout to twice per week', impact: 'Saves ~$35/month', category: 'Dining', suggestedCut: 35 },
      { id: 'act-s2', title: 'Automate $25 weekly transfer to Emergency Reserve', impact: 'Guarantees $100 monthly buffer', category: 'Savings' },
      { id: 'act-s3', title: 'Audit course supplies and use university library licenses', impact: 'Lowers textbook costs', category: 'Education' },
    ];
  } else if (profile.scenario === 'freelancer') {
    savingsOpportunities = [
      `Ringfence 25-30% of every invoice into a high-yield Tax Reserve before touching income.`,
      `Consolidate design & cloud tool subscriptions; cancel unused seats to recover ~${currency}45/mo.`,
      `Maintain a strict 6-month baseline survival runway to weather delayed invoice quarters.`,
    ];
    actionItems = [
      { id: 'act-f1', title: 'Transfer 30% of latest client payout to Tax Reserve', impact: 'Eliminates quarterly tax shock', category: 'Tax' },
      { id: 'act-f2', title: 'Lock baseline discretionary spending cap for next 30 days', impact: 'Saves ~$180/month', category: 'Budgeting', suggestedCut: 180 },
      { id: 'act-f3', title: 'Automate $300 monthly deposit to 6-Month Runway Buffer', impact: 'Strengthens stability', category: 'Savings' },
    ];
  } else if (profile.scenario === 'household') {
    savingsOpportunities = [
      `Consolidate grocery shopping via wholesale bulk planning to trim ~${currency}140/mo.`,
      `Audit household utility thermostat schedules and water efficiency to save ~${currency}45/mo.`,
      `Automate direct deposits into the Kids’ 529 College Savings Fund on each corporate payday.`,
    ];
    actionItems = [
      { id: 'act-h1', title: 'Weekly meal planning before bulk grocery supermarket runs', impact: 'Cuts grocery overrun by ~$120', category: 'Groceries', suggestedCut: 120 },
      { id: 'act-h2', title: 'Review streaming family subscriptions and bundle plans', impact: 'Saves ~$30/month', category: 'Utilities' },
      { id: 'act-h3', title: 'Set up automated monthly contribution to Kids 529 Fund', impact: 'Accelerates college target', category: 'Education' },
    ];
  } else {
    // Salaried / Default
    savingsOpportunities = [
      `Shift 15% of dining out meals toward meal prep to recover ~${currency}120–${currency}180 monthly.`,
      `Review recurring digital memberships and cloud tiers to eliminate idle recurring charges.`,
      `Automate payday deposits into your 6-Month Emergency Buffer to lock in your ${savingsRate}% savings target.`,
    ];
    actionItems = [
      { id: 'act-gen-1', title: 'Establish a weekly dining out cap for the remainder of the month', impact: 'Prevents budget overruns', category: 'Dining', suggestedCut: 100 },
      { id: 'act-gen-2', title: 'Automate $200 recurring deposit into your Emergency Fund', impact: 'Locks in savings rate', category: 'Savings' },
      { id: 'act-gen-3', title: 'Audit variable discretionary shopping expenses', impact: 'Saves ~$75/month', category: 'Shopping', suggestedCut: 75 },
    ];
  }

  // Answer tailoring based on user prompt
  let reply = '';
  if (lowerPrompt.includes('overspend') || lowerPrompt.includes('overage') || lowerPrompt.includes('exceed')) {
    if (overspendingAlerts.length > 0) {
      reply = `Here is your overspending audit for **${profile.name}**:\n\nYou currently have **${overspendingAlerts.length} category overruns**:\n${overspendingAlerts.map((a) => `• **${a.category}**: Spent ${currency}${a.actual.toFixed(0)} against a budget limit of ${currency}${a.budget.toLocaleString()} (Over by ${currency}${a.overage.toFixed(0)}).`).join('\n')}\n\n**Actionable Fix:** Trimming discretionary outlays in these areas will immediately restore ${currency}${overspendingAlerts.reduce((acc, a) => acc + a.overage, 0).toFixed(0)} back to your savings buffer.`;
    } else {
      reply = `Great news, ${profile.name}! None of your categories have exceeded their allocated budget limits this month. Your total expenses (${currency}${totalExpenses.toLocaleString()}) are well contained within your income (${currency}${totalIncome.toLocaleString()}), giving you a **${savingsRate}% savings rate**. Keep maintaining this disciplined pace!`;
    }
  } else if (lowerPrompt.includes('budget') || lowerPrompt.includes('50/30/20') || lowerPrompt.includes('suggest')) {
    reply = `Here is an optimized **50/30/20 Budget Plan** for your monthly income of **${currency}${totalIncome.toLocaleString()}**:\n\n• **Needs (50% = ${currency}${(totalIncome * 0.5).toFixed(0)}):** Covers rent/housing, groceries, utilities, and essential transit.\n• **Wants (30% = ${currency}${(totalIncome * 0.3).toFixed(0)}):** Dining out, entertainment, hobbies, and personal shopping.\n• **Savings & Debt (20% = ${currency}${(totalIncome * 0.2).toFixed(0)}):** Emergency buffer, debt payoff, and investments.\n\nYou can apply this framework with 1 click directly in the **Budget Planner** tab!`;
  } else if (lowerPrompt.includes('emergency') || lowerPrompt.includes('buffer') || lowerPrompt.includes('runway')) {
    const liquidBuffer = context.savingsGoals.find((g) => g.name.toLowerCase().includes('emergency'))?.currentAmount || 0;
    const monthlyBurn = totalExpenses > 0 ? totalExpenses : 2000;
    const runway = (liquidBuffer / monthlyBurn).toFixed(1);
    reply = `Your current Emergency Buffer stands at **${currency}${liquidBuffer.toLocaleString()}**, which gives you approximately **${runway} months** of runway against your current monthly burn rate of ${currency}${monthlyBurn.toFixed(0)}.\n\n**Target Recommendation:** Aim for 3–6 months (${currency}${(monthlyBurn * 3).toLocaleString()} – ${currency}${(monthlyBurn * 6).toLocaleString()}). Setting up an automated transfer of ${currency}250–${currency}500 on payday will help you achieve this milestone without feeling the pinch!`;
  } else if (lowerPrompt.includes('tax') || lowerPrompt.includes('freelance')) {
    reply = `For freelance/contract income of **${currency}${totalIncome.toLocaleString()}**, standard financial discipline recommends holding **25%–30% (${currency}${(totalIncome * 0.28).toFixed(0)})** in a dedicated, separate high-yield Tax Reserve account. Never mix tax funds with operating capital to ensure stress-free quarterly filings!`;
  } else {
    reply = `I've analyzed your live financial context for **${profile.name}** (${profile.roleTitle}):\n\n• **Total Inflow:** ${currency}${totalIncome.toLocaleString()}\n• **Total Outflow:** ${currency}${totalExpenses.toLocaleString()}\n• **Net Savings:** ${netSavings >= 0 ? '+' : ''}${currency}${netSavings.toLocaleString()} (${savingsRate}% savings rate)\n\n${
      overspendingAlerts.length > 0
        ? `⚠️ Note: You have exceeded budget caps in ${overspendingAlerts.map((o) => o.category).join(', ')}. Check out the suggested actions below to recapture margin!`
        : `✅ All categories are well contained within budget limits. You have solid financial momentum!`
    }`;
  }

  const structuredAdvice: StructuredAdvice = {
    summary: `Monthly income: ${currency}${totalIncome.toLocaleString()} vs total expenses: ${currency}${totalExpenses.toLocaleString()} (${savingsRate}% savings rate).`,
    overspendingAlerts,
    savingsOpportunities,
    actionItems,
    projectedSavingsNextMonth: Math.max(0, netSavings + 150),
  };

  return { reply, structuredAdvice };
}
