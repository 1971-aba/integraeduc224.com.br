"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

type FilterOptions = {
  escolas: Array<{ id: string; nome: string }>;
  disciplinas: Array<{ id: string; nome: string }>;
  series: string[];
  bimestres: Array<{ id: string; label: string }>;
};

type BiFiltersProps = {
  options: FilterOptions;
  values: {
    escolaId?: string;
    serie?: string;
    disciplinaId?: string;
    bimestreId?: string;
  };
};

export function BiFilters({ options, values }: BiFiltersProps) {
  const router = useRouter();

  function applyFilters(formData: FormData) {
    const params = new URLSearchParams();

    const escola = String(formData.get("escola_id") ?? "");
    const serie = String(formData.get("serie") ?? "");
    const disciplina = String(formData.get("disciplina_id") ?? "");
    const bimestre = String(formData.get("bimestre_id") ?? "");

    if (escola) params.set("escola_id", escola);
    if (serie) params.set("serie", serie);
    if (disciplina) params.set("disciplina_id", disciplina);
    if (bimestre) params.set("bimestre_id", bimestre);

    router.push(`/admin/bi?${params.toString()}`);
  }

  function limparFiltros() {
    router.push("/admin/bi");
  }

  return (
    <Card>
      <CardTitle>Filtros de desempenho</CardTitle>
      <CardDescription>
        Escola, série, disciplina e bimestre
      </CardDescription>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          applyFilters(new FormData(event.currentTarget));
        }}
        className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <SelectField
          label="Escola"
          name="escola_id"
          defaultValue={values.escolaId ?? ""}
          options={options.escolas.map((item) => ({
            value: item.id,
            label: item.nome,
          }))}
        />
        <SelectField
          label="Série"
          name="serie"
          defaultValue={values.serie ?? ""}
          options={options.series.map((item) => ({ value: item, label: item }))}
        />
        <SelectField
          label="Disciplina"
          name="disciplina_id"
          defaultValue={values.disciplinaId ?? ""}
          options={options.disciplinas.map((item) => ({
            value: item.id,
            label: item.nome,
          }))}
        />
        <SelectField
          label="Bimestre"
          name="bimestre_id"
          defaultValue={values.bimestreId ?? ""}
          options={options.bimestres.map((item) => ({
            value: item.id,
            label: item.label,
          }))}
        />

        <div className="flex gap-2 sm:col-span-2 lg:col-span-4">
          <Button type="submit">Aplicar filtros</Button>
          <Button type="button" variant="secondary" onClick={limparFiltros}>
            Limpar
          </Button>
        </div>
      </form>
    </Card>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        className="mt-2 flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
      >
        <option value="">Todas</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
