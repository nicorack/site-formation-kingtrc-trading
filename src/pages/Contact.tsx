import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { Phone, Mail, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const whatsappMsg = encodeURIComponent(
      `Bonjour, je suis ${name} (${email}).\n\n${message}`
    );
    window.open(`https://wa.me/261382696825?text=${whatsappMsg}`, "_blank");
    toast.success("Redirection vers WhatsApp...");
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <Layout>
      <section className="gradient-hero py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl font-bold text-primary-foreground md:text-4xl"
          >
            Contactez-nous
          </motion.h1>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
            Une question sur nos formations trading ? Contactez-nous par WhatsApp ou via le formulaire ci-dessous.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2">
            {/* Contact Info */}
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold text-foreground">Nos coordonnées</h2>

              <div className="space-y-4">
                <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-5">
                  <Phone size={20} className="mt-0.5 shrink-0 text-accent" />
                  <div>
                    <p className="font-semibold text-foreground">Téléphone</p>
                    <a href="tel:+261382696825" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                      038 26 968 25
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-5">
                  <Mail size={20} className="mt-0.5 shrink-0 text-accent" />
                  <div>
                    <p className="font-semibold text-foreground">Email</p>
                    <a href="mailto:tradingtrc4@gmail.com" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                      tradingtrc4@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              <a
                href="https://wa.me/261382696825"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-success/10 px-6 py-3 font-semibold text-success hover:bg-success/20 transition-colors"
              >
                <MessageCircle size={20} /> Écrire sur WhatsApp
              </a>
            </div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <form
                onSubmit={handleSubmit}
                className="rounded-xl border border-border bg-card p-6 space-y-4"
              >
                <h2 className="font-display text-xl font-bold text-foreground">Envoyez un message</h2>
                <p className="text-sm text-muted-foreground">
                  Le formulaire ouvrira WhatsApp avec votre message pré-rempli.
                </p>

                <div>
                  <Label>Nom complet</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Votre nom" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="votre@email.com" />
                </div>
                <div>
                  <Label>Message</Label>
                  <Textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} placeholder="Votre message..." />
                </div>
                <Button type="submit" className="w-full gradient-accent text-accent-foreground border-0 font-semibold">
                  <Send size={16} className="mr-2" /> Envoyer via WhatsApp
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
