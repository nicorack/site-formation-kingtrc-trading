import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { Video, Users, MapPin, MessageCircle, Phone } from "lucide-react";
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
        <div className="container mx-auto grid max-w-4xl gap-6 px-4 md:grid-cols-2">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <Video size={28} className="mb-3 text-accent" />
            <h2 className="font-display text-xl font-bold text-foreground">{t("about.onlineTitle")}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t("about.onlineDesc")}</p>
            <p className="mt-4 font-display font-bold text-accent">{formatDual(22500)}</p>
            <Button className="mt-4 w-full gradient-accent text-accent-foreground border-0" asChild>
              <Link to="/formations">{t("nav.formations")}</Link>
            </Button>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <Users size={28} className="mb-3 text-accent" />
            <h2 className="font-display text-xl font-bold text-foreground">{t("about.salleTitle")}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t("about.salleDesc")}</p>
            <p className="mt-4 font-display font-bold text-accent">{formatDual(225000)}</p>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin size={14} className="text-accent" /> {t("salle.place")} : {SITE.salleLieu}
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <Button variant="outline" asChild>
                <a href={SITE.facebookFormateur} target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={16} className="mr-2" /> {t("salle.button")}
                </a>
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
