import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { Users, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useI18n } from "@/context/LanguageContext";
import { SITE, formatDual } from "@/lib/site";

const About = () => {
  const { t } = useI18n();

  return (
    <Layout>
      <section className="gradient-hero py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl font-bold text-primary-foreground md:text-4xl"
          >
            {t("about.title")}
          </motion.h1>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto grid max-w-4xl gap-6 px-4 ">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <Users size={28} className="mb-3 text-accent" />
            <h2 className="font-display text-xl font-bold text-foreground">FORMATION SPECIAL</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Formation de base (notions, création de compte, dépôt et retrait), analyse technique avec une stratégie simple pour trader sur le marché, et les secrets du débutant pour devenir rentable. Paiement MVola, puis accès total après validation par l'admin.
            </p>
            <p className="mt-4 font-display font-bold text-accent">Tarif spécial : {formatDual(12000)}</p>
            <div className="mt-4 flex flex-col gap-2">
              <Button asChild>
                <Link to="/formations">Voir la formation</Link>
              </Button>
              <Button variant="ghost" asChild>
                <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">
                  <Phone size={16} className="mr-2" /> {SITE.whatsappDisplay}
                </a>
              </Button>
            </div>
          </motion.article>
        </div>
      </section>
    </Layout>
  );
};

export default About;
