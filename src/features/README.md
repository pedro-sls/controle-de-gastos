# Features

As funcionalidades serão organizadas por domínio a partir das próximas etapas.
Cada feature poderá conter seus próprios componentes, schemas, consultas, ações e
tipos. As rotas em `src/app` ficarão responsáveis pela composição das telas.

Estrutura prevista:

```text
features/
  accounts/
  auth/
  budgets/
  categories/
  recurring/
  reports/
  transactions/
```

Diretórios serão criados somente quando houver implementação, evitando pastas
vazias e abstrações prematuras.
