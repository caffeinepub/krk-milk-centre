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
import { Loader2, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../../context/AppContext";

export default function MilkCollection() {
  const { producers, milkEntries, addMilkEntry, deleteMilkEntry } = useApp();
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    producerId: "",
    date: today,
    session: "Morning" as "Morning" | "Evening" | "Both",
    litres: "",
    litresMorning: "",
    litresEvening: "",
    ratePerLitre: "32",
  });
  const [saving, setSaving] = useState(false);

  const amount =
    form.session !== "Both" && form.litres && form.ratePerLitre
      ? (
          Number.parseFloat(form.litres) * Number.parseFloat(form.ratePerLitre)
        ).toFixed(2)
      : "0.00";

  const todayEntries = useMemo(
    () =>
      milkEntries.filter((e) => e.date === today).sort((a, b) => b.id - a.id),
    [milkEntries, today],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.producerId || !form.ratePerLitre) {
      toast.error("Please fill all fields");
      return;
    }
    if (form.session === "Both") {
      if (!form.litresMorning || !form.litresEvening) {
        toast.error("Please enter litres for both sessions");
        return;
      }
    } else {
      if (!form.litres) {
        toast.error("Please fill all fields");
        return;
      }
    }
    setSaving(true);
    try {
      const pid = BigInt(form.producerId);
      const r = Number.parseFloat(form.ratePerLitre);
      if (form.session === "Both") {
        const lm = Number.parseFloat(form.litresMorning);
        const le = Number.parseFloat(form.litresEvening);
        addMilkEntry({
          producerId: pid,
          date: form.date,
          session: "Morning",
          litres: lm,
          ratePerLitre: r,
          amount: lm * r,
        });
        addMilkEntry({
          producerId: pid,
          date: form.date,
          session: "Evening",
          litres: le,
          ratePerLitre: r,
          amount: le * r,
        });
      } else {
        const l = Number.parseFloat(form.litres);
        addMilkEntry({
          producerId: pid,
          date: form.date,
          session: form.session,
          litres: l,
          ratePerLitre: r,
          amount: l * r,
        });
      }
      toast.success("Milk entry recorded");
      setForm((f) => ({
        ...f,
        producerId: "",
        litres: "",
        litresMorning: "",
        litresEvening: "",
      }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6" data-ocid="milk_collection.page">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Milk Collection</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Record morning and evening milk collections
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add New Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <div className="space-y-2">
              <Label>Producer</Label>
              <Select
                value={form.producerId}
                onValueChange={(v) => setForm((f) => ({ ...f, producerId: v }))}
              >
                <SelectTrigger data-ocid="milk_collection.producer_select">
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
                data-ocid="milk_collection.date_input"
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Session</Label>
              <div className="flex gap-2">
                {(["Morning", "Evening", "Both"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    data-ocid={`milk_collection.${s.toLowerCase()}_toggle`}
                    onClick={() => setForm((f) => ({ ...f, session: s }))}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${
                      form.session === s
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {form.session === "Both" ? (
              <>
                <div className="space-y-2">
                  <Label>Morning Litres</Label>
                  <Input
                    data-ocid="milk_collection.morning_litres_input"
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={form.litresMorning}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, litresMorning: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Evening Litres</Label>
                  <Input
                    data-ocid="milk_collection.evening_litres_input"
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={form.litresEvening}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, litresEvening: e.target.value }))
                    }
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label>Litres</Label>
                <Input
                  data-ocid="milk_collection.litres_input"
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={form.litres}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, litres: e.target.value }))
                  }
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Rate per Litre (₹)</Label>
              <Input
                data-ocid="milk_collection.rate_input"
                type="number"
                step="0.5"
                value={form.ratePerLitre}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ratePerLitre: e.target.value }))
                }
              />
            </div>

            {form.session !== "Both" && (
              <div className="space-y-2">
                <Label>Amount (Auto)</Label>
                <div className="h-10 px-3 flex items-center bg-secondary rounded-lg text-lg font-bold text-primary">
                  ₹{amount}
                </div>
              </div>
            )}

            <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
              <Button
                data-ocid="milk_collection.submit_button"
                type="submit"
                disabled={saving}
                className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-32"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Record Entry"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Today's Entries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Today's Entries — {today}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-ocid="milk_collection.table">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  {["Producer", "Session", "Litres", "Rate", "Amount", ""].map(
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
                {todayEntries.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-10 text-muted-foreground"
                      data-ocid="milk_collection.empty_state"
                    >
                      No entries for today yet
                    </td>
                  </tr>
                )}
                {todayEntries.map((e, i) => {
                  const p = producers.find((p) => p.id === e.producerId);
                  return (
                    <tr
                      key={e.id}
                      data-ocid={`milk_collection.item.${i + 1}`}
                      className="border-b border-border/50 hover:bg-muted/10"
                    >
                      <td className="px-4 py-2.5 font-medium">
                        {p?.producerNumber ?? "?"} — {p?.name ?? "?"}
                      </td>
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
                      <td className="px-4 py-2.5">{e.litres} L</td>
                      <td className="px-4 py-2.5">₹{e.ratePerLitre}</td>
                      <td className="px-4 py-2.5 font-semibold text-primary">
                        ₹{e.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <Button
                          data-ocid={`milk_collection.delete_button.${i + 1}`}
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            deleteMilkEntry(e.id);
                            toast.success("Entry deleted");
                          }}
                          className="text-destructive hover:text-destructive/80 h-7 w-7 p-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
