import { notFound, redirect } from "next/navigation";

const MODULOS_2025: Record<string, string> = {
  "ata-de-resultados": "ATA de Resultados",
  "ficha-de-avaliacoes": "Ficha de Avaliações",
  "boletins-individuais": "Boletins Individuais",
  "concludentes-2025": "Concludentes 2025",
  "retidos-2025": "Retidos 2025",
  "formacoes-2025": "Formações 2025",
  "aluno-nota-10-2025": "Aluno Nota 10 2025",
  "complementares-2025": "Complementares 2025",
  "diario-de-classe-2025": "Diário de Classe 2025",
};

export default async function GestorSalaDeAulaAnosAnteriores2025ModuloPage({
  params,
}: {
  params: Promise<{ modulo: string }>;
}) {
  const { modulo } = await params;
  const label = MODULOS_2025[modulo];

  if (!label) {
    notFound();
  }

  redirect(
    `/gestor/em-breve?modulo=${encodeURIComponent(`Anos Anteriores 2025 — ${label}`)}`,
  );
}
