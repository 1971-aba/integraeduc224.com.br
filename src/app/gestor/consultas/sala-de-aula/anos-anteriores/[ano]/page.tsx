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

  if (ano === "2023") {
    redirect(
      "/gestor/consultas/sala-de-aula/anos-anteriores/2023/ata-de-resultados",
    );
  }

  redirect(`/gestor/em-breve?modulo=Anos Anteriores ${ano}`);
}
