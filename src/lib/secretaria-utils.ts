export function cleanCpf(value: string) {
  return value.replace(/\D/g, "").slice(0, 11);
}

export function cleanNis(value: string) {
  return value.replace(/\D/g, "").slice(0, 11);
}

export function isValidCpf(value: string) {
  const cpf = cleanCpf(value);
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(cpf[i]) * (10 - i);
  let digit = (sum * 10) % 11;
  if (digit === 10) digit = 0;
  if (digit !== Number(cpf[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(cpf[i]) * (11 - i);
  digit = (sum * 10) % 11;
  if (digit === 10) digit = 0;
  return digit === Number(cpf[10]);
}

export const MATRICULA_STATUS_LABEL: Record<string, string> = {
  ativa: "Ativa",
  transferido: "Transferido",
  concluido: "Concluído",
  cancelado: "Cancelado",
};
