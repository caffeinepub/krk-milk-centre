import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Milk, TrendingUp, Users } from "lucide-react";
import { useMemo } from "react";
import type { AdminPage } from "../../App";
import { useApp } from "../../context/AppContext";

interface Props {
  onNavigate: (page: AdminPage) => void;
}

export default function Dashboard({ onNavigate }: Props) {
  const { producers, milkEntries } = useApp();
  const today = new Date().toISOString().split("T")[0];

  const stats = useMemo(() => {
    const todayEntries = milkEntries.filter((e) => e.date === today);
    const todayLitres = todayEntries.reduce((s, e) => s + e.litres, 0);
    const todayAmount = todayEntries.reduce((s, e) => s + e.amount, 0);
    const avgPerLitre = todayLitres > 0 ? todayAmount / todayLitres : 0;
    return { members: producers.length, todayLitres, todayAmount, avgPerLitre };
  }, [producers, milkEntries, today]);

  const recentEntries = useMemo(
    () => [...milkEntries].reverse().slice(0, 10),
    [milkEntries],
  );

  const statCards = [
    {
      title: "Total Members",
      value: stats.members,
      icon: Users,
      suffix: "producers",
      color: "text-primary",
    },
    {
      title: "Today's Milk",
      value: `${stats.todayLitres.toFixed(1)} L`,
      icon: Milk,
      suffix: "litres collected",
      color: "text-chart-2",
    },
    {
      title: "Today's Amount",
      value: `₹${stats.todayAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      icon: TrendingUp,
      suffix: "total earnings",
      color: "text-chart-3",
    },
    {
      title: "Avg per Litre",
      value: `₹${stats.avgPerLitre.toFixed(2)}`,
      icon: TrendingUp,
      suffix: "₹/litre today",
      color: "text-chart-5",
    },
  ];

  return (
    <div className="p-6 space-y-6" data-ocid="dashboard.page">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Daily overview — {today}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <Card
            key={s.title}
            data-ocid={`dashboard.stat.item.${i + 1}`}
            className="bg-card border-border"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {s.title}
                </CardTitle>
                <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {s.value}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {s.suffix}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Entries */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Recent Milk Collections
          </CardTitle>
          <button
            type="button"
            data-ocid="dashboard.milk_collection_link"
            onClick={() => onNavigate("milk-collection")}
            className="text-xs text-primary hover:underline font-medium"
          >
            View All
          </button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {[
                    "Producer",
                    "Date",
                    "Session",
                    "Litres",
                    "Rate",
                    "Amount",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground last:text-right"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentEntries.map((e, i) => {
                  const p = producers.find((prod) => prod.id === e.producerId);
                  return (
                    <tr
                      key={e.id}
                      data-ocid={`dashboard.entry.item.${i + 1}`}
                      className="border-b border-border/50 hover:bg-muted/20"
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold text-primary">
                            {p?.name?.[0] ?? "?"}
                          </div>
                          <span className="font-medium">
                            {p?.producerNumber ?? "?"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {e.date}
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
                      <td className="px-4 py-2.5 font-medium">{e.litres} L</td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        ₹{e.ratePerLitre}
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold text-primary">
                        ₹{e.amount.toFixed(2)}
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
