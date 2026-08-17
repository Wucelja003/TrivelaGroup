import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

/*
 * Prijava za /admin.
 *
 * Sesiju cuva sam Supabase klijent (localStorage) — ovde je samo izlazemo
 * Reactu i pored nje drzimo je li ulogovani korisnik admin.
 *
 * Admin se proverava preko is_admin() RPC-a. Ta funkcija je u bazi
 * `security definer`, pa cita admins tabelu bez obzira na RLS — dakle
 * pouzdano vraca true/false i za obicnog ulogovanog korisnika.
 */
interface AuthContextValue {
  session: Session | null;
  isAdmin: boolean;
  /* Dok jos ne znamo stanje (prvi upit sesije + provera admina) */
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function checkAdmin(session: Session | null): Promise<boolean> {
  if (!session) return false;
  const { data, error } = await supabase.rpc("is_admin");
  if (error) {
    console.error("[auth] is_admin RPC:", error.message);
    return false;
  }
  return data === true;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    /* Prvi upit: postoji li vec sacuvana sesija */
    supabase.auth.getSession().then(async ({ data }) => {
      const s = data.session;
      const admin = await checkAdmin(s);
      if (cancelled) return;
      setSession(s);
      setIsAdmin(admin);
      setLoading(false);
    });

    /* Prati promene: prijava, odjava, osvezen token */
    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, s) => {
      const admin = await checkAdmin(s);
      if (cancelled) return;
      setSession(s);
      setIsAdmin(admin);
      setLoading(false);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, isAdmin, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth mora biti unutar <AuthProvider>");
  return ctx;
}
