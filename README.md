# FairShare

> A modern, zero-sum group expense splitting web application built with React and Vite.

FairShare helps groups of friends, travelers, and roommates easily log shared costs, track individual running balances, and settle up with the minimum number of transactions — without losing or inventing money in rounding.

---

## Features

- **Accurate Bill Splitting**:
  - **Equal Split**: Evenly distributes costs among participants with exact penny distribution so no cents are lost to rounding.
  - **Custom Percentages**: Split unevenly by percentage with automatic validation ensuring totals equal 100%.
- **Pay for Others**: Supports scenarios where the payer is not part of the split (e.g. paying for someone else's cab ride) with full reimbursement.
- **Zero-Sum Running Balances**: Tracks real-time net positions ($Balance = Paid - Consumed$). Group balances strictly sum to $0.00.
- **Optimized Settlement Engine**: Automatically computes pairwise transfers to settle all group debts cleanly.
- **Interactive Filtering & Search**: Instant filter by expense description, category chips (Food, Travel, Fun, Stay), or payer.
- **Persistent State**: Automatically syncs data to browser `localStorage` for offline persistence.
- **Responsive Design**: Fast, lightweight UI built with modern CSS and responsive layouts.

---

## Tech Stack

- **Frontend**: React 18
- **Build Tool**: Vite 6
- **Styling**: Vanilla CSS (CSS Custom Properties & Grid/Flexbox)
- **State Management**: React `useReducer` with LocalStorage persistence

---

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm 9 or newer

### Installation

```bash
# Clone the repository
git clone https://github.com/ABHINAVJINDAL26/Fair-Share.git

# Navigate into project directory
cd Fair-Share

# Install dependencies
npm install
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Available Scripts

- `npm run dev` — Starts the local Vite development server with Hot Module Replacement (HMR).
- `npm run build` — Bundles the application into production-ready assets in the `dist/` directory.
- `npm run preview` — Locally previews the production build output.

---

## Project Structure

```text
Fair-Share/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── AddExpenseForm.jsx  # Expense creation form (equal / custom %)
│   │   ├── BalancesPanel.jsx   # Running balances breakdown (owes / is owed)
│   │   ├── ExpenseList.jsx     # Sorted expense list with inline editing & deletion
│   │   ├── Filters.jsx         # Search, category chips, and payer filters
│   │   ├── SettleUpPanel.jsx   # Optimal settlement transfers list
│   │   └── SummaryCards.jsx    # Group totals, member stats, and member addition
│   ├── data/
│   │   └── seed.json     # Initial demo group and expenses
│   ├── lib/              # Core business logic & mathematical utilities
│   │   ├── balances.js   # Zero-sum balance computations
│   │   ├── format.js     # Currency & localized date formatting
│   │   ├── money.js      # Cent-safe equal & percentage split algorithms
│   │   └── settle.js     # Greedy settlement / debt simplification engine
│   ├── state/
│   │   └── store.js      # Central reducer, hydration & persistence logic
│   ├── App.jsx           # Main application layout
│   ├── index.css         # Global design system & theme tokens
│   └── main.jsx          # React DOM root entrypoint
├── index.html            # HTML shell
├── vite.config.js        # Vite configuration
└── package.json          # Project metadata and dependencies
```

---

## Financial Logic & Rules

1. **Closed-Group Invariant**: Across all group members, $\sum \text{Balances} = 0$. The app acts as a closed ledger, not a bank.
2. **Remainder Penny Distribution**: When dividing an amount that does not split into whole cents (e.g. $100 / 3), remainder cents are allocated to participants sequentially to guarantee $\sum \text{Shares} = \text{Amount}$.
3. **Payer Independence**: If member $A$ pays for members $B$ and $C$, member $A$'s balance increases by $+Amount$, while $B$ and $C$ are debited their respective shares. $A$ is never penalized for non-involvement.
