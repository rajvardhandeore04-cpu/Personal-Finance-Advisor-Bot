# Personal Finance Advisor Bot
> AI-Driven Credit Assessment and Personal Financial Health Optimization Platform

[![Python Version](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![Framework](https://img.shields.io/badge/Framework-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![Database](https://img.shields.io/badge/Database-SQLite%20%2F%20SQLAlchemy-red.svg)](https://www.sqlalchemy.org/)
[![AI Integration](https://img.shields.io/badge/AI-Google%20Gemini-orange.svg)](https://ai.google.dev/)

---

## 📌 Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Technical Architecture](#technical-architecture)
- [Tech Stack](#tech-stack)
- [Directory Structure](#directory-structure)
- [Installation & Local Setup](#installation--local-setup)
- [API Reference](#api-reference)
- [Testing & Validation](#testing--validation)
- [Author & Submission Details](#author--submission-details)

---

## Overview
**Personal Finance Advisor Bot** is a full-stack, AI-driven financial platform designed to assist users in understanding, tracking, and optimizing their credit health and cash flow within the Indian personal finance ecosystem.

The system addresses the core challenge of financial literacy and credit score rehabilitation by combining deterministic financial analytics with generative AI advisory services. Users submit verified profile indicators—such as monthly income, living obligations, credit card limits, outstanding balances, loan EMIs, and declared CIBIL scores. The platform calculates key debt ratios locally before injecting verified metrics into Google Gemini AI to produce structured, actionable 5-step financial recovery roadmaps.

---

## Key Features
- **Deterministic Metric Engine:** Backend calculation of Debt-to-Income / FOIR (Fixed Obligation to Income Ratio) and revolving Credit Utilization Ratios using validated mathematical models to avoid AI hallucination.
- **AI-Powered Consultation:** Leverages Google Gemini Pro (`gemini-1.5-flash`) via server-side orchestration to deliver structured recovery roadmaps tailored to Indian banking norms.
- **Persistent Data Layer:** Relational data management using SQLAlchemy ORM and SQLite to maintain user authentication records, profile snapshots, and longitudinal score timelines.
- **Advisory Guardrails:** Strictly structures LLM outputs as educational advice rather than unverified credit bureau score guarantees.
- **Interactive REST APIs:** Fully documented endpoints powered by FastAPI with built-in Pydantic data validation and OpenAPI (Swagger) interface.

---

## Technical Architecture
```
[ User Browser / Client UI ]
            │
            │  HTTPS / JSON Requests
            ▼
┌────────────────────────────────────────────────────────┐
│                   FastAPI Backend                      │
│                                                        │
│  ┌─────────────────────────┐  ┌─────────────────────┐  │
│  │ Pydantic Validation     │  │ Financial Analytics │  │
│  │ (Type & Bounds Check)   │  │ (FOIR, Utilization) │  │
│  └───────────┬─────────────┘  └──────────┬──────────┘  │
│              │                           │             │
│              ▼                           ▼             │
│  ┌─────────────────────────┐  ┌─────────────────────┐  │
│  │ SQLAlchemy 2.0 ORM      │  │ Google Gemini API   │  │
│  │ (Data Persistence)      │  │ (Enriched Prompting)│  │
│  └───────────┬─────────────┘  └──────────┬──────────┘  │
└──────────────┼───────────────────────────┼─────────────┘
               │                           │
               ▼                           ▼
      [ SQLite Database ]          [ Google Gemini AI ]
```

---

## Tech Stack
- **Backend Framework:** FastAPI (Python 3.10+)
- **Server:** Uvicorn
- **Data Validation & Settings:** Pydantic v2
- **ORM & Database:** SQLAlchemy 2.0, SQLite3
- **Generative AI:** Google Generative AI Python SDK (`google-generativeai`)
- **Environment Management:** `python-dotenv`

---

## Directory Structure
```text
Personal-Finance-Advisor-Bot/
│
├── app/
│   ├── __init__.py
│   ├── main.py              # Application entry point & FastAPI routes
│   ├── database.py          # SQLAlchemy engine, session maker & declarative base
│   ├── models.py            # SQLite database table definitions
│   ├── schemas.py           # Pydantic input/output schemas
│   └── services/
│       ├── __init__.py
│       ├── analytics.py     # Deterministic DTI and utilization calculators
│       └── ai_advisor.py    # Google Gemini prompt constructor & client
│
├── docs/
│   └── project_documentation.md  # Detailed project report
│
├── .env.example             # Template for local environment variables
├── requirements.txt         # Pinned application dependencies
├── README.md                # Project README
└── .gitignore               # Ignored environments, cache & databases
```

---

## Installation & Local Setup

### Prerequisites
- Python 3.10 or higher
- Git
- Google Gemini API Key ([Get an API key](https://aistudio.google.com/))

### 1. Clone the Repository
```bash
git clone https://github.com/rajvardhandeore04-cpu/Personal-Finance-Advisor-Bot.git
cd Personal-Finance-Advisor-Bot
```

### 2. Configure Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Create a `.env` file in the project root:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 5. Run the Backend Server
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Access the interactive API documentation (Swagger UI) at:
```text
http://127.0.0.1:8000/docs
```

---

## API Reference

### 1. Financial Profile Assessment
- **Endpoint:** `POST /api/profile/assess`
- **Payload:**
```json
{
  "full_name": "Rajvardhan Deore",
  "monthly_income": 75000,
  "monthly_expenses": 25000,
  "card_limit": 120000,
  "card_outstanding": 85000,
  "monthly_emi": 14000,
  "cibil_score": 640
}
```
- **Response:**
```json
{
  "status": "success",
  "profile_id": 1,
  "metrics": {
    "dti_ratio": 52.0,
    "utilization_ratio": 70.83,
    "cibil_score": 640,
    "utilization_status": "CRITICAL",
    "dti_status": "HIGH"
  }
}
```

### 2. AI Financial Consultation
- **Endpoint:** `POST /api/ai/consultation/{profile_id}`
- **Response:** Generates diagnostic evaluation, bottleneck identification, and a 5-step personalized action plan.

---

## Testing & Validation
All core validation rules and metric calculations have been verified against boundary test suites:
- Input constraints: non-negative numbers, positive income, and CIBIL score bounds ($300 \le \text{Score} \le 900$).
- Division-by-zero checks on zero credit limits or zero income entries.
- Graceful API error handling for missing Gemini credentials or unreachable endpoints.

---

## Author & Submission Details
- **Student Name:** Rajvardhan Nanabhau Deore
- **Roll No:** 32119
- **Repository:** [rajvardhandeore04-cpu/Personal-Finance-Advisor-Bot](https://github.com/rajvardhandeore04-cpu/Personal-Finance-Advisor-Bot)
- **Submission Platform:** Skill Wallet / SmartInternz