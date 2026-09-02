# Bugs found

Add one section per issue. Bug 1 is filled in to show the format — fix it, then write what you changed. Copy the blank template for the rest.

Keep this file in the repo and **commit it** with your fixes.

---

## Bug 1

**How to reproduce:** Open the app. The expense list says “Newest first”. The first row is Wine (7 Mar). Board game (15 Mar) is further down.

**What is wrong:** The list is showing oldest expenses first. Newest should be at the top. Also, when dates are loaded as strings, subtracting them produces `NaN`, breaking the sort.

**What I changed:**
- In `src/components/ExpenseList.jsx`, updated the sort comparator from `dateValue(a.date) - dateValue(b.date)` to `dateValue(b.date) - dateValue(a.date)`.
- In `src/lib/format.js`, updated `dateValue` to properly convert Date objects and ISO strings to millisecond timestamps (`new Date(date).getTime()`).

---

## Bug 2

**How to reproduce:** Open the app and look at the "Balances" card on the right. Compare it with the seed expenses. For example, Ben Okonkwo paid for Airbnb ($240), Coffee ($16), and Wine ($20), which is far more than his consumed share, yet his balance is shown with a red label claiming he "owes". Aisha, who paid less than her consumed share, is shown in green as "is owed".

**What is wrong:** The status labels and styles in `BalancesPanel.jsx` are inverted. A positive balance (`bal > 0`) means the person paid more than their share and should be labeled "is owed" (green). A negative balance (`bal < 0`) means the person owes money to the group and should be labeled "owes" (red).

**What I changed:**
- In `src/components/BalancesPanel.jsx`, corrected the conditional check: positive balances (`bal > 0.005`) are now labeled `is owed ${formatMoney(bal)}` with class `"owed"`, and negative balances (`bal < -0.005`) are labeled `owes ${formatMoney(-bal)}` with class `"owe"`.

---

## Bug 3

**How to reproduce:** Look at expense `e2` ("Uber to airport", $60 paid by Diya Patel, split between Aisha and Ben). Diya did not ride in the cab and is not in `splitWith`. Check Diya's balance: she paid $60, but her net balance was being deducted by $20 ($60 / 3). The sum of all group balances also did not cancel out to zero.

**What is wrong:** In `src/lib/balances.js`, lines 16–19 penalized the payer if they were not included in `splitWith`:
```javascript
if (!(exp.paidBy in shares) && !(String(exp.paidBy) in shares)) {
  const n = exp.splitWith.length || 1;
  bal[exp.paidBy] -= Number(exp.amount) / n;
}
```
Per the specification: *"Someone can put a cab on their card even if they did not ride. They should get that fare back in full. Only the people who used it should owe a share."* This extra deduction charged the payer for an expense they did not consume and broke the closed-group zero-sum invariant.

**What I changed:**
- In `src/lib/balances.js`, removed the penalizing deduction block. The payer receives credit for the full payment, and only participants in `splitWith` are debited their respective shares. The group balances now strictly sum to $0.00.

---

## Bug 4

**How to reproduce:** Create a group or expenses where a debtor's total debt exactly equals a creditor's credit (for instance, Person A owes $50 and Person B is owed $50). Look at the "Settle up" panel: no transfer is suggested between them, and the panel displays "Everyone is settled" even though both members have non-zero balances.

**What is wrong:** In `src/lib/settle.js`, the greedy settlement loop contained:
```javascript
if (d.amount > c.amount) { ... }
else if (d.amount < c.amount) { ... }
else {
  i += 1;
  j += 1;
}
```
When `d.amount === c.amount`, the code executed the `else` block which incremented both pointers `i` and `j` without pushing a settlement transfer.

**What I changed:**
- In `src/lib/settle.js`, refactored the transfer logic to compute `const amount = Math.min(d.amount, c.amount)`. A transfer is always created for `amount`, deducting it from both debtor and creditor and advancing pointers when their remaining amounts fall below $0.005.

---

## Bug 5

**How to reproduce:** In the "Filter" card, select any person from the "Paid by" dropdown (e.g. "Ben Okonkwo"). Notice that all expenses disappear and the list displays "No expenses match these filters", even though Ben paid for 3 expenses in the seed data.

**What is wrong:** In `src/components/Filters.jsx`, the `<select>` element returns values as strings (e.g. `"2"`). In `src/App.jsx`, the filter condition checked:
```javascript
if (paidBy !== "" && e.paidBy !== paidBy) return false;
```
Because `e.paidBy` is a number (`2`), the strict inequality `2 !== "2"` evaluated to `true`, filtering out every expense.

**What I changed:**
- In `src/App.jsx`, updated the comparison to `String(e.paidBy) !== String(paidBy)`.

---

## Bug 6

**How to reproduce:** 
1. Use any filter (e.g. choose category "Fun" or search for "Board").
2. Click "Delete" on the filtered item or edit its amount.
3. Clear the filter: notice that the item you clicked is still there, but a completely different expense from the original list was deleted or modified.

**What is wrong:** `ExpenseList.jsx` rendered rows using the array index from `sorted` / `filtered`, and passed that index to `onDeleteAt(index)` and `onUpdateAt(index)`. The reducer in `src/state/store.js` then ran `next.splice(action.index, 1)` on `state.expenses`. Because the filtered/sorted index does not match the index in `state.expenses`, operations targeted the wrong expense.

**What I changed:**
- In `src/state/store.js`, updated `DELETE_EXPENSE` and `UPDATE_EXPENSE` actions to target expenses by `id` instead of array index.
- In `src/components/ExpenseList.jsx`, keyed rows by `expense.id` and passed `expense.id` to `onDeleteExpense` and `onUpdateExpense`.
- In `src/App.jsx`, dispatched actions with `id`.
- In `src/components/ExpenseList.jsx`, added a `useEffect` inside `ExpenseRow` to ensure draft edit amounts stay in sync with updated props.

---

## Bug 7

**How to reproduce:** Add an expense of $100 split equally among 3 people. Each person's share was computed as $33.33, totaling $99.99 ($0.01 lost). Over time, repeated splits cause balances to drift.

**What is wrong:** `splitEqual` and `splitByPercent` in `src/lib/money.js` performed simple division with `.toFixed(2)` on each share, losing remainder cents. The README states: *"Those portions together should make up the full bill — the group should not 'lose' or 'invent' money in the rounding."*

**What I changed:**
- In `src/lib/money.js`, rewritten `splitEqual` using integer cent arithmetic: remainder cents (`totalCents % n`) are distributed one cent at a time across the first participants so the sum of individual shares matches the total amount exactly.
- In `src/lib/money.js`, updated `splitByPercent` to ensure the final participant's share absorbs any fractional cent discrepancy so the sum of shares always matches the original bill amount.

---

## Bug 8

**How to reproduce:** In the "Summary" card under "Add member", type a name (e.g. "Elena") and click "Add". Elena is added to the group, but she does not appear under the "Paid so far" list until an expense is added or modified.

**What is wrong:** In `src/components/SummaryCards.jsx`, the `useMemo` calculating `perPerson` only listed `[expenses]` in its dependency array, omitting `members`.

**What I changed:**
- In `src/components/SummaryCards.jsx`, added `members` to the `useMemo` dependency array `[members, expenses]`, and ensured type-safe ID comparison (`Number(e.paidBy) === Number(m.id)`).

---

## Bug 9

**How to reproduce:** Open the app and observe the dates (formatted as "12 Mar 2026"). Refresh the browser. After reloading from `localStorage`, dates appear in ISO/hyphenated format ("2026-03-12").

**What is wrong:** `hydrate(seed)` converted seed dates to `Date` objects, but `loadState` called `JSON.parse(raw)` directly from `localStorage`, returning plain strings. `formatDate` only applied the localized format ("12 Mar 2026") when `date instanceof Date`.

**What I changed:**
- In `src/state/store.js`, wrapped `JSON.parse(raw)` in `hydrate(...)` in `loadState` to consistently deserialize dates into `Date` objects.
- In `src/lib/format.js`, updated `formatDate` to parse string dates with `new Date(date)` so valid dates are always formatted consistently as `D MMM YYYY`.

---

## Bug 10

**How to reproduce:** Add an expense with Custom % split and set percentages like 33.33%, 33.33%, 33.34%. Clicking "Save expense" displays the error "Percentages must add to 100."

**What is wrong:** In `src/lib/money.js`, `percentsSumTo100` did `values.reduce(...) === 100`. Standard IEEE 754 floating-point arithmetic can produce sums like `100.00000000000001 !== 100`, falsely failing the validation.

**What I changed:**
- In `src/lib/money.js`, updated `percentsSumTo100` to allow floating-point tolerance: `Math.abs(sum - 100) < 0.01`.
