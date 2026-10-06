import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Clock, Users, Star, BookOpen, Play, FileText, HelpCircle,
  CheckCircle, Phone, MessageCircle, Upload, Image as ImageIcon, MapPin,
  Send, Clock3, LifeBuoy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layout } from "@/components/Layout";
import { formatPrice } from "@/lib/data";
import { SITE, CAT_SALLE, CAT_SPECIAL, formatDual } from "@/lib/site";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/context/LanguageContext";
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
  const { t } = useI18n();
  const [course, setCourse] = useState<Formation | null>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [reference, setReference] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);

  const hasAccess = orderStatus === "confirmed";

  useEffect(() => {
    const fetchCourse = async () => {
      const { data: f } = await supabase.from("formations").select("*").eq("id", id!).maybeSingle();
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

      if (user) {
        const { data: order } = await supabase
          .from("orders")
          .select("status")
          .eq("user_id", user.id)
          .eq("formation_id", id!)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        setOrderStatus(order?.status ?? null);
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
    setOrdering(true);
    try {
      let proofUrl: string | null = null;
      if (proofFile) {
        const ext = proofFile.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("payment-proofs").upload(path, proofFile);
        if (uploadErr) throw uploadErr;
        proofUrl = supabase.storage.from("payment-proofs").getPublicUrl(path).data.publicUrl;
      }

      const { error } = await supabase.from("orders").insert({
        user_id: user.id,
        formation_id: course!.id,
        amount: course!.price,
        payment_method: "mvola",
        payment_reference: reference.trim() || null,
        payment_proof_url: proofUrl,
        status: "pending",
      });
      if (error) throw error;
      setOrderStatus("pending");
      setProofFile(null);
      setProofPreview(null);
      setReference("");
      toast.success(t("pay.pending"));
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

  const isSalle = course.category === CAT_SALLE;
  const isSpecial = course.category === CAT_SPECIAL;
  const totalLessons = modules.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0);

  return (
    <Layout>
      <section className="gradient-hero py-12 md:py-16">
        <div className="container mx-auto px-4">
          <Link to="/formations" className="mb-6 inline-flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
            <ArrowLeft size={16} /> Retour aux formations
          </Link>
          <div className="grid gap-8 lg:grid-cols-3">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge className="bg-accent/20 text-accent border-accent/30">{course.category}</Badge>
                {course.original_price && (
                  <Badge className="gradient-accent border-0 text-accent-foreground text-[10px] uppercase tracking-wider">
                    Promo
                  </Badge>
                )}
              </div>
              <h1 className="mb-4 font-display text-3xl font-bold text-primary-foreground md:text-4xl leading-tight">
                {course.title}
              </h1>
              <p className="mb-6 text-primary-foreground/80 leading-relaxed">{course.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-primary-foreground/70">
                <span className="flex items-center gap-1"><Star size={14} className="text-warning fill-warning" /> {course.rating}</span>
                <span className="flex items-center gap-1"><Users size={14} /> {course.students_count} apprenants</span>
                {course.duration && <span className="flex items-center gap-1"><Clock size={14} /> {course.duration}</span>}
                <span className="flex items-center gap-1"><BookOpen size={14} /> {totalLessons} leçons</span>
                <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground">{course.level}</Badge>
                {isSalle && (
                  <span className="flex items-center gap-1"><MapPin size={14} /> {SITE.salleLieu}</span>
                )}
              </div>
              <p className="mt-3 text-sm text-primary-foreground/60">Par {course.instructor}</p>
            </motion.div>

            {/* Side card */}
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
                <p className="text-2xl font-bold font-display text-accent">{formatDual(course.price)}</p>
                {course.original_price && (
                  <span className="mt-1 inline-block rounded-full gradient-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">
                    Tarif promo
                  </span>
                )}
              </div>

              {isSalle ? (
                /* ---------- FORMATION EN SALLE ---------- */
                <div className="space-y-3">
                  <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
                    <p className="mb-1 font-display text-sm font-semibold text-foreground">{t("salle.title")}</p>
                    <p className="mb-2 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin size={14} className="text-accent" /> {t("salle.place")} : <strong className="text-foreground">{SITE.salleLieu}</strong>
                    </p>
                    <p className="text-sm text-muted-foreground">{t("salle.invite")}</p>
                  </div>
                  <Button className="w-full gradient-accent text-accent-foreground border-0 font-semibold" size="lg" asChild>
                    <a href={SITE.facebookFormateur} target="_blank" rel="noopener noreferrer">
                      <MessageCircle size={18} className="mr-2" /> {t("salle.button")}
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <a href={`tel:+261${SITE.whatsappDisplay.replace(/\s|^0/g, "")}`}>
                      <Phone size={16} className="mr-2" /> {SITE.whatsappDisplay}
                    </a>
                  </Button>
                </div>
              ) : hasAccess ? (
                /* ---------- ACCÈS DÉBLOQUÉ ---------- */
                <div className="space-y-3">
                  <div className="rounded-lg border border-success/30 bg-success/10 p-4">
                    <p className="flex items-center gap-2 font-display text-sm font-semibold text-success">
                      <CheckCircle size={16} /> {t("pay.approved")}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {isSpecial
                        ? "Accès total débloqué — retrouvez toutes les leçons dans votre espace client."
                        : t("telegram.desc")}
                    </p>
                  </div>
                  {isSpecial ? (
                    <Button className="w-full bg-success text-white border-0 font-semibold hover:bg-success/90" size="lg" asChild>
                      <Link to={`/formations/${course.id}/learn`}>
                        <Play size={18} className="mr-2" /> Accéder à la formation
                      </Link>
                    </Button>
                  ) : (
                    <Button className="w-full bg-success text-white border-0 font-semibold hover:bg-success/90" size="lg" asChild>
                      <a href={SITE.telegram} target="_blank" rel="noopener noreferrer">
                        <Send size={18} className="mr-2" /> {t("telegram.button")}
                      </a>
                    </Button>
                  )}

                </div>
              ) : orderStatus === "pending" ? (
                /* ---------- EN ATTENTE ---------- */
                <div className="rounded-lg border border-warning/30 bg-warning/10 p-4">
                  <p className="flex items-center gap-2 font-display text-sm font-semibold text-warning">
                    <Clock3 size={16} /> {t("pay.pending")}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{t("pay.wait")}</p>
                </div>
              ) : (
                /* ---------- PAIEMENT MVOLA ---------- */
                <div className="space-y-3">
                  <div className="rounded-lg bg-accent/5 border border-accent/20 p-4">
                    <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Phone size={14} className="text-accent" /> {t("pay.title")}
                    </p>
                    <p className="mb-1 text-sm text-muted-foreground">
                      {t("pay.send")} <span className="font-bold text-accent">{formatDual(course.price)}</span> {t("pay.to")} :
                    </p>
                    <p className="text-lg font-bold font-display text-foreground">{SITE.mvolaNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("pay.name")} : <strong>{SITE.mvolaName}</strong>
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="ref" className="text-xs">{t("pay.reference")}</Label>
                    <Input
                      id="ref"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="Ex : 123456789"
                      maxLength={100}
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="flex items-center gap-1 text-xs font-semibold text-foreground">
                      <Upload size={12} className="text-accent" /> {t("pay.proof")}
                    </p>
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-accent/30 bg-accent/5 p-3 text-sm text-muted-foreground hover:border-accent/50 hover:bg-accent/10 transition-colors">
                      <ImageIcon size={16} className="text-accent" />
                      {proofFile ? proofFile.name : t("pay.attach")}
                      <input type="file" accept="image/*" className="hidden" onChange={handleProofSelect} />
                    </label>
                    {proofPreview && (
                      <img src={proofPreview} alt="Preuve de paiement" className="mt-2 max-h-32 w-full rounded-lg border border-border object-contain" />
                    )}
                  </div>

                  <Button
                    className="w-full gradient-accent text-accent-foreground border-0 font-semibold shadow-lg hover:opacity-90"
                    size="lg"
                    onClick={handleOrder}
                    disabled={ordering}
                  >
                    {ordering ? "Envoi en cours..." : t("pay.submit")}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">{t("pay.wait")}</p>
                </div>
              )}

              {/* Support */}
              <div className="mt-5 rounded-lg border border-border bg-secondary p-4">
                <p className="flex items-center gap-2 font-display text-sm font-semibold text-foreground">
                  <LifeBuoy size={14} className="text-accent" /> {t("support.title")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{t("support.desc")}</p>
                <Button variant="outline" size="sm" className="mt-3 w-full" asChild>
                  <a href={SITE.facebookFormateur} target="_blank" rel="noopener noreferrer">
                    <MessageCircle size={14} className="mr-2" /> {t("support.button")}
                  </a>
                </Button>
                <Button variant="ghost" size="sm" className="mt-1 w-full" asChild>
                  <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">
                    <MessageCircle size={14} className="mr-2" /> WhatsApp {SITE.whatsappDisplay}
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-12">
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
