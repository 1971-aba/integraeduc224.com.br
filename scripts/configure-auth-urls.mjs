/**
 * Configura Site URL e Redirect URLs via Supabase Management API.
 * Requer SUPABASE_ACCESS_TOKEN (Account → Access Tokens).
 */
import { loadEnv, requireEnv } from "./lib/env.mjs";

loadEnv();

const PROJECT_REF = "xlbddrjzrrpxsarppxky";
const SITE_URL =
  process.env.SITE_URL ?? "https://integraeduc224.com.br";
const EXTRA_SITE_URLS = (process.env.EXTRA_SITE_URLS ?? "")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);
const SITE_URLS = [SITE_URL, ...EXTRA_SITE_URLS];
const REDIRECT_URLS = [
  ...SITE_URLS.flatMap((url) => [`${url}/**`, `${url}/auth/callback`]),
  "http://localhost:3000/**",
  "http://localhost:3000/auth/callback",
].join(",");

async function main() {
  const token = requireEnv("SUPABASE_ACCESS_TOKEN");

  const response = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        site_url: SITE_URL,
        uri_allow_list: REDIRECT_URLS,
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Falha ao configurar Auth URLs (${response.status}): ${body}`);
  }

  const config = await response.json();
  console.log("✓ Auth URLs configuradas");
  console.log(`  site_url: ${config.site_url ?? SITE_URL}`);
  console.log(`  uri_allow_list: ${config.uri_allow_list ?? REDIRECT_URLS}`);
}

main().catch((error) => {
  console.error("\nErro:", error.message ?? error);
  process.exit(1);
});
