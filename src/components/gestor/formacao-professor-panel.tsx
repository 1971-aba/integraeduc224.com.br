"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  excluirFormacaoProfessor,
  salvarFormacaoProfessor,
} from "@/actions/gestor-professor-formacao";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  TIPOS_FORMACAO,
  type FormacaoProfessor,
} from "@/lib/professor-formacao-config";

type FormacaoProfessorPanelProps = {
  professores: Array<{ id: string; nome: string }>;
  formacoes: FormacaoProfessor[];
};

export function FormacaoProfessorPanel({
  professores,
  formacoes,
}: FormacaoProfessorPanelProps) {
  const router = useRouter();
  const [professorId, setProfessorId] = useState(professores[0]?.id ?? "");
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const professorMap = new Map(professores.map((item) => [item.id, item.nome]));

  async function handleSalvar(formData: FormData) {
    if (!professorId) return;

    setProcessando(true);
    setErro(null);

    const result = await salvarFormacaoProfessor(professorId, formData);
    setProcessando(false);

    if (result?.error) {
      setErro(result.error);
      return;
    }

    router.refresh();
  }

  async function handleExcluir(id: string) {
    setProcessando(true);
    setErro(null);

    const result = await excluirFormacaoProfessor(id);
    setProcessando(false);

    if (result?.error) {
      setErro(result.error);
      return;
    }

    router.refresh();
  }

  if (professores.length === 0) {
    return (
      <Card>
        <CardTitle>Nenhum professor cadastrado</CardTitle>
        <CardDescription>
          Cadastre professores em Professores da Escola antes de registrar
          cursos e especializações.
        </CardDescription>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,24rem)_1fr]">
      <Card className="h-fit">
        <CardTitle>Novo curso ou especialização</CardTitle>
        <CardDescription>
          Graduação, pós-graduação e demais formações do professor
        </CardDescription>

        <form action={handleSalvar} className="mt-4 space-y-3">
          <div>
            <label
              htmlFor="professor_formacao"
              className="text-xs font-medium uppercase tracking-wide text-slate-500"
            >
              Professor
            </label>
            <select
              id="professor_formacao"
              value={professorId}
              onChange={(event) => setProfessorId(event.target.value)}
              className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
            >
              {professores.map((professor) => (
                <option key={professor.id} value={professor.id}>
                  {professor.nome}
                </option>
              ))}
            </select>
          </div>

          <Campo label="Nome do curso / formação" name="titulo" required />
          <Campo label="Instituição" name="instituicao" />

          <div>
            <label
              htmlFor="tipo"
              className="text-xs font-medium uppercase tracking-wide text-slate-500"
            >
              Tipo
            </label>
            <select
              id="tipo"
              name="tipo"
              required
              defaultValue="graduacao"
              className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
            >
              {Object.entries(TIPOS_FORMACAO).map(([chave, label]) => (
                <option key={chave} value={chave}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <Campo
            label="Carga horária (h)"
            name="carga_horaria"
            type="number"
            min={1}
          />
          <Campo
            label="Ano de conclusão"
            name="ano_conclusao"
            type="number"
            min={1950}
            max={new Date().getFullYear()}
          />

          {erro ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {erro}
            </p>
          ) : null}

          <Button type="submit" disabled={processando}>
            {processando ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              "Salvar formação"
            )}
          </Button>
        </form>
      </Card>

      <Card>
        <CardTitle>{formacoes.length} formação(ões) registrada(s)</CardTitle>
        <CardDescription>
          Histórico acadêmico dos professores desta escola
        </CardDescription>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">Professor</th>
                <th className="px-3 py-2 font-medium">Formação</th>
                <th className="px-3 py-2 font-medium">Tipo</th>
                <th className="px-3 py-2 font-medium">Ano</th>
                <th className="px-3 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {formacoes.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-100 last:border-b-0"
                >
                  <td className="px-3 py-3 text-slate-600">
                    {professorMap.get(item.professorId) ?? "Professor"}
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-medium text-slate-900">{item.titulo}</p>
                    {item.instituicao ? (
                      <p className="text-xs text-slate-500">
                        {item.instituicao}
                        {item.cargaHoraria ? ` · ${item.cargaHoraria}h` : ""}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-3 py-3 text-slate-600">
                    {TIPOS_FORMACAO[item.tipo]}
                  </td>
                  <td className="px-3 py-3 text-slate-600">
                    {item.anoConclusao ?? "—"}
                  </td>
                  <td className="px-3 py-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleExcluir(item.id)}
                      disabled={processando}
                      aria-label="Excluir formação"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </td>
                </tr>
              ))}
              {formacoes.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-8 text-center text-slate-500"
                  >
                    Nenhuma formação cadastrada ainda.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Campo({
  label,
  name,
  type = "text",
  required,
  min,
  max,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="text-xs font-medium uppercase tracking-wide text-slate-500"
      >
        {label}
      </label>
      <Input
        id={name}
        name={name}
        type={type}
        required={required}
        min={min}
        max={max}
        className="mt-1"
      />
    </div>
  );
}
