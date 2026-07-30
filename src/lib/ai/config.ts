export const SERIES_ESCOLARES = [
  "Educação Infantil — Berçário",
  "Educação Infantil — Maternal",
  "Educação Infantil — Pré I",
  "Educação Infantil — Pré II",
  "1º ano do Ensino Fundamental",
  "2º ano do Ensino Fundamental",
  "3º ano do Ensino Fundamental",
  "4º ano do Ensino Fundamental",
  "5º ano do Ensino Fundamental",
  "6º ano do Ensino Fundamental",
  "7º ano do Ensino Fundamental",
  "8º ano do Ensino Fundamental",
  "9º ano do Ensino Fundamental",
  "1ª série do Ensino Médio",
  "2ª série do Ensino Médio",
  "3ª série do Ensino Médio",
] as const;

export type AiProvider = "openai" | "gemini";
export type AiMode = AiProvider | "demo";

export function getAiProvider(): AiProvider | null {
  const configured = process.env.AI_PROVIDER?.toLowerCase();
  if (configured === "openai" && process.env.OPENAI_API_KEY) return "openai";
  if (configured === "gemini" && process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.GEMINI_API_KEY) return "gemini";
  return null;
}

/** Modo ativo: IA externa ou fallback demo (estrutura BNCC sem API). */
export function getAiMode(): AiMode {
  return getAiProvider() ?? "demo";
}

export function getAiModeLabel(mode: AiMode) {
  switch (mode) {
    case "openai":
      return "OpenAI";
    case "gemini":
      return "Google Gemini";
    case "demo":
      return "Modo demonstração";
  }
}
