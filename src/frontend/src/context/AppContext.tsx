import type React from "react";
import { createContext, useContext, useState } from "react";

export interface Producer {
  id: bigint;
  producerNumber: string;
  name: string;
  phone: string;
  canSelfView: boolean;
}

export interface MilkEntry {
  id: number;
  producerId: bigint;
  date: string;
  session: string;
  litres: number;
  ratePerLitre: number;
  amount: number;
}

export interface Loan {
  id: number;
  producerId: bigint;
  date: string;
  amount: number;
  purpose: string;
}

export interface LoanRepayment {
  id: number;
  producerId: bigint;
  date: string;
  amount: number;
}

export interface SavedWeeklyBill {
  id: number;
  from: string;
  to: string;
  label: string;
}

interface AppContextType {
  producers: Producer[];
  milkEntries: MilkEntry[];
  loans: Loan[];
  loanRepayments: LoanRepayment[];
  savedWeeklyBills: SavedWeeklyBill[];
  addProducer: (p: Omit<Producer, "id">) => bigint;
  deleteProducer: (id: bigint) => void;
  addMilkEntry: (e: Omit<MilkEntry, "id">) => void;
  deleteMilkEntry: (id: number) => void;
  addLoan: (l: Omit<Loan, "id">) => void;
  addLoanRepayment: (r: Omit<LoanRepayment, "id">) => void;
  addSavedWeeklyBill: (b: Omit<SavedWeeklyBill, "id">) => void;
  deleteSavedWeeklyBill: (id: number) => void;
  toggleSelfView: (id: bigint, val: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}

const SAMPLE_PRODUCERS: Producer[] = [
  {
    id: 1n,
    producerNumber: "P001",
    name: "Ramu Patel",
    phone: "9876543210",
    canSelfView: true,
  },
  {
    id: 2n,
    producerNumber: "P002",
    name: "Sunita Devi",
    phone: "9876543211",
    canSelfView: true,
  },
  {
    id: 3n,
    producerNumber: "P003",
    name: "Mohan Singh",
    phone: "9876543212",
    canSelfView: false,
  },
  {
    id: 4n,
    producerNumber: "P004",
    name: "Lakshmi Rao",
    phone: "9876543213",
    canSelfView: true,
  },
  {
    id: 5n,
    producerNumber: "P005",
    name: "Vijay Kumar",
    phone: "9876543214",
    canSelfView: false,
  },
  {
    id: 6n,
    producerNumber: "P006",
    name: "Priya Sharma",
    phone: "9876543215",
    canSelfView: true,
  },
];

function makeSampleEntries(): MilkEntry[] {
  const entries: MilkEntry[] = [];
  let id = 1;
  const today = new Date();
  for (let d = 6; d >= 0; d--) {
    const date = new Date(today);
    date.setDate(today.getDate() - d);
    const dateStr = date.toISOString().split("T")[0];
    for (const p of SAMPLE_PRODUCERS.slice(0, 4)) {
      for (const session of ["Morning", "Evening"]) {
        const litres = Number.parseFloat((Math.random() * 5 + 3).toFixed(1));
        const rate = 32;
        entries.push({
          id: id++,
          producerId: p.id,
          date: dateStr,
          session,
          litres,
          ratePerLitre: rate,
          amount: Number.parseFloat((litres * rate).toFixed(2)),
        });
      }
    }
  }
  return entries;
}

function makeSampleLoans(): Loan[] {
  const today = new Date().toISOString().split("T")[0];
  return [
    { id: 1, producerId: 1n, date: today, amount: 5000, purpose: "Medical" },
    { id: 2, producerId: 3n, date: today, amount: 3000, purpose: "Cow Feed" },
    { id: 3, producerId: 4n, date: today, amount: 2000, purpose: "Pellet" },
  ];
}

function makeSampleRepayments(): LoanRepayment[] {
  const today = new Date();
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7);
  return [
    {
      id: 1,
      producerId: 1n,
      date: today.toISOString().split("T")[0],
      amount: 500,
    },
    {
      id: 2,
      producerId: 4n,
      date: lastWeek.toISOString().split("T")[0],
      amount: 200,
    },
  ];
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [producers, setProducers] = useState<Producer[]>(SAMPLE_PRODUCERS);
  const [milkEntries, setMilkEntries] =
    useState<MilkEntry[]>(makeSampleEntries);
  const [loans, setLoans] = useState<Loan[]>(makeSampleLoans);
  const [loanRepayments, setLoanRepayments] =
    useState<LoanRepayment[]>(makeSampleRepayments);
  const [savedWeeklyBills, setSavedWeeklyBills] = useState<SavedWeeklyBill[]>(
    [],
  );
  const [nextId, setNextId] = useState(7);
  const [nextRepayId, setNextRepayId] = useState(3);
  const [nextBillId, setNextBillId] = useState(1);

  const addProducer = (p: Omit<Producer, "id">) => {
    const id = BigInt(nextId);
    setNextId((n) => n + 1);
    setProducers((prev) => [...prev, { ...p, id }]);
    return id;
  };

  const deleteProducer = (id: bigint) => {
    setProducers((prev) => prev.filter((p) => p.id !== id));
  };

  const addMilkEntry = (e: Omit<MilkEntry, "id">) => {
    setMilkEntries((prev) => [...prev, { ...e, id: prev.length + 1 }]);
  };

  const deleteMilkEntry = (id: number) => {
    setMilkEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const addLoan = (l: Omit<Loan, "id">) => {
    setLoans((prev) => [...prev, { ...l, id: prev.length + 1 }]);
  };

  const addLoanRepayment = (r: Omit<LoanRepayment, "id">) => {
    setLoanRepayments((prev) => [...prev, { ...r, id: nextRepayId }]);
    setNextRepayId((n) => n + 1);
  };

  const addSavedWeeklyBill = (b: Omit<SavedWeeklyBill, "id">) => {
    setSavedWeeklyBills((prev) => [...prev, { ...b, id: nextBillId }]);
    setNextBillId((n) => n + 1);
  };

  const deleteSavedWeeklyBill = (id: number) => {
    setSavedWeeklyBills((prev) => prev.filter((b) => b.id !== id));
  };

  const toggleSelfView = (id: bigint, val: boolean) => {
    setProducers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, canSelfView: val } : p)),
    );
  };

  return (
    <AppContext.Provider
      value={{
        producers,
        milkEntries,
        loans,
        loanRepayments,
        savedWeeklyBills,
        addProducer,
        deleteProducer,
        addMilkEntry,
        deleteMilkEntry,
        addLoan,
        addLoanRepayment,
        addSavedWeeklyBill,
        deleteSavedWeeklyBill,
        toggleSelfView,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
