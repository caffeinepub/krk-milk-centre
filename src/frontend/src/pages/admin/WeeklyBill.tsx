import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Printer, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Producer } from "../../context/AppContext";
import { useApp } from "../../context/AppContext";

interface BillData {
  producer: Producer;
  entries: {
    id: number;
    date: string;
    session: string;
    litres: number;
    ratePerLitre: number;
    amount: number;
  }[];
  totalMilk: number;
  totalAmt: number;
  totalOutstanding: number;
  net: number;
  penaltyFlag: boolean;
}

function getDefaultRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);
  return {
    from: start.toISOString().split("T")[0],
    to: end.toISOString().split("T")[0],
  };
}

function getPrevWeekRange(from: string) {
  const d = new Date(from);
  d.setDate(d.getDate() - 1);
  const prevTo = d.toISOString().split("T")[0];
  d.setDate(d.getDate() - 6);
  const prevFrom = d.toISOString().split("T")[0];
  return { prevFrom, prevTo };
}

export default function WeeklyBill() {
  const {
    producers,
    milkEntries,
    loans,
    loanRepayments,
    savedWeeklyBills,
    addSavedWeeklyBill,
    deleteSavedWeeklyBill,
  } = useApp();
  const [range, setRange] = useState(getDefaultRange);

  const { prevFrom, prevTo } = useMemo(
    () => getPrevWeekRange(range.from),
    [range.from],
  );

  const producerBills: BillData[] = useMemo(() => {
    const bills: BillData[] = [];
    for (const p of producers) {
      const entries = milkEntries
        .filter(
          (e) =>
            e.producerId === p.id && e.date >= range.from && e.date <= range.to,
        )
        .sort(
          (a, b) =>
            a.date.localeCompare(b.date) || a.session.localeCompare(b.session),
        );

      if (entries.length === 0) continue;

      const totalMilk = entries.reduce((s, e) => s + e.litres, 0);
      const totalAmt = entries.reduce((s, e) => s + e.amount, 0);

      const totalAllLoans = loans
        .filter((l) => l.producerId === p.id)
        .reduce((s, l) => s + l.amount, 0);
      const totalRepaid = loanRepayments
        .filter((r) => r.producerId === p.id)
        .reduce((s, r) => s + r.amount, 0);
      const totalOutstanding = Math.max(0, totalAllLoans - totalRepaid);

      const prevWeekRepayment = loanRepayments
        .filter(
          (r) =>
            r.producerId === p.id && r.date >= prevFrom && r.date <= prevTo,
        )
        .reduce((s, r) => s + r.amount, 0);
      const penaltyFlag = totalOutstanding > 0 && prevWeekRepayment === 0;

      const net = totalAmt;

      bills.push({
        producer: p,
        entries,
        totalMilk,
        totalAmt,
        totalOutstanding,
        net,
        penaltyFlag,
      });
    }
    return bills;
  }, [producers, milkEntries, loans, loanRepayments, range, prevFrom, prevTo]);

  const handleSaveBill = () => {
    if (producerBills.length === 0) {
      toast.error("No producers with entries in this period");
      return;
    }
    const fmt = (d: string) => {
      const dt = new Date(d);
      return dt.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    };
    const label = `${fmt(range.from)} – ${fmt(range.to)}`;
    addSavedWeeklyBill({ from: range.from, to: range.to, label });
    toast.success(`Bill saved: ${label}`);
  };

  const BillCard = ({ bill }: { bill: BillData }) => (
    <div
      className="bill-card border-2 border-gray-400 rounded-lg p-4 bg-white text-black print:break-after-page"
      style={{ fontSize: "11px" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-gray-300 pb-2">
        <div>
          <div className="font-bold text-sm leading-tight">KRK Milk Centre</div>
          <div className="text-gray-500" style={{ fontSize: "9px" }}>
            Milk Collection Center
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-bold text-base">
              {bill.producer.producerNumber}
            </div>
            <div className="text-gray-500" style={{ fontSize: "9px" }}>
              {range.from} to {range.to}
            </div>
          </div>
          <img
            src="/assets/uploads/image-019d2b3e-b53c-75ab-862d-0025b51968e7-1.png"
            alt="KRK Logo"
            className="w-10 h-10 object-contain"
          />
        </div>
      </div>

      {/* Entries Table */}
      <table className="w-full mb-3" style={{ fontSize: "10px" }}>
        <thead>
          <tr className="bg-gray-100">
            {["Date", "Ses", "Litres", "Rate", "Amount"].map((h) => (
              <th
                key={h}
                className="px-1 py-1 text-left font-semibold last:text-right"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bill.entries.map((e) => (
            <tr key={e.id} className="border-b border-gray-200">
              <td className="px-1 py-0.5">{e.date.slice(5)}</td>
              <td className="px-1 py-0.5">{e.session.slice(0, 3)}</td>
              <td className="px-1 py-0.5">{e.litres.toFixed(1)}</td>
              <td className="px-1 py-0.5">{e.ratePerLitre}</td>
              <td className="px-1 py-0.5 text-right">{e.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div
        className="space-y-0.5 border-t border-gray-300 pt-2"
        style={{ fontSize: "11px" }}
      >
        <div className="flex justify-between">
          <span className="text-gray-600">Total Litres:</span>
          <span className="font-semibold">{bill.totalMilk.toFixed(1)} L</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Total Amount:</span>
          <span className="font-semibold">₹{bill.totalAmt.toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-t border-gray-400 pt-1 mt-1">
          <span className="font-bold">NET PAYABLE:</span>
          <span className="font-bold text-green-700">
            ₹{bill.net.toFixed(2)}
          </span>
        </div>
        {bill.totalOutstanding > 0 && (
          <div
            className={`flex justify-between pt-0.5 ${
              bill.penaltyFlag ? "text-red-600 font-semibold" : "text-gray-700"
            }`}
          >
            <span>Outstanding Loan:</span>
            <span>₹{bill.totalOutstanding.toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6" data-ocid="weekly_bill.page">
      <div className="no-print">
        <h1 className="text-2xl font-bold text-foreground">Weekly Bill</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Generate 7-day bills — one per page when printed
        </p>
      </div>

      {/* Controls */}
      <Card className="no-print">
        <CardContent className="pt-5">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>From Date</Label>
              <Input
                data-ocid="weekly_bill.from_date_input"
                type="date"
                value={range.from}
                onChange={(e) =>
                  setRange((r) => ({ ...r, from: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>To Date</Label>
              <Input
                data-ocid="weekly_bill.to_date_input"
                type="date"
                value={range.to}
                onChange={(e) =>
                  setRange((r) => ({ ...r, to: e.target.value }))
                }
              />
            </div>
            <div className="flex items-end">
              <Button
                data-ocid="weekly_bill.save_button"
                variant="outline"
                className="w-full"
                onClick={handleSaveBill}
              >
                Save Bill
              </Button>
            </div>
            <div className="flex items-end">
              <Button
                data-ocid="weekly_bill.print_button"
                className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
                onClick={() => window.print()}
              >
                <Printer className="w-4 h-4 mr-2" /> Print Bills
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Saved Bills */}
      {savedWeeklyBills.length > 0 && (
        <Card className="no-print">
          <CardContent className="pt-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Saved Bills
            </h3>
            <div className="space-y-2">
              {savedWeeklyBills.map((bill, i) => (
                <div
                  key={bill.id}
                  data-ocid={`weekly_bill.saved.item.${i + 1}`}
                  className="flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-muted/20"
                >
                  <span className="text-sm font-medium">{bill.label}</span>
                  <Button
                    data-ocid={`weekly_bill.saved.delete_button.${i + 1}`}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      deleteSavedWeeklyBill(bill.id);
                      toast.success("Bill deleted");
                    }}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bill Preview / Print area */}
      <div className="print-container">
        {producerBills.length === 0 ? (
          <div
            className="no-print text-center py-16 text-muted-foreground"
            data-ocid="weekly_bill.empty_state"
          >
            No producers with milk entries in the selected period
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:block">
            {producerBills.map((bill) => (
              <BillCard key={String(bill.producer.id)} bill={bill} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
