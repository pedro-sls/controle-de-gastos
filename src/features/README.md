# Features

As funcionalidades são organizadas por domínio. Cada feature contém seus próprios
componentes, schemas, consultas, ações e tipos; as rotas em `src/app` ficam
responsáveis pela composição das telas.

Estrutura atual e prevista:

```text
features/
  accounts/
  auth/
  budgets/
  categories/
  dashboard/
  finance/
  recurrences/
  reports/
  transactions/
```

Todos os domínios listados estão implementados. Novos diretórios serão criados
somente quando houver código, evitando pastas vazias e abstrações prematuras.
