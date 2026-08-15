import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { Target, TrendingUp, Shield, Lightbulb } from "lucide-react";

const values = [
  { icon: Target, title: "Stratégie", desc: "Des méthodes de trading claires, testées et applicables immédiatement sur les marchés." },
  { icon: TrendingUp, title: "Résultats", desc: "Un apprentissage orienté rentabilité avec une gestion du risque rigoureuse." },
  { icon: Shield, title: "Discipline", desc: "Développez la psychologie du trader gagnant et évitez les pièges émotionnels." },
  { icon: Lightbulb, title: "Innovation", desc: "Des techniques adaptées au Forex, aux indices synthétiques et au trading moderne." },
];

const About = () => (
  <Layout>
    <section className="gradient-hero py-16">
      <div className="container mx-auto px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl font-bold text-primary-foreground md:text-4xl"
        >
          À propos d'Expert en King TRC
        </motion.h1>
        <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/80">
          Nous formons les traders de demain avec des contenus concrets, du coaching pratique et un suivi personnalisé.
        </p>
      </div>
    </section>

    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl space-y-6 text-muted-foreground leading-relaxed">
          <h2 className="font-display text-2xl font-bold text-foreground">Notre mission</h2>
          <p>
            Chez Expert en King TRC, nous croyons que le trading est un métier qui s'apprend. Notre mission est de
            vous donner les outils, les stratégies et la discipline nécessaires pour trader de manière rentable
            et autonome sur le Forex et les indices synthétiques.
          </p>
          <p>
            Que vous soyez débutant complet ou trader cherchant à structurer votre approche, nos formations
            vous accompagnent étape par étape : analyse technique, gestion du risque, psychologie du trader et
            mise en pratique sur les marchés.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl gap-6 sm:grid-cols-2">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="rounded-xl border border-border bg-card p-6"
            >
              <v.icon size={28} className="mb-3 text-accent" />
              <h3 className="font-display font-semibold text-foreground">{v.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </Layout>
);

export default About;
