import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, mode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY non configuré");

    let systemPrompt = "Tu es un assistant IA polyvalent, amical et précis, similaire à ChatGPT. Réponds clairement, en markdown quand utile. Tu réponds dans la langue de l'utilisateur (français, malgache ou anglais).";
    let model = "google/gemini-3-flash-preview";

    if (mode === "book") {
      systemPrompt = "Tu es un écrivain professionnel. Quand l'utilisateur demande un livre, un chapitre ou un long texte, produis un contenu structuré en markdown avec un titre (#), une table des matières, des chapitres (##) et sous-sections (###). Sois détaillé, créatif et cohérent. Vise plusieurs milliers de mots si demandé.";
      model = "google/gemini-2.5-pro";
    } else if (mode === "code") {
      systemPrompt = "Tu es un expert développeur. Donne du code clair, commenté, dans des blocs de code markdown.";
    } else if (mode === "forex") {
      systemPrompt = `Tu es un coach trading spécialisé sur le marché Forex. Tu aides l'utilisateur à tenir son journal de trading Forex.
Pour chaque entrée, structure ta réponse avec :
- Date / paire de devises
- Direction (achat/vente)
- Setup et stratégie utilisée
- Point d'entrée, stop loss, take profit
- Résultat en pips et en % du capital
- Leçons et émotions ressenties
- Axes d'amélioration
Sois concret, discipliné et orienté gestion du risque. Réponds en français ou malgache selon la langue de l'utilisateur.`;
    } else if (mode === "synthetic") {
      systemPrompt = `Tu es un coach trading spécialisé sur les indices synthétiques (Boom & Crash, Volatility indices, Step indices). Tu aides l'utilisateur à tenir son journal de trading sur ces marchés.
Pour chaque entrée, structure ta réponse avec :
- Date / indice synthétique
- Direction (achat/vente)
- Setup et stratégie utilisée
- Point d'entrée, stop loss, take profit
- Résultat en points/pips et en % du capital
- Leçons et émotions ressenties
- Axes d'amélioration
Sois concret, discipliné et orienté gestion du risque. Réponds en français ou malgache selon la langue de l'utilisateur.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite atteinte, réessayez dans un instant." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA épuisés. Ajoutez des crédits dans Settings > Workspace > Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erreur du service IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
