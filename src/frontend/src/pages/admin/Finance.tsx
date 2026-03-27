import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../../context/AppContext";

const REASON_OPTIONS = [
  "Snacks",
  "Cow Feed",
  "Pellet",
  "Medical",
  "Temple",
  "Others",
];

function getWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    from: monday.toISOString().split("T")[0],
    to: sunday.toISOString().split("T")[0],
  };
}

export default function Finance() {
  const { producers, loans, loanRepayments, addLoan, addLoanRepayment } =
    useApp();
  const today = new Date().toISOString().split("T")[0];
  const weekRange = useMemo(() => getWeekRange(), []);

  const [entryForm, setEntryForm] = useState({
    producerId: "",
    date: today,
    amount: "",
    reason: "",
    customReason: "",
  });
  const [repayForm, setRepayForm] = useState({
    producerId: "",
    date: today,
    amount: "",
  });
  const [saving, setSaving] = useState(false);
  const [repaySaving, setRepaySaving] = useState(false);

  const effectiveReason =
    entryForm.reason === "Others" ? entryForm.customReason : entryForm.reason;

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryForm.producerId || !entryForm.amount || !entryForm.reason) {
      toast.error("Fill all fields");
      return;
    }
    if (entryForm.reason === "Others" && !entryForm.customReason.trim()) {
      toast.error("Please specify the reason");
      return;
    }
    setSaving(true);
    try {
      addLoan({
        producerId: BigInt(entryForm.producerId),
        date: entryForm.date,
        amount: Number.parseFloat(entryForm.amount),
        purpose: effectiveReason,
      });
      toast.success("Loan recorded");
      setEntryForm((f) => ({
        ...f,
        producerId: "",
        amount: "",
        reason: "",
        customReason: "",
      }));
    } finally {
      setSaving(false);
    }
  };

  const handleAddRepayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repayForm.producerId || !repayForm.amount) {
      toast.error("Fill all fields");
      return;
    }
    setRepaySaving(true);
    try {
      addLoanRepayment({
        producerId: BigInt(repayForm.producerId),
        date: repayForm.date,
        amount: Number.parseFloat(repayForm.amount),
      });
      toast.success("Repayment recorded");
      setRepayForm((f) => ({ ...f, producerId: "", amount: "" }));
    } finally {
      setRepaySaving(false);
    }
  };

  // Loans for display
  const allEntries = useMemo(() => {
    return loans
      .map((l) => ({
        id: `l-${l.id}`,
        producerId: l.producerId,
        date: l.date,
        reason: l.purpose,
        amount: l.amount,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [loans]);

  // History for selected producer (loans + repayments combined)
  const selectedProducerHistory = useMemo(() => {
    if (!entryForm.producerId) return [];
    const pid = BigInt(entryForm.producerId);
    const loanItems = loans
      .filter((l) => l.producerId === pid)
      .map((l) => ({
        date: l.date,
        kind: "Loan Given" as const,
        reason: l.purpose,
        amount: l.amount,
      }));
    const repayItems = loanRepayments
      .filter((r) => r.producerId === pid)
      .map((r) => ({
        date: r.date,
        kind: "Repayment" as const,
        reason: "",
        amount: r.amount,
      }));
    return [...loanItems, ...repayItems].sort((a, b) =>
      b.date.localeCompare(a.date),
    );
  }, [entryForm.producerId, loans, loanRepayments]);

  const selectedProducer = entryForm.producerId
    ? producers.find((p) => String(p.id) === entryForm.producerId)
    : null;

  // This week's repayments grouped by producer
  const thisWeekRepayments = useMemo(() => {
    const entries = loanRepayments.filter(
      (r) => r.date >= weekRange.from && r.date <= weekRange.to,
    );
    const byProducer = new Map<string, number>();
    for (const r of entries) {
      const key = String(r.producerId);
      byProducer.set(key, (byProducer.get(key) ?? 0) + r.amount);
    }
    return byProducer;
  }, [loanRepayments, weekRange]);

  // Summary per producer
  const summaryRows = useMemo(() => {
    return producers.map((p) => {
      const pId = p.id;
      const totalLoans = loans
        .filter((l) => l.producerId === pId)
        .reduce((s, l) => s + l.amount, 0);
      const totalRepaid = loanRepayments
        .filter((r) => r.producerId === pId)
        .reduce((s, r) => s + r.amount, 0);
      const balance = totalLoans - totalRepaid;
      return { producer: p, totalLoans, totalRepaid, balance };
    });
  }, [producers, loans, loanRepayments]);

  return (
    <div className="p-6 space-y-6" data-ocid="finance.page">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Finance</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage loans and repayments
        </p>
      </div>

      <Tabs defaultValue="entries">
        <TabsList>
          <TabsTrigger data-ocid="finance.entries_tab" value="entries">
            Loans
          </TabsTrigger>
          <TabsTrigger data-ocid="finance.repayments_tab" value="repayments">
            Loan Repayments
          </TabsTrigger>
          <TabsTrigger data-ocid="finance.summary_tab" value="summary">
            Summary
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Loans */}
        <TabsContent value="entries" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add Loan</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleAddEntry}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div className="space-y-2">
                  <Label>Producer</Label>
                  <Select
                    value={entryForm.producerId}
                    onValueChange={(v) =>
                      setEntryForm((f) => ({ ...f, producerId: v }))
                    }
                  >
                    <SelectTrigger data-ocid="finance.entry_producer_select">
                      <SelectValue placeholder="Select producer" />
                    </SelectTrigger>
                    <SelectContent>
                      {producers.map((p) => (
                        <SelectItem key={String(p.id)} value={String(p.id)}>
                          {p.producerNumber} - {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    data-ocid="finance.entry_date_input"
                    type="date"
                    value={entryForm.date}
                    onChange={(e) =>
                      setEntryForm((f) => ({ ...f, date: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Amount (₹)</Label>
                  <Input
                    data-ocid="finance.entry_amount_input"
                    type="number"
                    placeholder="0"
                    value={entryForm.amount}
                    onChange={(e) =>
                      setEntryForm((f) => ({ ...f, amount: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Reason / Purpose</Label>
                  <Select
                    value={entryForm.reason}
                    onValueChange={(v) =>
                      setEntryForm((f) => ({ ...f, reason: v }))
                    }
                  >
                    <SelectTrigger data-ocid="finance.entry_reason_select">
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {REASON_OPTIONS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {entryForm.reason === "Others" && (
                  <div className="space-y-2">
                    <Label>Specify Reason</Label>
                    <Input
                      data-ocid="finance.entry_custom_reason_input"
                      placeholder="Describe the reason"
                      value={entryForm.customReason}
                      onChange={(e) =>
                        setEntryForm((f) => ({
                          ...f,
                          customReason: e.target.value,
                        }))
                      }
                    />
                  </div>
                )}

                <div className="sm:col-span-2 flex justify-end">
                  <Button
                    data-ocid="finance.entry_submit_button"
                    type="submit"
                    disabled={saving}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Record Loan"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Loan History for selected producer */}
          {selectedProducer && selectedProducerHistory.length > 0 && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-sm text-primary">
                  Loan History — {selectedProducer.producerNumber}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table
                    className="w-full text-sm"
                    data-ocid="finance.history_table"
                  >
                    <thead>
                      <tr className="bg-muted/30 border-b border-border">
                        {["Date", "Type", "Reason", "Amount"].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-2 text-xs font-semibold text-muted-foreground text-left last:text-right"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProducerHistory.map((item, i) => (
                        <tr
                          key={`${item.kind}-${item.date}-${i}`}
                          className="border-b border-border/50"
                        >
                          <td className="px-4 py-2 text-muted-foreground">
                            {item.date}
                          </td>
                          <td className="px-4 py-2">
                            <Badge
                              variant="outline"
                              className={
                                item.kind === "Loan Given"
                                  ? "border-destructive text-destructive"
                                  : "border-primary text-primary"
                              }
                            >
                              {item.kind}
                            </Badge>
                          </td>
                          <td className="px-4 py-2 text-muted-foreground">
                            {item.reason || "—"}
                          </td>
                          <td
                            className={`px-4 py-2 text-right font-semibold ${
                              item.kind === "Loan Given"
                                ? "text-destructive"
                                : "text-primary"
                            }`}
                          >
                            {item.kind === "Loan Given" ? "-" : "+"}₹
                            {item.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">All Loans</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table
                  className="w-full text-sm"
                  data-ocid="finance.entries_table"
                >
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      {["Producer#", "Date", "Reason", "Amount"].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-2.5 text-xs font-semibold text-muted-foreground text-left last:text-right"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allEntries.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-10 text-muted-foreground"
                          data-ocid="finance.entries_empty_state"
                        >
                          No loans recorded
                        </td>
                      </tr>
                    )}
                    {allEntries.map((entry, i) => {
                      const p = producers.find(
                        (p) => p.id === entry.producerId,
                      );
                      return (
                        <tr
                          key={entry.id}
                          data-ocid={`finance.entry.item.${i + 1}`}
                          className="border-b border-border/50 hover:bg-muted/10"
                        >
                          <td className="px-4 py-2.5 font-mono text-primary">
                            {p?.producerNumber ?? "?"}
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground">
                            {entry.date}
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground">
                            {entry.reason}
                          </td>
                          <td className="px-4 py-2.5 text-right font-semibold">
                            ₹{entry.amount.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Loan Repayments */}
        <TabsContent value="repayments" className="mt-4 space-y-4">
          {thisWeekRepayments.size > 0 && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-sm text-primary">
                  This Week's Repayments ({weekRange.from} – {weekRange.to})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {Array.from(thisWeekRepayments.entries()).map(
                    ([pidStr, total]) => {
                      const p = producers.find(
                        (pr) => String(pr.id) === pidStr,
                      );
                      return (
                        <div
                          key={pidStr}
                          className="bg-card border border-border rounded-lg px-3 py-2 text-sm"
                        >
                          <span className="font-mono text-primary font-semibold">
                            {p?.producerNumber ?? pidStr}
                          </span>
                          <span className="text-muted-foreground mx-1">—</span>
                          <span className="font-bold">
                            ₹{total.toLocaleString()}
                          </span>
                        </div>
                      );
                    },
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Record Repayment</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleAddRepayment}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                <div className="space-y-2">
                  <Label>Producer</Label>
                  <Select
                    value={repayForm.producerId}
                    onValueChange={(v) =>
                      setRepayForm((f) => ({ ...f, producerId: v }))
                    }
                  >
                    <SelectTrigger data-ocid="finance.repay_producer_select">
                      <SelectValue placeholder="Select producer" />
                    </SelectTrigger>
                    <SelectContent>
                      {producers.map((p) => (
                        <SelectItem key={String(p.id)} value={String(p.id)}>
                          {p.producerNumber} - {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    data-ocid="finance.repay_date_input"
                    type="date"
                    value={repayForm.date}
                    onChange={(e) =>
                      setRepayForm((f) => ({ ...f, date: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount Paid (₹)</Label>
                  <Input
                    data-ocid="finance.repay_amount_input"
                    type="number"
                    placeholder="0"
                    value={repayForm.amount}
                    onChange={(e) =>
                      setRepayForm((f) => ({ ...f, amount: e.target.value }))
                    }
                  />
                </div>
                <div className="sm:col-span-3 flex justify-end">
                  <Button
                    data-ocid="finance.repay_submit_button"
                    type="submit"
                    disabled={repaySaving}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {repaySaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Record Repayment"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">All Repayments</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table
                  className="w-full text-sm"
                  data-ocid="finance.repayments_table"
                >
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      {["Producer#", "Date", "Amount Paid"].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-2.5 text-xs font-semibold text-muted-foreground text-left last:text-right"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loanRepayments.length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="text-center py-10 text-muted-foreground"
                          data-ocid="finance.repayments_empty_state"
                        >
                          No repayments recorded
                        </td>
                      </tr>
                    )}
                    {[...loanRepayments]
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map((r, i) => {
                        const p = producers.find((p) => p.id === r.producerId);
                        return (
                          <tr
                            key={r.id}
                            data-ocid={`finance.repayment.item.${i + 1}`}
                            className="border-b border-border/50 hover:bg-muted/10"
                          >
                            <td className="px-4 py-2.5 font-mono text-primary">
                              {p?.producerNumber ?? "?"}
                            </td>
                            <td className="px-4 py-2.5 text-muted-foreground">
                              {r.date}
                            </td>
                            <td className="px-4 py-2.5 text-right font-semibold text-primary">
                              ₹{r.amount.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Summary */}
        <TabsContent value="summary" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Outstanding Summary per Producer
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table
                  className="w-full text-sm"
                  data-ocid="finance.summary_table"
                >
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      {[
                        "Producer#",
                        "Total Loans",
                        "Total Repaid",
                        "Balance",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-2.5 text-xs font-semibold text-muted-foreground text-left last:text-right"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {summaryRows
                      .filter((r) => r.totalLoans > 0 || r.totalRepaid > 0)
                      .map((row, i) => (
                        <tr
                          key={String(row.producer.id)}
                          data-ocid={`finance.summary.item.${i + 1}`}
                          className="border-b border-border/50 hover:bg-muted/10"
                        >
                          <td className="px-4 py-2.5 font-mono text-primary font-semibold">
                            {row.producer.producerNumber}
                          </td>
                          <td className="px-4 py-2.5">
                            ₹{row.totalLoans.toLocaleString()}
                          </td>
                          <td className="px-4 py-2.5 text-primary">
                            ₹{row.totalRepaid.toLocaleString()}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <Badge
                              variant={
                                row.balance > 0 ? "destructive" : "outline"
                              }
                              className={
                                row.balance <= 0
                                  ? "border-primary text-primary"
                                  : ""
                              }
                            >
                              ₹{row.balance.toLocaleString()}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    {summaryRows.filter(
                      (r) => r.totalLoans > 0 || r.totalRepaid > 0,
                    ).length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-10 text-muted-foreground"
                          data-ocid="finance.summary_empty_state"
                        >
                          No financial records yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
