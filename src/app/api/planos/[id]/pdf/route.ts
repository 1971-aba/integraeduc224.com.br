import { NextResponse } from "next/server";

import { renderPlanoAulaPdf } from "@/lib/pdf/render-plano-pdf";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { data: plano } = await supabase
    .from("planos_aula")
    .select(
      "id, tema, serie, disciplina, conteudo_ia, conteudo_final, professor_id",
    )
    .eq("id", id)
    .eq("professor_id", user.id)
    .maybeSingle();

  if (!plano) {
    return NextResponse.json({ error: "Plano não encontrado." }, { status: 404 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome, secretaria_id")
    .eq("id", user.id)
    .single();

  const { data: secretaria } = profile?.secretaria_id
    ? await supabase
        .from("secretarias")
        .select("nome, municipio, uf, cabecalho_pdf, subtitulo_pdf")
        .eq("id", profile.secretaria_id)
        .single()
    : { data: null };

  const dataEmissao = new Date().toLocaleDateString("pt-BR");
  const conteudo = plano.conteudo_final ?? plano.conteudo_ia;
  const slug = plano.tema
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);

  const buffer = await renderPlanoAulaPdf({
    cabecalho:
      secretaria?.cabecalho_pdf ??
      secretaria?.nome ??
      "Secretaria Municipal de Educação",
    subtitulo:
      secretaria?.subtitulo_pdf ??
      (secretaria
        ? `${secretaria.municipio} — ${secretaria.uf}`
        : "Plataforma Educação"),
    tema: plano.tema,
    serie: plano.serie,
    disciplina: plano.disciplina,
    professor: profile?.nome ?? "Professor",
    conteudo,
    dataEmissao,
  });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="plano-aula-${slug || plano.id}.pdf"`,
    },
  });
}
