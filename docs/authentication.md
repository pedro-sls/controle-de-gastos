# Autenticação e sessões

Esta documentação descreve a Etapa 3 do MeuSaldo: cadastro, login, logout,
recuperação de senha, persistência da sessão e proteção de rotas com Supabase
Auth e Next.js 16.

## Fluxos disponíveis

| Rota               | Finalidade                                    | Acesso                |
| ------------------ | --------------------------------------------- | --------------------- |
| `/entrar`          | autenticar com e-mail e senha                 | somente visitante     |
| `/cadastro`        | criar conta e solicitar confirmação do e-mail | somente visitante     |
| `/recuperar-senha` | solicitar link de recuperação                 | somente visitante     |
| `/nova-senha`      | definir senha após validar o link             | sessão válida         |
| `/auth/confirm`    | validar `token_hash` enviado nos e-mails      | Route Handler público |
| `/auth/callback`   | trocar código PKCE por sessão como fallback   | Route Handler público |
| `/dashboard`       | entrada do shell e visão geral protegida      | usuário autenticado   |

Sidebar, navegação móvel, cabeçalho e tema foram entregues na Etapa 4. O dashboard
financeiro com cálculos e gráficos continua reservado à Etapa 7. Consulte
[Shell autenticado](application-shell.md) para as demais rotas privadas e seus
estados compartilhados.

## Arquitetura da sessão

O Supabase SSR persiste a sessão em cookies. Cada requisição recebe um cliente
novo; não existe singleton compartilhado entre usuários.

1. `src/proxy.ts` executa antes das rotas de aplicação.
2. `src/lib/supabase/proxy.ts` chama `auth.getClaims()` imediatamente para
   validar ou renovar o JWT.
3. Cookies renovados são escritos tanto na requisição encaminhada quanto na
   resposta ao navegador.
4. `Cache-Control`, `Expires` e `Pragma` fornecidos pelo Supabase SSR são
   preservados. Redirecionamentos de autenticação também são `no-store`.
5. O Proxy faz apenas uma verificação otimista. Páginas privadas chamam
   `requireUser()` e Server Actions protegidas verificam novamente a identidade.
6. O PostgreSQL continua aplicando RLS como última barreira junto aos dados.

Não se usa `getSession()` para autorizar requisições no servidor. A assinatura e
as claims do token são verificadas com `getClaims()`.

## Cadastro e perfil automático

O cadastro envia `full_name` em `user_metadata`. A trigger criada na Etapa 2
provisiona, na mesma transação:

- `profiles`;
- `user_settings`;
- 18 categorias padrão.

A aplicação não tenta duplicar esse provisionamento no frontend. Se a
confirmação de e-mail estiver habilitada, a resposta orienta o usuário a abrir a
mensagem. Se estiver desabilitada em outro ambiente, a sessão imediata também é
tratada e leva ao dashboard.

## Confirmação e recuperação por e-mail

Os templates locais em `supabase/templates` criam links para `/auth/confirm` com
um `token_hash`. O Route Handler chama `verifyOtp()`, grava a sessão em cookies e
remove o token da URL ao redirecionar.

Esse é o fluxo SSR principal porque não depende do verificador PKCE estar no
mesmo navegador. `/auth/callback` permanece como fallback para projetos que ainda
usem o template padrão do Supabase e retornem um `code` PKCE.

Depois de atualizar a senha, os refresh tokens de todos os dispositivos são
revogados e o usuário entra novamente com a nova senha. Access tokens já emitidos
podem permanecer válidos até o prazo configurado pelo Supabase — uma hora na
configuração local. Um link ausente, inválido ou expirado volta para uma tela
segura com orientação para solicitar outro.

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e configure:

```dotenv
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_local_publishable_key
```

`NEXT_PUBLIC_APP_URL` deve conter somente a origem confiável, sem caminho,
credenciais, query string ou fragmento. Ela é usada para construir destinos de
e-mail sem confiar nos headers `Host` ou `Origin` recebidos. Fora de `localhost`
e `127.0.0.1`, HTTPS é obrigatório e os cookies de autenticação recebem `Secure`.

A chave publicável é segura para o navegador quando o RLS está correto. Nunca
adicione `service_role`, JWT secret, senha do banco ou chaves privadas a uma
variável `NEXT_PUBLIC_*`.

## Teste com o Supabase local

Inicie os serviços e consulte as credenciais:

```bash
npm run supabase:start
npm run supabase:status
npm run db:reset
npm run dev
```

Abra a aplicação em [http://localhost:3000](http://localhost:3000). Os e-mails
locais aparecem no Mailpit em
[http://localhost:54324](http://localhost:54324).

O `supabase/config.toml` local mantém:

- confirmação de e-mail habilitada;
- troca segura de senha habilitada;
- senha mínima de 8 caracteres;
- rotação de refresh token;
- redirects restritos a `localhost:3000` e `127.0.0.1:3000`;
- templates versionados de confirmação e recuperação.

No Windows, Docker Desktop, WSL 2 e Virtual Machine Platform precisam estar
ativos. Depois de habilitar recursos do Windows, reinicie o sistema antes de
subir o Supabase. Consulte [Banco de dados e segurança](database.md) para o fluxo
completo.

## Configuração de um projeto remoto

Antes de homologação ou produção:

1. aplique as migrations no projeto remoto pelo processo de deploy escolhido;
2. defina a Site URL do Supabase como a origem oficial HTTPS da aplicação;
3. autorize a URL oficial `/auth/callback` nos Redirect URLs;
4. mantenha confirmação de e-mail e troca segura de senha habilitadas;
5. copie os conteúdos de `supabase/templates/confirmation.html` e
   `supabase/templates/recovery.html` para os respectivos templates no painel;
6. configure `NEXT_PUBLIC_APP_URL`, URL e chave publicável no ambiente de deploy;
7. use SMTP próprio, desative rastreamento de links no provedor e avalie CAPTCHA
   antes de abrir cadastros públicos.

Não use wildcard amplo no domínio de produção. Para previews, autorize apenas o
padrão específico do provedor e da conta responsável.

## Validação e mensagens

React Hook Form oferece validação e foco no navegador. Os mesmos schemas Zod são
executados novamente nas Server Actions, pois qualquer cliente pode chamar essas
ações diretamente.

Erros conhecidos são traduzidos para português. Mensagens brutas do provedor,
senhas, tokens, códigos e respostas completas nunca são devolvidos ou
registrados. A solicitação de recuperação sempre usa resposta neutra para não
revelar se um e-mail possui conta.

O parâmetro `next` aceita apenas caminhos internos. URLs absolutas, caminhos com
duas barras, barras invertidas, protocolos e caracteres de controle caem em um
destino seguro.

## Estados tratados

- envio pendente com botão desabilitado e texto de progresso;
- erros de campo associados por `aria-describedby` e `aria-invalid`;
- falha de credenciais e e-mail ainda não confirmado;
- indisponibilidade do serviço ou da conexão;
- sessão ausente ou expirada;
- link inválido ou expirado;
- cadastro, logout e senha atualizada com feedback;
- skeletons durante navegação e fallback para erro inesperado.

## Verificações automatizadas

```bash
npm test
npm run check
npm audit --audit-level=moderate
```

Os testes unitários cobrem schemas, limites de senha, mensagens que não vazam
detalhes, rate limit, origem confiável da aplicação e prevenção de open redirect.
O build valida Server Components, Client Components, Server Actions, Route
Handlers e Proxy em conjunto.

## Checklist integrado

Quando o Supabase estiver em execução, valide em um navegador limpo:

- [ ] cadastro e recebimento do e-mail no Mailpit;
- [ ] confirmação cria sessão e abre `/dashboard`;
- [ ] perfil, configurações e 18 categorias foram provisionados;
- [ ] login correto e credenciais incorretas;
- [ ] acesso direto a `/dashboard` sem sessão volta ao login e preserva `next`;
- [ ] refresh da página mantém a sessão;
- [ ] recuperação completa e login somente com a senha nova;
- [ ] link de recuperação expirado mostra orientação segura;
- [ ] logout impede novo acesso direto ao dashboard;
- [ ] usuário A não acessa dados do usuário B, conforme os testes RLS.

Na implementação inicial, a validação HTTP sem Supabase confirmou páginas
públicas em `200`, redirects privados em `303`, preservação do destino interno e
cabeçalhos `no-store`. A validação completa dos e-mails depende da stack local ou
de um projeto remoto configurado.
