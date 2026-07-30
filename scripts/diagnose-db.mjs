import { createClient } from "@supabase/supabase-js";

import { loadEnv, requireEnv } from "./lib/env.mjs";

loadEnv();

const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
const anonKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

const sb = createClient(url, anonKey);

for (const table of ["secretarias", "escolas", "profiles", "turmas", "anos_letivos"]) {
  const result = await sb.from(table).select("*", { count: "exact", head: true });
  console.log(`${table}:`, result.count, result.error?.message ?? "ok");
}
