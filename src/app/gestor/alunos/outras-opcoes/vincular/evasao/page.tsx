import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { VincularAlunoPanel } from "@/components/gestor/vincular-aluno-panel";
import { getContextoVinculo } from "@/lib/gestor-alunos-vinculo";

export default async function ResgatarEvasaoPage() {
  const contexto = await getContextoVinculo();

  if (!contexto) {
    return (
      <>
        <GestorPageHeader
          title="Resgatar Evasão Escolar"
          description="Alunos com matrícula cancelada que podem voltar à escola"
        />
        <SemEscolaAlert />
      </>
    );
  }

  const alunos = contexto.alunos.filter((aluno) => aluno.situacao === "evasao");

  return (
    <>
      <GestorPageHeader
        title="Resgatar Evasão Escolar"
        description="Alunos da rede cuja matrícula foi cancelada: rematricule para trazer o estudante de volta"
      />

      <VincularAlunoPanel
        alunos={alunos}
        turmas={contexto.turmas}
        acaoLabel="Rematricular"
        vazioTitulo="Nenhum caso de evasão a resgatar"
        vazioDescricao="Não há alunos da rede com matrícula cancelada e sem vínculo ativo. Para acompanhar risco de abandono por faltas, use Consultas → Evasão Escolar."
      />
    </>
  );
}
