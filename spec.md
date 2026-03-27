# KRK Dairy Trace

## Current State
App named DairyTrace. MilkCollection has no delete. Finance has Loan+Advance type selector. WeeklyBill shows 2 per sheet, outstanding row has Min 2% due text. KRK logo at /assets/uploads/image-019d2b3e-b53c-75ab-862d-0025b51968e7-1.png

## Requested Changes (Diff)

### Add
- deleteMilkEntry in AppContext and delete button per milk entry row
- Milk Collection: simultaneous Morning+Evening entry option
- Finance: inline producer loan history panel when producer selected

### Modify
- App name: DairyTrace -> KRK Dairy Trace in sidebar and bill header
- AdminLayout sidebar: replace Leaf icon + DairyTrace with KRK logo + KRK Dairy Trace
- Finance: remove Advance type, only Loan; remove type selector; tab = Loans; summary removes advances column
- WeeklyBill BillCard: KRK logo on RIGHT, KRK Milk Centre on LEFT
- WeeklyBill outstanding row: remove Min 2% due text, just red color if penaltyFlag
- WeeklyBill print: each bill on its own page

### Remove
- Advance type from Finance
- Min 2% due text from WeeklyBill
- Leaf icon from sidebar

## Implementation Plan
1. AppContext: add deleteMilkEntry; remove advances/addAdvance; Loan type = Loan only
2. AdminLayout: KRK logo + KRK Dairy Trace brand
3. MilkCollection: delete per row; Morning+Evening simultaneous entry
4. Finance: loans only; producer history panel; summary without advances col
5. WeeklyBill: KRK header; no Min 2% text; one bill per print page
6. Validate
