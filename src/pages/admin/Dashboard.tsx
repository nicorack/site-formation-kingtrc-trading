import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Users, ShoppingCart, Plus, LogOut, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ formations: 0, orders: 0, users: 0, revenue: 0 });

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/");
    }
  }, [loading, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  const fetchStats = async () => {
    const [{ count: fCount }, { count: oCount }, { data: ordersData }] = await Promise.all([
      supabase.from("formations").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "confirmed"),
      supabase.from("orders").select("amount").eq("status", "confirmed"),
    ]);
    const revenue = ordersData?.reduce((sum, o) => sum + o.amount, 0) || 0;
    setStats({
      formations: fCount || 0,
      orders: oCount || 0,
      users: 0,
      revenue,
    });
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Chargement...</div>;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("fr-MG").format(price) + " Ar";

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="flex">
        <aside className="sticky top-0 h-screen w-64 border-r border-border bg-card p-6 hidden md:block">
          <Link to="/" className="mb-8 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-hero">
              <span className="text-lg font-bold text-primary-foreground font-display">K</span>
            </div>
            <span className="text-xl font-bold font-display text-foreground">Expert en King TRC</span>
          </Link>
          <nav className="space-y-1">
            <Link to="/admin" className="flex items-center gap-3 rounded-lg bg-secondary px-3 py-2.5 text-sm font-medium text-foreground">
              <BarChart3 size={18} /> Tableau de bord
            </Link>
            <Link to="/admin/formations" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground">
              <BookOpen size={18} /> Formations
            </Link>
            <Link to="/admin/orders" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground">
              <ShoppingCart size={18} /> Commandes
            </Link>
          </nav>
          <div className="absolute bottom-6 left-6 right-6">
            <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={() => { signOut(); navigate("/"); }}>
              <LogOut size={16} className="mr-2" /> Déconnexion
            </Button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 md:p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">Tableau de bord</h1>
              <p className="text-sm text-muted-foreground">Bienvenue dans l'espace admin Expert en King TRC</p>
            </div>
            <Button className="gradient-accent text-accent-foreground border-0" asChild>
              <Link to="/admin/formations/new"><Plus size={16} className="mr-2" /> Nouvelle formation</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {[
              { label: "Formations", value: stats.formations, icon: BookOpen },
              { label: "Commandes confirmées", value: stats.orders, icon: ShoppingCart },
              { label: "Revenus", value: formatPrice(stats.revenue), icon: BarChart3 },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-accent/10 p-2">
                    <s.icon size={20} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold font-display text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Link to="/admin/formations" className="rounded-xl border border-border bg-card p-6 hover:shadow-card transition-shadow">
              <BookOpen className="mb-3 text-accent" size={24} />
              <h3 className="font-display font-semibold text-foreground mb-1">Gérer les formations</h3>
              <p className="text-sm text-muted-foreground">Ajouter, modifier ou supprimer des formations et vidéos</p>
            </Link>
            <Link to="/admin/orders" className="rounded-xl border border-border bg-card p-6 hover:shadow-card transition-shadow">
              <ShoppingCart className="mb-3 text-accent" size={24} />
              <h3 className="font-display font-semibold text-foreground mb-1">Gérer les commandes</h3>
              <p className="text-sm text-muted-foreground">Confirmer les paiements et gérer les accès</p>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
