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
  const labels: Record<string, string> = {
    manha: "MANHÃ",
    tarde: "TARDE",
    noite: "NOITE",
    integral: "INTEGRAL",
  };

  return labels[turno.toLowerCase()] ?? turno.toUpperCase();
}
