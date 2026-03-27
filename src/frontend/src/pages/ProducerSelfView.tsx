import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, DollarSign, Leaf, Milk, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useActor } from "../hooks/useActor";

interface MilkEntryLocal {
  date: string;
  session: string;
  litres: number;
  fatPercent: number;
  ratePerLitre: number;
  amount: number;
}

interface AdvanceLocal {
  date: string;
  amount: number;
  reason: string;
}

interface ProducerLocal {
  name: string;
  producerNumber: string;
  phone: string;
  canSelfView: boolean;
}

interface Props {
  phone: string;
  onBack: () => void;
}

export default function ProducerSelfView({ phone, onBack }: Props) {
  const { actor } = useActor();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [producer, setProducer] = useState<ProducerLocal | null>(null);
  const [milkEntries, setMilkEntries] = useState<MilkEntryLocal[]>([]);
  const [advances, setAdvances] = useState<AdvanceLocal[]>([]);
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        if (!actor) {
          setError("Service not available. Please try again.");
          setLoading(false);
          return;
        }
        const hist = await actor.getMyHistory(phone);
        if (cancelled) return;
        if (!hist.producer.canSelfView) {
          setError(
            "Access not permitted. Please contact the admin to enable self-view.",
          );
          setLoading(false);
          return;
        }
        setProducer(hist.producer);
        setMilkEntries(
          hist.milkEntries.map((e) => ({
            date: e.date,
            session: e.session,
            litres: Number(e.litres),
            fatPercent: Number(e.fatPercent),
            ratePerLitre: Number(e.ratePerLitre),
            amount: Number(e.amount),
          })),
        );
        setAdvances(
          hist.advances.map((a) => ({
            date: a.date,
            amount: Number(a.amount),
            reason: a.reason,
          })),
        );
      } catch {
        if (!cancelled)
          setError("Producer not found. Please check your phone number.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [phone, actor]);

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - 6);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const filteredEntries = milkEntries
    .filter((e) => {
      if (filterFrom && e.date < filterFrom) return false;
      if (filterTo && e.date > filterTo) return false;
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const weekMilk = milkEntries
    .filter((e) => e.date >= weekStart.toISOString().split("T")[0])
    .reduce((s, e) => s + e.litres, 0);
  const monthMilk = milkEntries
    .filter((e) => e.date >= monthStart.toISOString().split("T")[0])
    .reduce((s, e) => s + e.litres, 0);
  const totalAdv = advances.reduce((s, a) => s + a.amount, 0);
  const monthAmt = milkEntries
    .filter((e) => e.date >= monthStart.toISOString().split("T")[0])
    .reduce((s, e) => s + e.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div data-ocid="self_view.loading_state" className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div data-ocid="self_view.error_state" className="text-center max-w-sm">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚫</span>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Access Denied
          </h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button
            data-ocid="self_view.back_button"
            onClick={onBack}
            className="bg-primary text-primary-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        <Button
          data-ocid="self_view.back_button"
          variant="ghost"
          size="sm"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <Leaf className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground">DairyTrace</span>
        </div>
        <Badge className="ml-auto bg-primary text-primary-foreground">
          Producer View
        </Badge>
      </header>

      <div
        className="max-w-3xl mx-auto p-4 space-y-5"
        data-ocid="self_view.page"
      >
        {producer && (
          <Card className="bg-secondary border-0">
            <CardContent className="pt-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-xl font-bold text-primary-foreground">
                  {producer.name[0]}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    {producer.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {producer.producerNumber} · {producer.phone}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "This Week Milk",
              val: `${weekMilk.toFixed(1)}L`,
              icon: Milk,
            },
            {
              label: "This Month Milk",
              val: `${monthMilk.toFixed(1)}L`,
              icon: Milk,
            },
            {
              label: "Month Amount",
              val: `₹${monthAmt.toFixed(0)}`,
              icon: DollarSign,
            },
            { label: "Total Advances", val: `₹${totalAdv}`, icon: TrendingUp },
          ].map((s) => (
            <Card key={s.label} className="bg-card border-border">
              <CardContent className="pt-4">
                <s.icon className="w-4 h-4 text-primary mb-2" />
                <div className="text-xl font-bold text-foreground">{s.val}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {s.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="space-y-1">
                <Label className="text-xs">From</Label>
                <Input
                  data-ocid="self_view.from_date_input"
                  type="date"
                  className="h-8"
                  value={filterFrom}
                  onChange={(e) => setFilterFrom(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">To</Label>
                <Input
                  data-ocid="self_view.to_date_input"
                  type="date"
                  className="h-8"
                  value={filterTo}
                  onChange={(e) => setFilterTo(e.target.value)}
                />
              </div>
              <Button
                data-ocid="self_view.clear_filter_button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilterFrom("");
                  setFilterTo("");
                }}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Milk Entries */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Milk Collections ({filteredEntries.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-ocid="self_view.table">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    {[
                      "Date",
                      "Session",
                      "Litres",
                      "Fat%",
                      "Rate",
                      "Amount",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2.5 text-xs font-semibold text-muted-foreground text-left last:text-right"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                        data-ocid="self_view.empty_state"
                      >
                        No entries found
                      </td>
                    </tr>
                  )}
                  {filteredEntries.map((e, i) => (
                    <tr
                      key={`${e.date}-${e.session}-${i}`}
                      data-ocid={`self_view.item.${i + 1}`}
                      className="border-b border-border/50 hover:bg-muted/10"
                    >
                      <td className="px-3 py-2">{e.date}</td>
                      <td className="px-3 py-2">
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
                      <td className="px-3 py-2">{e.litres}L</td>
                      <td className="px-3 py-2">{e.fatPercent}%</td>
                      <td className="px-3 py-2">₹{e.ratePerLitre}</td>
                      <td className="px-3 py-2 text-right font-semibold text-primary">
                        ₹{e.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <footer className="border-t border-border py-4 px-4 text-center text-xs text-muted-foreground mt-8">
        © {new Date().getFullYear()} DairyTrace. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
