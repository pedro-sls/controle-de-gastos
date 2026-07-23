# Produção

O código está preparado para produção, mas publicar exige recursos externos que
não pertencem ao repositório: um projeto Supabase hospedado, um domínio, um
serviço SMTP e um provedor para executar a aplicação Next.js.

O primeiro lançamento usa acesso somente por convite. A aplicação não contém uma
chave administrativa e ninguém é aprovado por meio da caixa de e-mail de outra
pessoa. O responsável envia o convite no painel do Supabase; o destinatário
confirma o próprio endereço e cria a própria senha.

## Arquitetura

```text
Navegador
  └─ HTTPS ─► aplicação Next.js
                ├─ cookies de sessão seguros
                └─ HTTPS ─► Supabase hospedado
                              ├─ Auth: usuários e senhas protegidas
                              └─ PostgreSQL: dados financeiros com RLS
```

Não execute Studio, Mailpit ou a stack local do Supabase em um servidor público.
Esses serviços existem somente para desenvolvimento.

## 1. Criar e proteger o Supabase

1. Crie um projeto hospedado em uma região adequada aos usuários.
2. Ative MFA na conta e, se disponível no plano, exija MFA na organização.
3. Guarde a senha do banco em um gerenciador de segredos.
4. Em `Authentication > URL Configuration`, defina:
   - Site URL: `https://app.seudominio.com.br`;
   - Redirect URL: `https://app.seudominio.com.br/auth/callback`.
5. Mantenha confirmação de e-mail e troca segura de senha habilitadas.
6. Desative novos cadastros públicos no provedor de e-mail. Convites
   administrativos continuam sendo enviados pelo painel.
7. Mantenha o vencimento de OTP em uma hora ou menos.
8. Configure SMTP próprio com remetente no domínio da aplicação.
9. Copie para o painel os três templates versionados:
   - `supabase/templates/confirmation.html`;
   - `supabase/templates/recovery.html`;
   - `supabase/templates/invite.html`.
10. Revise Security Advisor, Performance Advisor, SSL Enforcement e restrições
    de rede antes do lançamento.

O rastreamento de links do provedor de e-mail deve ficar desabilitado nos e-mails
de autenticação, pois alguns rastreadores consomem links de uso único.

## 2. Aplicar o banco

O schema remoto deve ser alterado exclusivamente pelas migrations versionadas.
Não recrie tabelas manualmente no painel.

Para a primeira publicação:

```bash
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db push --dry-run
npx supabase db push
npx supabase migration list
```

Nunca execute `db:reset` nem `supabase db reset --linked` contra produção.
Migrations que já chegaram ao ambiente remoto são append-only.

### Deploy protegido pelo GitHub

O workflow `Deploy production database` valida o banco local antes de aplicar
migrations. Crie no GitHub um Environment chamado `production`, habilite
aprovação manual e cadastre:

- `SUPABASE_ACCESS_TOKEN`;
- `SUPABASE_DB_PASSWORD`;
- `SUPABASE_PROJECT_REF`.

Depois, execute o workflow manualmente em `Actions`. Apenas uma implantação do
banco pode rodar por vez.

## 3. Configurar a aplicação

Use `.env.production.example` como referência:

```dotenv
NEXT_PUBLIC_APP_URL=https://app.seudominio.com.br
NEXT_PUBLIC_SUPABASE_URL=https://seu-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
REGISTRATION_MODE=invite_only
DEPLOYMENT_VERSION=SHA_DO_COMMIT
```

As variáveis `NEXT_PUBLIC_*` ficam embutidas no bundle do navegador durante o
build. Elas são públicas, mas precisam pertencer ao mesmo ambiente. Nunca use
`sb_secret_*`, `service_role`, senha do banco ou token de acesso em uma variável
`NEXT_PUBLIC_*`.

Valide a configuração antes do build:

```bash
npm run production:check
npm run build:production
```

O preflight rejeita HTTP, endereços locais, chave privilegiada e cadastro aberto.

## 4. Publicar o Next.js

### Plataforma gerenciada

Em uma plataforma compatível com Next.js:

1. conecte o repositório e selecione Node.js 22;
2. cadastre as variáveis de produção;
3. use `npm run build:production` como comando de build;
4. publique primeiro em um domínio temporário HTTPS;
5. configure o domínio definitivo;
6. atualize `NEXT_PUBLIC_APP_URL`, Site URL e Redirect URLs;
7. faça um novo build após qualquer mudança em `NEXT_PUBLIC_*`.

O provedor deve encerrar instâncias com `SIGTERM` e permitir de 10 a 30 segundos
para concluir requisições em andamento.

### Docker

O `Dockerfile` gera a saída `standalone`, executa com usuário sem privilégios e
possui healthcheck. Os mesmos valores públicos devem ser informados no build e na
execução:

```bash
docker build -t meusaldo:VERSAO \
  --build-arg NEXT_PUBLIC_APP_URL=https://app.seudominio.com.br \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://seu-project-ref.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_... \
  --build-arg REGISTRATION_MODE=invite_only \
  --build-arg DEPLOYMENT_VERSION=VERSAO \
  .

docker run --rm -p 3000:3000 \
  -e NEXT_PUBLIC_APP_URL=https://app.seudominio.com.br \
  -e NEXT_PUBLIC_SUPABASE_URL=https://seu-project-ref.supabase.co \
  -e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_... \
  -e REGISTRATION_MODE=invite_only \
  meusaldo:VERSAO
```

Coloque um proxy reverso HTTPS na frente do container. Se houver múltiplas
réplicas, todas devem usar exatamente a mesma imagem; não reconstrua a aplicação
separadamente em cada servidor.

## 5. Convidar usuários

No painel do Supabase:

1. abra `Authentication > Users`;
2. escolha `Add user > Send invitation`;
3. informe o e-mail;
4. confirme o envio.

O usuário recebe “Você recebeu um convite para o MeuSaldo”, aceita o convite,
define uma senha e entra novamente. Um link expirado exige o envio de outro
convite. O administrador consegue remover ou bloquear uma conta no painel, mas
não consegue ver a senha do usuário.

## 6. Monitoramento e backups

`GET /api/health` retorna:

- `200` quando aplicação e Supabase respondem;
- `503` quando a dependência está indisponível.

Configure um monitor HTTPS sem autenticação nesse endpoint e alerte após falhas
consecutivas. A resposta não contém URL, chave, usuário ou dados financeiros.
Centralize também os logs da plataforma e nunca registre corpos de formulários de
autenticação.

Defina antes do lançamento:

- retenção de backups compatível com o plano;
- backup lógico externo periódico se o plano não permitir restauração adequada;
- responsável por restaurar e periodicidade do teste de restauração;
- alerta de uso de banco, armazenamento e indisponibilidade;
- procedimento de revogação de credenciais.

## 7. Checklist de lançamento

- [ ] domínio definitivo com HTTPS;
- [ ] Supabase remoto protegido com MFA;
- [ ] migrations validadas e aplicadas;
- [ ] RLS habilitado nas nove tabelas;
- [ ] cadastro público desativado no Supabase;
- [ ] `REGISTRATION_MODE=invite_only`;
- [ ] SMTP próprio e três templates configurados;
- [ ] confirmação, convite e recuperação testados no domínio real;
- [ ] `/api/health` monitorado;
- [ ] backups e restauração definidos;
- [ ] `npm audit --audit-level=moderate` sem vulnerabilidades;
- [ ] CI e testes de navegador verdes;
- [ ] usuário convidado enxerga somente os próprios dados;
- [ ] rollback da aplicação ensaiado.

O rollback do Next.js consiste em publicar uma imagem ou versão anterior. O banco
não deve ser revertido apagando migrations; correções de schema entram em uma
nova migration compatível.
