import { redirect } from "next/navigation";

export default async function GestorSalaDeAulaRealizarFrequenciaTurmaRedirectPage({
  params,
}: {
  params: Promise<{ atribuicaoId: string }>;
}) {
  const { atribuicaoId } = await params;
  redirect(
    `/gestor/consultas/sala-de-aula/frequencia-turma/realizar/turma/${atribuicaoId}`,
  );
}
