"use client";

import { Loader2, Plus, Trash2, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  excluirResponsavel,
  salvarResponsavel,
} from "@/actions/gestor-responsaveis";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  PARENTESCOS,
  type AlunoComResponsaveis,
  type ResponsavelAluno,
} from "@/lib/responsaveis-config";

type ResponsaveisPanelProps = {
  alunos: AlunoComResponsaveis[];
};

export function ResponsaveisPanel({ alunos }: ResponsaveisPanelProps) {
  const router = useRouter();
  const [alunoAtivo, setAlunoAtivo] = useState(alunos[0]?.id ?? "");
  const [editando, setEditando] = useState<ResponsavelAluno | null>(null);
  const [novoAberto, setNovoAberto] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const aluno = alunos.find((item) => item.id === alunoAtivo) ?? null;
  const semResponsavel = alunos.filter(
    (item) => item.responsaveis.length === 0,
  ).length;

  async function handleSalvar(formData: FormData) {
    if (!aluno) return;

    setProcessando(true);
    setErro(null);

    const result = await salvarResponsavel(
      aluno.id,
      formData,
      editando?.id,
    );
    setProcessando(false);

    if (result?.error) {
      setErro(result.error);
      return;
    }

    setEditando(null);
    setNovoAberto(false);
    router.refresh();
  }

  async function handleExcluir(responsavelId: string) {
    if (!aluno) return;

    setProcessando(true);
    setErro(null);

    const result = await excluirResponsavel(aluno.id, responsavelId);
    setProcessando(false);

    if (result?.error) {
      setErro(result.error);
      return;
    }

    if (editando?.id === responsavelId) setEditando(null);
    router.refresh();
  }

  if (alunos.length === 0) {
    return (
      <Card>
        <CardTitle>Nenhum aluno matriculado</CardTitle>
        <CardDescription>
          Matricule alunos nesta escola para cadastrar responsáveis.
        </CardDescription>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardTitle className="text-base">Alunos na escola</CardTitle>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {alunos.length}
          </p>
        </Card>
        <Card>
          <CardTitle className="text-base">Sem responsável cadastrado</CardTitle>
          <p className="mt-2 text-3xl font-bold text-amber-600">
            {semResponsavel}
          </p>
        </Card>
      </div>

      <Card>
        <CardTitle>Cadastro de Responsáveis</CardTitle>
        <CardDescription>
          Selecione o aluno e informe os dados do responsável legal ou de
          quem está autorizado a retirar o estudante
        </CardDescription>

        <div className="mt-4">
          <label
            htmlFor="aluno_responsavel"
            className="text-xs font-medium uppercase tracking-wide text-slate-500"
          >
            Aluno
          </label>
          <select
            id="aluno_responsavel"
            value={alunoAtivo}
            onChange={(event) => {
              setAlunoAtivo(event.target.value);
              setEditando(null);
              setNovoAberto(false);
              setErro(null);
            }}
            className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
          >
            {alunos.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nome} — {item.turma}
                {item.responsaveis.length === 0 ? " (sem responsável)" : ""}
              </option>
            ))}
          </select>
        </div>

        {erro ? (
          <p
            className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
            role="alert"
          >
            {erro}
          </p>
        ) : null}

        {aluno ? (
          <div className="mt-6 space-y-4">
            {aluno.nomeMae && aluno.responsaveis.length === 0 ? (
              <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                Nome da mãe na matrícula:{" "}
                <span className="font-medium text-slate-900">
                  {aluno.nomeMae}
                </span>
                . Cadastre o responsável completo abaixo.
              </p>
            ) : null}

            <ul className="divide-y divide-slate-100">
              {aluno.responsaveis.map((responsavel) => (
                <li
                  key={responsavel.id}
                  className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100">
                      <UserRound
                        className="h-4 w-4 text-slate-500"
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {responsavel.nome}
                      </p>
                      <p className="text-sm text-slate-600">
                        {PARENTESCOS[responsavel.parentesco]}
                        {responsavel.telefone
                          ? ` · ${responsavel.telefone}`
                          : ""}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {responsavel.responsavelLegal ? (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                            Responsável legal
                          </span>
                        ) : null}
                        {responsavel.autorizadoRetirar ? (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                            Autorizado a retirar
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setEditando(responsavel);
                        setNovoAberto(true);
                      }}
                      disabled={processando}
                    >
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleExcluir(responsavel.id)}
                      disabled={processando}
                      aria-label={`Excluir ${responsavel.nome}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </li>
              ))}
              {aluno.responsaveis.length === 0 ? (
                <li className="py-4 text-sm text-slate-500">
                  Nenhum responsável cadastrado para este aluno.
                </li>
              ) : null}
            </ul>

            {!novoAberto ? (
              <Button
                type="button"
                onClick={() => {
                  setEditando(null);
                  setNovoAberto(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                Novo responsável
              </Button>
            ) : (
              <form
                action={handleSalvar}
                className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-slate-900">
                    {editando ? "Editar responsável" : "Novo responsável"}
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setNovoAberto(false);
                      setEditando(null);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Campo
                    label="Nome completo"
                    name="nome"
                    defaultValue={editando?.nome}
                    required
                    className="sm:col-span-2"
                  />
                  <div>
                    <label
                      htmlFor="parentesco"
                      className="text-xs font-medium uppercase tracking-wide text-slate-500"
                    >
                      Parentesco
                    </label>
                    <select
                      id="parentesco"
                      name="parentesco"
                      required
                      defaultValue={editando?.parentesco ?? "mae"}
                      className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
                    >
                      {Object.entries(PARENTESCOS).map(([chave, label]) => (
                        <option key={chave} value={chave}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Campo
                    label="CPF"
                    name="cpf"
                    defaultValue={editando?.cpf ?? ""}
                    placeholder="000.000.000-00"
                  />
                  <Campo
                    label="RG"
                    name="rg"
                    defaultValue={editando?.rg ?? ""}
                  />
                  <Campo
                    label="Telefone"
                    name="telefone"
                    defaultValue={editando?.telefone ?? ""}
                    placeholder="(00) 00000-0000"
                  />
                  <Campo
                    label="Telefone alternativo"
                    name="telefone_alt"
                    defaultValue={editando?.telefoneAlt ?? ""}
                  />
                  <Campo
                    label="E-mail"
                    name="email"
                    type="email"
                    defaultValue={editando?.email ?? ""}
                    className="sm:col-span-2"
                  />
                  <Campo
                    label="Endereço"
                    name="endereco"
                    defaultValue={editando?.endereco ?? ""}
                    className="sm:col-span-2"
                  />
                  <Campo
                    label="Bairro"
                    name="bairro"
                    defaultValue={editando?.bairro ?? ""}
                  />
                  <Campo
                    label="CEP"
                    name="cep"
                    defaultValue={editando?.cep ?? ""}
                  />
                  <Campo
                    label="Local de trabalho"
                    name="local_trabalho"
                    defaultValue={editando?.localTrabalho ?? ""}
                  />
                  <Campo
                    label="Telefone do trabalho"
                    name="telefone_trabalho"
                    defaultValue={editando?.telefoneTrabalho ?? ""}
                  />
                </div>

                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      name="responsavel_legal"
                      defaultChecked={editando?.responsavelLegal ?? true}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    Responsável legal
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      name="autorizado_retirar"
                      defaultChecked={editando?.autorizadoRetirar ?? true}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    Autorizado a retirar o aluno
                  </label>
                </div>

                <div>
                  <label
                    htmlFor="observacoes"
                    className="text-xs font-medium uppercase tracking-wide text-slate-500"
                  >
                    Observações
                  </label>
                  <textarea
                    id="observacoes"
                    name="observacoes"
                    rows={3}
                    defaultValue={editando?.observacoes ?? ""}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  />
                </div>

                <Button type="submit" disabled={processando}>
                  {processando ? (
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : editando ? (
                    "Salvar alterações"
                  ) : (
                    "Cadastrar responsável"
                  )}
                </Button>
              </form>
            )}
          </div>
        ) : null}
      </Card>
    </div>
  );
}

function Campo({
  label,
  name,
  defaultValue,
  placeholder,
  required,
  type = "text",
  className,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
  className?: string;
}) {
  return (
    <div className={className}>
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
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="mt-1"
      />
    </div>
  );
}
