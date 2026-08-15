import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Users, Star, BookOpen, Play, FileText, HelpCircle, CheckCircle, Phone, MessageCircle, Upload, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/Layout";
import { formatPrice } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Formation = Tables<"formations">;

const typeIcons: Record<string, any> = {
  video: Play,
  pdf: FileText,
  quiz: HelpCircle,
};

const FormationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<Formation | null>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      const { data: f } = await supabase
        .from("formations")
        .select("*")
        .eq("id", id!)
        .single();
      setCourse(f);

      if (f) {
        const { data: mods } = await supabase
          .from("modules")
          .select("*, lessons(*)")
          .eq("formation_id", f.id)
          .order("sort_order");
        setModules(
          (mods || []).map((m: any) => ({
            ...m,
            lessons: (m.lessons || []).sort(
              (a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)
            ),
          }))
        );
      }

      // Check if user has confirmed access
      if (user) {
        const { data: order } = await supabase
          .from("orders")
          .select("id")
          .eq("user_id", user.id)
          .eq("formation_id", id!)
          .eq("status", "confirmed")
          .maybeSingle();
        setHasAccess(!!order);
      }

      setLoading(false);
    };
    fetchCourse();
  }, [id, user]);

  const handleProofSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
      setProofPreview(URL.createObjectURL(file));
    }
  };

  const handleOrder = async () => {
    if (!user) {
      toast.error("Veuillez vous connecter d'abord");
      navigate("/auth");
      return;
    }
    if (!proofFile) {
      toast.error("Veuillez joindre la preuve de paiement (capture d'écran)");
      return;
    }
    setOrdering(true);
    try {
      // Upload proof image
      const ext = proofFile.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("payment-proofs").upload(path, proofFile);
      if (uploadErr) throw uploadErr;
      const { data: urlData } = supabase.storage.from("payment-proofs").getPublicUrl(path);

      const { error } = await supabase.from("orders").insert({
        user_id: user.id,
        formation_id: course!.id,
        amount: course!.price,
        payment_method: "mvola",
        payment_proof_url: urlData.publicUrl,
        status: "pending",
      });
      if (error) throw error;
      toast.success(
        "Commande créée avec preuve de paiement ! L'admin va confirmer votre accès."
      );
      setProofFile(null);
      setProofPreview(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Chargement...</div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="mb-4 font-display text-2xl font-bold text-foreground">Formation non trouvée</h1>
          <Button asChild><Link to="/formations">Retour au catalogue</Link></Button>
        </div>
      </Layout>
    );
  }

  const totalLessons = modules.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0);

  return (
    <Layout>
      {/* Header */}
      <section className="gradient-hero py-12 md:py-16">
        <div className="container mx-auto px-4">
          <Link to="/formations" className="mb-6 inline-flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
            <ArrowLeft size={16} /> Retour aux formations
          </Link>
          <div className="grid gap-8 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2"
            >
              <Badge className="mb-3 bg-accent/20 text-accent border-accent/30">{course.category}</Badge>
              <h1 className="mb-4 font-display text-3xl font-bold text-primary-foreground md:text-4xl leading-tight">
                {course.title}
              </h1>
              <p className="mb-6 text-primary-foreground/80 leading-relaxed">{course.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-primary-foreground/70">
                <span className="flex items-center gap-1"><Star size={14} className="text-warning fill-warning" /> {course.rating}</span>
                <span className="flex items-center gap-1"><Users size={14} /> {course.students_count} apprenants</span>
                <span className="flex items-center gap-1"><Clock size={14} /> {course.duration}</span>
                <span className="flex items-center gap-1"><BookOpen size={14} /> {totalLessons} leçons</span>
                <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground">{course.level}</Badge>
              </div>
              <p className="mt-3 text-sm text-primary-foreground/60">Par {course.instructor}</p>
            </motion.div>

            {/* Price card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl bg-card p-6 shadow-card-hover border border-border self-start"
            >
              <div className="mb-4">
                {course.original_price && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(course.original_price)}
                  </span>
                )}
                <p className="text-3xl font-bold font-display text-accent">{formatPrice(course.price)}</p>
              </div>
              {hasAccess ? (
                <Button
                  className="w-full bg-success text-white border-0 font-semibold shadow-lg hover:bg-success/90"
                  size="lg"
                  onClick={() => navigate(`/formations/${course.id}/learn`)}
                >
                  <Play size={18} className="mr-2" /> Accéder au cours
                </Button>
              ) : (
                <Button
                  className="w-full gradient-accent text-accent-foreground border-0 font-semibold shadow-lg hover:opacity-90"
                  size="lg"
                  onClick={handleOrder}
                  disabled={ordering}
                >
                  {ordering ? "Commande en cours..." : "Acheter la formation"}
                </Button>
              )}
              <p className="mt-3 text-center text-xs text-muted-foreground">Accès à vie après validation • Support WhatsApp</p>

              {/* MVola Payment Info */}
              <div className="mt-4 rounded-lg bg-accent/5 border border-accent/20 p-4">
                <p className="mb-2 text-sm font-semibold text-foreground flex items-center gap-2">
                  <Phone size={14} className="text-accent" /> Paiement MVola
                </p>
                <p className="text-sm text-muted-foreground mb-1">
                  Envoyez <span className="font-bold text-accent">{formatPrice(course.price)}</span> au :
                </p>
                  <p className="text-lg font-bold font-display text-foreground">038 26 968 25</p>
                  <p className="text-xs text-muted-foreground">Nom : <strong>Nico</strong></p>

                  {/* Payment proof upload */}
                  {!hasAccess && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                        <Upload size={12} className="text-accent" /> Preuve de paiement (capture d'écran)
                      </p>
                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-accent/30 bg-accent/5 p-3 text-sm text-muted-foreground hover:border-accent/50 hover:bg-accent/10 transition-colors">
                        <Image size={16} className="text-accent" />
                        {proofFile ? proofFile.name : "Cliquez pour joindre la capture"}
                        <input type="file" accept="image/*" className="hidden" onChange={handleProofSelect} />
                      </label>
                      {proofPreview && (
                        <img src={proofPreview} alt="Preuve" className="mt-2 rounded-lg border border-border max-h-32 w-full object-contain" />
                      )}
                    </div>
                  )}
                </div>

              <div className="mt-4 rounded-lg bg-secondary p-4">
                <p className="mb-2 text-sm font-semibold text-foreground">Ce cours inclut :</p>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2"><CheckCircle size={12} className="text-accent" /> Accès à vie à la formation</li>
                  <li className="flex items-center gap-2"><Play size={12} className="text-accent" /> Vidéos et contenus ajoutés par l'admin</li>
                  <li className="flex items-center gap-2"><MessageCircle size={12} className="text-accent" /> Support via WhatsApp</li>
                  <li className="flex items-center gap-2"><CheckCircle size={12} className="text-accent" /> Validation manuelle du paiement</li>
                </ul>
              </div>

              {/* WhatsApp */}
              <a
                href="https://wa.me/261382696825"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-success/10 p-3 text-sm font-medium text-success hover:bg-success/20 transition-colors"
              >
                <MessageCircle size={16} /> Contacter sur WhatsApp
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-12">
              {/* Objectives */}
              {course.objectives && course.objectives.length > 0 && (
                <div>
                  <h2 className="mb-4 font-display text-xl font-bold text-foreground">Objectifs pédagogiques</h2>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {course.objectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle size={16} className="mt-0.5 shrink-0 text-accent" />
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Programme */}
              {modules.length > 0 && (
                <div>
                  <h2 className="mb-4 font-display text-xl font-bold text-foreground">Programme de la formation</h2>
                  <div className="space-y-3">
                    {modules.map((mod: any, mi: number) => (
                      <div key={mod.id} className="rounded-xl border border-border bg-card overflow-hidden">
                        <div className="flex items-center justify-between bg-secondary px-5 py-3">
                          <h3 className="font-display font-semibold text-foreground text-sm">
                            Module {mi + 1} : {mod.title}
                          </h3>
                          <span className="text-xs text-muted-foreground">{mod.lessons?.length || 0} leçons</span>
                        </div>
                        <ul className="divide-y divide-border">
                          {(mod.lessons || []).map((lesson: any) => {
                            const Icon = typeIcons[lesson.type] || Play;
                            return (
                              <li key={lesson.id} className="flex items-center gap-3 px-5 py-3">
                                <Icon size={14} className="shrink-0 text-accent" />
                                <span className="flex-1 text-sm text-foreground">{lesson.title}</span>
                                <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cover image */}
              {course.image_url && (
                <div className="rounded-xl overflow-hidden border border-border">
                  <img src={course.image_url} alt={course.title} className="w-full object-cover aspect-video" loading="lazy" width={800} height={450} />
                </div>
              )}
            </div>
            <div className="hidden lg:block" />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default FormationDetail;
