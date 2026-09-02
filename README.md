# FairShare

A web app for splitting group expenses and settling debts on trips and shared outings without rounding errors. Built with React and Vite.

---

## Features

- **Accurate Bill Splitting**:
  - **Equal Split**: Distributes costs among members with remainder cent distribution so no cents are lost.
  - **Custom Percentages**: Split unevenly by percentage with validation ensuring percentages add to 100%.
- **Paying for Others**: Full reimbursement when a payer is not part of the split (e.g. paying a cab fare for others).
- **Running Balances**: Tracks net positions in real time (Balance = Paid - Consumed). Across everyone, balances cancel out to zero.
- **Settle-Up Transfers**: Suggests the minimal list of pairwise payments to settle everyone's balance to $0.00.
- **Search & Filters**: Filter expenses by description, category (Food, Travel, Fun, Stay), or by payer.
- **Offline Persistence**: Automatically saves data to browser localStorage so state is preserved on reload.

---

## Tech Stack

- React 18
- Vite 6
- Vanilla CSS

---

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm 9 or newer

### Installation & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Project Structure

```text
Fair-Share/
├── src/
│   ├── components/       # UI components (ExpenseList, Filters, Balances, etc.)
│   ├── data/             # Initial seed data for demo group
│   ├── lib/              # Calculations (balances, settle up, money helpers)
│   ├── state/            # Reducer and localStorage persistence
│   ├── App.jsx           # Main page layout
│   └── index.css         # Styling and theme tokens
├── index.html
├── vite.config.js
└── package.json
```

---

## Key Logic

1. **Closed-Group Rule**: Total balances across all members sum to zero (closed group, no outside bank).
2. **Penny Conservation**: When splitting uneven amounts (like $100 among 3 people), remaining cents are distributed so that the sum of shares matches the original bill ($33.34 + $33.33 + $33.33 = $100.00).
3. **Payer Independence**: Payers who cover expenses for others get credited their full payment back without being forced into the split.
