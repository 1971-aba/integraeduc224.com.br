/**
 * Seed seguro de usuários demo via Supabase Auth Admin API.
 * Requer SUPABASE_SERVICE_ROLE_KEY (nunca expor no client ou Vercel public).
 */
import { createClient } from "@supabase/supabase-js";

import { loadEnv, requireEnv } from "./lib/env.mjs";

loadEnv();

const SECRETARIA_ID = "11111111-1111-1111-1111-111111111111";
const ESCOLA_MARIA_ID = "22222222-2222-2222-2222-222222222221";
const ESCOLA_JOAO_BARBOSA_ID = "22222222-2222-2222-2222-222222222222";
const ANO_LETIVO_ID = "33333333-3333-3333-3333-333333333333";
const DISCIPLINA_PORTUGUES_ID = "44444444-4444-4444-4444-444444444401";
const TURMA_5A_ID = "95082835-a76f-40cc-9e79-ff6ce03616d7";

const DEMO_USERS = [
  {
    email: "admin@sme.gov.br",
    cpf: "12345678901",
    nome: "Administrador SME",
    role: "admin_sme",
    secretaria_id: SECRETARIA_ID,
    escola_id: null,
  },
  {
    email: "gestor@emefmaria.gov.br",
    cpf: "98765432100",
    nome: "Gestor EMEF Maria Silva",
    role: "gestor_escolar",
    secretaria_id: SECRETARIA_ID,
    escola_id: ESCOLA_MARIA_ID,
  },
  {
    email: "professor@emefmaria.gov.br",
    cpf: "11122233344",
    nome: "Prof. Ana Souza",
    role: "professor",
    secretaria_id: SECRETARIA_ID,
    escola_id: ESCOLA_MARIA_ID,
  },
  {
    email: "coordenador@joaobarbosa.gov.br",
    cpf: "55566677788",
    nome: "Coord. Maria Vieira Leal",
    role: "coordenador",
    secretaria_id: SECRETARIA_ID,
    escola_id: ESCOLA_JOAO_BARBOSA_ID,
  },
  {
    email: "sga@sme.gov.br",
    cpf: "77788899900",
    nome: "Téc. Carlos Mendes (SGA)",
    role: "tecnico_sga",
    secretaria_id: SECRETARIA_ID,
    escola_id: null,
  },
];

const DEMO_PASSWORD = "Demo@2026";

function generatePassword() {
  return DEMO_PASSWORD;
}

async function findUserByEmail(admin, email) {
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const match = data.users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase(),
    );
    if (match) return match;

    if (data.users.length < perPage) return null;
    page += 1;
  }
}

async function upsertDemoUser(admin, db, user, password) {
  let authUser = await findUserByEmail(admin, user.email);

  if (authUser) {
    const { data, error } = await admin.auth.admin.updateUserById(authUser.id, {
      password,
      email_confirm: true,
      user_metadata: {
        nome: user.nome,
        role: user.role,
      },
    });
    if (error) throw error;
    authUser = data.user;
    console.log(`↻ Atualizado: ${user.email}`);
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email: user.email,
      password,
      email_confirm: true,
      user_metadata: {
        nome: user.nome,
        role: user.role,
      },
    });
    if (error) throw error;
    authUser = data.user;
    console.log(`✓ Criado: ${user.email}`);
  }

  const { error: profileError } = await db.from("profiles").upsert(
    {
      id: authUser.id,
      secretaria_id: user.secretaria_id,
      escola_id: user.escola_id,
      role: user.role,
      nome: user.nome,
      cpf: user.cpf,
      email: user.email,
      ativo: true,
    },
    { onConflict: "id" },
  );

  if (profileError) throw profileError;

  return { authUser, password };
}

async function ensureProfessorAtribuicao(db, professorId) {
  const { data: existing, error: selectError } = await db
    .from("atribuicoes_docentes")
    .select("id")
    .eq("professor_id", professorId)
    .eq("turma_id", TURMA_5A_ID)
    .eq("disciplina_id", DISCIPLINA_PORTUGUES_ID)
    .maybeSingle();

  if (selectError) throw selectError;
  if (existing) return;

  const { error: insertError } = await db.from("atribuicoes_docentes").insert({
    professor_id: professorId,
    disciplina_id: DISCIPLINA_PORTUGUES_ID,
    turma_id: TURMA_5A_ID,
    ano_letivo_id: ANO_LETIVO_ID,
  });

  if (insertError) throw insertError;
  console.log("✓ Atribuição docente (5º A / Português) vinculada");
}

async function removeLegacySqlUsers(db) {
  const legacyIds = [
    "a1111111-1111-1111-1111-111111111111",
    "a2222222-2222-2222-2222-222222222221",
    "a3333333-3333-3333-3333-333333333331",
  ];

  for (const id of legacyIds) {
    await db.from("atribuicoes_docentes").delete().eq("professor_id", id);
    await db.from("profiles").delete().eq("id", id);

    const { error } = await db.auth.admin.deleteUser(id);
    if (error && !/not found|User not found/i.test(error.message)) {
      console.warn(`⚠ Não foi possível remover legado ${id}: ${error.message}`);
    } else if (!error) {
      console.log(`✓ Removido usuário legado (SQL): ${id}`);
    }
  }
}

async function ensureDemoBaseData(db) {
  const { error: secretariaError } = await db.from("secretarias").upsert(
    {
      id: SECRETARIA_ID,
      nome: "Secretaria Municipal de Educação — Jardim do Mulato",
      municipio: "Jardim do Mulato",
      uf: "PI",
    },
    { onConflict: "id" },
  );
  if (secretariaError) throw secretariaError;
  console.log("✓ Secretaria demo");

  const { error: escolaError } = await db.from("escolas").upsert(
    {
      id: ESCOLA_MARIA_ID,
      secretaria_id: SECRETARIA_ID,
      nome: "EMEF Maria Silva",
      inep: "22000001",
      endereco: "Jardim do Mulato — PI",
      ativa: true,
    },
    { onConflict: "id" },
  );
  if (escolaError) throw escolaError;
  console.log("✓ Escola demo");

  const { error: escolaJoaoError } = await db.from("escolas").upsert(
    {
      id: ESCOLA_JOAO_BARBOSA_ID,
      secretaria_id: SECRETARIA_ID,
      nome: "UNIDADE ESCOLAR JOÃO BARBOSA SOARES",
      inep: "22000002",
      endereco: "Jardim do Mulato — PI",
      ativa: true,
    },
    { onConflict: "id" },
  );
  if (escolaJoaoError) throw escolaJoaoError;
  console.log("✓ Escola João Barbosa Soares");

  const { error: anoError } = await db.from("anos_letivos").upsert(
    {
      id: ANO_LETIVO_ID,
      secretaria_id: SECRETARIA_ID,
      ano: 2026,
      ativo: true,
    },
    { onConflict: "id" },
  );
  if (anoError) throw anoError;
  console.log("✓ Ano letivo demo");

  const { error: disciplinaError } = await db.from("disciplinas").upsert(
    {
      id: DISCIPLINA_PORTUGUES_ID,
      secretaria_id: SECRETARIA_ID,
      nome: "Língua Portuguesa",
    },
    { onConflict: "id" },
  );
  if (disciplinaError) throw disciplinaError;
  console.log("✓ Disciplina demo");

  const { error: turmaError } = await db.from("turmas").upsert(
    [
      {
        id: "a1000001-0001-4001-8001-000000000001",
        escola_id: ESCOLA_MARIA_ID,
        ano_letivo_id: ANO_LETIVO_ID,
        nome: "A",
        serie: "1º ano",
        turno: "matutino",
        codigo: 54,
      },
      {
        id: "a1000002-0002-4002-8002-000000000002",
        escola_id: ESCOLA_MARIA_ID,
        ano_letivo_id: ANO_LETIVO_ID,
        nome: "A",
        serie: "2º ano",
        turno: "matutino",
        codigo: 55,
      },
      {
        id: "a1000003-0003-4003-8003-000000000003",
        escola_id: ESCOLA_MARIA_ID,
        ano_letivo_id: ANO_LETIVO_ID,
        nome: "A",
        serie: "3º ano",
        turno: "matutino",
        codigo: 56,
      },
      {
        id: "a1000004-0004-4004-8004-000000000004",
        escola_id: ESCOLA_MARIA_ID,
        ano_letivo_id: ANO_LETIVO_ID,
        nome: "A",
        serie: "4º ano",
        turno: "matutino",
        codigo: 57,
      },
      {
        id: TURMA_5A_ID,
        escola_id: ESCOLA_MARIA_ID,
        ano_letivo_id: ANO_LETIVO_ID,
        nome: "A",
        serie: "5º ano",
        turno: "matutino",
        codigo: 58,
      },
      {
        id: "a1000006-0006-4006-8006-000000000006",
        escola_id: ESCOLA_MARIA_ID,
        ano_letivo_id: ANO_LETIVO_ID,
        nome: "A",
        serie: "6º ano",
        turno: "vespertino",
        codigo: 59,
      },
      {
        id: "a1000007-0007-4007-8007-000000000007",
        escola_id: ESCOLA_MARIA_ID,
        ano_letivo_id: ANO_LETIVO_ID,
        nome: "A",
        serie: "7º ano",
        turno: "vespertino",
        codigo: 60,
      },
      {
        id: "a1000008-0008-4008-8008-000000000008",
        escola_id: ESCOLA_MARIA_ID,
        ano_letivo_id: ANO_LETIVO_ID,
        nome: "A",
        serie: "8º ano",
        turno: "vespertino",
        codigo: 61,
      },
      {
        id: "a1000009-0009-4009-8009-000000000009",
        escola_id: ESCOLA_MARIA_ID,
        ano_letivo_id: ANO_LETIVO_ID,
        nome: "A",
        serie: "9º ano",
        turno: "vespertino",
        codigo: 62,
      },
    ],
    { onConflict: "id" },
  );
  if (turmaError) throw turmaError;
  console.log("✓ Turmas demo (1º ao 9º ano)");
}

async function main() {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  const admin = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("Criando dados base da demonstração…");
  await ensureDemoBaseData(admin);

  console.log("Removendo usuários criados via SQL direto (se existirem)…");
  await removeLegacySqlUsers(admin);

  const credentials = [];

  for (const user of DEMO_USERS) {
    const password = generatePassword();
    const { authUser } = await upsertDemoUser(admin, admin, user, password);
    credentials.push({
      perfil: user.role,
      login: `${user.cpf} ou ${user.email}`,
      senha: password,
      id: authUser.id,
    });

    if (user.role === "professor") {
      await ensureProfessorAtribuicao(admin, authUser.id);
    }
  }

  console.log("\n── Credenciais demo (guarde em local seguro; não commitar) ──");
  for (const row of credentials) {
    console.log(`\n[${row.perfil}]`);
    console.log(`  Login: ${row.login}`);
    console.log(`  Senha: ${row.senha}`);
  }
  console.log("\nLogin: https://integraeduc224.com.br/login");
}

main().catch((error) => {
  console.error("\nErro no seed:", error.message ?? error);
  process.exit(1);
});
