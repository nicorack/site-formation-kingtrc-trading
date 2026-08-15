import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Play, Clock, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface EnrolledCourse {
  formation: any;
  totalLessons: number;
  completedLessons: number;
  progress: number;
}

const MesFormations = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
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
    // Get confirmed orders
    const { data: orders } = await supabase
      .from("orders")
      .select("formation_id")
      .eq("user_id", user!.id)
      .eq("status", "confirmed");

    if (!orders || orders.length === 0) {
      setLoading(false);
      return;
    }

    const formationIds = orders.map((o) => o.formation_id);

    // Get formations
    const { data: formations } = await supabase
      .from("formations")
      .select("*")
      .in("id", formationIds);

    // Get all lessons for these formations via modules
    const { data: modules } = await supabase
      .from("modules")
      .select("id, formation_id, lessons(id)")
      .in("formation_id", formationIds);

    // Get user progress
    const { data: progress } = await supabase
      .from("lesson_progress")
      .select("lesson_id, completed")
      .eq("user_id", user!.id)
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

      <section className="py-10">
        <div className="container mx-auto px-4">
          {courses.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <BookOpen size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h2 className="mb-2 font-display text-xl font-bold text-foreground">Aucune formation</h2>
              <p className="mb-6 text-muted-foreground">Vous n'avez pas encore de formation confirmée.</p>
              <Button asChild>
                <Link to="/formations">Découvrir les formations</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map(({ formation, totalLessons, completedLessons, progress }) => (
                <div
                  key={formation.id}
                  className="group rounded-xl border border-border bg-card overflow-hidden hover:shadow-card-hover transition-shadow"
                >
                  {formation.image_url && (
                    <img
                      src={formation.image_url}
                      alt={formation.title}
                      className="h-40 w-full object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display font-bold text-foreground line-clamp-2">{formation.title}</h3>
                      <Badge variant={progress === 100 ? "default" : "secondary"} className="shrink-0 text-xs">
                        {progress === 100 ? "Terminé" : `${progress}%`}
                      </Badge>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{completedLessons} / {totalLessons} leçons</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {formation.duration && (
                        <span className="flex items-center gap-1"><Clock size={12} /> {formation.duration}</span>
                      )}
                      {progress === 100 && (
                        <span className="flex items-center gap-1 text-accent"><CheckCircle size={12} /> Complété</span>
                      )}
                    </div>

                    <Button className="w-full" size="sm" asChild>
                      <Link to={`/formations/${formation.id}/learn`}>
                        <Play size={14} className="mr-2" />
                        {progress > 0 && progress < 100 ? "Continuer" : progress === 100 ? "Revoir" : "Commencer"}
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default MesFormations;
