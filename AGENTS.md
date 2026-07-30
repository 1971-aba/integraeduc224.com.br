<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Publicação

Quando o usuário aprovar uma alteração, execute os três passos, nesta ordem:

1. `npm run build` — a publicação só acontece se o build passar.
2. `git commit` na branch `main` e `git push origin main` (remote `1971-aba/integraeduc224.com.br`).
3. `npx vercel --prod --yes` — **obrigatório**. O projeto `plataforma-educacao` não está conectado ao GitHub, então o push não dispara deploy; sem este passo o site continua na versão anterior.

O usuário acompanha as alterações ao vivo em https://integraeduc224.com.br, então confirme ao final que o deploy foi apontado (*aliased*) para esse domínio.
