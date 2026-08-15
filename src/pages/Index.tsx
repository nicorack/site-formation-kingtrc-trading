import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Users, Award, Play, Star, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { CourseCard } from "@/components/CourseCard";
import { testimonials } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import heroBg from "@/assets/hero-bg.jpg";

type Formation = Tables<"formations">;

const stats = [
  { icon: TrendingUp, value: "2", label: "Formations trading" },
  { icon: Users, value: "500+", label: "Traders formés" },
  { icon: Award, value: "95%", label: "Taux de satisfaction" },
  { icon: Play, value: "Accès", label: "À vie en ligne" },
];

const Index = () => {
  const [featuredCourses, setFeaturedCourses] = useState<Formation[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data } = await supabase
        .from("formations")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(3);
      setFeaturedCourses(data || []);
    };
    fetchCourses();
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="absolute inset-0 opacity-20">
          <img src={heroBg} alt="" className="h-full w-full object-cover" width={1920} height={1080} />
        </div>
        <div className="absolute inset-0 gradient-hero opacity-80" />
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <span className="mb-4 inline-block rounded-full bg-accent/20 px-4 py-1.5 text-sm font-medium text-accent">
              🚀 Devenez un trader rentable
            </span>
            <h1 className="mb-6 font-display text-4xl font-bold leading-tight text-primary-foreground md:text-5xl lg:text-6xl">
              Maîtrisez le <span className="text-accent">trading</span> avec Expert en King TRC
            </h1>
            <p className="mb-8 text-lg text-primary-foreground/80 leading-relaxed max-w-lg">
              Formations en ligne et en salle pour apprendre le Forex et les indices synthétiques. Stratégies, gestion du risque et discipline de trader.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="gradient-accent text-accent-foreground border-0 shadow-lg hover:opacity-90 font-semibold" asChild>
                <Link to="/formations">
                  Voir les formations
                  <ArrowRight className="ml-2" size={18} />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <Link to="/a-propos">En savoir plus</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative -mt-12 z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="rounded-xl bg-card p-5 text-center shadow-card border border-border"
              >
                <stat.icon className="mx-auto mb-2 text-accent" size={24} />
                <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-3 font-display text-3xl font-bold text-foreground">
              Nos <span className="text-accent">formations</span>
            </h2>
            <p className="mx-auto max-w-md text-muted-foreground">
              Choisissez la formule qui vous convient et commencez votre parcours de trader dès aujourd'hui.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCourses.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <CourseCard course={course} />
              </motion.div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button variant="outline" size="lg" asChild>
              <Link to="/formations">
                Voir toutes les formations
                <ArrowRight className="ml-2" size={16} />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="bg-secondary/50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-3 font-display text-3xl font-bold text-foreground">
              Pourquoi <span className="text-accent">Expert en King TRC</span> ?
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Stratégies concrètes", desc: "Des setups de trading directement applicables sur les marchés Forex et synthétiques." },
              { title: "Accès à vie", desc: "Achetez une fois la formation en ligne, accédez pour toujours." },
              { title: "Gestion du risque", desc: "Apprenez à protéger votre capital et à trader avec discipline." },
              { title: "Support dédié", desc: "Une équipe disponible sur WhatsApp pour répondre à vos questions." },
              { title: "Mobile friendly", desc: "Apprenez et suivez vos formations depuis votre téléphone ou ordinateur." },
              { title: "Paiement facile", desc: "Payez par MVola en toute simplicité au 038 26 968 25." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="flex gap-4 rounded-xl bg-card p-6 shadow-card border border-border"
              >
                <CheckCircle className="mt-0.5 shrink-0 text-accent" size={20} />
                <div>
                  <h3 className="mb-1 font-display font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-3 font-display text-3xl font-bold text-foreground">
              Ce que disent nos <span className="text-accent">traders</span>
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="rounded-xl bg-card p-6 shadow-card border border-border"
              >
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={14} className="text-warning fill-warning" />
                  ))}
                </div>
                <p className="mb-4 text-sm text-muted-foreground leading-relaxed italic">
                  "{t.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-hero text-xs font-bold text-primary-foreground">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-hero py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 font-display text-3xl font-bold text-primary-foreground">
            Prêt à trader sérieusement ?
          </h2>
          <p className="mx-auto mb-8 max-w-md text-primary-foreground/80">
            Rejoignez les traders qui apprennent avec Expert en King TRC et construisez votre méthode gagnante.
          </p>
          <Button size="lg" className="gradient-accent text-accent-foreground border-0 shadow-lg hover:opacity-90 font-semibold" asChild>
            <Link to="/formations">
              Découvrir les formations
              <ArrowRight className="ml-2" size={18} />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
