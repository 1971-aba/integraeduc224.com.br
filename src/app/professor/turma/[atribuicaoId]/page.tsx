import { redirect } from "next/navigation";

export default async function TurmaIndexPage({
  params,
}: {
  params: Promise<{ atribuicaoId: string }>;
}) {
  const { atribuicaoId } = await params;
  redirect(`/professor/turma/${atribuicaoId}/chamada`);
}
