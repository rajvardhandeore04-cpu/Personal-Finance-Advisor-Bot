# Personal Finance Advisor Bot

> An AI-powered personal finance assistant: track income and expenses, plan budgets, set savings goals, stress-test your month and chat with a Gemini-based advisor. Works with a built-in rule-based fallback when no AI key is available.

Built for the BFSI course (Skill Wallet / SmartInternz) using Google AI Studio.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Demo Scenarios](#demo-scenarios)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup and Run](#setup-and-run)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Reference](#api-reference)
- [How the Fallback Works](#how-the-fallback-works)
- [Limitations](#limitations)
- [Documentation](#documentation)
- [Author](#author)

---

## Overview

Personal Finance Advisor Bot helps a user understand where their money goes and plan better. The React front end calculates income, expenses, savings rate, budget usage and emergency-fund runway from the user's transactions. When the user asks the advisor a question, requests an AI budget or opens a monthly report, the front end sends the relevant figures to the Express server, which prompts Google Gemini and returns structured results.

The Gemini API key stays on the server. If the key is missing or an AI call fails, the app still responds using rule-based logic, so it never shows an empty screen.

> The advice is educational and is not a substitute for a licensed financial advisor.

## Features

- **Dashboard:** total inflow, total outflow, net savings, savings rate, emergency runway, 50/30/20 distribution bar, recent transactions and budget progress.
- **Budget Planner:** per-category monthly limits with progress bars, plus an AI budget generator that proposes new limits for you to review.
- **Ledger:** income and expense tracker with search and filters (type, category, essential vs discretionary) and CSV export.
- **Add Transaction:** modal to log income or an expense with amount, date, description, category, payment method and an essential toggle.
- **Savings Goals:** goal cards with progress, deadlines and monthly contributions, deposit and add-goal dialogs.
- **AI Advisor (chat drawer):** conversational advisor with scenario-based quick prompts. Replies include structured cards for overspending alerts, action items and projected savings.
- **Monthly Report:** printable statement with an AI executive summary, key figures, category breakdown, overrun flags and recommendations.
- **Predictive Analytics:** daily run-rate projection of month-end spending and a stress-test simulator (income drop plus an emergency expense).
- **Scenarios:** switch between four ready-made personas (and a custom one) to see the app with different data.
- **Two fallbacks:** the server uses rule-based replies if the key is missing or the AI fails, and the front end uses its own analysis engine if the server cannot be reached.

## Demo Scenarios

The sample data is fictional and uses Indian Rupees (₹).

| Scenario | Persona | Monthly target income |
|---|---|---|
| Salaried professional | Rahul Sharma, software engineer, Bengaluru | ₹95,000 |
| College student | Ananya Iyer, engineering student and tutor, Pune | ₹20,000 |
| Freelancer | Vikram Malhotra, UI/UX consultant, Mumbai | ₹1,50,000 |
| Household managers | Rajesh and Sunita Kulkarni | ₹2,10,000 |
| Custom | Custom User | ₹80,000 |

## Architecture

```
[ Browser: React 19 + Tailwind CSS v4 (Vite) ]
        |  state: profile, transactions, budgets, savings goals
        |  JSON over HTTP (/api/advisor/*)
        v
[ Express server (server.ts) ]
   |-- request checks
   |-- rule-based advice (fallback)
   |-- Gemini client (@google/genai) ----> [ Google Gemini API ]
   '-- Vite middleware (dev) / static dist (production)
```

One Node process serves both the API and the front end. All figures shown in the UI are calculated in the browser from the current transactions; the server only builds prompts and returns advice.

## Tech Stack

| Layer | Technology |
|---|---|
| Front end | React 19, TypeScript, Tailwind CSS v4, Vite, lucide-react, motion |
| Server | Node.js, Express, TypeScript (run with `tsx`) |
| AI | Google Gemini via `@google/genai` |
| Config | `dotenv` |

## Project Structure

```
Personal-Finance-Advisor-Bot/
├── server.ts                    # Express server, Gemini calls, API routes
├── index.html                   # Front-end entry page
├── vite.config.ts               # Vite + Tailwind CSS v4 setup
├── tsconfig.json
├── package.json
├── bun.lock
├── metadata.json                # AI Studio applet metadata
├── .env.example                 # Template for environment variables
└── src/
    ├── main.tsx                 # React root
    ├── index.css                # Tailwind imports and print styles
    ├── App.tsx                  # App state, metric calculations, tab routing
    ├── types/finance.ts         # Data models (transactions, budgets, goals, reports)
    ├── data/defaultScenarios.ts # Sample data for the demo scenarios
    ├── utils/financialAdvisorEngine.ts  # Front-end rule-based advice engine
    └── components/
        ├── Header.tsx               # Top bar, navigation and scenario switcher
        ├── OverviewCards.tsx        # Dashboard metric cards
        ├── BudgetPlanner.tsx        # Category limits and AI budget generator
        ├── TransactionLedger.tsx    # Ledger, filters, CSV export
        ├── AddTransactionModal.tsx  # Log income or expense
        ├── SavingsGoals.tsx         # Savings goals and deposits
        ├── AdvisorChatDrawer.tsx    # AI advisor chat
        ├── MonthlyReportModal.tsx   # Printable monthly report
        └── PredictiveAnalytics.tsx  # Run-rate projection and stress test
```

## Setup and Run

### Prerequisites

- Node.js 18 or newer (Node 20+ recommended)
- A Google Gemini API key from [Google AI Studio](https://aistudio.google.com/) (optional: the app works without one)

### Steps

```bash
# 1. Clone
git clone https://github.com/rajvardhandeore04-cpu/Personal-Finance-Advisor-Bot.git
cd Personal-Finance-Advisor-Bot

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env        # Windows: copy .env.example .env
# edit .env and set GEMINI_API_KEY

# 4. Start the development server (Express + Vite)
npm run dev
```

Open `http://localhost:3000`.

For production: run `npm run build`, then start the server with `NODE_ENV=production npm start`. The server then serves the built `dist/` folder.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | No (recommended) | Gemini API key. If missing, or left as the placeholder `MY_GEMINI_API_KEY`, the server uses rule-based replies. |
| `PORT` | No | Server port. Default `3000`. |
| `NODE_ENV` | No | Set to `production` to serve the built `dist/` folder. |
| `APP_URL` | No | Hosting URL placeholder used by AI Studio deployments. |

Never commit your real `.env` file.

## Available Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the Express server with Vite middleware on port 3000 |
| `npm run build` | Builds the front end with Vite into `dist/` |
| `npm start` | Starts the server (use with `NODE_ENV=production` after a build) |
| `npm run lint` | Type-checks the project with `tsc --noEmit` |
| `npm run clean` | Removes build output |

## API Reference

All endpoints accept and return JSON.

### `POST /api/advisor/chat`

Request body: `message` (required), `conversationHistory` (the last 6 messages are used), `financialContext` (`profile`, `metrics` with totalIncome, totalExpenses, netSavings and savingsRate, `budgets`, `savingsGoals`, `overspentCategories`, `recentTransactions`).

Response:

```json
{
  "reply": "Markdown text from the advisor",
  "structuredAdvice": {
    "summary": "...",
    "overspendingAlerts": [],
    "savingsOpportunities": [],
    "actionItems": [],
    "projectedSavingsNextMonth": 0
  }
}
```

A missing `message` returns `400`.

### `POST /api/advisor/generate-budget`

Request body: `profile`, `currentExpenses`, `monthlyIncome`, `framework` (default `50_30_20`).

Response: `framework`, `monthlyIncome`, `recommendedBudgets` (category, limit, reason), `savingsTarget`, `rationale`. Returns `500` if the AI call fails.

### `POST /api/advisor/monthly-report`

Request body: `profile` and `reportData` (totals, essential and discretionary expenses, category breakdown).

Response: `executiveSummary`, `financialHealthStatus` (`Optimal`, `Stable` or `Attention Needed`), `topOverrunNotes`, `strategicRecommendations`, `nextMonthTargetSavings`. Returns `500` if the AI call fails.

### `GET /api/download-project`

Returns the project archive `personal-finance-advisor-bot.tar.gz` if it is present on the server, otherwise `404`. This route was added by AI Studio and is not needed for the app to work.

## How the Fallback Works

- **Server side:** if `GEMINI_API_KEY` is missing, or the chat AI call throws an error, the server calculates the savings rate and overspending categories and returns rule-based advice. The budget generator then uses fixed percentages of income per category.
- **Front end:** if the chat request to the server fails, `financialAdvisorEngine.ts` produces a reply and structured advice from the user's data, tailored to the active scenario and the keywords in the question.

## Limitations

- No database or login: all data lives in React state and resets when the page is refreshed.
- Predictive analytics assumes 28 of 30 days of the month have elapsed (fixed values), so the projection is illustrative.
- The rule-based advice uses fixed percentages and generic tips; some tips contain fixed dollar amounts.
- The server's fallback budget text describes a 56/17/27 split that does not exactly match its category percentages.
- AI output can be inaccurate and should be reviewed by the user.
- No automated tests are included yet.

## Documentation

The full project report (scenarios, architecture, workflow, testing and outcome) is in [`docs/`](docs/).

## License

Apache-2.0

## Author

- **Name:** Rajvardhan Nanabhau Deore
- **Roll No:** 32119
- **Platform:** Skill Wallet / SmartInternz (BFSI course)
- **Repository:** https://github.com/rajvardhandeore04-cpu/Personal-Finance-Advisor-Bot
