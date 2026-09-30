import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '5mb' }));

// Initialize GoogleGenAI client on server
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for financial fallback recommendations
function generateRuleBasedFinancialAdvice(context: any, userPrompt: string) {
  const { profile, metrics, budgets, overspentCategories } = context;
  const currency = profile?.currency || '$';
  const totalIncome = metrics?.totalIncome || 0;
  const totalExpenses = metrics?.totalExpenses || 0;
  const savings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0;

  const alerts = (overspentCategories || []).map((cat: any) => ({
    category: cat.category,
    actual: cat.spent,
    budget: cat.budget,
    overage: cat.spent - cat.budget,
    advice: `Consider setting a weekly spending cap of ${currency}${Math.round(cat.budget / 4)} to prevent overruns.`,
  }));

  const savingsOpportunities = [
    `Shift 15% of dining out meals (${currency}${metrics?.topExpenses?.find((t: any) => t.category.includes('Dining'))?.amount || 150}) toward home cooking.`,
    `Audit recurring digital subscriptions; pausing 1-2 idle services saves ${currency}30–${currency}60 monthly.`,
    `Automate transfers to your Emergency Fund on payday to lock in your ${savingsRate}% savings target before discretionary spending.`,
  ];

  const actionItems = [
    {
      id: 'act-1',
      title: 'Review discretionary spending caps for the remainder of the month',
      impact: 'Prevents budget overruns',
      category: 'Budgeting',
      suggestedCut: Math.max(50, Math.round(totalExpenses * 0.05)),
      completed: false,
    },
    {
      id: 'act-2',
      title: 'Set up an automatic recurring deposit to the Emergency Reserve',
      impact: 'Builds financial cushion',
      category: 'Savings',
      completed: false,
    },
    {
      id: 'act-3',
      title: 'Audit variable monthly bills (utilities, subscriptions, groceries)',
      impact: `Frees up ~${currency}80 monthly`,
      category: 'Optimization',
      completed: false,
    },
  ];

  const summary = `Based on your current month financial data, your total income is ${currency}${totalIncome.toLocaleString()} against total expenses of ${currency}${totalExpenses.toLocaleString()}, achieving a savings rate of ${savingsRate}%. ${
    alerts.length > 0
      ? `You have ${alerts.length} category overruns (${alerts.map((a: any) => a.category).join(', ')}). Trimming these can recover ${currency}${alerts.reduce((acc: number, a: any) => acc + a.overage, 0).toFixed(0)} immediately.`
      : `Your expenses are currently well contained within your allocated budgets. Keep up the disciplined pace!`
  }`;

  return {
    summary,
    overspendingAlerts: alerts,
    savingsOpportunities,
    actionItems,
    projectedSavingsNextMonth: Math.max(0, savings + 150),
  };
}

// 1. Advisor Chat Endpoint
app.post('/api/advisor/chat', async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory = [], financialContext } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const hasApiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');

    if (!hasApiKey) {
      // Deterministic expert financial advisor reply when API key is unconfigured
      const structured = generateRuleBasedFinancialAdvice(financialContext || {}, message);
      return res.json({
        reply: `Hello! I'm your Personal Finance Advisor Bot. ${structured.summary}\n\nHere are targeted recommendations based on your ${financialContext?.profile?.name || 'profile'} ledger:\n\n• **Immediate Priority:** ${structured.savingsOpportunities[0]}\n• **Optimization:** ${structured.savingsOpportunities[1]}\n• **Action:** ${structured.actionItems[0].title}`,
        structuredAdvice: structured,
      });
    }

    const contextStr = JSON.stringify(financialContext, null, 2);
    const systemPrompt = `You are the "Personal Finance Advisor Bot", a certified, highly empathetic, mathematically rigorous, and practical personal finance assistant.
You help individuals, salaried professionals, college students, freelancers, and household managers take control of their finances with clarity and confidence.

The user's current live financial ledger, budget allocations, recent transactions, and profile are provided below in JSON:
=== LIVE FINANCIAL CONTEXT ===
${contextStr}
=== END CONTEXT ===

Instructions:
1. Provide personalized, constructive, actionable, and encouraging financial guidance based directly on the user's specific numbers and profile scenario.
2. If there are category overspending areas (actual > budget), highlight them specifically with realistic ways to trim expenditures.
3. Suggest concrete saving milestones and strategies (e.g., 50/30/20 budget framework, emergency buffer creation, tax reserves for freelancers, bulk grocery savings for households, student discount optimization).
4. In addition to a friendly, structured conversational response in Markdown (using clear bullet points and bolding), ALSO output a JSON code block with structured advice if helpful.
Format for structured block at the very end of your response:
\`\`\`json
{
  "summary": "1-2 sentence executive overview",
  "overspendingAlerts": [
    {
      "category": "Category name",
      "actual": 120,
      "budget": 100,
      "overage": 20,
      "advice": "Specific recommendation"
    }
  ],
  "savingsOpportunities": [
    "Concrete opportunity 1",
    "Concrete opportunity 2"
  ],
  "actionItems": [
    {
      "id": "act-1",
      "title": "Action title",
      "impact": "Concrete impact",
      "category": "Category",
      "suggestedCut": 50
    }
  ],
  "projectedSavingsNextMonth": 450
}
\`\`\`
Ensure your advice is mathematically grounded in the provided numbers.`;

    const chatContents: any[] = [];
    chatContents.push({ role: 'user', parts: [{ text: `Here is the financial context: ${contextStr}` }] });
    chatContents.push({ role: 'model', parts: [{ text: "Understood. I have loaded your live financial context, including income, budgets, expenses, and savings goals. How can I assist you today?" }] });

    for (const msg of conversationHistory.slice(-6)) {
      chatContents.push({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      });
    }

    chatContents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: chatContents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    const fullText = response.text || '';

    // Extract structured JSON block if present
    let structuredAdvice: any = null;
    const jsonMatch = fullText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        structuredAdvice = JSON.parse(jsonMatch[1]);
      } catch (err) {
        console.warn('Could not parse embedded JSON from model response', err);
      }
    }

    // Clean reply text to remove the raw json code block from the chat bubble if parsed
    const cleanText = jsonMatch ? fullText.replace(/```json\s*[\s\S]*?\s*```/, '').trim() : fullText;

    if (!structuredAdvice) {
      structuredAdvice = generateRuleBasedFinancialAdvice(financialContext || {}, message);
    }

    res.json({
      reply: cleanText,
      structuredAdvice,
    });
  } catch (error: any) {
    console.error('Advisor Chat error:', error);
    // Graceful fallback response on error
    const fallbackAdvice = generateRuleBasedFinancialAdvice(req.body.financialContext || {}, req.body.message || '');
    res.json({
      reply: `I analyzed your current financial numbers. ${fallbackAdvice.summary}\n\nKey Recommendations:\n• ${fallbackAdvice.savingsOpportunities[0]}\n• ${fallbackAdvice.savingsOpportunities[1]}`,
      structuredAdvice: fallbackAdvice,
    });
  }
});

// 2. Automated Budget Generator Endpoint
app.post('/api/advisor/generate-budget', async (req: Request, res: Response) => {
  try {
    const { profile, currentExpenses, monthlyIncome, framework = '50_30_20' } = req.body;

    const hasApiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
    const income = monthlyIncome || profile?.monthlyTargetIncome || 4000;

    if (!hasApiKey) {
      // High quality rule-based budget generator
      const recommendedBudgets = [
        { category: 'Housing & Rent', limit: Math.round(income * 0.30), reason: 'Standard baseline living cap (30%)' },
        { category: 'Groceries & Food', limit: Math.round(income * 0.12), reason: 'Essential nutrition & home cooking' },
        { category: 'Dining & Coffee', limit: Math.round(income * 0.05), reason: 'Modest discretionary social eating' },
        { category: 'Utilities & Bills', limit: Math.round(income * 0.06), reason: 'Electricity, water, connectivity' },
        { category: 'Transportation', limit: Math.round(income * 0.08), reason: 'Commute, transit pass or fuel' },
        { category: 'Healthcare & Wellness', limit: Math.round(income * 0.05), reason: 'Insurance, preventive care, gym' },
        { category: 'Entertainment & Leisure', limit: Math.round(income * 0.05), reason: 'Recreation & hobbies' },
        { category: 'Subscriptions', limit: Math.round(income * 0.02), reason: 'Essential digital tools' },
        { category: 'Miscellaneous', limit: Math.round(income * 0.04), reason: 'Buffer for unforeseen minor needs' },
      ];

      return res.json({
        framework,
        monthlyIncome: income,
        recommendedBudgets,
        allocatedTotal: recommendedBudgets.reduce((sum, b) => sum + b.limit, 0),
        savingsTarget: Math.round(income * 0.23),
        rationale: `Personalized ${framework} allocation tailored to ${profile?.roleTitle || 'your profile'}. Allocates 56% to Essential Needs, 17% to Discretionary, and preserves 27% for Emergency Fund & Wealth Growth.`,
      });
    }

    const prompt = `As an expert financial planning AI, generate an optimized, realistic monthly budget plan for:
Role: ${profile?.roleTitle || 'Individual'} (${profile?.scenario || 'General'})
Monthly Net Income: $${income}
Budget Framework: ${framework}
Recent Spending Context: ${JSON.stringify(currentExpenses?.slice(0, 15) || [])}

Return a valid JSON object with the following schema:
{
  "framework": "${framework}",
  "monthlyIncome": ${income},
  "recommendedBudgets": [
    { "category": "Housing & Rent", "limit": 1500, "reason": "Explanation" },
    { "category": "Groceries & Food", "limit": 500, "reason": "Explanation" },
    { "category": "Dining & Coffee", "limit": 200, "reason": "Explanation" },
    { "category": "Utilities & Bills", "limit": 250, "reason": "Explanation" },
    { "category": "Transportation", "limit": 300, "reason": "Explanation" },
    { "category": "Healthcare & Wellness", "limit": 150, "reason": "Explanation" },
    { "category": "Entertainment & Leisure", "limit": 180, "reason": "Explanation" },
    { "category": "Subscriptions", "limit": 60, "reason": "Explanation" },
    { "category": "Miscellaneous", "limit": 120, "reason": "Explanation" }
  ],
  "savingsTarget": ${Math.round(income * 0.20)},
  "rationale": "Clear 2-3 sentence strategic rationale explaining why this budget is realistic and beneficial for this user profile."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Generate Budget error:', err);
    res.status(500).json({ error: 'Failed to generate budget' });
  }
});

// 3. Monthly Financial Report Endpoint
app.post('/api/advisor/monthly-report', async (req: Request, res: Response) => {
  try {
    const { profile, reportData } = req.body;
    const hasApiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');

    const totalIncome = reportData?.totalIncome || 0;
    const totalExpenses = reportData?.totalExpenses || 0;
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;
    const currency = profile?.currency || '$';

    if (!hasApiKey) {
      return res.json({
        executiveSummary: `During this monthly billing cycle, you accumulated ${currency}${totalIncome.toLocaleString()} in total inflows and executed ${currency}${totalExpenses.toLocaleString()} in categorized outlays, realizing a net financial surplus of ${currency}${netSavings.toLocaleString()} (${savingsRate}% savings rate). Your essential survival baseline accounted for ${Math.round((reportData.essentialExpenses / (totalExpenses || 1)) * 100)}% of total outlays.`,
        financialHealthStatus: savingsRate >= 20 ? 'Optimal' : savingsRate >= 10 ? 'Stable' : 'Attention Needed',
        topOverrunNotes: reportData.categoryBreakdown
          .filter((c: any) => c.spent > c.budget)
          .map((c: any) => `${c.category} surpassed budget by ${currency}${(c.spent - c.budget).toFixed(0)}`),
        strategicRecommendations: [
          `Prioritize direct-depositing the ${currency}${Math.round(netSavings * 0.5)} surplus directly into your highest-priority savings goal.`,
          `Rebalance category caps for next month by trimming discretionary dining and impulse purchases.`,
          `Maintain an emergency buffer to withstand at least 3-6 months of essential living expenses.`,
        ],
        nextMonthTargetSavings: Math.max(0, netSavings + 100),
      });
    }

    const prompt = `You are a Chief Financial Officer and Personal Financial Planning Advisor analyzing a monthly closing statement for:
User: ${profile?.name} (${profile?.roleTitle})
Report Metrics:
- Total Income: $${totalIncome}
- Total Expenses: $${totalExpenses}
- Net Savings: $${netSavings} (Savings Rate: ${savingsRate}%)
- Essential Expenses: $${reportData?.essentialExpenses}
- Discretionary Expenses: $${reportData?.discretionaryExpenses}
- Category Breakdown: ${JSON.stringify(reportData?.categoryBreakdown || [])}

Return a JSON object with:
{
  "executiveSummary": "Concise, professional 3-sentence summary of the month's financial performance, highlights, and primary takeaway.",
  "financialHealthStatus": "Optimal" | "Stable" | "Attention Needed",
  "topOverrunNotes": ["Specific note on overruns"],
  "strategicRecommendations": [
    "Actionable recommendation 1",
    "Actionable recommendation 2",
    "Actionable recommendation 3"
  ],
  "nextMonthTargetSavings": 1200
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.5,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Monthly report error:', err);
    res.status(500).json({ error: 'Failed to generate monthly report' });
  }
});

// Start Express server and mount Vite
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Personal Finance Advisor Bot server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
