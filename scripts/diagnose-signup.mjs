import { createClient } from "@supabase/supabase-js";

import { loadEnv, requireEnv } from "./lib/env.mjs";

loadEnv();

const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
const anonKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

const sb = createClient(url, anonKey);

const signup = await sb.auth.signUp({
  email: "test-setup@example.com",
  password: "Demo@2026",
});

console.log("signUp:", signup.error?.message ?? "OK", signup.data.user?.id ?? "");

if (signup.data.user?.id) {
  await sb.auth.admin?.deleteUser?.(signup.data.user.id);
}
