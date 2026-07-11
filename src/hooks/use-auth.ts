import { useEffect, useState, useCallback } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "manager" | "supervisor" | "operator" | "quality" | "maintenance";

export interface AuthState {
  session: Session | null;
  userId: string | null;
  email: string | null;
  fullName: string | null;
  roles: AppRole[];
  loading: boolean;
}

const initial: AuthState = {
  session: null, userId: null, email: null, fullName: null, roles: [], loading: true,
};

let cache: AuthState = initial;
const listeners = new Set<(s: AuthState) => void>();

function setState(next: AuthState) {
  cache = next;
  listeners.forEach((l) => l(next));
}

async function fetchRolesAndProfile(userId: string) {
  const [roles, profile] = await Promise.all([
    supabase.from("user_roles").select("role").eq("user_id", userId),
    supabase.from("profiles").select("full_name,email").eq("id", userId).maybeSingle(),
  ]);
  return {
    roles: (roles.data ?? []).map((r) => r.role as AppRole),
    fullName: profile.data?.full_name ?? null,
    email: profile.data?.email ?? null,
  };
}

async function refresh() {
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  if (!session) {
    setState({ ...initial, loading: false });
    return;
  }
  const { roles, fullName, email } = await fetchRolesAndProfile(session.user.id);
  setState({
    session, userId: session.user.id, email: email ?? session.user.email ?? null,
    fullName, roles, loading: false,
  });
}

if (typeof window !== "undefined") {
  supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED" || event === "INITIAL_SESSION") {
      refresh();
    }
  });
  refresh();
}

export function useAuth() {
  const [state, set] = useState<AuthState>(cache);
  useEffect(() => {
    listeners.add(set);
    return () => { listeners.delete(set); };
  }, []);
  const hasRole = useCallback((r: AppRole | AppRole[]) => {
    const arr = Array.isArray(r) ? r : [r];
    return state.roles.some((role) => arr.includes(role));
  }, [state.roles]);
  const isAdmin = state.roles.includes("admin");
  const canManage = isAdmin || state.roles.includes("manager");
  const canOperate = canManage || state.roles.includes("supervisor") || state.roles.includes("operator");
  return { ...state, hasRole, isAdmin, canManage, canOperate, refresh };
}
