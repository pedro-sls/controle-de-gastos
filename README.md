# MeuSaldo

Aplicação web de controle financeiro pessoal. O objetivo do produto é tornar
receitas, despesas, orçamentos e compromissos mensais fáceis de entender, com
destaque para uma estimativa segura de quanto o usuário ainda pode gastar por dia
até o fim do mês.

## Status do projeto

As **Etapas 1 a 12 estão concluídas** e o MVP funcional está completo. A área
privada permite organizar contas, categorias, movimentações, orçamentos e
recorrências, além de apresentar dashboard, relatórios comparativos e
preferências persistentes. O PostgreSQL possui constraints, RLS, operações
atômicas, agregações seguras, 98 testes pgTAP e tipos TypeScript gerados. A
interface possui 123 testes Vitest e 10 cenários Playwright em desktop e celular
com auditoria WCAG automatizada.

O repositório possui preflight de produção, acesso por convite, healthcheck,
imagem Docker e deploy protegido de migrations. Ainda não há projeto Supabase
remoto vinculado, domínio, SMTP nem deploy ativo; esses recursos externos são os
passos finais descritos em [Produção](docs/production.md).

## Tecnologias

Stack atual:

- Next.js 16 com App Router e React 19;
- TypeScript em modo estrito;
- Tailwind CSS 4;
- shadcn/ui com Base UI, variáveis CSS e Lucide Icons;
- Supabase JavaScript e Supabase SSR;
- React Hook Form e Zod;
- Recharts para visualizações financeiras acessíveis;
- next-themes para preferência clara, escura ou do sistema;
- Supabase CLI, PostgreSQL 17 e pgTAP;
- Vitest para regras executáveis no TypeScript;
- Playwright e axe-core para fluxos reais e acessibilidade;
- GitHub Actions para qualidade web e validação do banco;
- ESLint e Prettier.

Regras atuais de data usam formatos ISO explícitos e APIs nativas, evitando uma
dependência adicional somente para cálculos já cobertos pelo domínio.

## Pré-requisitos

- Node.js 22 ou superior;
- npm 10 ou superior;
- Docker Desktop para executar o Supabase local;
- WSL 2 no Windows.

Um projeto Supabase remoto ainda não é necessário. As versões utilizadas ficam
registradas no `package-lock.json`.

## Instalação

```bash
npm install
```

Crie o arquivo local de ambiente a partir do exemplo:

```powershell
Copy-Item .env.example .env.local
```

Em macOS ou Linux, use `cp .env.example .env.local`.

## Configuração do Supabase

Inicie a stack local e consulte as credenciais de desenvolvimento:

```bash
npm run supabase:start
npm run supabase:status
```

Copie a URL e a chave pública exibidas para `.env.local`:

```dotenv
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_local_publishable_key
REGISTRATION_MODE=open
```

As três variáveis são públicas e não contêm segredos. `NEXT_PUBLIC_APP_URL` é a
origem confiável usada nos links de autenticação. Nunca adicione a `service_role
key`, segredos ou chaves privadas a variáveis `NEXT_PUBLIC_*`.

Os clientes ficam separados por ambiente:

- `src/lib/supabase/client.ts`: Client Components;
- `src/lib/supabase/server.ts`: Server Components, Actions e Route Handlers;
- `src/lib/supabase/proxy.ts`: renovação de sessão por requisição;
- `src/lib/supabase/env.ts`: leitura e validação da configuração pública.

No Next.js 16, `src/proxy.ts` substitui a convenção antiga `middleware.ts`. Ele
renova cookies e faz redirects iniciais; páginas e ações protegidas validam a
identidade novamente.

O fluxo completo do banco, inclusive solução de problemas no Windows, está em
[Banco de dados e segurança](docs/database.md). Cadastro, templates de e-mail,
sessões e configuração remota estão em
[Autenticação e sessões](docs/authentication.md). Layout, rotas privadas, tema e
responsividade estão em [Shell autenticado](docs/application-shell.md).
O CRUD financeiro entregue na Etapa 5 está detalhado em
[Contas e categorias](docs/accounts-and-categories.md).
Receitas, despesas, transferências e filtros estão em
[Movimentações](docs/transactions.md).
Totais, alertas, gráficos e gasto diário estão em
[Dashboard financeiro](docs/dashboard.md).
Limites mensais estão em [Orçamentos](docs/budgets.md), compromissos repetidos
em [Recorrências](docs/recurrences.md), análises e preferências em
[Relatórios e configurações](docs/reports-and-settings.md) e a validação final em
[Qualidade do MVP](docs/quality.md).

## Execução local

```bash
npm run supabase:start
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Comandos disponíveis

| Comando                    | Finalidade                                       |
| -------------------------- | ------------------------------------------------ |
| `npm run dev`              | inicia o servidor de desenvolvimento             |
| `npm run build`            | gera o build otimizado de produção               |
| `npm run build:production` | valida o ambiente e gera o build de produção     |
| `npm start`                | serve um build já gerado                         |
| `npm run lint`             | executa as regras do ESLint                      |
| `npm run lint:fix`         | corrige automaticamente problemas seguros        |
| `npm run typecheck`        | valida os tipos sem emitir arquivos              |
| `npm test`                 | executa os testes unitários uma vez              |
| `npm run test:watch`       | executa testes unitários em modo interativo      |
| `npm run test:e2e`         | valida navegador, mobile e acessibilidade        |
| `npm run format`           | formata os arquivos com Prettier                 |
| `npm run format:check`     | verifica a formatação sem alterar arquivos       |
| `npm run check`            | executa formatação, lint, tipos, testes e build  |
| `npm run production:check` | valida URLs, chave e acesso do ambiente real     |
| `npm run supabase:start`   | inicia a stack Supabase local                    |
| `npm run supabase:status`  | exibe URLs e credenciais locais                  |
| `npm run supabase:stop`    | encerra a stack Supabase local                   |
| `npm run db:reset`         | recria o banco e reaplica migrations             |
| `npm run db:lint`          | analisa funções e schema PostgreSQL              |
| `npm run db:test`          | executa os 98 testes pgTAP                       |
| `npm run db:types`         | regenera e formata os tipos TypeScript do schema |

## Build de produção

```bash
npm run production:check
npm run build:production
npm start
```

O build comum continua aceitando o ambiente local. O build de produção exige
origens HTTPS, chave `sb_publishable_*` e `REGISTRATION_MODE=invite_only`.
Consulte [Produção](docs/production.md) para Supabase, SMTP, backups, plataforma
gerenciada, Docker e checklist de lançamento.

## Estrutura atual

```text
src/
  app/
    (auth)/              # login, cadastro e recuperação de senha
    (dashboard)/         # shell e rotas privadas responsivas
    auth/                # callbacks HTTP de confirmação e PKCE
    globals.css          # Tailwind e tokens visuais do shadcn/ui
    layout.tsx           # layout raiz, idioma e metadados
    page.tsx             # apresentação e entradas públicas
  components/
    layout/              # sidebar, cabeçalho, navegação e estados reutilizáveis
    providers/           # providers globais com fronteira Client Component
    ui/
      *.tsx              # componentes compartilhados do shadcn/ui
  config/
    app-url.ts           # validação da origem confiável
    navigation.ts        # catálogo e correspondência das rotas privadas
    site.ts              # nome, localidade, moeda e fuso padrão
  features/
    accounts/            # consultas, ações, schemas e formulários de contas
    auth/                # ações, schemas, formulários e testes de autenticação
    categories/          # consultas, ações, schemas e formulários de categorias
    dashboard/           # agregações, período financeiro, gráficos e testes
    budgets/             # limites mensais, progresso e alertas
    finance/             # campos e regras compartilhadas do domínio financeiro
    recurrences/         # agendas e geração idempotente de ocorrências
    reports/             # comparativos e gráficos agregados
    settings/            # perfil e preferências persistentes
    transactions/        # CRUD, filtros e transferências atômicas
  lib/
    auth/                # identidade, gates e respostas sem cache
    supabase/
      client.ts          # cliente para o navegador
      env.ts             # validação das variáveis públicas
      proxy.ts           # refresh de cookies e claims
      server.ts          # cliente para o servidor
    utils.ts             # utilitários compartilhados do design system
    theme.ts             # normalização e ciclo da preferência visual
  proxy.ts               # entrada do Proxy no Next.js 16
  types/
    database.ts          # tipos gerados a partir do schema Supabase
supabase/
  config.toml            # configuração da stack local
  migrations/            # histórico versionado do PostgreSQL
  templates/             # e-mails locais com token_hash para SSR
  tests/database/        # testes pgTAP de segurança e integridade
  seed.sql               # reservado a dados locais opcionais
docs/
  accounts-and-categories.md # operação e segurança do CRUD financeiro
  application-shell.md   # layout, navegação, tema e validação responsiva
  authentication.md      # fluxos, segurança e operação do Supabase Auth
  database.md            # decisões e operação do banco
  dashboard.md           # cálculos e experiência da visão geral
  budgets.md             # limites gerais e por categoria
  recurrences.md         # agenda e geração idempotente
  reports-and-settings.md # análises e preferências
  quality.md             # segurança e validação final
  transactions.md        # operação de receitas, despesas e transferências
.github/workflows/
  ci.yml                 # validação web, PostgreSQL e navegadores
```

Conforme o produto crescer, `src/app` continuará responsável por rotas e
composição. Regras específicas serão agrupadas em
`src/features/<feature>/{components,schemas,queries,actions,types}`. Componentes
genéricos permanecerão em `src/components` e infraestrutura compartilhada em
`src/lib`.

## Migrações e dados de demonstração

A migration inicial cria as nove tabelas do domínio, índices, constraints,
triggers, policies RLS, três views derivadas e três RPCs de transferência. O
provisionamento de usuário cria 18 categorias padrão de forma idempotente.

O `seed.sql` permanece vazio. Dados de demonstração serão opcionais e exclusivos
para desenvolvimento; nunca serão inseridos automaticamente em produção. Consulte
[a documentação do banco](docs/database.md) antes de alterar o schema.

## Testes

A qualidade web e o banco são validados separadamente:

```bash
npm test
npm run check
npm run test:e2e
npm run db:reset
npm run db:lint
npm run db:test
```

Os 123 testes Vitest cobrem autenticação, limites, erros seguros, configuração da
origem, prevenção de open redirect, navegação, tema, schemas, filtros, datas e
valores monetários, incluindo orçamento, recorrência, relatórios e gasto diário.
As seis suítes pgTAP somam 98 asserções sobre provisionamento, isolamento,
referências, privilégios, transferências, recorrências idempotentes e agregações.
O Playwright executa 10 cenários em Chromium desktop e mobile, incluindo login,
módulos finais, dados reais, 404, cabeçalhos e WCAG. A CI repete todas as
validações em ambientes descartáveis.

## Decisões arquiteturais

- Server Components serão o padrão; Client Components serão usados apenas onde
  houver interação no navegador.
- Leituras protegidas serão feitas no servidor. Mutações usarão Server Actions
  validadas; Route Handlers ficarão reservados a endpoints que realmente precisem
  de HTTP.
- Valores monetários são persistidos como `numeric(14,2)` e serão manipulados em
  centavos inteiros ou representação decimal explícita no TypeScript.
- Saldo atual e orçamento utilizado são calculados, evitando cópias mutáveis que
  possam ficar inconsistentes.
- Transferências são atômicas no PostgreSQL e criam duas movimentações
  relacionadas, sem entrar nos totais de receita ou despesa.
- Toda tabela vinculada a usuário possui RLS. Filtros de frontend nunca serão
  tratados como barreira de segurança.
- A sessão é validada com `getClaims()`, nunca autorizada por `getSession()`. O
  Proxy é um filtro otimista; cada página e ação sensível repete a verificação.
- Redirects de autenticação aceitam apenas caminhos internos e respostas que
  alteram cookies não podem ser armazenadas em cache.
- A recuperação de senha usa resposta neutra para não enumerar contas. Mensagens
  brutas do Supabase, tokens e senhas não chegam à interface nem aos logs.
- Não há ORM ou biblioteca de estado global nesta fase; ambos só serão adotados se
  uma necessidade concreta justificar.
- O `package.json` sobrescreve somente o PostCSS interno do Next para a versão
  8.5.22, que corrige o alerta GHSA-qx2v-qp2m-jg93. Esse override pode ser removido
  quando uma versão estável do Next incorporar a correção.
- Nome, moeda, localidade e fuso padrão estão centralizados em
  `src/config/site.ts`. O nome provisório pode ser alterado em um único local.

## Plano de implementação

1. **Preparação (concluída):** scaffold, qualidade, shadcn/ui, Supabase e
   documentação inicial.
2. **Banco e segurança (concluída):** tabelas, constraints, índices, RLS,
   transferências, categorias padrão, testes e tipos gerados.
3. **Autenticação (concluída):** cadastro, login, logout, confirmação,
   recuperação, persistência de sessão e rotas privadas.
4. **Layout (concluída):** sidebar, navegação mobile, cabeçalho, tema e estados
   compartilhados.
5. **Contas e categorias (concluída):** CRUD, saldo inicial, categorias padrão e
   arquivamento.
6. **Movimentações (concluída):** CRUD, filtros, paginação, status e
   transferências atômicas.
7. **Dashboard (concluída):** totais, pendências, alertas, gráficos e gasto diário
   disponível.
8. **Orçamentos (concluída):** limites gerais e por categoria, progresso e alertas.
9. **Recorrências (concluída):** cadastro e geração idempotente de ocorrências.
10. **Relatórios e configurações (concluída):** gráficos, comparativos e
    preferências do usuário.
11. **Qualidade final (concluída):** testes financeiros, acessibilidade,
    responsividade, segurança e desempenho.
12. **Preparação para produção (concluída):** acesso por convite, preflight de
    ambiente, healthcheck, container, deploy protegido do banco e runbook.

Cartões de crédito, metas com interface própria, integração bancária, Open Finance,
OCR, OFX, compartilhamento familiar e aplicativo nativo permanecem fora do MVP.

## Contribuição e Git Flow

O projeto utiliza `main` para versões estáveis, `develop` para integração e
branches `feature/*`, `release/*` e `hotfix/*` para o trabalho diário. Consulte o
[guia de contribuição](CONTRIBUTING.md) para a convenção completa de branches,
commits, pushes e pull requests.

## Evolução seguinte

O roadmap funcional do MVP foi concluído. As próximas entregas serão melhorias
orientadas por uso, observabilidade e feedback, sem ampliar silenciosamente o
escopo para os itens explicitamente mantidos fora do MVP.
