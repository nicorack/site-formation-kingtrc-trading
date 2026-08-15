import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, ArrowLeft, BookOpen, ShoppingCart, BarChart3, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatPrice } from "@/lib/data";
import type { Tables } from "@/integrations/supabase/types";

type Formation = Tables<"formations">;

const FormationManager = () => {
  const { isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [formations, setFormations] = useState<Formation[]>([]);

  useEffect(() => {
    if (!loading && !isAdmin) navigate("/");
  }, [loading, isAdmin]);

  useEffect(() => {
    if (isAdmin) fetchFormations();
  }, [isAdmin]);

  const fetchFormations = async () => {
    const { data } = await supabase
      .from("formations")
      .select("*")
      .order("created_at", { ascending: false });
    setFormations(data || []);
  };

  const deleteFormation = async (id: string) => {
    if (!confirm("Supprimer cette formation ?")) return;
    await supabase.from("formations").delete().eq("id", id);
    toast.success("Formation supprimée");
    fetchFormations();
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
          <Link to="/admin" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground">
            <BarChart3 size={18} /> Tableau de bord
          </Link>
          <Link to="/admin/formations" className="flex items-center gap-3 rounded-lg bg-secondary px-3 py-2.5 text-sm font-medium text-foreground">
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

      <main className="flex-1 p-6 md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-foreground">Formations</h1>
          <Button className="gradient-accent text-accent-foreground border-0" asChild>
            <Link to="/admin/formations/new"><Plus size={16} className="mr-2" /> Nouvelle formation</Link>
          </Button>
        </div>

        <div className="space-y-3">
          {formations.map((f) => (
            <div key={f.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
              {f.image_url && (
                <img src={f.image_url} alt={f.title} className="h-16 w-24 rounded-lg object-cover" />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold text-foreground truncate">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.category} • {formatPrice(f.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs ${f.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                  {f.is_active ? "Actif" : "Inactif"}
                </span>
                <Button variant="ghost" size="icon" asChild>
                  <Link to={`/admin/formations/${f.id}`}><Pencil size={16} /></Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deleteFormation(f.id)}>
                  <Trash2 size={16} className="text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          {formations.length === 0 && (
            <p className="py-10 text-center text-muted-foreground">Aucune formation. Créez-en une !</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default FormationManager;
