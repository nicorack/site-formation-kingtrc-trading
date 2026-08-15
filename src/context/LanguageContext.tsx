import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Lang = "fr" | "mg";

const dict = {
  fr: {
    "nav.home": "Accueil",
    "nav.formations": "Formations",
    "nav.journal": "Journal de Trading",
    "nav.about": "À propos",
    "nav.contact": "Contact",
    "nav.myCourses": "Mes formations",
    "nav.admin": "Admin",
    "nav.login": "Connexion",
    "nav.signup": "S'inscrire",
    "nav.logout": "Déconnexion",
    "auth.loginTitle": "Connexion",
    "auth.signupTitle": "Inscription",
    "auth.fullName": "Nom complet",
    "auth.email": "Email",
    "auth.password": "Mot de passe",
    "auth.submitLogin": "Se connecter",
    "auth.submitSignup": "S'inscrire",
    "auth.google": "Continuer avec Google",
    "auth.or": "ou",
    "auth.noAccount": "Pas encore de compte ?",
    "auth.hasAccount": "Déjà un compte ?",
    "pay.title": "Paiement MVola",
    "pay.send": "Envoyez",
    "pay.to": "au",
    "pay.name": "Nom",
    "pay.reference": "Référence du paiement (facultatif)",
    "pay.proof": "Capture d'écran du paiement (facultatif)",
    "pay.attach": "Cliquez pour joindre la capture",
    "pay.submit": "J'ai payé — envoyer pour validation",
    "pay.pending": "Paiement envoyé — en attente de l'approbation de l'admin",
    "pay.approved": "Paiement approuvé — accès débloqué",
    "pay.wait": "Après le paiement, l'admin approuve puis votre formation est débloquée.",
    "salle.title": "Formation en salle (présentielle)",
    "salle.place": "Lieu",
    "salle.invite": "Nous vous invitons à écrire en MP au formateur pour réserver votre place.",
    "salle.button": "Écrire au formateur (Facebook)",
    "telegram.title": "Accès à la formation",
    "telegram.desc": "Votre paiement est approuvé. Rejoignez le groupe Telegram de la formation :",
    "telegram.button": "Ouvrir le groupe Telegram",
    "support.title": "Contact support",
    "support.desc": "Un problème ou une question ? Écrivez à la page de l'admin.",
    "support.button": "Contacter le support",
    "about.title": "À propos de formation",
    "about.onlineTitle": "1. Formation en ligne",
    "about.onlineDesc": "Vidéos de formation en malgache, pré-enregistrées, de la base jusqu'au retrait. Vous entrez dans la formation en ligne, vous effectuez le paiement et vous obtenez tous les accès.",
    "about.salleTitle": "2. Formation en salle",
    "about.salleDesc": "Formation en présentiel : nous vous invitons à écrire en MP au formateur via le lien disponible, ou à l'appeler directement.",
    "contact.whatsapp": "Écrire sur WhatsApp",
  },
  mg: {
    "nav.home": "Fandraisana",
    "nav.formations": "Formation",
    "nav.journal": "Journal de Trading",
    "nav.about": "Momba anay",
    "nav.contact": "Fifandraisana",
    "nav.myCourses": "Ny formation-ko",
    "nav.admin": "Admin",
    "nav.login": "Hiditra",
    "nav.signup": "Hisoratra anarana",
    "nav.logout": "Hivoaka",
    "auth.loginTitle": "Fidirana",
    "auth.signupTitle": "Fisoratana anarana",
    "auth.fullName": "Anarana feno",
    "auth.email": "Email",
    "auth.password": "Teny miafina",
    "auth.submitLogin": "Hiditra",
    "auth.submitSignup": "Hisoratra anarana",
    "auth.google": "Hanohy amin'ny Google",
    "auth.or": "na",
    "auth.noAccount": "Mbola tsy manana kaonty ?",
    "auth.hasAccount": "Efa manana kaonty ?",
    "pay.title": "Fandoavam-bola MVola",
    "pay.send": "Alefaso",
    "pay.to": "amin'ny",
    "pay.name": "Anarana",
    "pay.reference": "Référence ny fandoavam-bola (tsy voatery)",
    "pay.proof": "Capture d'écran ny fandoavam-bola (tsy voatery)",
    "pay.attach": "Tsindrio raha hanampy sary",
    "pay.submit": "Vita ny fandoavam-bola — alefa hamarinina",
    "pay.pending": "Voalefa ny fandoavam-bola — miandry fankatoavan'ny admin",
    "pay.approved": "Voamarina ny fandoavam-bola — misokatra ny formation",
    "pay.wait": "Rehefa vita ny fandoavam-bola dia manaiky ny admin vao misokatra ny formation.",
    "salle.title": "Formation en salle (atrehina)",
    "salle.place": "Toerana",
    "salle.invite": "Manasa anao izahay hiditra MP amin'ny formateur mba hamandrika toerana.",
    "salle.button": "Hiditra MP amin'ny formateur (Facebook)",
    "telegram.title": "Fidirana amin'ny formation",
    "telegram.desc": "Voamarina ny fandoavam-bolanao. Midira ao amin'ny vondrona Telegram :",
    "telegram.button": "Hisokatra ny vondrona Telegram",
    "support.title": "Contact support",
    "support.desc": "Misy olana na mila fanazavana ? Alefaso hafatra ao amin'ny pejin'ny admin.",
    "support.button": "Hifandray amin'ny support",
    "about.title": "Momba ny formation",
    "about.onlineTitle": "1. Formation en ligne",
    "about.onlineDesc": "Video de formation teny malagasy pre-enregistrer, de base jusque retrait. Miditra ao amin'ny formation en ligne ianao, manao ny payement, dia mahazo ny acces rehetra ao.",
    "about.salleTitle": "2. Formation en salle",
    "about.salleDesc": "Presentielle izy io : manasa anao hiditra MP amin'ny formateur amin'ny lien izay efa mipetraka ao, na hiantso azy mivantana.",
    "contact.whatsapp": "Hanoratra amin'ny WhatsApp",
  },
} as const;

type Key = keyof (typeof dict)["fr"];

const LanguageContext = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: Key) => string }>({
  lang: "fr",
  setLang: () => {},
  t: (k) => k,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem("lang") as Lang) || "fr");

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (k: Key) => dict[lang][k] ?? dict.fr[k] ?? k;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>
  );
}

export const useI18n = () => useContext(LanguageContext);
