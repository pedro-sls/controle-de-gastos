# Recorrências

A Etapa 9 implementa o cadastro e a geração de lançamentos repetidos em
`/recorrencias`.

## Agenda

Cada recorrência define conta, categoria, tipo, valor, frequência, vigência,
próxima execução, estado padrão, pagamento e classificação de despesa fixa. É
possível editar, pausar, retomar e excluir uma agenda que ainda não gerou
histórico. Agendas com lançamentos são pausadas em vez de apagadas.

## Geração idempotente

`generate_recurring_occurrences`:

- exige usuário autenticado e processa somente suas agendas;
- bloqueia as linhas da agenda durante a geração concorrente;
- usa índice único por recorrência e data;
- aceita execução repetida sem duplicar lançamentos;
- avança a próxima data na mesma transação;
- preserva o dia de calendário, inclusive dia 31 e fevereiro;
- limita o horizonte a um ano;
- encerra automaticamente agendas após a vigência.

O usuário escolhe até qual data vencida deseja gerar. Lançamentos pagos recebem
data de pagamento; pendentes recebem vencimento na data da ocorrência.

## Validação

Doze testes pgTAP cobrem autenticação, isolamento, âncora de calendário,
idempotência, próxima execução, estado e limite de horizonte. Schemas TypeScript
cobrem classificação fixa e intervalos de datas.
