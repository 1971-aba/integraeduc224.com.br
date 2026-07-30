import { cookies } from "next/headers";

import { DEMO_ANO_LETIVO_ID } from "@/lib/dev-auth";

export const ANO_LETIVO_COOKIE = "platform_ano_letivo_id";

export type AnoLetivoOption = {
  id: string;
  ano: number;
  ativo: boolean;
};

export const DEFAULT_ANO_LETIVO = 2026;

export function getFallbackAnosLetivos(): AnoLetivoOption[] {
  return [{ id: DEMO_ANO_LETIVO_ID, ano: DEFAULT_ANO_LETIVO, ativo: true }];
}

export async function setAnoLetivoSession(anoLetivoId: string) {
  const cookieStore = await cookies();
  cookieStore.set(ANO_LETIVO_COOKIE, anoLetivoId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function clearAnoLetivoSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ANO_LETIVO_COOKIE);
}

export async function getAnoLetivoSessionId() {
  const cookieStore = await cookies();
  return cookieStore.get(ANO_LETIVO_COOKIE)?.value ?? null;
}

export function pickDefaultAnoLetivoId(anos: AnoLetivoOption[]) {
  if (anos.length === 0) return DEMO_ANO_LETIVO_ID;

  const ativo2026 = anos.find((item) => item.ativo && item.ano === DEFAULT_ANO_LETIVO);
  if (ativo2026) return ativo2026.id;

  const ativo = anos.find((item) => item.ativo);
  if (ativo) return ativo.id;

  return anos[0].id;
}
