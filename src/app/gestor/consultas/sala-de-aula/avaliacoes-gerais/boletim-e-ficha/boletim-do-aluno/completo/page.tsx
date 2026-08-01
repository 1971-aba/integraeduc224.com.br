import { GestorBoletimAlunoPage } from "@/components/gestor/gestor-boletim-aluno-page";

export default function GestorSalaDeAulaBoletimDoAlunoCompletoPage({
  searchParams,
}: {
  searchParams: Promise<{ turma?: string; aluno?: string; bimestre?: string }>;
}) {
  return GestorBoletimAlunoPage({ modo: "completo", searchParams });
}
