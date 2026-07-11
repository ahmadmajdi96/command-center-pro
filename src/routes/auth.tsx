import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Warehouse, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "Sign in · CORTA WMS" },
    { name: "description", content: "Sign in to CORTA WMS to manage inventory, receiving, picking, packing and shipping." },
  ]}),
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/" });
  },
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: fullName } },
        });
        if (error) throw error;
        toast.success("Account created. Signing you in…");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      nav({ to: "/" });
    } catch (err: any) {
      toast.error(err.message ?? "Auth error");
    } finally { setLoading(false); }
  }

  async function google() {
    setLoading(true);
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (res.error) { toast.error(res.error.message); setLoading(false); return; }
    if (!res.redirected) nav({ to: "/" });
  }

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,oklch(0.35_0.15_195/0.15),transparent_40%),radial-gradient(circle_at_80%_70%,oklch(0.35_0.15_75/0.10),transparent_40%)]" />
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary to-info text-primary-foreground shadow-[var(--shadow-glow)]">
            <Warehouse className="h-6 w-6" />
          </div>
          <div>
            <div className="text-lg font-semibold tracking-tight">CORTA WMS</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Warehouse Operations</div>
          </div>
        </div>
        <div className="glass-panel rounded-2xl p-6">
          <h1 className="text-xl font-semibold">{mode === "signin" ? "Sign in" : "Create an account"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin" ? "Access your warehouse control center" : "New users start with the Operator role"}
          </p>

          <button
            onClick={google} disabled={loading}
            className="mt-5 w-full flex items-center justify-center gap-2 rounded-lg border border-border/60 bg-card/60 py-2.5 text-sm hover:bg-card"
          >
            <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.2 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.2 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.3 0 10.1-2 13.7-5.3l-6.3-5.2C29.3 35.4 26.8 36 24 36c-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.6 39.6 16.3 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.3 5.2C41.5 35.7 44 30.3 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
            Continue with Google
          </button>

          <div className="my-4 flex items-center gap-3 text-[10px] uppercase tracking-wider text-muted-foreground">
            <div className="h-px flex-1 bg-border/60" />or<div className="h-px flex-1 bg-border/60" />
          </div>

          <form onSubmit={onSubmit} className="space-y-3">
            {mode === "signup" && (
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" required
                className="w-full rounded-lg border border-border/60 bg-card/60 px-3 py-2 text-sm focus:border-primary/50 focus:outline-none" />
            )}
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required
              className="w-full rounded-lg border border-border/60 bg-card/60 px-3 py-2 text-sm focus:border-primary/50 focus:outline-none" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 6 chars)" required minLength={6}
              className="w-full rounded-lg border border-border/60 bg-card/60 px-3 py-2 text-sm focus:border-primary/50 focus:outline-none" />
            <button type="submit" disabled={loading}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-4 w-full text-xs text-muted-foreground hover:text-foreground">
            {mode === "signin" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Sign in to continue · Roles: Admin · Manager · Supervisor · Operator · QA · Maintenance
        </p>
      </div>
    </div>
  );
}
