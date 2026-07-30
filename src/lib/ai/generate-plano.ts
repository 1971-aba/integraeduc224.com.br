import { getAiMode, type AiProvider } from "@/lib/ai/config";
import { generatePlanoAulaDemo } from "@/lib/ai/generate-plano-demo";
import { buildPlanoAulaPrompt } from "@/lib/ai/prompt-plano-aula";

type GeneratePlanoInput = {
  tema: string;
  serie: string;
  disciplina?: string;
  professorNome: string;
};

async function generateWithOpenAI(system: string, user: string) {
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI: ${error}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("OpenAI retornou resposta vazia.");
  return content;
}

async function generateWithGemini(system: string, user: string) {
  const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
  const key = process.env.GEMINI_API_KEY;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: `${system}\n\n${user}` }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
        },
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini: ${error}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };

  const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!content) throw new Error("Gemini retornou resposta vazia.");
  return content;
}

export async function generatePlanoAulaContent(input: GeneratePlanoInput) {
  const mode = getAiMode();

  if (mode === "demo") {
    return generatePlanoAulaDemo(input);
  }

  const { system, user } = buildPlanoAulaPrompt(input);
  return generateByProvider(mode, system, user);
}

async function generateByProvider(
  provider: AiProvider,
  system: string,
  user: string,
) {
  if (provider === "openai") {
    return generateWithOpenAI(system, user);
  }
  return generateWithGemini(system, user);
}
