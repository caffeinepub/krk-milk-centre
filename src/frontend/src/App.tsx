import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import AdminLayout from "./components/layout/AdminLayout";
import { AppProvider } from "./context/AppContext";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import Landing from "./pages/Landing";
import ProducerSelfView from "./pages/ProducerSelfView";
import Dashboard from "./pages/admin/Dashboard";
import Finance from "./pages/admin/Finance";
import MilkCollection from "./pages/admin/MilkCollection";
import ProducerDetail from "./pages/admin/ProducerDetail";
import Producers from "./pages/admin/Producers";
import WeeklyBill from "./pages/admin/WeeklyBill";

export type AdminPage =
  | "dashboard"
  | "producers"
  | "producer-detail"
  | "milk-collection"
  | "finance"
  | "weekly-bill"
  | "settings";

export default function App() {
  const { identity } = useInternetIdentity();
  const [view, setView] = useState<"landing" | "admin" | "producer-portal">(
    "landing",
  );
  const [adminPage, setAdminPage] = useState<AdminPage>("dashboard");
  const [selectedProducerId, setSelectedProducerId] = useState<bigint | null>(
    null,
  );
  const [selfViewPhone, setSelfViewPhone] = useState("");

  const handleAdminLogin = () => setView("admin");

  const handleProducerLogin = (phone: string) => {
    setSelfViewPhone(phone);
    setView("producer-portal");
  };

  const navigateAdmin = (page: AdminPage, producerId?: bigint) => {
    setAdminPage(page);
    if (producerId !== undefined) setSelectedProducerId(producerId);
  };

  if (view === "producer-portal") {
    return (
      <AppProvider>
        <ProducerSelfView
          phone={selfViewPhone}
          onBack={() => setView("landing")}
        />
        <Toaster />
      </AppProvider>
    );
  }

  if (view === "admin" || identity) {
    return (
      <AppProvider>
        <AdminLayout
          currentPage={adminPage}
          onNavigate={navigateAdmin}
          onLogout={() => setView("landing")}
        >
          {adminPage === "dashboard" && (
            <Dashboard onNavigate={navigateAdmin} />
          )}
          {adminPage === "producers" && (
            <Producers
              onViewProducer={(id) => navigateAdmin("producer-detail", id)}
            />
          )}
          {adminPage === "producer-detail" && selectedProducerId !== null && (
            <ProducerDetail
              producerId={selectedProducerId}
              onBack={() => navigateAdmin("producers")}
            />
          )}
          {adminPage === "milk-collection" && <MilkCollection />}
          {adminPage === "finance" && <Finance />}
          {adminPage === "weekly-bill" && <WeeklyBill />}
          {adminPage === "settings" && (
            <div className="p-8 text-muted-foreground">
              Settings coming soon.
            </div>
          )}
        </AdminLayout>
        <Toaster />
      </AppProvider>
    );
  }

  return (
    <AppProvider>
      <Landing
        onAdminLogin={handleAdminLogin}
        onProducerLogin={handleProducerLogin}
      />
      <Toaster />
    </AppProvider>
  );
}
