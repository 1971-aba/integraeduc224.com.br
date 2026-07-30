import type { UserRole } from "@/types/database";

export type LoginProfileId = "semec" | "diretor" | "coordenador" | "professor";

export type LoginProfileOption = {
  id: LoginProfileId;
  label: string;
  description: string;
};

export const loginProfileOptions: LoginProfileOption[] = [
  {
    id: "semec",
    label: "SEMEC — Gestão de Acesso",
    description: "Secretaria e SGA",
  },
  {
    id: "diretor",
    label: "Diretor",
    description: "Gestão escolar",
  },
  {
    id: "coordenador",
    label: "Coordenador",
    description: "Coordenação pedagógica",
  },
  {
    id: "professor",
    label: "Professor",
    description: "Sala de aula e diário",
  },
];

const profileRoles: Record<LoginProfileId, UserRole[]> = {
  semec: ["tecnico_sga", "admin_sme"],
  diretor: ["gestor_escolar"],
  coordenador: ["coordenador"],
  professor: ["professor"],
};

export function isLoginProfileId(value: string): value is LoginProfileId {
  return value in profileRoles;
}

export function roleMatchesLoginProfile(role: UserRole, perfil: LoginProfileId) {
  return profileRoles[perfil].includes(role);
}

export function getLoginProfileLabel(perfil: LoginProfileId) {
  return loginProfileOptions.find((option) => option.id === perfil)?.label ?? perfil;
}

export function demoPerfilFromRole(role: UserRole): LoginProfileId {
  switch (role) {
    case "admin_sme":
    case "tecnico_sga":
      return "semec";
    case "gestor_escolar":
      return "diretor";
    case "coordenador":
      return "coordenador";
    case "professor":
      return "professor";
  }
}
