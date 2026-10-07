import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Play, Clock, CheckCircle, Loader2, BellRing, Send, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

import { CAT_SPECIAL } from "@/lib/site";

interface EnrolledCourse {
  formation: any;
  totalLessons: number;
  completedLessons: number;
  progress: number;
}

interface ApprovalNotice {
  orderId: string;
  title: string;
  category: string;
  approvedAt: string;
  drive: string | null;
  telegram: string | null;
  telegram2: string | null;
}


const MesFormations = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [notices, setNotices] = useState<ApprovalNotice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchEnrolledCourses();
  }, [user, authLoading]);

  const fetchEnrolledCourses = async () => {
    if (!user) return;
    // Get confirmed orders
    const { data: allOrders } = await supabase
      .from("orders")
      .select("id, formation_id, updated_at, formations(title, category)")
      .eq("user_id", user.id)
      .eq("status", "confirmed")
      .order("updated_at", { ascending: false });

    const orders = (allOrders || []).filter((order) => order.formations?.category === CAT_SPECIAL);

    const { data: linkRows } = await supabase
      .from("formation_links")
      .select("formation_id, drive_url, telegram_url, telegram_url_2")
      .in("formation_id", (orders || []).map((o) => o.formation_id));
    const linkMap = new Map((linkRows || []).map((l) => [l.formation_id, l]));

    setNotices(
      (orders || []).map((o: any) => ({
        orderId: o.id,
        title: o.formations?.title || "Formation",
        category: o.formations?.category || "",
        approvedAt: o.updated_at,
        drive: linkMap.get(o.formation_id)?.drive_url || null,
        telegram: linkMap.get(o.formation_id)?.telegram_url || null,
        telegram2: linkMap.get(o.formation_id)?.telegram_url_2 || null,
      }))
    );


    if (!orders || orders.length === 0) {
      setLoading(false);
      return;
    }

    const formationIds = orders.map((o) => o.formation_id);

    // Get formations
    const { data: formations } = await supabase
      .from("formations")
      .select("*")
      .in("id", formationIds)
      .eq("category", CAT_SPECIAL);

    // Get all lessons for these formations via modules
    const { data: modules } = await supabase
      .from("modules")
      .select("id, formation_id, lessons(id)")
      .in("formation_id", formationIds);

    // Get user progress
    const { data: progress } = await supabase
      .from("lesson_progress")
      .select("lesson_id, completed")
      .eq("user_id", user.id)
      .eq("completed", true);

    const completedSet = new Set((progress || []).map((p: any) => p.lesson_id));

    const enrolled: EnrolledCourse[] = (formations || []).map((f: any) => {
      const fModules = (modules || []).filter((m: any) => m.formation_id === f.id);
      const lessonIds = fModules.flatMap((m: any) => (m.lessons || []).map((l: any) => l.id));
      const totalLessons = lessonIds.length;
      const completedLessons = lessonIds.filter((id: string) => completedSet.has(id)).length;
      return {
        formation: f,
        totalLessons,
        completedLessons,
        progress: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
      };
    });

    setCourses(enrolled);
    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="gradient-hero py-10">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl font-bold text-primary-foreground">Mon espace apprenant</h1>
          <p className="mt-2 text-primary-foreground/70">Suivez votre progression et continuez vos formations</p>
        </div>
      </section>

      {notices.length > 0 && (
        <section className="pt-8">
          <div className="container mx-auto px-4 space-y-3">
            {notices.map((n) => (
              <div
                key={n.orderId}
                className="rounded-xl border border-success/30 bg-success/5 p-4 sm:p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                      <BellRing size={18} />
                    </span>
                    <div>
                      <p className="font-medium text-foreground">
                        Paiement approuvé — accès débloqué : {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Approuvé le{" "}
                        {new Date(n.approvedAt).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}{" "}
                        à{" "}
                        {new Date(n.approvedAt).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {n.drive && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={n.drive} target="_blank" rel="noopener noreferrer">
                          <FileText size={14} className="mr-2" /> Lien Drive
                        </a>
                      </Button>
                    )}
                    {n.telegram && (
                      <Button size="sm" asChild>
                        <a href={n.telegram} target="_blank" rel="noopener noreferrer">
                          <Send size={14} className="mr-2" /> Ouvrir groupe Telegram
                        </a>
                      </Button>
                    )}
                    {n.telegram2 && (
                      <Button size="sm" asChild>
                        <a href={n.telegram2} target="_blank" rel="noopener noreferrer">
                          <Send size={14} className="mr-2" /> Ouvrir groupe Telegram 2
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {notices.length === 0 && (
        <section className="py-10">
          <div className="container mx-auto px-4">
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <BookOpen size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h2 className="mb-2 font-display text-xl font-bold text-foreground">Aucune formation</h2>
              <p className="mb-6 text-muted-foreground">Vous n'avez pas encore de formation confirmée.</p>
              <Button asChild>
                <Link to="/formations">Découvrir les formations</Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default MesFormations;
