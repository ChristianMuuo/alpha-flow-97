# AlphaFlow 97 - S-Tier Quantitative Trading & Multi-Agent Intelligence Platform

[![CI Pipeline](https://github.com/ChristianMuuo/alpha-flow-97/actions/workflows/ci.yml/badge.svg)](https://github.com/ChristianMuuo/alpha-flow-97/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Vitest](https://img.shields.io/badge/Vitest-Unit%20%26%20Evals-green.svg)](https://vitest.dev/)
[![MetaTrader 5](https://img.shields.io/badge/MT5-Authenticated%20Bridge-orange.svg)](https://www.metatrader5.com/)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg)](#)

AlphaFlow 97 is an institutional-grade algorithmic trading intelligence and education platform designed for retail prop traders and quantitative funds. It fuses a serverless 9-agent consensus swarm, empirical statistical machine learning, real-time microstructure orderflow analysis, and an authenticated MetaTrader 5 Expert Advisor execution bridge.

---

## 🌟 Key Features & Capabilities

- **10-Agent Swarm War Room:** Collaborative multi-agent debate graph featuring independent Risk Manager veto authority, adversarial stress-testing, and human-in-the-loop execution controls.
- **Statistical ML Feature Store (`/ml`):** Python-engineered point-in-time features with automated zero-lookahead leakage tests.
- **Empirical Market Regime Detection:** 4-state Gaussian Mixture Model (GMM) with posterior probabilities replacing arbitrary time-of-day heuristics.
- **Calibrated Directional Alpha & SHAP Attributions:** Isotonic-calibrated win probability model with local explainability waterfalls.
- **GARCH(1,1) Volatility & Dynamic Kelly Sizing:** Conditional variance forecaster driving fractional Kelly risk parameters.
- **Monte Carlo 10,000-Path Simulator:** Stochastic bootstrap analysis calculating probability of account ruin, 95% VaR, and 95% CVaR (Expected Shortfall).
- **Authenticated MT5 Cloud Bridge:** Secure HTTPS `WebRequest` bridge connecting desktop MT5 terminals (`AntiGravityPro.mq5`) to Supabase Edge Functions with HMAC-SHA256 authentication.
- **Interactive 95-Book Strategy Library:** Full PDF reader with Athena AI copilot, vector embeddings, and reading streak gamification.
- **Prop Firm Combine & Trade Journal:** Automated trade synchronization, calendar heatmaps, and psychological tilt detection.

---

## 🏗️ Architecture & Technology Stack

```
Frontend:          Vite 5 + React 18 + TypeScript + Tailwind CSS + shadcn/ui
Backend Layer:     Supabase (PostgreSQL 16, pgvector, Edge Functions, Auth, Storage)
Agent Engine:      Typed Zod Tool Registry + HITL Approval Bus + Guardrail Sentinel
Machine Learning:  Python 3.11 (scikit-learn, arch, scipy, numpy, pandas)
Testing:           Vitest (Unit, Quant Algorithms, 50-Scenario Golden Set Agent Evals)
Desktop Execution: MetaTrader 5 MQL5 Expert Advisor (AntiGravityPro.mq5)
CI/CD:             GitHub Actions
```

For detailed architecture diagrams and security boundaries, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/AGENTS.md](docs/AGENTS.md).

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **Python**: v3.11 or higher (optional, for ML pipeline development)

### 1. Clone & Install
```bash
git clone https://github.com/ChristianMuuo/alpha-flow-97.git
cd alpha-flow-97

# Install Node dependencies
npm install

# (Optional) Install Python ML dependencies
pip install -r requirements.txt
```

### 2. Environment Configuration
Copy the example environment file and provide your Supabase project credentials:
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:5173`.

---

## 🧪 Testing & Validation Suite

AlphaFlow adheres to strict quantitative verification standards:

```bash
# Run Vitest test suite (Quant algorithms, Agent platform, 50 Golden-Set Evals)
npm run test

# Run TypeScript static typecheck
npx tsc --noEmit

# Run ESLint quality audit
npm run lint

# Run Python ML Feature Store pipeline & leakage test
python ml/run_pipeline.py

# Verify production bundle build
npm run build
```

---

## 🗺️ S-Tier Upgrade Roadmap Status

| Stage | Focus Area | Status | Deliverables |
| :---: | :--- | :---: | :--- |
| **Stage 1** | Security Hardening & Clean-Up | ✅ Complete | Zero client secrets, Supabase RLS hardening, repository clean-up |
| **Stage 2** | Agent Platform Engine | ✅ Complete | Typed Zod tool registry, pgvector memory, HITL approval bus |
| **Stage 3** | Specialist Agent Swarm | ✅ Complete | 9 specialist agents, consensus graph, interactive Swarm Grid |
| **Stage 4** | Statistical ML Feature Store | ✅ Complete | Zero-leakage pipeline, GMM regime model, calibrated alpha, GARCH |
| **Stage 5** | AI Command Center & UX | ✅ Complete | Unified dashboard, SHAP waterfalls, walk-forward backtester |
| **Stage 6** | Authenticated MT5 Bridge | ✅ Complete | `AntiGravityPro.mq5` WebRequest client, Supabase `mt5-bridge` |
| **Stage 7** | Quality Assurance, Evals & CI | ✅ Complete | Vitest suite, 50 Golden Set Evals, GitHub Actions CI, Docs overhaul |

---

## ⚖️ Legal & Institutional Risk Disclaimer

> ⚠️ **Important Risk Notice:** AlphaFlow 97, its machine learning models, and its autonomous multi-agent swarm are developed solely for educational, analytical, and simulation purposes. Nothing within this repository or platform constitutes financial, investment, or legal advice. All trade executions default to Paper/Simulation mode. Trading foreign exchange, futures, commodities, and digital assets carries substantial risk of loss. Past performance does not guarantee future results.
