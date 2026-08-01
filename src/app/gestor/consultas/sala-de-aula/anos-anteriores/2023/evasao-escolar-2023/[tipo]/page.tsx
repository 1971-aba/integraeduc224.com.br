import { notFound, redirect } from "next/navigation";

const TIPOS_EVASAO_2023: Record<string, string> = {
  "todas-as-evasoes": "Todas as Evasões",
  desistentes: "Desistentes",
  transferidos: "Transferidos",
  expulsos: "Expulsos",
  falecidos: "Falecidos",
};

export default async function GestorSalaDeAulaEvasaoEscolar2023TipoPage({
  params,
}: {
  params: Promise<{ tipo: string }>;
}) {
  const { tipo } = await params;
  const label = TIPOS_EVASAO_2023[tipo];

  if (!label) {
    notFound();
  }

  redirect(
    `/gestor/em-breve?modulo=${encodeURIComponent(`Anos Anteriores 2023 — Evasão Escolar — ${label}`)}`,
  );
}
