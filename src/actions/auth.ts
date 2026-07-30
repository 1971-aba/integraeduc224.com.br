"use server";



import { cookies } from "next/headers";

import { redirect } from "next/navigation";



import { getDashboardPath } from "@/lib/auth";

import {

  setAnoLetivoSession,

  clearAnoLetivoSession,

} from "@/lib/ano-letivo-session";

import {

  DEV_SESSION_COOKIE,

  devAccounts,

  findDevAccountByProfile,

  isDevLoginEnabled,

  serializeDevProfile,

} from "@/lib/dev-auth";

import {

  getLoginProfileLabel,

  isLoginProfileId,

  roleMatchesLoginProfile,

} from "@/lib/login-profiles";

import { createClient } from "@/lib/supabase/server";



export async function login(formData: FormData) {

  const loginInput = String(formData.get("login") ?? "").trim();

  const password = String(formData.get("password") ?? "");

  const perfilInput = String(formData.get("perfil") ?? "").trim();

  const anoLetivoId = String(formData.get("ano_letivo_id") ?? "").trim();



  if (!loginInput || !password) {

    return { error: "Informe usuário e senha." };

  }



  if (!isLoginProfileId(perfilInput)) {

    return { error: "Selecione o perfil de acesso." };

  }



  if (!anoLetivoId) {

    return { error: "Selecione o ano letivo." };

  }



  async function finishLogin() {

    await setAnoLetivoSession(anoLetivoId);

  }



  const supabase = await createClient();



  const { data: email, error: resolveError } = await supabase.rpc(

    "resolve_login_email",

    { login_input: loginInput },

  );



  if (!resolveError && email) {

    const { error } = await supabase.auth.signInWithPassword({

      email,

      password,

    });



    if (!error) {

      const {

        data: { user },

      } = await supabase.auth.getUser();



      if (user) {

        const { data: profile } = await supabase

          .from("profiles")

          .select("role, ativo, escola_id")

          .eq("id", user.id)

          .single();



        if (profile?.ativo) {

          if (!roleMatchesLoginProfile(profile.role, perfilInput)) {

            await supabase.auth.signOut();

            return {

              error: `Este usuário não possui acesso ao perfil "${getLoginProfileLabel(perfilInput)}".`,

            };

          }



          const cookieStore = await cookies();

          cookieStore.delete(DEV_SESSION_COOKIE);

          await finishLogin();

          redirect(getDashboardPath(profile.role));

        }



        await supabase.auth.signOut();

        return { error: "Usuário inativo. Contate a secretaria." };

      }

    }

  }



  if (isDevLoginEnabled()) {

    const devAccount = findDevAccountByProfile(loginInput, password, perfilInput);



    if (devAccount) {

      await supabase.auth.signOut();



      const cookieStore = await cookies();

      cookieStore.set(DEV_SESSION_COOKIE, serializeDevProfile(devAccount.profile), {

        httpOnly: true,

        sameSite: "lax",

        path: "/",

        maxAge: 60 * 60 * 8,

      });



      await finishLogin();

      redirect(getDashboardPath(devAccount.profile.role));

    }



    const loginExists = devAccounts.some(

      (account) =>

        account.login.toLowerCase() === loginInput.trim().toLowerCase() &&

        account.password === password,

    );



    if (loginExists) {

      return {

        error: `Perfil incorreto para este usuário. Selecione "${getLoginProfileLabel(perfilInput)}" apenas se sua conta tiver esse acesso.`,

      };

    }

  }



  return {

    error: isDevLoginEnabled()

      ? "Credenciais inválidas. Use os dados demo exibidos abaixo do formulário."

      : "Credenciais inválidas.",

  };

}



export async function logout() {

  const cookieStore = await cookies();

  cookieStore.delete(DEV_SESSION_COOKIE);

  await clearAnoLetivoSession();



  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect("/login");

}


