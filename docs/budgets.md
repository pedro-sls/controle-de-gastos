# Orçamentos mensais

A Etapa 8 implementa limites de despesa em `/orcamentos`.

## Comportamento

- limite geral para todas as despesas do mês;
- limite específico para cada categoria de despesa;
- um único limite por escopo e mês;
- navegação entre meses;
- comparação somente com despesas pagas do mês;
- edição e exclusão com feedback explícito;
- progresso visual limitado a 100%, sem esconder o percentual real;
- saldo restante ou valor excedido.

As faixas são saudável abaixo de 75%, atenção a partir de 75%, próximo do limite
a partir de 90% e excedido a partir de 100%. A view `budget_progress`, com
`security_invoker`, calcula uso, percentual e estado sem persistir totais
derivados. RLS e referências compostas mantêm cada orçamento no usuário e em uma
categoria de despesa válida.

## Validação

Os schemas rejeitam datas fora do primeiro dia do mês, valores não positivos e
identificadores inválidos. Os testes cobrem faixas, saldo, progresso, mudança de
mês e entradas monetárias. Os fluxos de navegador confirmam dados reais em
desktop e celular.
