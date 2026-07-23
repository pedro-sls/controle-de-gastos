# Banco de dados e segurança

A Etapa 2 estabelece o modelo PostgreSQL do MeuSaldo, suas regras de integridade,
políticas de Row Level Security (RLS), operações atômicas de transferência e testes
automatizados. A migration inicial está em
`supabase/migrations/20260713225410_initial_financial_schema.sql`.
A proteção adicional da classificação das categorias está em
`supabase/migrations/20260716024844_protect_category_classification.sql`.
As agregações autenticadas do dashboard estão em
`supabase/migrations/20260716035000_dashboard_snapshot.sql`.

## Execução local

### Pré-requisitos

- Node.js 22 ou superior;
- npm 10 ou superior;
- Docker Desktop em execução;
- WSL 2 habilitado no Windows.

No Windows, confirme o ambiente antes de iniciar:

```powershell
wsl --status
docker info
```

Se aparecer `HCS_E_HYPERV_NOT_INSTALLED`, habilite WSL e Virtual Machine Platform
nos Recursos do Windows e reinicie o computador. Em seguida, abra o Docker Desktop
e aguarde o mecanismo Linux ficar disponível.

### Subir e validar o banco

```bash
npm install
npm run supabase:start
npm run db:reset
npm run db:lint
npm run db:test
npm run db:types
npm run check
```

`db:reset` recria o banco local e reaplica todas as migrations. Esse replay é o
teste mais seguro para detectar uma migration que dependa de estado não versionado.

Consulte URLs e credenciais locais com:

```bash
npm run supabase:status
```

Use a URL local e a chave pública exibidas pelo comando em `.env.local`. Nunca
versione `.env.local`, `service_role`, senhas ou tokens. Ao terminar:

```bash
npm run supabase:stop
```

## Modelo de dados

As nove tabelas de domínio são:

- `profiles`: dados públicos mínimos associados ao usuário autenticado;
- `user_settings`: moeda, localidade, fuso, tema e início do mês financeiro;
- `accounts`: contas, saldo inicial e arquivamento;
- `categories`: categorias de receita e despesa;
- `recurring_transactions`: definições de recorrências;
- `transfers`: agregado canônico de uma transferência;
- `transactions`: receitas, despesas e as duas pernas internas de transferências;
- `budgets`: limites mensais gerais ou por categoria;
- `financial_goals`: metas financeiras e valores reservados.

Valores monetários usam `numeric(14,2)`. Datas financeiras usam `date`; auditoria
usa `timestamptz`. Cálculos monetários no TypeScript deverão usar centavos inteiros
ou uma representação decimal explícita, nunca ponto flutuante sem controle.

Um novo usuário recebe automaticamente perfil, configurações em BRL/pt-BR e 18
categorias padrão: 11 de despesa e 7 de receita. A recorrência `biweekly` representa
14 dias para preservar o dia da semana.

## Dados derivados

As views abaixo usam `security_invoker`, preservando as políticas RLS do usuário:

- `transactions_with_effective_status`: deriva `overdue` de uma movimentação
  pendente conforme o fuso configurado pelo usuário;
- `account_balances`: soma ao saldo inicial somente movimentações pagas;
- `budget_progress`: calcula consumo, percentual e faixa de alerta usando despesas
  pagas do mês.

Status vencido, saldo e progresso de orçamento não são armazenados como cópias
mutáveis.

## Segurança e integridade

RLS está habilitado nas nove tabelas. Usuários autenticados acessam somente seus
próprios registros e usuários anônimos não recebem acesso às tabelas financeiras.

As principais barreiras são:

- políticas RLS por `auth.uid()`;
- chaves estrangeiras compostas com `user_id`, impedindo referências entre usuários;
- grants explícitos depois da revogação dos privilégios padrão;
- funções `security definer` com `search_path` vazio;
- timestamps de auditoria controlados pelo banco;
- validação de fuso horário;
- bloqueio de novas referências a contas ou categorias arquivadas;
- categorias removidas por arquivamento, sem `DELETE` para usuários autenticados;
- tipo de categoria imutável depois da criação e flag de categoria padrão
  controlada exclusivamente pelo banco;
- views derivadas executadas com os privilégios do chamador.

A exclusão de um usuário remove seu grafo financeiro. Relacionamentos históricos
internos usam constraints diferíveis para preservar a integridade durante essa
operação.

## Transferências

Uma transferência possui um registro canônico em `transfers` e exatamente duas
movimentações relacionadas:

- `transfer_out` na conta de origem;
- `transfer_in` na conta de destino.

Criação, atualização e exclusão devem usar exclusivamente:

- `create_transfer`;
- `update_transfer`;
- `delete_transfer`.

As RPCs validam o usuário autenticado, contas distintas, ativas e pertencentes ao
mesmo usuário. A operação inteira é atômica. Escritas diretas no agregado ou nas
pernas internas são bloqueadas, inclusive contra tentativas privilegiadas de
reassociar uma perna a outro agregado.

Transferências afetam os saldos das contas, mas não entram nos totais de receita ou
despesa.

## Dashboard

`get_dashboard_snapshot` recebe um período limitado a 63 dias e retorna somente
agregados do usuário autenticado: saldo de contas ativas, receitas e despesas
pagas, pendências, vencimentos, fluxo diário e despesas por categoria. A função
filtra explicitamente por `auth.uid()` e não retorna linhas financeiras completas.

Transferências não entram nos totais de receita e despesa nem são duplicadas nos
gráficos. O fuso de `user_settings` determina vencimentos e próximos compromissos.

## Migrations e dados locais

Enquanto a migration ainda não foi aplicada fora de ambientes descartáveis, ela
pode ser ajustada na própria branch. Depois de aplicada em um ambiente compartilhado
ou remoto, migrations tornam-se append-only: correções devem entrar em um novo
arquivo.

`supabase/seed.sql` está deliberadamente vazio. Categorias obrigatórias pertencem à
migration e ao trigger de provisionamento; dados de demonstração nunca devem ser
necessários para a integridade do schema.

## Testes

Os testes pgTAP ficam em `supabase/tests/database/` e são executados dentro de
transações com rollback:

- `001_provisioning.test.sql`: estrutura, RLS, privilégios, provisionamento,
  categorias padrão, auditoria e exclusão do usuário;
- `002_rls_isolation.test.sql`: isolamento entre dois usuários, acesso anônimo,
  referências cruzadas, registros arquivados e classificação protegida;
- `003_transfers.test.sql`: RPCs, duas pernas, saldos, atomicidade e bloqueio de
  adulteração.
- `004_dashboard.test.sql`: autenticação, isolamento, totais, pendências, séries e
  validação do período.
- `005_recurrences.test.sql`: geração ancorada no calendário, isolamento,
  idempotência e limites de execução;
- `006_reports.test.sql`: agregações comparativas, isolamento e preferências
  atualizadas atomicamente.

A suíte atual possui 98 asserções:

```bash
npm run db:test
```

## Tipos TypeScript

`src/types/database.ts` é gerado a partir do banco local e usado pelos clientes
Supabase do navegador e do servidor. Depois de alterar o schema público:

```bash
npm run db:reset
npm run db:types
npm run typecheck
```

Não edite esse arquivo manualmente. Revise e versione seu diff junto da migration.

## Integração contínua e deploy

O GitHub Actions executa qualidade web e, em um PostgreSQL descartável, replay das
migrations, lint, pgTAP e geração dos tipos. O artefato `database-types` permite
comparar o schema executado com o arquivo TypeScript versionado.

Ainda não existe deploy de banco remoto. Não execute `supabase link`,
`supabase db push` nem aplique migrations em produção até que projetos separados,
segredos, backups e o processo de aprovação estejam definidos. O banco local e o
banco descartável da CI são as únicas referências executáveis atuais.
