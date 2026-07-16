# Contas e categorias

A Etapa 5 transforma `/contas` e `/categorias` em telas funcionais com dados reais
do usuário autenticado. Leituras usam Server Components; criações, edições e
arquivamentos usam Server Actions validadas no cliente e novamente no servidor.

## Funcionalidades

Em `/contas` é possível:

- listar contas ativas ou arquivadas;
- criar e editar nome, tipo, saldo inicial, instituição, cor e ícone;
- consultar o saldo atual calculado pela view `account_balances`;
- arquivar ou reativar uma conta com confirmação.

Em `/categorias` é possível:

- filtrar categorias por tipo e por estado;
- criar categorias de receita ou despesa;
- editar nome, cor e ícone;
- identificar as 18 categorias padrão provisionadas no cadastro;
- arquivar ou reativar com confirmação.

O tipo da categoria é definitivo depois da criação para preservar o significado
das movimentações históricas. Arquivar substitui a exclusão física e mantém todas
as referências existentes.

## Persistência local

Os dados são gravados no PostgreSQL do Supabase, em volumes Docker persistentes.
Eles continuam disponíveis após fechar o navegador, parar `npm run dev`, reiniciar
a máquina ou executar `npm run supabase:stop` e `npm run supabase:start`.

Os dados locais são apagados quando o banco é recriado com `npm run db:reset`,
quando os volumes do Supabase/Docker são removidos ou quando o ambiente Docker é
limpo. Este repositório ainda não possui banco remoto nem backup de produção; o
volume local não deve ser tratado como cópia definitiva.

Novas migrations podem ser aplicadas sem recriar o banco com:

```bash
npx supabase migration up --local
```

## Segurança e integridade

- todas as consultas e alterações exigem uma identidade válida no servidor;
- as operações filtram explicitamente por `user_id` e o PostgreSQL repete o
  isolamento com RLS;
- Zod valida IDs, campos, opções permitidas e valores monetários;
- valores monetários chegam ao banco como representação decimal explícita;
- nomes ativos duplicados retornam uma mensagem compreensível;
- somente o trigger de cadastro pode marcar uma categoria como padrão;
- um trigger impede alterar o tipo de uma categoria existente;
- mensagens internas do banco não são expostas na interface.

## Validação manual

Com Supabase e aplicação ativos, entre em uma conta de usuário e verifique:

- [ ] criação e edição de uma conta, inclusive saldo inicial negativo;
- [ ] atualização do saldo atual após futuras movimentações pagas;
- [ ] arquivamento, filtro de arquivadas e reativação de conta;
- [ ] criação de categorias de receita e despesa;
- [ ] tipo bloqueado durante a edição e identificação das categorias padrão;
- [ ] conflito ao reativar um nome já usado por registro ativo;
- [ ] navegação por teclado, diálogo de confirmação, tema escuro e largura móvel.

As verificações automatizadas são executadas por:

```bash
npm test
npm run check
npm run db:lint
npm run db:test
```
