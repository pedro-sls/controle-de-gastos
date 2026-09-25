# Movimentações

A Etapa 6 implementa receitas, despesas e transferências reais nas rotas
`/movimentacoes`, `/movimentacoes/nova` e `/movimentacoes/[id]/editar`.

## Funcionalidades

- criação, edição e exclusão de receitas e despesas;
- transferência entre duas contas ativas em uma operação atômica;
- estados pago, pendente e cancelado;
- estado vencido derivado automaticamente para pendências após o vencimento;
- forma de pagamento, data, vencimento, observação e classificação de despesa
  fixa;
- filtros por descrição, tipo, estado, conta, categoria e período;
- paginação de 20 itens com filtros preservados na URL;
- visualização de cada transferência como um único evento, embora o banco mantenha
  uma perna de saída e outra de entrada.

Somente movimentações pagas alteram o saldo atual. Valores pendentes, vencidos ou
cancelados permanecem no histórico sem afetar a view `account_balances`.

## Transferências

A interface nunca escreve diretamente nas pernas de uma transferência. Criação,
edição e exclusão usam respectivamente as RPCs `create_transfer`,
`update_transfer` e `delete_transfer`.

O PostgreSQL valida propriedade e atividade das contas, impede origem igual ao
destino e executa a alteração do agregado e das duas pernas na mesma transação. Se
qualquer validação falhar, nenhuma conta é alterada.

Ao filtrar por conta, a transferência é apresentada pela perspectiva dessa conta:
saída na origem e entrada no destino. Sem filtro de conta, somente a perna de saída
representa o evento, evitando duplicidade na lista e na paginação.

## Segurança

- páginas e consultas exigem identidade autenticada no servidor;
- cada leitura e escrita filtra explicitamente por `user_id`;
- RLS e chaves estrangeiras compostas repetem o isolamento no PostgreSQL;
- IDs, valores, datas, combinações de estado e campos são validados por Zod na
  interface e novamente na Server Action;
- o tipo não pode ser alterado durante a edição;
- transferências são autorizadas novamente dentro das RPCs `security definer`;
- erros internos, SQL e dados de outros usuários não são enviados ao navegador.

## Datas e estados

Datas financeiras chegam ao banco no formato `YYYY-MM-DD`, sem conversão implícita
de fuso. A interface formata apenas para apresentação. Uma movimentação paga exige
data de pagamento; as demais não podem armazená-la. O vencimento, quando existe,
não pode ser anterior à data da movimentação.

O estado `overdue` não é persistido. A view
`transactions_with_effective_status` o calcula a partir do vencimento e do fuso
definido em `user_settings`, evitando um valor armazenado que ficaria obsoleto.

## Validação manual

- [ ] criar receitas e despesas pagas e conferir o saldo da conta;
- [ ] criar uma pendência e confirmar que ela não altera o saldo;
- [ ] editar valor, conta, categoria, datas e estado;
- [ ] transferir entre duas contas e conferir débito e crédito simultâneos;
- [ ] editar e excluir uma transferência, conferindo as duas contas;
- [ ] combinar busca, filtros, período e paginação;
- [ ] filtrar uma transferência pela conta de origem e pela conta de destino;
- [ ] validar formulário, confirmação de exclusão, teclado, 320 px e tema escuro.

As verificações automatizadas são:

```bash
npm test
npm run check
npm run db:lint
npm run db:test
npm audit --audit-level=moderate
```
