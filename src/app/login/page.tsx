import Link from "next/link";

import { LogOut } from "lucide-react";



import { LoginDemoPanel } from "@/components/auth/login-demo-panel";

import { LoginPageLayout } from "@/components/auth/login-page-layout";

import { SgrmeLoginForm } from "@/components/auth/sgrme-login-form";

import { logout } from "@/actions/auth";

import { getDashboardPath, getRoleLabel } from "@/lib/auth";

import {

  getFallbackAnosLetivos,

  pickDefaultAnoLetivoId,

  type AnoLetivoOption,

} from "@/lib/ano-letivo-session";

import { isDevLoginEnabled } from "@/lib/dev-auth";

import { getSessionProfile } from "@/lib/auth";

import { createClient } from "@/lib/supabase/server";

import { Button } from "@/components/ui/button";



export default async function LoginPage() {

  const { profile } = await getSessionProfile();



  const supabase = await createClient();

  const { count } = await supabase

    .from("escolas")

    .select("*", { count: "exact", head: true })

    .eq("ativa", true);



  const databaseReady = (count ?? 0) > 0;



  const { data: anosDb } = await supabase

    .from("anos_letivos")

    .select("id, ano, ativo")

    .order("ano", { ascending: false });



  const anosLetivos: AnoLetivoOption[] =

    (anosDb ?? []).length > 0

      ? (anosDb ?? []).map((ano) => ({

          id: ano.id,

          ano: ano.ano,

          ativo: ano.ativo,

        }))

      : getFallbackAnosLetivos();



  const defaultAnoLetivoId = pickDefaultAnoLetivoId(anosLetivos);



  return (

    <>

      <LoginPageLayout>

        {profile?.ativo ? (

          <div className="mb-4 rounded-lg border border-[#BBDEFB] bg-[#E3F2FD] p-4 text-sm text-[#0D47A1]">

            <p className="font-medium">

              Você já está logado como {getRoleLabel(profile.role)} ({profile.nome}

              ).

            </p>

            <div className="mt-3 flex flex-wrap gap-2">

              <Link

                href={getDashboardPath(profile.role)}

                className="inline-flex h-9 items-center rounded-md bg-[#4097B1] px-3 text-xs font-semibold uppercase text-white hover:bg-[#36899f]"

              >

                Ir para meu painel

              </Link>

              <form action={logout}>

                <Button

                  type="submit"

                  variant="secondary"

                  className="h-9 text-xs"

                >

                  <LogOut className="mr-1.5 h-3.5 w-3.5" />

                  Sair e trocar perfil

                </Button>

              </form>

            </div>

          </div>

        ) : null}



        <SgrmeLoginForm

          anosLetivos={anosLetivos}

          defaultAnoLetivoId={defaultAnoLetivoId}

        />

      </LoginPageLayout>



      <LoginDemoPanel

        databaseReady={databaseReady}

        devLoginEnabled={isDevLoginEnabled()}

      />

    </>

  );

}


