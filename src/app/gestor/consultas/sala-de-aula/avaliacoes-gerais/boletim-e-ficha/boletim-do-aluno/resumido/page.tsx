import { GestorBoletimAlunoPage } from "@/components/gestor/gestor-boletim-aluno-page";

export default function GestorSalaDeAulaBoletimDoAlunoResumidoPage({
  searchParams,
}: {
  searchParams: Promise<{ turma?: string; aluno?: string; bimestre?: string }>;
}) {
  return GestorBoletimAlunoPage({ modo: "resumido", searchParams });
}
