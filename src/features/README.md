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
  finance/
  recurring/
  reports/
  transactions/
```

`accounts`, `auth`, `categories` e `finance` já estão implementados. Os demais
diretórios serão criados somente quando houver código, evitando pastas vazias e
abstrações prematuras.
