import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getRelatorioPorTurma } from "@/lib/gestor-relatorios";
import {
  detectarIrregularidadesHorario,
  getVinculosDocentes,
  montarHorarioEscolar,
} from "@/lib/gestor-turmas";
import type { TurmaSemVinculo } from "@/lib/gestor-turmas";

export default async function GestorHorarioIrregularPage() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  const [turmas, vinculos] = await Promise.all([
    getRelatorioPorTurma(profile),
    getVinculosDocentes(profile),
  ]);

  const slots = montarHorarioEscolar(vinculos);
  const { choques, turmasSemDisciplina, turmasSemEstudante } =
    detectarIrregularidadesHorario(slots, turmas, vinculos);

  const total =
    choques.length + turmasSemDisciplina.length + turmasSemEstudante.length;

  return (
    <>
      <GestorPageHeader
        title="Horário Irregular"
        description="Inconsistências na grade semanal e na composição das turmas"
      />

      {total === 0 ? (
        <Card>
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-700">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <CardTitle>Nenhuma irregularidade encontrada</CardTitle>
          <CardDescription className="mt-2">
            Todas as turmas têm disciplinas vinculadas e estudantes
            matriculados, e nenhum professor está alocado em duas turmas no
            mesmo horário.
          </CardDescription>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <CardTitle>
                  {total} ponto(s) de atenção na grade escolar
                </CardTitle>
                <CardDescription className="mt-1">
                  {choques.length} choque(s) de professor •{" "}
                  {turmasSemDisciplina.length} turma(s) sem disciplina •{" "}
                  {turmasSemEstudante.length} turma(s) sem estudante.
                </CardDescription>
              </div>
            </div>
          </Card>

          {choques.length > 0 ? (
            <Card>
              <CardTitle>Professor em duas turmas no mesmo horário</CardTitle>
              <CardDescription>
                Reveja as atribuições para liberar um dos horários.
              </CardDescription>

              <ul className="mt-4 divide-y divide-slate-100 text-sm">
                {choques.map((choque) => (
                  <li
                    key={`${choque.professorId}-${choque.dia}-${choque.horario}`}
                    className="py-3"
                  >
                    <span className="block font-medium text-slate-800">
                      {choque.professorNome}
                    </span>
                    <span className="block text-slate-600">
                      {choque.dia}, {choque.horario} — {choque.turmas.join(" e ")}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {turmasSemDisciplina.length > 0 ? (
            <ListaTurmas
              titulo="Turmas sem disciplina vinculada"
              descricao="Essas turmas não entram na grade semanal enquanto não tiverem professor e disciplina."
              turmas={turmasSemDisciplina}
            />
          ) : null}

          {turmasSemEstudante.length > 0 ? (
            <ListaTurmas
              titulo="Turmas sem estudante matriculado"
              descricao="Confira se as matrículas foram lançadas ou se a turma deve ser encerrada."
              turmas={turmasSemEstudante}
            />
          ) : null}
        </div>
      )}
    </>
  );
}

function ListaTurmas({
  titulo,
  descricao,
  turmas,
}: {
  titulo: string;
  descricao: string;
  turmas: TurmaSemVinculo[];
}) {
  return (
    <Card>
      <CardTitle>{titulo}</CardTitle>
      <CardDescription>{descricao}</CardDescription>

      <ul className="mt-4 divide-y divide-slate-100 text-sm">
        {turmas.map((turma) => (
          <li
            key={turma.turmaId}
            className="flex flex-wrap items-center justify-between gap-2 py-2"
          >
            <span className="font-medium text-slate-800">
              {turma.turmaNome} — {turma.serie}
            </span>
            <span className="text-slate-600">{turma.turno}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
