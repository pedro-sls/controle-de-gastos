# Como contribuir

Este projeto utiliza Git Flow, Conventional Commits e pull requests para manter o
histórico legível e cada mudança fácil de revisar.

## Branches permanentes

- `main`: somente versões estáveis e prontas para produção;
- `develop`: integração das funcionalidades concluídas.

Não faça commits diretos em `main` ou `develop` depois que essas branches estiverem
publicadas. Alterações devem chegar por pull request.

## Branches temporárias

| Tipo        | Origem    | Destino            | Exemplo                             |
| ----------- | --------- | ------------------ | ----------------------------------- |
| `feature/*` | `develop` | `develop`          | `feature/stage-2-database-security` |
| `release/*` | `develop` | `main` e `develop` | `release/1.0.0`                     |
| `hotfix/*`  | `main`    | `main` e `develop` | `hotfix/session-expiration`         |

Uma feature deve conter apenas um objetivo coerente. Use uma nova branch quando o
escopo pertencer a outra etapa ou puder ser entregue de forma independente.

## Fluxo de uma funcionalidade

```bash
git switch develop
git pull --ff-only
git switch -c feature/descricao-curta
```

Durante o desenvolvimento:

1. faça commits pequenos e funcionais;
2. execute as validações relevantes;
3. envie a branch ao concluir um checkpoint ou antes de uma mudança arriscada;
4. abra um draft PR para `develop` enquanto o trabalho estiver em andamento;
5. marque o PR como pronto apenas quando todos os critérios forem atendidos.

Não é necessário fazer push a cada edição. Como regra prática, faça push após um
grupo pequeno de commits relacionados e sempre ao encerrar uma sessão de trabalho.

## Commits

Use mensagens no padrão Conventional Commits:

```text
<tipo>(escopo opcional): descrição curta no imperativo
```

Tipos mais comuns:

- `feat`: nova funcionalidade;
- `fix`: correção de comportamento;
- `docs`: documentação;
- `test`: testes;
- `refactor`: mudança interna sem alterar comportamento;
- `chore`: manutenção de ferramentas ou dependências;
- `ci`: automação de integração contínua.

Exemplos:

```text
feat(database): add financial account schema
fix(rls): prevent cross-user category references
docs: describe local Supabase setup
```

Evite commits enormes, mensagens genéricas como `ajustes` e mistura de refatoração
não relacionada com uma nova funcionalidade.

## Checklist antes do push

```bash
npm run check
npm audit --audit-level=moderate
```

Quando houver alterações no banco, execute também os comandos Supabase documentados
no README. Nunca versione `.env.local`, tokens, chaves privadas, senhas ou a chave
`service_role`.

## Pull requests

Todo PR deve explicar:

- o que mudou e por quê;
- impacto para usuário ou desenvolvimento;
- decisões ou riscos relevantes;
- como a alteração foi validada;
- migrations, variáveis de ambiente ou passos manuais necessários.

Prefira squash merge para features quando os commits intermediários não agregarem
valor permanente. Releases e hotfixes devem seguir a estratégia definida para
preservar o histórico e retornar as mudanças para `develop`.
