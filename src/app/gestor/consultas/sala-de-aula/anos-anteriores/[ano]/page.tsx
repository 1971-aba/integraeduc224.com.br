import { notFound, redirect } from "next/navigation";

const ANOS_PERMITIDOS = new Set(["2023", "2024", "2025"]);

export default async function GestorSalaDeAulaAnosAnterioresAnoPage({
  params,
}: {
  params: Promise<{ ano: string }>;
}) {
  const { ano } = await params;

  if (!ANOS_PERMITIDOS.has(ano)) {
    notFound();
  }

  redirect(`/gestor/em-breve?modulo=Anos Anteriores ${ano}`);
}
