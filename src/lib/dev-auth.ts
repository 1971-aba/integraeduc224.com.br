import type { Profile, UserRole } from "@/types/database";

import {
  roleMatchesLoginProfile,
  type LoginProfileId,
} from "@/lib/login-profiles";

export const DEMO_SECRETARIA_ID = "11111111-1111-1111-1111-111111111111";
export const DEMO_ESCOLA_ID = "22222222-2222-2222-2222-222222222221";
export const DEMO_ESCOLA_NOME = "EMEF MARIA SILVA";
export const DEMO_ESCOLA_JOAO_BARBOSA_ID = "22222222-2222-2222-2222-222222222222";
export const DEMO_ESCOLA_JOAO_BARBOSA_NOME = "UNIDADE ESCOLAR JOÃO BARBOSA SOARES";

export const demoEscolas = [
  { id: DEMO_ESCOLA_ID, nome: "EMEF Maria Silva" },
  { id: DEMO_ESCOLA_JOAO_BARBOSA_ID, nome: DEMO_ESCOLA_JOAO_BARBOSA_NOME },
];

type DevAccount = {
  login: string;
  password: string;
  escolaId: string | "admin" | "sga";
  profile: Profile;
};

const DEV_USER_IDS = {
  admin: "b1111111-1111-1111-1111-111111111111",
  gestor: "b2222222-2222-2222-2222-222222222221",
  coordenador: "b3333333-3333-3333-3333-333333333333",
  professor: "b4444444-4444-4444-4444-444444444441",
  sga: "b5555555-5555-5555-5555-555555555552",
} as const;

export const DEMO_ANO_LETIVO_ID = "33333333-3333-3333-3333-333333333333";
export const DEMO_ATRIBUICAO_ID = "b5555555-5555-5555-5555-555555555551";
export const DEMO_TURMA_5A_ID = "95082835-a76f-40cc-9e79-ff6ce03616d7";
export const DEMO_DISCIPLINA_PORTUGUES_ID =
  "44444444-4444-4444-4444-444444444401";

export { DEV_USER_IDS };

export function isDevProfileId(id: string) {
  return (Object.values(DEV_USER_IDS) as string[]).includes(id);
}

export function getDemoProfessorAtribuicoes() {
  return [
    {
      id: DEMO_ATRIBUICAO_ID,
      turma_id: DEMO_TURMA_5A_ID,
      disciplina_id: DEMO_DISCIPLINA_PORTUGUES_ID,
      ano_letivo_id: DEMO_ANO_LETIVO_ID,
      turmas: {
        id: DEMO_TURMA_5A_ID,
        nome: "5º A",
        serie: "5º ano",
        turno: "manha",
      },
      disciplinas: {
        id: DEMO_DISCIPLINA_PORTUGUES_ID,
        nome: "Língua Portuguesa",
      },
      anos_letivos: {
        id: DEMO_ANO_LETIVO_ID,
        ano: 2026,
        ativo: true,
      },
    },
  ];
}

function buildDevProfile(
  role: UserRole,
  nome: string,
  escolaId: string | null,
  email: string,
): Profile {
  const now = new Date().toISOString();
  const id =
    role === "admin_sme"
      ? DEV_USER_IDS.admin
      : role === "gestor_escolar"
        ? DEV_USER_IDS.gestor
        : role === "coordenador"
          ? DEV_USER_IDS.coordenador
          : role === "tecnico_sga"
            ? DEV_USER_IDS.sga
            : DEV_USER_IDS.professor;

  return {
    id,
    secretaria_id: DEMO_SECRETARIA_ID,
    escola_id: escolaId,
    role,
    nome,
    cpf: null,
    email,
    ativo: true,
    created_at: now,
    updated_at: now,
  };
}

export const devAccounts: DevAccount[] = [
  {
    login: "12345678901",
    password: "Demo@2026",
    escolaId: "admin",
    profile: buildDevProfile("admin_sme", "Administrador SME", null, "admin@sme.gov.br"),
  },
  {
    login: "98765432100",
    password: "Demo@2026",
    escolaId: DEMO_ESCOLA_ID,
    profile: buildDevProfile(
      "gestor_escolar",
      "Gestor EMEF Maria Silva",
      DEMO_ESCOLA_ID,
      "gestor@emefmaria.gov.br",
    ),
  },
  {
    login: "11122233344",
    password: "Demo@2026",
    escolaId: DEMO_ESCOLA_ID,
    profile: buildDevProfile(
      "professor",
      "Prof. Ana Souza",
      DEMO_ESCOLA_ID,
      "professor@emefmaria.gov.br",
    ),
  },
  {
    login: "gestor@emefmaria.gov.br",
    password: "Demo@2026",
    escolaId: DEMO_ESCOLA_ID,
    profile: buildDevProfile(
      "gestor_escolar",
      "Gestor EMEF Maria Silva",
      DEMO_ESCOLA_ID,
      "gestor@emefmaria.gov.br",
    ),
  },
  {
    login: "professor@emefmaria.gov.br",
    password: "Demo@2026",
    escolaId: DEMO_ESCOLA_ID,
    profile: buildDevProfile(
      "professor",
      "Prof. Ana Souza",
      DEMO_ESCOLA_ID,
      "professor@emefmaria.gov.br",
    ),
  },
  {
    login: "admin@sme.gov.br",
    password: "Demo@2026",
    escolaId: "admin",
    profile: buildDevProfile("admin_sme", "Administrador SME", null, "admin@sme.gov.br"),
  },
  {
    login: "55566677788",
    password: "Demo@2026",
    escolaId: DEMO_ESCOLA_JOAO_BARBOSA_ID,
    profile: buildDevProfile(
      "coordenador",
      "Coord. Maria Vieira Leal",
      DEMO_ESCOLA_JOAO_BARBOSA_ID,
      "coordenador@joaobarbosa.gov.br",
    ),
  },
  {
    login: "coordenador@joaobarbosa.gov.br",
    password: "Demo@2026",
    escolaId: DEMO_ESCOLA_JOAO_BARBOSA_ID,
    profile: buildDevProfile(
      "coordenador",
      "Coord. Maria Vieira Leal",
      DEMO_ESCOLA_JOAO_BARBOSA_ID,
      "coordenador@joaobarbosa.gov.br",
    ),
  },
  {
    login: "77788899900",
    password: "Demo@2026",
    escolaId: "sga",
    profile: buildDevProfile(
      "tecnico_sga",
      "Téc. Carlos Mendes (SGA)",
      null,
      "sga@sme.gov.br",
    ),
  },
  {
    login: "sga@sme.gov.br",
    password: "Demo@2026",
    escolaId: "sga",
    profile: buildDevProfile(
      "tecnico_sga",
      "Téc. Carlos Mendes (SGA)",
      null,
      "sga@sme.gov.br",
    ),
  },
];

export function isDevLoginEnabled() {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.ENABLE_DEV_LOGIN === "true"
  );
}

export function findDevAccount(
  loginInput: string,
  password: string,
  escolaId: string,
) {
  const normalizedLogin = loginInput.trim().toLowerCase();

  return devAccounts.find((account) => {
    if (account.password !== password) return false;
    if (account.login.toLowerCase() !== normalizedLogin) return false;
    if (account.escolaId === escolaId) return true;

    if (account.escolaId === "sga" && escolaId === "sga") return true;

    if (account.escolaId !== "admin" && account.escolaId !== "sga") {
      const demoIds = demoEscolas.map((escola) => escola.id);
      return demoIds.includes(escolaId) && account.escolaId === escolaId;
    }

    return false;
  });
}

export function findDevAccountByProfile(
  loginInput: string,
  password: string,
  perfil: LoginProfileId,
) {
  const normalizedLogin = loginInput.trim().toLowerCase();

  return devAccounts.find((account) => {
    if (account.password !== password) return false;
    if (account.login.toLowerCase() !== normalizedLogin) return false;
    return roleMatchesLoginProfile(account.profile.role, perfil);
  });
}

export const DEV_SESSION_COOKIE = "dev_platform_session";

export function serializeDevProfile(profile: Profile) {
  return JSON.stringify(profile);
}

export function parseDevProfile(value: string | undefined): Profile | null {
  if (!value) return null;

  try {
    const profile = JSON.parse(value) as Profile;
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        profile.id,
      );

    if (!isUuid) return null;

    return profile;
  } catch {
    return null;
  }
}

export function getDevUser(profile: Profile) {
  return {
    id: profile.id,
    email: profile.email ?? "dev@local.demo",
  };
}
