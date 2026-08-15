import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, X, BookOpen, ShoppingCart, BarChart3, LogOut, Eye, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatPrice } from "@/lib/data";

interface OrderWithDetails {
  id: string;
  amount: number;
  status: string;
  payment_method: string | null;
  payment_reference: string | null;
  payment_proof_url: string | null;
  created_at: string;
  user_id: string;
  formations: { title: string } | null;
  profiles: { full_name: string | null; phone: string | null } | null;
}

interface CustomerInfo {
  user_id: string;
  full_name: string | null;
  phone: string | null;
  email?: string;
}

const OrdersManager = () => {
  const { isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [customers, setCustomers] = useState<CustomerInfo[]>([]);
  const [activeTab, setActiveTab] = useState<"orders" | "customers">("orders");
  useEffect(() => {
    if (!loading && !isAdmin) navigate("/");
  }, [loading, isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchOrders();
      fetchCustomers();
    }
  }, [isAdmin]);

  const fetchOrders = async () => {
    const { data: ordersData } = await supabase
      .from("orders")
      .select("*, formations(title)")
      .order("created_at", { ascending: false });

    // Fetch profiles for all order user_ids
    const userIds = [...new Set((ordersData || []).map((o: any) => o.user_id))];
    let profilesMap: Record<string, { full_name: string | null; phone: string | null }> = {};
    if (userIds.length > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, full_name, phone")
        .in("user_id", userIds);
      for (const p of profs || []) {
        profilesMap[p.user_id] = { full_name: p.full_name, phone: p.phone };
      }
    }

    setOrders(
      (ordersData || []).map((o: any) => ({
        ...o,
        profiles: profilesMap[o.user_id] || null,
      }))
    );
  };

  const fetchCustomers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("user_id, full_name, phone")
      .order("created_at", { ascending: false });
    setCustomers((data as any) || []);
  };

  const updateStatus = async (orderId: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", orderId);
    toast.success(status === "confirmed" ? "Commande confirmée !" : "Commande annulée");
    fetchOrders();
  };

  const statusColors: Record<string, string> = {
    pending: "bg-warning/10 text-warning",
    confirmed: "bg-success/10 text-success",
    cancelled: "bg-destructive/10 text-destructive",
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Chargement...</div>;

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="sticky top-0 h-screen w-64 border-r border-border bg-card p-6 hidden md:block">
        <Link to="/" className="mb-8 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-hero">
            <span className="text-lg font-bold text-primary-foreground font-display">K</span>
          </div>
          <span className="text-xl font-bold font-display text-foreground">Expert en King TRC</span>
        </Link>
        <nav className="space-y-1">
          <Link to="/admin" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary">
            <BarChart3 size={18} /> Tableau de bord
          </Link>
          <Link to="/admin/formations" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary">
            <BookOpen size={18} /> Formations
          </Link>
          <Link to="/admin/orders" className="flex items-center gap-3 rounded-lg bg-secondary px-3 py-2.5 text-sm font-medium text-foreground">
            <ShoppingCart size={18} /> Commandes
          </Link>
        </nav>
        <div className="absolute bottom-6 left-6 right-6">
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={() => { signOut(); navigate("/"); }}>
            <LogOut size={16} className="mr-2" /> Déconnexion
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-8">
        <h1 className="mb-6 font-display text-2xl font-bold text-foreground">Commandes & Clients</h1>

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          <Button
            variant={activeTab === "orders" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("orders")}
          >
            <ShoppingCart size={14} className="mr-1" /> Commandes
          </Button>
          <Button
            variant={activeTab === "customers" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("customers")}
          >
            <Users size={14} className="mr-1" /> Clients ({customers.length})
          </Button>
        </div>

        {activeTab === "orders" ? (
          <div className="rounded-xl border border-border bg-card overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Formation</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Montant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Paiement</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Preuve</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-foreground">{(o as any).profiles?.full_name || "—"}</div>
                      <div className="text-xs text-muted-foreground">{(o as any).profiles?.phone || ""}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{o.formations?.title || "—"}</td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{formatPrice(o.amount)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{o.payment_method || "—"}</td>
                    <td className="px-4 py-3">
                      {o.payment_proof_url ? (
                        <a href={o.payment_proof_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
                          <Eye size={14} /> Voir
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={statusColors[o.status] || ""}>
                        {o.status === "pending" ? "En attente" : o.status === "confirmed" ? "Confirmé" : "Annulé"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(o.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3">
                      {o.status === "pending" && (
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => updateStatus(o.id, "confirmed")} title="Confirmer">
                            <Check size={16} className="text-success" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => updateStatus(o.id, "cancelled")} title="Annuler">
                            <X size={16} className="text-destructive" />
                          </Button>
                        </div>
                      )}
                      {o.status === "confirmed" && (
                        <Button size="sm" variant="ghost" onClick={() => updateStatus(o.id, "cancelled")} title="Révoquer l'accès" className="text-destructive hover:text-destructive">
                          <X size={14} className="mr-1" /> Révoquer
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">Aucune commande</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Nom</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Téléphone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {customers.map((c) => (
                  <tr key={c.user_id}>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{c.full_name || "—"}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{c.phone || "—"}</td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-4 py-10 text-center text-muted-foreground">Aucun client</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default OrdersManager;
