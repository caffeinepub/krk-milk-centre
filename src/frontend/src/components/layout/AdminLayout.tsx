import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  DollarSign,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Milk,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import type { AdminPage } from "../../App";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";

const navItems: { id: AdminPage; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "producers", label: "Producers", icon: Users },
  { id: "milk-collection", label: "Milk Collection", icon: Milk },
  { id: "finance", label: "Finance", icon: DollarSign },
  { id: "weekly-bill", label: "Weekly Bill", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings },
];

interface Props {
  children: React.ReactNode;
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  onLogout: () => void;
}

export default function AdminLayout({
  children,
  currentPage,
  onNavigate,
  onLogout,
}: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { clear } = useInternetIdentity();

  const handleLogout = async () => {
    await clear();
    onLogout();
  };

  const SidebarNav = () => (
    <nav className="flex flex-col h-full">
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <img
            src="/assets/uploads/image-019d2b3e-b53c-75ab-862d-0025b51968e7-1.png"
            alt="KRK Logo"
            className="w-10 h-10 rounded object-cover"
          />
          <span className="font-bold text-lg text-foreground">
            KRK Dairy Trace
          </span>
        </div>
      </div>
      <div className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            data-ocid={`nav.${item.id}_link`}
            onClick={() => {
              onNavigate(item.id);
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentPage === item.id ||
              (currentPage === "producer-detail" && item.id === "producers")
                ? "bg-sidebar-accent text-sidebar-primary"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            }`}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {item.label}
            {(currentPage === item.id ||
              (currentPage === "producer-detail" &&
                item.id === "producers")) && (
              <ChevronRight className="w-3 h-3 ml-auto" />
            )}
          </button>
        ))}
      </div>
      <div className="p-4 border-t border-sidebar-border">
        <div className="text-xs text-muted-foreground mb-3">Admin</div>
        <Button
          data-ocid="nav.logout_button"
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={handleLogout}
        >
          <LogOut className="w-3.5 h-3.5" /> Logout
        </Button>
      </div>
    </nav>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="no-print hidden md:flex flex-col w-56 bg-sidebar border-r border-sidebar-border flex-shrink-0">
        <SidebarNav />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="no-print fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
            role="button"
            tabIndex={-1}
            aria-label="Close sidebar"
          />
          <aside className="absolute left-0 top-0 h-full w-60 bg-sidebar border-r border-sidebar-border">
            <div className="absolute top-3 right-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarNav />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="no-print bg-card border-b border-border px-4 py-3 flex items-center justify-between flex-shrink-0">
          <button
            type="button"
            className="md:hidden p-1.5 rounded-lg hover:bg-accent"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden md:block">
            <span className="text-sm font-semibold text-foreground">
              {navItems.find((n) => n.id === currentPage)?.label ?? "Admin"}
            </span>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <div className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-full">
              Admin Dashboard
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
