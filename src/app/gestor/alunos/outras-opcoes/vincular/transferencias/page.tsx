import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { VincularAlunoPanel } from "@/components/gestor/vincular-aluno-panel";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { getContextoVinculo } from "@/lib/gestor-alunos-vinculo";
import { formatCpf } from "@/lib/utils";

export default async function ReceberTransferenciasPage() {
  const contexto = await getContextoVinculo();

  if (!contexto) {
    return (
      <>
        <GestorPageHeader
          title="Receber Transferências"
          description="Alunos transferidos que podem ser recebidos nesta escola"
        />
        <SemEscolaAlert />
      </>
    );
  }

  const transferidos = contexto.alunos.filter(
    (aluno) => aluno.situacao === "transferencia",
  );
  const ativosEmOutra = contexto.alunos.filter(
    (aluno) => aluno.situacao === "ativo_em_outra",
  );

  return (
    <>
      <GestorPageHeader
        title="Receber Transferências"
        description="Alunos da rede cuja matrícula foi encerrada por transferência: receba o estudante em uma turma desta escola"
      />

      <VincularAlunoPanel
        alunos={transferidos}
        turmas={contexto.turmas}
        acaoLabel="Receber"
        vazioTitulo="Nenhuma transferência aguardando recebimento"
        vazioDescricao="Não há alunos da rede com matrícula encerrada por transferência e sem vínculo ativo."
      />

      {ativosEmOutra.length > 0 ? (
        <Card className="mt-6 border-amber-200 bg-amber-50">
          <CardTitle className="text-amber-900">
            {ativosEmOutra.length} aluno(s) com matrícula ativa em outra unidade
          </CardTitle>
          <CardDescription className="text-amber-800">
            A escola de origem precisa encerrar a matrícula antes de o aluno ser
            recebido aqui. Enquanto o vínculo estiver ativo, a matrícula nesta
            escola é bloqueada para evitar duplicidade.
          </CardDescription>

          <ul className="mt-4 space-y-1 text-sm text-amber-900">
            {ativosEmOutra.map((aluno) => (
              <li key={aluno.id}>
                {aluno.nome}
                {aluno.cpf ? ` · ${formatCpf(aluno.cpf)}` : ""}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </>
  );
}
