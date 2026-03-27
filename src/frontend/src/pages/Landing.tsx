import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BarChart2,
  FileText,
  Leaf,
  Milk,
  Shield,
  Smartphone,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface Props {
  onAdminLogin: () => void;
  onProducerLogin: (phone: string) => void;
}

const features = [
  {
    icon: Milk,
    title: "Milk Collection",
    desc: "Track morning & evening collections with fat % and rate per litre.",
  },
  {
    icon: BarChart2,
    title: "Finance Management",
    desc: "Manage loans, advances, and repayments for each producer.",
  },
  {
    icon: FileText,
    title: "Weekly Bills",
    desc: "Auto-generate A4 bills with full transaction breakdown every 7 days.",
  },
  {
    icon: Smartphone,
    title: "Producer Portal",
    desc: "Producers can view their own account history via phone number.",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    desc: "Admin controls all data; producers see only their own records.",
  },
  {
    icon: BarChart2,
    title: "60+ Members",
    desc: "Designed for milk centers with large producer networks.",
  },
];

export default function Landing({ onAdminLogin, onProducerLogin }: Props) {
  const [tab, setTab] = useState<"admin" | "producer">("admin");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, loginStatus } = useInternetIdentity();

  const handleAdminLogin = async () => {
    try {
      await login();
      onAdminLogin();
    } catch {
      onAdminLogin();
    }
  };

  const handleProducerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    setLoading(true);
    try {
      onProducerLogin(phone.trim());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between no-print">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Leaf className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">DairyTrace</span>
        </div>
        <span className="text-sm text-muted-foreground">
          Milk Collection Management
        </span>
      </header>

      {/* Hero */}
      <section className="bg-secondary py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Leaf className="w-3.5 h-3.5" /> Trusted by 60+ Producers
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
            Smart Milk Collection
            <br />
            <span className="text-primary">Center Management</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Track daily milk collections, manage producer finances, generate
            weekly bills, and empower producers with self-service access.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              onClick={() => setTab("admin")}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Admin Login
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setTab("producer")}
              className="border-primary text-primary hover:bg-accent"
            >
              Producer Login
            </Button>
          </div>
        </div>
      </section>

      {/* Login Card */}
      <section className="py-12 px-6">
        <div className="max-w-md mx-auto">
          <Card className="shadow-md border-border">
            <CardHeader>
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  data-ocid="login.admin_tab"
                  onClick={() => setTab("admin")}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    tab === "admin"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  Admin Login
                </button>
                <button
                  type="button"
                  data-ocid="login.producer_tab"
                  onClick={() => setTab("producer")}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    tab === "producer"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  Producer Login
                </button>
              </div>
              <CardTitle className="text-lg">
                {tab === "admin" ? "Admin Dashboard" : "Producer Self-View"}
              </CardTitle>
              <CardDescription>
                {tab === "admin"
                  ? "Login with Internet Identity to manage your milk collection center."
                  : "Enter your registered phone number to view your account."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tab === "admin" ? (
                <Button
                  data-ocid="login.admin_button"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleAdminLogin}
                  disabled={loginStatus === "logging-in"}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {loginStatus === "logging-in"
                    ? "Logging in..."
                    : "Login with Internet Identity"}
                </Button>
              ) : (
                <form onSubmit={handleProducerLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      data-ocid="login.phone_input"
                      id="phone"
                      type="tel"
                      placeholder="Enter your 10-digit phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <Button
                    data-ocid="login.producer_button"
                    type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={loading}
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    {loading ? "Checking..." : "View My Account"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 px-6 bg-card border-t border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-foreground mb-8">
            Everything You Need
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-5 rounded-xl border border-border bg-background hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center mb-3">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-6 px-6 text-center text-sm text-muted-foreground">
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
