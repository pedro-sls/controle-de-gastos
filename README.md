# MeuSaldo

Aplicação web de controle financeiro pessoal. O objetivo do produto é tornar
receitas, despesas, orçamentos e compromissos mensais fáceis de entender, com
destaque para uma estimativa segura de quanto o usuário ainda pode gastar por dia
até o fim do mês.

## Status do projeto

A **Etapa 1 — preparação** está concluída. O repositório contém a fundação técnica
e uma página inicial de validação, mas ainda não possui autenticação, banco de
dados, movimentações financeiras ou dashboard.

Não use dados financeiros reais antes da Etapa 2 configurar o banco, as
restrições de integridade e as políticas de Row Level Security (RLS).

## Tecnologias

Fundação instalada nesta etapa:

- Next.js 16 com App Router e React 19;
- TypeScript em modo estrito;
- Tailwind CSS 4;
- shadcn/ui com Base UI, variáveis CSS e Lucide Icons;
- Supabase JavaScript e Supabase SSR;
- ESLint e Prettier.

React Hook Form, Zod, Recharts e date-fns são obrigatórios no produto, mas serão
instalados quando as primeiras features que os utilizam forem implementadas. Isso
evita dependências sem uso no scaffold.

## Pré-requisitos

- Node.js 22 ou superior;
- npm 10 ou superior;
- um projeto Supabase para as etapas que acessarem dados.

As versões utilizadas ficam registradas no `package-lock.json`.

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

No painel do seu projeto Supabase, copie a URL do projeto e a chave pública
(`publishable key`) para `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
```

Somente essas duas variáveis públicas são necessárias no frontend. Nunca adicione
a `service_role key`, segredos ou chaves privadas a variáveis `NEXT_PUBLIC_*`.

Os clientes ficam separados por ambiente:

- `src/lib/supabase/client.ts`: Client Components;
- `src/lib/supabase/server.ts`: Server Components, Actions e Route Handlers;
- `src/lib/supabase/env.ts`: leitura e validação da configuração pública.

O Proxy de renovação de sessão será criado junto da autenticação na Etapa 3. No
Next.js 16, essa convenção usa `src/proxy.ts` em vez de `middleware.ts`.

## Execução local

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Comandos disponíveis

| Comando                | Finalidade                                       |
| ---------------------- | ------------------------------------------------ |
| `npm run dev`          | inicia o servidor de desenvolvimento             |
| `npm run build`        | gera o build otimizado de produção               |
| `npm start`            | serve um build já gerado                         |
| `npm run lint`         | executa as regras do ESLint                      |
| `npm run lint:fix`     | corrige automaticamente problemas seguros        |
| `npm run typecheck`    | valida os tipos sem emitir arquivos              |
| `npm run format`       | formata os arquivos com Prettier                 |
| `npm run format:check` | verifica a formatação sem alterar arquivos       |
| `npm run check`        | executa formatação, lint, tipos e build em série |

## Build de produção

```bash
npm run check
npm start
```

O build da preparação não exige credenciais reais porque nenhum cliente Supabase
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
```

Conforme o produto crescer, `src/app` continuará responsável por rotas e
composição. Regras específicas serão agrupadas em
`src/features/<feature>/{components,schemas,queries,actions,types}`. Componentes
genéricos permanecerão em `src/components` e infraestrutura compartilhada em
`src/lib`.

## Migrações e dados de demonstração

Ainda não existem migrações nem seed nesta etapa. A Etapa 2 criará o diretório
`supabase/`, o modelo PostgreSQL, índices, constraints, triggers justificadas,
políticas RLS e categorias padrão.

Dados de demonstração serão opcionais e exclusivos para desenvolvimento. Eles
nunca serão inseridos automaticamente em produção.

## Testes

Ainda não há regras financeiras nem test runner para testar. A qualidade atual é
verificada por formatação, lint, checagem de tipos e build:

```bash
npm run check
```

Os testes automatizados serão adicionados junto das regras de saldo, gasto diário,
orçamentos, transferências e recorrências. Não serão usados valores monetários em
ponto flutuante nessas regras.

## Decisões arquiteturais

- Server Components serão o padrão; Client Components serão usados apenas onde
  houver interação no navegador.
- Leituras protegidas serão feitas no servidor. Mutações usarão Server Actions
  validadas; Route Handlers ficarão reservados a endpoints que realmente precisem
  de HTTP.
- Valores monetários serão persistidos como `numeric(14,2)` e manipulados em
  centavos inteiros ou representação decimal explícita no TypeScript.
- Saldo atual e orçamento utilizado serão calculados, evitando cópias mutáveis que
  possam ficar inconsistentes.
- Transferências serão atômicas no PostgreSQL e criarão duas movimentações
  relacionadas, sem entrar nos totais de receita ou despesa.
- Toda tabela vinculada a usuário terá RLS. Filtros de frontend nunca serão
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
2. **Banco e segurança:** tabelas, constraints, índices, RLS e categorias padrão.
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

Projetar e versionar o banco PostgreSQL no Supabase, incluindo as tabelas do MVP,
integridade referencial, índices e políticas RLS completas antes de conectar telas
a dados financeiros reais.
