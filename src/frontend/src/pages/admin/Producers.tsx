import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Eye, Search, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../../context/AppContext";

interface Props {
  onViewProducer: (id: bigint) => void;
}

export default function Producers({ onViewProducer }: Props) {
  const { producers, addProducer, toggleSelfView, deleteProducer } = useApp();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ producerNumber: "", name: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<bigint | null>(null);

  const filtered = producers.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.producerNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search),
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.producerNumber) {
      toast.error("Please fill all fields");
      return;
    }
    setSaving(true);
    try {
      addProducer({ ...form, canSelfView: false });
      toast.success(`Producer ${form.name} added successfully`);
      setForm({ producerNumber: "", name: "", phone: "" });
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: bigint, val: boolean) => {
    toggleSelfView(id, val);
    toast.success(`Self-view ${val ? "enabled" : "disabled"}`);
  };

  const handleDelete = (id: bigint) => {
    deleteProducer(id);
    setConfirmDeleteId(null);
    toast.success("Producer removed");
  };

  const producerToDelete = confirmDeleteId
    ? producers.find((p) => p.id === confirmDeleteId)
    : null;

  return (
    <div className="p-6 space-y-5" data-ocid="producers.page">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Producers</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {producers.length} registered producers
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              data-ocid="producers.open_modal_button"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <UserPlus className="w-4 h-4 mr-2" /> Add Producer
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid="producers.dialog">
            <DialogHeader>
              <DialogTitle>Add New Producer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Producer Number</Label>
                <Input
                  data-ocid="producers.producernumber_input"
                  placeholder="e.g. P007"
                  value={form.producerNumber}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, producerNumber: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  data-ocid="producers.name_input"
                  placeholder="Producer name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  data-ocid="producers.phone_input"
                  type="tel"
                  placeholder="10-digit phone"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  data-ocid="producers.cancel_button"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  data-ocid="producers.submit_button"
                  type="submit"
                  disabled={saving}
                  className="bg-primary text-primary-foreground"
                >
                  {saving ? "Adding..." : "Add Producer"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Confirm Delete Dialog */}
      <Dialog
        open={!!confirmDeleteId}
        onOpenChange={(v) => !v && setConfirmDeleteId(null)}
      >
        <DialogContent data-ocid="producers.delete.dialog">
          <DialogHeader>
            <DialogTitle>Delete Producer</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to remove{" "}
            <span className="font-semibold text-foreground">
              {producerToDelete?.name}
            </span>{" "}
            ({producerToDelete?.producerNumber})? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="producers.delete.cancel_button"
              onClick={() => setConfirmDeleteId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              data-ocid="producers.delete.confirm_button"
              onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          data-ocid="producers.search_input"
          placeholder="Search by name, number or phone..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-ocid="producers.table">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                  No.
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                  Phone
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">
                  Self View
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-10 text-muted-foreground"
                    data-ocid="producers.empty_state"
                  >
                    No producers found
                  </td>
                </tr>
              )}
              {filtered.map((p, i) => (
                <tr
                  key={String(p.id)}
                  data-ocid={`producers.item.${i + 1}`}
                  className="border-b border-border/50 hover:bg-muted/20 cursor-pointer"
                  onClick={() => onViewProducer(p.id)}
                  onKeyDown={(e) => e.key === "Enter" && onViewProducer(p.id)}
                  tabIndex={0}
                >
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className="font-mono text-primary border-primary/30"
                    >
                      {p.producerNumber}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold text-primary">
                        {p.name[0]}
                      </div>
                      <span className="font-medium text-foreground">
                        {p.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.phone}</td>
                  <td
                    className="px-4 py-3 text-center"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <Switch
                      data-ocid={`producers.selfview.switch.${i + 1}`}
                      checked={p.canSelfView}
                      onCheckedChange={(v) => handleToggle(p.id, v)}
                    />
                  </td>
                  <td
                    className="px-4 py-3 text-right"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        data-ocid={`producers.view_button.${i + 1}`}
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewProducer(p.id);
                        }}
                        className="text-primary hover:text-primary/80"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        data-ocid={`producers.delete_button.${i + 1}`}
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(p.id);
                        }}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
