import { createClient } from "@supabase/supabase-js";

import { loadEnv, requireEnv } from "./lib/env.mjs";

loadEnv();

const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
const anonKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

const sb = createClient(url, anonKey);

const escolas = await sb.from("escolas").select("id,nome,ativa").limit(10);
console.log("escolas:", escolas);

const rpc = await sb.rpc("resolve_login_email", { login_input: "98765432100" });
console.log("resolve_login_email:", rpc);

const login = await sb.auth.signInWithPassword({
  email: "gestor@emefmaria.gov.br",
  password: "Demo@2026",
});

console.log(
  "signIn:",
  login.error?.message ?? "OK",
  login.data.user?.id ?? "",
);
