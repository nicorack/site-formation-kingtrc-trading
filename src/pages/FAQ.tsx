import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";

const faqs = [
  {
    q: "Quelles formations proposez-vous ?",
    a: "Nous proposons deux formations : la Formation Trading en Ligne (promotion week-end à 5$ / 22 500 Ar) et la Formation Trading en Salle à Fianarantsoa (50$ / 225 000 Ar).",
  },
  {
    q: "Comment acheter une formation ?",
    a: "Choisissez votre formation, cliquez sur « Acheter la formation », envoyez le montant via MVola au 038 26 968 25, puis joignez votre capture d'écran. L'admin confirmera votre accès.",
  },
  {
    q: "Quels modes de paiement acceptez-vous ?",
    a: "Nous acceptons le paiement par MVola au 038 26 968 25. Vous pouvez aussi nous contacter sur WhatsApp pour d'autres arrangements.",
  },
  {
    q: "Combien de temps faut-il pour avoir accès après le paiement ?",
    a: "Votre accès est généralement activé dans les 24 heures après confirmation de votre paiement.",
  },
  {
    q: "Est-ce que j'ai un accès à vie aux formations en ligne ?",
    a: "Oui ! Une fois votre paiement confirmé, vous avez un accès illimité à la formation en ligne achetée.",
  },
  {
    q: "Où se déroule la formation en salle ?",
    a: "La formation en salle se déroule à Fianarantsoa. Les détails précis (date, lieu exact) vous seront communiqués après votre inscription.",
  },
  {
    q: "Comment contacter le support ?",
    a: "Vous pouvez nous contacter sur WhatsApp au 038 26 968 25, par email à tradingtrc4@gmail.com, ou via la page Contact.",
  },
  {
    q: "Comment puis-je me connecter à mon compte ?",
    a: "Cliquez sur « Connexion » en haut à droite, entrez votre email et mot de passe. Si vous n'avez pas encore de compte, inscrivez-vous d'abord.",
  },
];

const FAQ = () => (
  <Layout>
    <section className="gradient-hero py-16">
      <div className="container mx-auto px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl font-bold text-primary-foreground md:text-4xl"
        >
          Questions fréquentes
        </motion.h1>
        <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
          Retrouvez les réponses aux questions les plus posées par nos traders.
        </p>
      </div>
    </section>

    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="rounded-xl border border-border bg-card px-6 overflow-hidden"
              >
                <AccordionTrigger className="text-left font-display font-semibold text-foreground hover:no-underline py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 rounded-xl border border-border bg-card p-8 text-center">
            <p className="mb-2 font-display font-semibold text-foreground">Vous n'avez pas trouvé votre réponse ?</p>
            <p className="mb-4 text-sm text-muted-foreground">Contactez-nous directement sur WhatsApp</p>
            <a
              href="https://wa.me/261382696825"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-success/10 px-6 py-3 font-semibold text-success hover:bg-success/20 transition-colors"
            >
              <MessageCircle size={18} /> Contacter sur WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  </Layout>
);

export default FAQ;
