export function formatDashboardDate(date: Date) {
  const formatted = date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return formatted.replace(
    / de ([\p{L}])/u,
    (_, letter: string) => ` de ${letter.toUpperCase()}`,
  );
}

export function formatTurnoLabel(turno: string) {
  const normalized = turno.toLowerCase();
  const labels: Record<string, string> = {
    manha: "MANHÃ",
    matutino: "MANHÃ",
    tarde: "TARDE",
    vespertino: "TARDE",
    noite: "NOITE",
    noturno: "NOITE",
    integral: "INTEGRAL",
  };

  return labels[normalized] ?? turno.toUpperCase();
}

export function formatSerieMenuLabel(serie: string) {
  const match = serie.match(/(\d+)/);
  if (!match) {
    return serie.toUpperCase();
  }

  return `${match[1]}ª ANO`;
}

export function formatTurmaAtualizarDadosLabel(
  serie: string,
  turno: string,
  id: string,
  options?: { nome?: string; codigo?: number | null },
) {
  const displayId =
    options?.codigo != null
      ? String(options.codigo)
      : options?.nome && /^\d+$/.test(options.nome)
        ? options.nome
        : id;

  return `${formatSerieMenuLabel(serie)} - ${formatTurnoLabel(turno)} - ID: ${displayId}`;
}
