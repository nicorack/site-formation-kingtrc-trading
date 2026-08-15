import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Play, FileText, HelpCircle, CheckCircle, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const typeIcons: Record<string, any> = {
  video: Play,
  pdf: FileText,
  quiz: HelpCircle,
};

const CourseViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      toast.error("Veuillez vous connecter");
      navigate("/auth");
      return;
    }
    fetchData();
  }, [id, user, authLoading]);

  const fetchData = async () => {
    // Check confirmed order
    const { data: order } = await supabase
      .from("orders")
      .select("id")
      .eq("user_id", user!.id)
      .eq("formation_id", id!)
      .eq("status", "confirmed")
      .maybeSingle();

    if (!order) {
      // Also allow admin
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: user!.id,
        _role: "admin",
      });
      if (!isAdmin) {
        setHasAccess(false);
        setLoading(false);
        return;
      }
    }

    setHasAccess(true);

    const { data: f } = await supabase
      .from("formations")
      .select("*")
      .eq("id", id!)
      .single();
    setCourse(f);

    const { data: mods } = await supabase
      .from("modules")
      .select("*, lessons(*)")
      .eq("formation_id", id!)
      .order("sort_order");

    const sorted = (mods || []).map((m: any) => ({
      ...m,
      lessons: (m.lessons || []).sort(
        (a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)
      ),
    }));
    setModules(sorted);

    // Auto-select first video lesson
    for (const mod of sorted) {
      for (const les of mod.lessons) {
        if (les.video_url) {
          setActiveLesson(les);
          setLoading(false);
          return;
        }
      }
    }
    if (sorted.length > 0 && sorted[0].lessons?.length > 0) {
      setActiveLesson(sorted[0].lessons[0]);
    }

    // Load progress
    const { data: progressData } = await supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", user!.id)
      .eq("formation_id", id!)
      .eq("completed", true);
    setCompletedLessons(new Set((progressData || []).map((p: any) => p.lesson_id)));

    setLoading(false);
  };

  const toggleLessonComplete = useCallback(async (lessonId: string) => {
    if (!user) return;
    const isCompleted = completedLessons.has(lessonId);
    if (isCompleted) {
      // Can't uncomplete for simplicity, just ignore
      return;
    }
    const { error } = await supabase.from("lesson_progress").upsert({
      user_id: user.id,
      lesson_id: lessonId,
      formation_id: id!,
      completed: true,
      completed_at: new Date().toISOString(),
    }, { onConflict: "user_id,lesson_id" });
    if (!error) {
      setCompletedLessons((prev) => new Set([...prev, lessonId]));
      toast.success("Leçon marquée comme terminée !");
    }
  }, [user, id, completedLessons]);

  const allLessons = modules.flatMap((m: any) => m.lessons || []);
  const totalLessons = allLessons.length;
  const completedCount = allLessons.filter((l: any) => completedLessons.has(l.id)).length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  if (loading || authLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Chargement...</div>
      </Layout>
    );
  }

  if (!hasAccess) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <Lock size={48} className="mx-auto mb-4 text-muted-foreground" />
          <h1 className="mb-2 font-display text-2xl font-bold text-foreground">Accès refusé</h1>
          <p className="mb-6 text-muted-foreground">
            Vous devez acheter cette formation et attendre la confirmation de l'admin pour y accéder.
          </p>
          <Button asChild>
            <Link to={`/formations/${id}`}>Voir la formation</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <Link
          to={`/formations/${id}`}
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} /> Retour à la formation
        </Link>

        <h1 className="mb-2 font-display text-2xl font-bold text-foreground">{course?.title}</h1>

        {/* Progress bar */}
        <div className="mb-6 space-y-1.5">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{completedCount} / {totalLessons} leçons terminées</span>
            <span>{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2.5" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Video Player */}
          <div className="lg:col-span-2 space-y-4">
            {activeLesson?.video_url ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-black">
                <video
                  key={activeLesson.id}
                  controls
                  className="h-full w-full"
                  src={activeLesson.video_url}
                >
                  Votre navigateur ne supporte pas la lecture vidéo.
                </video>
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-xl border border-border bg-secondary">
                <p className="text-muted-foreground">Pas de vidéo pour cette leçon</p>
              </div>
            )}

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display font-semibold text-foreground text-lg">
                    {activeLesson?.title}
                  </h2>
                  {activeLesson?.duration && (
                    <p className="mt-1 text-sm text-muted-foreground">Durée : {activeLesson.duration}</p>
                  )}
                </div>
                {activeLesson && !completedLessons.has(activeLesson.id) && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => toggleLessonComplete(activeLesson.id)}
                  >
                    <CheckCircle size={14} className="mr-1" /> Terminer
                  </Button>
                )}
                {activeLesson && completedLessons.has(activeLesson.id) && (
                  <span className="flex items-center gap-1 text-sm text-accent shrink-0">
                    <CheckCircle size={14} /> Terminée
                  </span>
                )}
              </div>
              {activeLesson?.content && (
                <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">{activeLesson.content}</p>
              )}
            </div>
          </div>

          {/* Sidebar - Lessons list */}
          <div className="space-y-3">
            <h3 className="font-display font-semibold text-foreground">Programme</h3>
            {modules.map((mod: any, mi: number) => (
              <div key={mod.id} className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="bg-secondary px-4 py-2.5">
                  <p className="font-display font-semibold text-foreground text-sm">
                    Module {mi + 1} : {mod.title}
                  </p>
                </div>
                <ul className="divide-y divide-border">
                  {(mod.lessons || []).map((lesson: any) => {
                    const Icon = typeIcons[lesson.type] || Play;
                    const isActive = activeLesson?.id === lesson.id;
                    const isDone = completedLessons.has(lesson.id);
                    return (
                      <li key={lesson.id}>
                        <button
                          onClick={() => setActiveLesson(lesson)}
                          className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/50 ${
                            isActive ? "bg-accent/10 border-l-2 border-accent" : ""
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle size={14} className="shrink-0 text-accent" />
                          ) : isActive ? (
                            <Play size={14} className="shrink-0 text-accent" />
                          ) : (
                            <Circle size={14} className="shrink-0 text-muted-foreground" />
                          )}
                          <span className={`flex-1 text-sm ${isActive ? "text-foreground font-medium" : isDone ? "text-foreground" : "text-muted-foreground"}`}>
                            {lesson.title}
                          </span>
                          {lesson.duration && (
                            <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CourseViewer;
