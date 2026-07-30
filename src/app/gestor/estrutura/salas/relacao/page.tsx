import { listEstruturaEscolar } from "@/actions/gestor-estrutura-almoxarifado";
import { SemEscolaAlert } from "@/components/coordenador/sem-escola-alert";
import { GestorPageHeader } from "@/components/dashboard/gestor-page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ExportarCsv } from "@/components/ui/exportar-csv";
import { requireRole } from "@/lib/auth";
import { ESTRUTURA_TIPO_LABEL } from "@/lib/gestor-modulos-types";
import { createClient } from "@/lib/supabase/server";

export default async function RelacaoSalasPage() {
  const { profile } = await requireRole(["gestor_escolar", "admin_sme"]);

  if (!profile.escola_id) {
    return (
      <>
        <GestorPageHeader
          title="Relação de Espaços"
          description="Salas e dependências da unidade"
        />
        <SemEscolaAlert />
      </>
    );
  }

  const supabase = await createClient();
  const { data: escola } = await supabase
    .from("escolas")
    .select("nome")
    .eq("id", profile.escola_id)
    .maybeSingle();

  const itens = await listEstruturaEscolar(profile.escola_id);
  const capacidadeTotal = itens.reduce(
    (soma, item) => soma + (item.capacidade ?? 0),
    0,
  );

  const linhasCsv = itens.map((item) => ({
    Nome: item.nome,
    Tipo: ESTRUTURA_TIPO_LABEL[item.tipo],
    Capacidade: item.capacidade != null ? String(item.capacidade) : "",
    Descricao: item.descricao ?? "",
  }));

  return (
    <>
      <GestorPageHeader
        title="Relação de Espaços"
        description={`${itens.length} espaço(s) · capacidade total ${capacidadeTotal} · ${
          escola?.nome ?? "Unidade Escolar"
        }`}
        actions={
          <ExportarCsv
            rows={linhasCsv}
            filename="salas-dependencias.csv"
            label={`Exportar CSV (${linhasCsv.length})`}
          />
        }
      />

      <Card>
        <CardTitle>Salas e dependências</CardTitle>
        <CardDescription>
          Relação completa dos espaços físicos da escola
        </CardDescription>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">Nome</th>
                <th className="px-3 py-2 font-medium">Tipo</th>
                <th className="px-3 py-2 font-medium">Capacidade</th>
                <th className="px-3 py-2 font-medium">Descrição</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-100 last:border-b-0"
                >
                  <td className="px-3 py-3 font-medium text-slate-900">
                    {item.nome}
                  </td>
                  <td className="px-3 py-3 text-slate-600">
                    {ESTRUTURA_TIPO_LABEL[item.tipo]}
                  </td>
                  <td className="px-3 py-3 text-slate-600">
                    {item.capacidade ?? "—"}
                  </td>
                  <td className="px-3 py-3 text-slate-600">
                    {item.descricao ?? "—"}
                  </td>
                </tr>
              ))}
              {itens.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-8 text-center text-slate-500"
                  >
                    Nenhum espaço cadastrado. Use Cadastro de Salas para incluir.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
