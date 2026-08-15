import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Send, Loader2, Download, BookOpen, TrendingUp, Activity, MessageSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "@/integrations/supabase/client";

type Msg = { role: "user" | "assistant"; content: string };
type Mode = "forex" | "synthetic" | "chat";

const prompts: Record<Mode, string[]> = {
  forex: [
    "Analyse ma dernière trade EUR/USD",
    "Plan de trading pour aujourd'hui",
    "Review de ma semaine Forex",
  ],
  synthetic: [
    "Analyse ma dernière trade Crash 500",
    "Setup Boom & Crash du jour",
    "Review de mes trades synthétiques",
  ],
  chat: [
    "Conseils pour gérer mes émotions",
    "Expliquer le money management",
    "Comment lire une bougie japonaise ?",
  ],
};

const placeholders: Record<Mode, string> = {
  forex: "Décrivez votre trade Forex (paire, entrée, SL, TP, résultat)...",
  synthetic: "Décrivez votre trade sur indice synthétique (indice, entrée, SL, TP, résultat)...",
  chat: "Posez votre question sur le trading...",
};

export default function AIAssistant() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("forex");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || loading) return;
    setInput("");
    const userMsg: Msg = { role: "user", content: text };
    setMessages((p) => [...p, userMsg]);
    setLoading(true);

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(({ role, content }) => ({ role, content })),
          mode,
        }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) toast.error("Limite atteinte, réessayez bientôt.");
        else if (resp.status === 402) toast.error("Crédits IA épuisés.");
        else toast.error("Erreur du service IA");
        setLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let acc = "";
      setMessages((p) => [...p, { role: "assistant", content: "" }]);

      let done = false;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) {
              acc += c;
              setMessages((p) => {
                const copy = [...p];
                copy[copy.length - 1] = { role: "assistant", content: acc };
                return copy;
              });
            }
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const downloadText = () => {
    const last = [...messages].reverse().find((m) => m.role === "assistant" && m.content);
    if (!last) return;
    const blob = new Blob([last.content], { type: "text/markdown;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "journal-de-trading.md";
    a.click();
  };

  const modes: { id: Mode; label: string; icon: any }[] = [
    { id: "forex", label: "Journal Forex", icon: TrendingUp },
    { id: "synthetic", label: "Journal Synthétique", icon: Activity },
    { id: "chat", label: "Assistant", icon: MessageSquare },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="container mx-auto flex flex-1 flex-col px-4 py-6">
        <div className="mb-4 flex items-center gap-2">
          <BookOpen className="text-accent" />
          <h1 className="text-2xl font-bold font-display">Journal de Trading</h1>
        </div>

        <Tabs value={mode} onValueChange={(v) => { setMode(v as Mode); setMessages([]); setInput(""); }} className="mb-4">
          <TabsList className="grid w-full grid-cols-3 max-w-xl">
            {modes.map((m) => (
              <TabsTrigger key={m.id} value={m.id} className="gap-1">
                <m.icon size={14} /> {m.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="mb-4 flex flex-wrap gap-2">
          {prompts[mode].map((p) => (
            <button
              key={p}
              onClick={() => send(p)}
              className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-muted transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        <Card className="flex flex-1 flex-col overflow-hidden">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[400px] max-h-[60vh]">
            {messages.length === 0 && (
              <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                <div>
                  <BookOpen className="mx-auto mb-2 opacity-50" size={32} />
                  <p>Choisissez un modèle rapide ou décrivez votre trade pour enrichir votre journal.</p>
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}>
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content || "…"}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t p-3">
            {messages.some((m) => m.role === "assistant" && m.content) && (
              <Button variant="ghost" size="sm" onClick={downloadText} className="mb-2">
                <Download size={14} className="mr-1" /> Télécharger le journal
              </Button>
            )}
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder={placeholders[mode]}
                rows={3}
                className="resize-none"
                disabled={loading}
              />
              <Button onClick={() => send()} disabled={loading || !input.trim()} size="lg">
                {loading ? <Loader2 className="animate-spin" /> : <Send />}
              </Button>
            </div>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
