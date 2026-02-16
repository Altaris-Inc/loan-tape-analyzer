# Loan Tape Analyzer

ABS Loan Tape Cracking Platform with AI column mapping, stratification, drill-down analytics, custom strats, charts & regression, and originator template management.

## Features

- **AI Column Mapping** — Rule-based + Claude AI auto-matching of source columns to standard ABS fields
- **Originator Templates** — Save/load column mappings per originator for instant tape processing
- **Custom Fields** — Add your own standard fields with fuzzy alternate-name matching
- **Pool Overview** — Key metrics (WA FICO, WA Rate, WA DTI, balances) with click-to-drill
- **Tape Cracking** — Delinquency buckets, loss analysis, vintage stratification
- **Stratifications** — FICO, Rate, DTI, Term, Purpose, Channel, Grade, Geography — all clickable
- **Custom Strats** — Build your own numeric-bucket or categorical stratifications on any column
- **Charts & Regression** — Scatter plots with OLS simple & multiple regression, color-by grouping
- **Drill-Down** — Click any metric, chart bar, or strat row → filtered loan grid with smart column ordering, column reorder, CSV export
- **Data Quality** — Completeness scoring, out-of-range detection, field mapping audit
- **Concentration Analysis** — Geographic HHI, top-state risk

## Quick Start

```bash
npm install
npm start
```

Opens at [http://localhost:3000](http://localhost:3000)

## Sample Data

Two sample tapes are included in `public/sample-data/`:

| File | Originator | Loans | Columns | Notes |
|------|-----------|-------|---------|-------|
| `consumer_unsecured_loan_tape.csv` | Generic Consumer | 1,000 | 88 | Clean data, standard column names |
| `quickdrive_auto_loan_tape.csv` | QuickDrive Capital | 500 | 73 | Auto loans, different column names, messy data ($ in amounts, % in rates, N/A in FICO, negative balances, mixed date formats) |

Click the sample data buttons on the landing page to load them instantly.

## Deployment

### Vercel
```bash
npm run build
npx vercel --prod
```

### Netlify
```bash
npm run build
# drag & drop the `build/` folder to netlify.com
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm install -g serve
CMD ["serve", "-s", "build", "-l", "3000"]
```

## Tech Stack

- React 18
- Recharts (charts)
- PapaParse (CSV parsing)
- Lodash (utilities)
- Lucide React (icons)
- Anthropic API (AI column matching — optional, works without it)
