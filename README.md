# MeuSaldo

Aplicação web de controle financeiro pessoal. O objetivo do produto é tornar
receitas, despesas, orçamentos e compromissos mensais fáceis de entender, com
destaque para uma estimativa segura de quanto o usuário ainda pode gastar por dia
até o fim do mês.

## Status do projeto

As **Etapas 1 e 2 estão concluídas**. O repositório contém a fundação web e o
modelo PostgreSQL seguro, com constraints, índices, RLS, transferências atômicas,
58 testes pgTAP e tipos TypeScript gerados. A interface ainda não possui
autenticação, formulários financeiros ou dashboard; esse trabalho começa na
Etapa 3.

O banco foi validado apenas em ambientes descartáveis locais e de CI. Ainda não há
projeto Supabase remoto vinculado nem deploy de produção.

## Tecnologias

Stack atual:

- Next.js 16 com App Router e React 19;
- TypeScript em modo estrito;
- Tailwind CSS 4;
- shadcn/ui com Base UI, variáveis CSS e Lucide Icons;
- Supabase JavaScript e Supabase SSR;
- Supabase CLI, PostgreSQL 17 e pgTAP;
- GitHub Actions para qualidade web e validação do banco;
- ESLint e Prettier.

React Hook Form, Zod, Recharts e date-fns são obrigatórios no produto, mas serão
instalados quando as primeiras features que os utilizam forem implementadas. Isso
evita dependências sem uso no scaffold.

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
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_local_publishable_key
```

Somente essas duas variáveis públicas são necessárias no frontend. Nunca adicione
a `service_role key`, segredos ou chaves privadas a variáveis `NEXT_PUBLIC_*`.

Os clientes ficam separados por ambiente:

- `src/lib/supabase/client.ts`: Client Components;
- `src/lib/supabase/server.ts`: Server Components, Actions e Route Handlers;
- `src/lib/supabase/env.ts`: leitura e validação da configuração pública.

O Proxy de renovação de sessão será criado junto da autenticação na Etapa 3. No
Next.js 16, essa convenção usa `src/proxy.ts` em vez de `middleware.ts`.

O fluxo completo do banco, inclusive solução de problemas no Windows, está em
[Banco de dados e segurança](docs/database.md).

## Execução local

```bash
npm run supabase:start
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Comandos disponíveis

| Comando                   | Finalidade                                       |
| ------------------------- | ------------------------------------------------ |
| `npm run dev`             | inicia o servidor de desenvolvimento             |
| `npm run build`           | gera o build otimizado de produção               |
| `npm start`               | serve um build já gerado                         |
| `npm run lint`            | executa as regras do ESLint                      |
| `npm run lint:fix`        | corrige automaticamente problemas seguros        |
| `npm run typecheck`       | valida os tipos sem emitir arquivos              |
| `npm run format`          | formata os arquivos com Prettier                 |
| `npm run format:check`    | verifica a formatação sem alterar arquivos       |
| `npm run check`           | executa formatação, lint, tipos e build em série |
| `npm run supabase:start`  | inicia a stack Supabase local                    |
| `npm run supabase:status` | exibe URLs e credenciais locais                  |
| `npm run supabase:stop`   | encerra a stack Supabase local                   |
| `npm run db:reset`        | recria o banco e reaplica migrations             |
| `npm run db:lint`         | analisa funções e schema PostgreSQL              |
| `npm run db:test`         | executa os 58 testes pgTAP                       |
| `npm run db:types`        | regenera e formata os tipos TypeScript do schema |

## Build de produção

```bash
npm run check
npm start
```

O build da aplicação não exige credenciais reais porque nenhum cliente Supabase
é instanciado durante a renderização da página inicial. As variáveis são validadas
no momento em que um cliente é criado.

## Estrutura atual

```text
src/
  app/
    globals.css          # Tailwind e tokens visuais do shadcn/ui
    layout.tsx           # layout raiz, idioma e metadados
    page.tsx             # página de validação da preparação
  components/
    ui/
      button.tsx         # componente compartilhado do shadcn/ui
  config/
    site.ts              # nome, localidade, moeda e fuso padrão
  features/
    README.md            # convenção das features futuras
  lib/
    supabase/
      client.ts          # cliente para o navegador
      env.ts             # validação das variáveis públicas
      server.ts          # cliente para o servidor
    utils.ts             # utilitários compartilhados do design system
  types/
    database.ts          # tipos gerados a partir do schema Supabase
supabase/
  config.toml            # configuração da stack local
  migrations/            # histórico versionado do PostgreSQL
  tests/database/        # testes pgTAP de segurança e integridade
  seed.sql               # reservado a dados locais opcionais
docs/
  database.md            # decisões e operação do banco
.github/workflows/
  ci.yml                 # validação web e PostgreSQL no GitHub Actions
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
npm run check
npm run db:reset
npm run db:lint
npm run db:test
```

As três suítes pgTAP somam 58 asserções sobre provisionamento, isolamento entre
usuários, referências cruzadas, arquivamento, privilégios, auditoria,
transferências e saldos. A CI repete essas validações em PostgreSQL descartável.

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
- Não há ORM ou biblioteca de estado global nesta fase; ambos só serão adotados se
  uma necessidade concreta justificar.
- O `package.json` sobrescreve somente o PostCSS interno do Next para a versão
  8.5.10, que corrige o alerta GHSA-qx2v-qp2m-jg93. Esse override pode ser removido
  quando uma versão estável do Next incorporar a correção.
- Nome, moeda, localidade e fuso padrão estão centralizados em
  `src/config/site.ts`. O nome provisório pode ser alterado em um único local.

## Plano de implementação

1. **Preparação (concluída):** scaffold, qualidade, shadcn/ui, Supabase e
   documentação inicial.
2. **Banco e segurança (concluída):** tabelas, constraints, índices, RLS,
   transferências, categorias padrão, testes e tipos gerados.
3. **Autenticação:** cadastro, login, logout, recuperação, perfil e rotas privadas.
4. **Layout:** sidebar, navegação mobile, cabeçalho, tema e estados compartilhados.
5. **Contas e categorias:** CRUD, saldo inicial, categorias padrão e arquivamento.
6. **Movimentações:** CRUD, filtros, paginação, status e transferências atômicas.
7. **Dashboard:** totais, pendências, alertas, gráficos e gasto diário disponível.
8. **Orçamentos:** limites gerais e por categoria, progresso e alertas.
9. **Recorrências:** cadastro e geração idempotente de ocorrências.
10. **Relatórios e configurações:** gráficos, comparativos e preferências do usuário.
11. **Qualidade final:** testes financeiros, acessibilidade, responsividade,
    segurança e desempenho.

Cartões de crédito, metas com interface própria, integração bancária, Open Finance,
OCR, OFX, compartilhamento familiar e aplicativo nativo permanecem fora do MVP.

## Contribuição e Git Flow

O projeto utiliza `main` para versões estáveis, `develop` para integração e
branches `feature/*`, `release/*` e `hotfix/*` para o trabalho diário. Consulte o
[guia de contribuição](CONTRIBUTING.md) para a convenção completa de branches,
commits, pushes e pull requests.

## Próxima etapa

Implementar a Etapa 3 em uma nova `feature/*`: cadastro, login, logout, recuperação
de senha, atualização de perfil, proxy de sessão e proteção das rotas privadas.
