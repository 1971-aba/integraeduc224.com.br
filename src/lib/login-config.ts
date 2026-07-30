import {
  demoPerfilFromRole,
  getLoginProfileLabel,
} from "@/lib/login-profiles";
import type { UserRole } from "@/types/database";

export const loginBranding = {
  estado: "ESTADO DO PIAUÍ",
  prefeitura: "PREFEITURA MUNICIPAL DE JARDIM DO MULATO-PI",
  brasaoSrc: "/brasao-jardim-mulato-white.png",
  footer: "IntegraEduc224",
  backgroundSrc: "/login-background.png",
};

type DemoCredential = {
  perfil: string;
  perfilLogin: string;
  usuario: string;
  senha: string;
};

function demoCred(
  role: UserRole,
  perfilLabel: string,
  usuario: string,
): DemoCredential {
  const perfilId = demoPerfilFromRole(role);
  return {
    perfil: perfilLabel,
    perfilLogin: getLoginProfileLabel(perfilId),
    usuario,
    senha: "Demo@2026",
  };
}

export const demoCredentials: DemoCredential[] = [
  demoCred("coordenador", "Coordenador Pedagógico", "55566677788"),
  demoCred("gestor_escolar", "Gestor Escolar", "98765432100"),
  demoCred("professor", "Professor", "11122233344"),
  demoCred("professor", "Professor (painel)", "professor@emefmaria.gov.br"),
  demoCred("tecnico_sga", "Técnico SGA", "77788899900"),
  demoCred("admin_sme", "Admin SME", "12345678901"),
];
