/**
 * Testa cadastro SGA via RPC (mesmo fluxo do painel).
 */
const URL = "https://xlbddrjzrrpxsarppxky.supabase.co";
const ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsYmRkcmp6cnJweHNhcnBweGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxODgwMzEsImV4cCI6MjA5OTc2NDAzMX0.JKknUVNYphHxxCkjcefqrXyyy69UUHtuuS4QZoQh41Y";

const TEST_USER = {
  p_nome: "Prof. Teste Painel SGA",
  p_email: "teste.painel.sga@sme.gov.br",
  p_cpf: "99988877766",
  p_senha: "Demo@2026",
  p_role: "professor",
  p_escola_id: "22222222-2222-2222-2222-222222222221",
  p_ativo: true,
};

async function login() {
  const res = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: ANON,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "sga@sme.gov.br",
      password: "Demo@2026",
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Login SGA falhou: ${data.error_description ?? data.msg ?? res.status}`);
  }
  return data.access_token;
}

async function criarUsuario(token) {
  const res = await fetch(`${URL}/rest/v1/rpc/sga_criar_usuario`, {
    method: "POST",
    headers: {
      apikey: ANON,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(TEST_USER),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Cadastro falhou (${res.status}): ${text}`);
  }

  return text ? JSON.parse(text) : null;
}

async function verificarLoginNovoUsuario() {
  const res = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: ANON,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: TEST_USER.p_email,
      password: TEST_USER.p_senha,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Login do novo usuário falhou: ${data.error_description ?? data.msg}`);
  }
  return true;
}

async function main() {
  console.log("1. Login como técnico SGA...");
  const token = await login();
  console.log("   OK");

  console.log("2. Cadastrando usuário via sga_criar_usuario...");
  const userId = await criarUsuario(token);
  console.log("   OK — ID:", userId);

  console.log("3. Testando login do novo usuário...");
  await verificarLoginNovoUsuario();
  console.log("   OK");

  console.log("\nCadastro testado com sucesso!");
  console.log("E-mail:", TEST_USER.p_email);
  console.log("CPF:", TEST_USER.p_cpf);
  console.log("Senha:", TEST_USER.p_senha);
}

main().catch((err) => {
  console.error("\nERRO:", err.message);
  process.exit(1);
});
