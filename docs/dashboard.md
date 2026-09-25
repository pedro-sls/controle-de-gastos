# Dashboard financeiro

A Etapa 7 transforma `/dashboard` em uma visão financeira real do período atual.
O início do período respeita `financial_month_start`, e vencimentos usam o fuso
configurado em `user_settings`.

## Conteúdo

- saldo total das contas ativas;
- receitas e despesas pagas no período;
- resultado entre receitas e despesas;
- valores pendentes a receber e a pagar;
- despesas vencidas, próximas do vencimento e contas com saldo negativo;
- gráfico diário de receitas e despesas pagas;
- distribuição de despesas pagas por categoria;
- cinco movimentações mais recentes;
- estimativa de gasto diário disponível.

Transferências alteram os saldos das contas, mas não entram como receita ou
despesa. Isso evita inflar o fluxo e mantém a soma global inalterada.

## Gasto diário disponível

A estimativa é conservadora:

```text
disponível no período = max(0, receitas pagas - despesas pagas - despesas pendentes comprometidas)
gasto diário = disponível no período / dias restantes, incluindo hoje
```

São comprometidas as despesas pendentes cujo vencimento — ou data da movimentação
quando não há vencimento — ocorre até o fim do período. Receitas pendentes nunca
aumentam o valor disponível. O resultado não fica negativo e não deve ser tratado
como promessa de liquidez ou recomendação financeira.

## Arquitetura e segurança

`get_dashboard_snapshot` executa as agregações no PostgreSQL para não depender do
limite de linhas da API. A função:

- exige `auth.uid()` e limita o intervalo consultado;
- filtra cada agregação pelo usuário atual;
- retorna apenas totais e séries reduzidas em JSON;
- ignora transferências nos totais de receita e despesa;
- calcula alertas de vencimento com o fuso do usuário.

A página continua sendo Server Component. Somente os dois componentes Recharts
são Client Components, recebendo DTOs mínimos com datas, nomes, cores e valores
agregados.

## Validação manual

- [ ] conferir os totais com receitas e despesas pagas do período;
- [ ] verificar que itens pendentes não alteram saldo nem receitas disponíveis;
- [ ] confirmar que compromissos reduzem a estimativa diária;
- [ ] criar, editar e excluir uma transferência sem alterar o resultado global;
- [ ] validar alertas vencidos, próximos e contas negativas;
- [ ] verificar estados vazios, gráficos, 320 px, teclado e tema escuro;
- [ ] alterar `financial_month_start` no banco local e conferir o intervalo.

As verificações automatizadas são:

```bash
npm test
npm run check
npm run db:lint
npm run db:test
npm audit --audit-level=moderate
```
