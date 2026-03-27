import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Hash, Phone } from "lucide-react";
import { useMemo } from "react";
import { useApp } from "../../context/AppContext";

interface Props {
  producerId: bigint;
  onBack: () => void;
}

export default function ProducerDetail({ producerId, onBack }: Props) {
  const { producers, milkEntries, loans, loanRepayments } = useApp();
  const producer = producers.find((p) => p.id === producerId);

  const pMilk = useMemo(
    () =>
      milkEntries
        .filter((e) => e.producerId === producerId)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [milkEntries, producerId],
  );
  const pLoans = useMemo(
    () => loans.filter((l) => l.producerId === producerId),
    [loans, producerId],
  );
  const pRepayments = useMemo(
    () => loanRepayments.filter((r) => r.producerId === producerId),
    [loanRepayments, producerId],
  );

  const totalMilk = pMilk.reduce((s, e) => s + e.litres, 0);
  const totalMilkAmt = pMilk.reduce((s, e) => s + e.amount, 0);
  const totalAllLoans = pLoans.reduce((s, l) => s + l.amount, 0);
  const totalRepaid = pRepayments.reduce((s, r) => s + r.amount, 0);
  const totalOutstanding = Math.max(0, totalAllLoans - totalRepaid);

  const allTransactions = useMemo(
    () =>
      [
        ...pMilk.map((e) => ({
          key: `milk-${e.id}`,
          date: e.date,
          type: "Milk",
          desc: `${e.session} - ${e.litres}L`,
          amount: e.amount,
          credit: true,
        })),
        ...pLoans.map((l) => ({
          key: `loan-${l.id}`,
          date: l.date,
          type: "Loan",
          desc: l.purpose,
          amount: l.amount,
          credit: false,
        })),
        ...pRepayments.map((r) => ({
          key: `repay-${r.id}`,
          date: r.date,
          type: "Repayment",
          desc: "Loan repayment",
          amount: r.amount,
          credit: true,
        })),
      ].sort((a, b) => b.date.localeCompare(a.date)),
    [pMilk, pLoans, pRepayments],
  );

  if (!producer)
    return <div className="p-8 text-muted-foreground">Producer not found.</div>;

  return (
    <div className="p-6 space-y-6" data-ocid="producer_detail.page">
      <div className="flex items-center gap-3">
        <Button
          data-ocid="producer_detail.back_button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      </div>

      {/* Producer Header */}
      <Card className="bg-secondary border-0">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
              {producer.name[0]}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">
                {producer.name}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5" />
                  {producer.producerNumber}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  {producer.phone}
                </span>
                <Badge
                  variant={producer.canSelfView ? "default" : "outline"}
                  className={
                    producer.canSelfView
                      ? "bg-primary text-primary-foreground"
                      : ""
                  }
                >
                  {producer.canSelfView ? "Self View On" : "Self View Off"}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Total Milk", val: `${totalMilk.toFixed(1)}L` },
                { label: "Milk Amount", val: `₹${totalMilkAmt.toFixed(0)}` },
                { label: "Outstanding", val: `₹${totalOutstanding}` },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-card rounded-lg p-3 text-center shadow-xs"
                >
                  <div className="text-lg font-bold text-primary">{s.val}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="milk">
        <TabsList className="bg-muted">
          <TabsTrigger data-ocid="producer_detail.milk_tab" value="milk">
            Milk Collections
          </TabsTrigger>
          <TabsTrigger data-ocid="producer_detail.finance_tab" value="finance">
            Finance
          </TabsTrigger>
          <TabsTrigger data-ocid="producer_detail.history_tab" value="history">
            Full History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="milk" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Milk Collections ({pMilk.length} entries)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {["Date", "Session", "Litres", "Rate/L", "Amount"].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-4 py-2.5 text-xs font-semibold text-muted-foreground text-left last:text-right"
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {pMilk.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center py-8 text-muted-foreground"
                          data-ocid="producer_detail.milk_empty_state"
                        >
                          No milk entries
                        </td>
                      </tr>
                    )}
                    {pMilk.map((e, i) => (
                      <tr
                        key={e.id}
                        data-ocid={`producer_detail.milk.item.${i + 1}`}
                        className="border-b border-border/50 hover:bg-muted/10"
                      >
                        <td className="px-4 py-2.5">{e.date}</td>
                        <td className="px-4 py-2.5">
                          <Badge
                            variant="outline"
                            className={
                              e.session === "Morning"
                                ? "border-chart-2 text-chart-2"
                                : "border-chart-5 text-chart-5"
                            }
                          >
                            {e.session}
                          </Badge>
                        </td>
                        <td className="px-4 py-2.5 font-medium">
                          {e.litres} L
                        </td>
                        <td className="px-4 py-2.5">₹{e.ratePerLitre}</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-primary">
                          ₹{e.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finance" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Loans</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {["Date", "Purpose", "Amount"].map((h) => (
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
                  {pLoans.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center py-6 text-muted-foreground"
                      >
                        No loans
                      </td>
                    </tr>
                  )}
                  {pLoans.map((l, i) => (
                    <tr
                      key={l.id}
                      data-ocid={`producer_detail.loan.item.${i + 1}`}
                      className="border-b border-border/50"
                    >
                      <td className="px-4 py-2.5">{l.date}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {l.purpose}
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold text-destructive">
                        ₹{l.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Repayments</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {["Date", "Amount Paid"].map((h) => (
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
                  {pRepayments.length === 0 && (
                    <tr>
                      <td
                        colSpan={2}
                        className="text-center py-6 text-muted-foreground"
                      >
                        No repayments
                      </td>
                    </tr>
                  )}
                  {pRepayments.map((r, i) => (
                    <tr
                      key={r.id}
                      data-ocid={`producer_detail.repayment.item.${i + 1}`}
                      className="border-b border-border/50"
                    >
                      <td className="px-4 py-2.5">{r.date}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-primary">
                        ₹{r.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All Transactions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {["Date", "Type", "Description", "Amount"].map((h) => (
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
                    {allTransactions.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-8 text-muted-foreground"
                          data-ocid="producer_detail.history_empty_state"
                        >
                          No transactions
                        </td>
                      </tr>
                    )}
                    {allTransactions.map((t, i) => (
                      <tr
                        key={t.key}
                        data-ocid={`producer_detail.transaction.item.${i + 1}`}
                        className="border-b border-border/50 hover:bg-muted/10"
                      >
                        <td className="px-4 py-2.5">{t.date}</td>
                        <td className="px-4 py-2.5">
                          <Badge
                            variant="outline"
                            className={
                              t.type === "Milk"
                                ? "border-primary text-primary"
                                : t.type === "Repayment"
                                  ? "border-chart-2 text-chart-2"
                                  : "border-destructive text-destructive"
                            }
                          >
                            {t.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">
                          {t.desc}
                        </td>
                        <td
                          className={`px-4 py-2.5 text-right font-semibold ${
                            t.credit ? "text-primary" : "text-destructive"
                          }`}
                        >
                          {t.credit ? "+" : "-"}₹{t.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
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
