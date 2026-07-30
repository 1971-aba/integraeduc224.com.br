import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { HorarioEscolarGrade } from "@/components/gestor/horario-escolar-grade";
import type { GrupoHorario } from "@/components/gestor/horario-escolar-grade";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getVinculosDocentes, montarHorarioEscolar } from "@/lib/gestor-turmas";

const ROTA = "/gestor/turmas/horario/consultar";

export default async function GestorConsultarHorarioPage({
  searchParams,
}: {
  searchParams: Promise<{ turma?: string; professor?: string }>;
}) {
  const { turma: turmaId, professor: professorId } = await searchParams;
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  const slots = montarHorarioEscolar(await getVinculosDocentes(profile));

  const turmasDisponiveis = [
    ...new Map(
      slots.map((slot) => [
        slot.turmaId,
        { id: slot.turmaId, label: `${slot.turmaNome} — ${slot.serie}` },
      ]),
    ).values(),
  ].sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));

  const professoresDisponiveis = [
    ...new Map(
      slots.map((slot) => [
        slot.professorId,
        { id: slot.professorId, label: slot.professorNome },
      ]),
    ).values(),
  ].sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));

  const selecionados = professorId
    ? slots.filter((slot) => slot.professorId === professorId)
    : turmaId
      ? slots.filter((slot) => slot.turmaId === turmaId)
      : [];

  const grupo: GrupoHorario | null =
    selecionados.length > 0
      ? {
          id: professorId ?? turmaId ?? "consulta",
          titulo: professorId
            ? selecionados[0].professorNome
            : `${selecionados[0].turmaNome} — ${selecionados[0].serie}`,
          subtitulo: professorId
            ? `${selecionados.length} aula(s) na semana`
            : selecionados[0].turno,
          slots: selecionados,
        }
      : null;

  return (
    <>
      <GestorPageHeader
        title="Consultar Horário"
        description="Escolha uma turma ou um professor para ver a grade semanal"
      />

      <Card className="mb-6">
        <CardTitle>Filtro</CardTitle>
        <CardDescription className="mt-1">
          A consulta considera uma seleção por vez. Escolher um professor
          substitui a turma selecionada.
        </CardDescription>

        <form
          action={ROTA}
          method="get"
          className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        >
          <div>
            <label
              htmlFor="turma"
              className="text-sm font-medium text-slate-700"
            >
              Turma
            </label>
            <select
              id="turma"
              name="turma"
              defaultValue={turmaId ?? ""}
              className="mt-2 flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="">Todas</option>
              {turmasDisponiveis.map((opcao) => (
                <option key={opcao.id} value={opcao.id}>
                  {opcao.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="professor"
              className="text-sm font-medium text-slate-700"
            >
              Professor
            </label>
            <select
              id="professor"
              name="professor"
              defaultValue={professorId ?? ""}
              className="mt-2 flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="">Todos</option>
              {professoresDisponiveis.map((opcao) => (
                <option key={opcao.id} value={opcao.id}>
                  {opcao.label}
                </option>
              ))}
            </select>
          </div>

          <Button type="submit">Consultar</Button>
        </form>
      </Card>

      {grupo ? (
        <HorarioEscolarGrade
          grupos={[grupo]}
          detalhe={professorId ? "turma" : "professor"}
          emptyTitle="Nenhum horário para exibir"
          emptyDescription="Ajuste o filtro para ver a grade semanal."
        />
      ) : (
        <Card>
          <CardTitle>
            {slots.length === 0
              ? "Nenhum horário para consultar"
              : "Selecione uma turma ou um professor"}
          </CardTitle>
          <CardDescription className="mt-2">
            {slots.length === 0
              ? "Vincule professores e disciplinas às turmas para gerar a grade semanal."
              : `A escola tem ${slots.length} aula(s) distribuídas em ${turmasDisponiveis.length} turma(s) e ${professoresDisponiveis.length} professor(es).`}
          </CardDescription>
        </Card>
      )}
    </>
  );
}
