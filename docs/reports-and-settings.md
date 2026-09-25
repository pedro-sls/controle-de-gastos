# Relatórios e configurações

A Etapa 10 substitui os últimos placeholders funcionais do MVP.

## Relatórios

`/relatorios` aceita um intervalo de até dois anos e apresenta:

- receitas, despesas e resultado pagos;
- comparação com o intervalo imediatamente anterior de mesma duração;
- evolução mensal com meses vazios preenchidos;
- distribuição das despesas por categoria;
- valores pendentes a receber e a pagar.

`get_financial_report` agrega os dados no PostgreSQL, exige `auth.uid()`, exclui
transferências dos totais e retorna somente séries e totais reduzidos. A página é
Server Component; somente os gráficos Recharts são enviados como componentes de
cliente.

## Preferências

`/configuracoes` salva nome, tema, fuso, início do mês financeiro, formato de
data, moeda e localidade. Nesta versão, moeda e localidade permanecem em BRL e
pt-BR para evitar sugerir conversão cambial inexistente.

`update_user_preferences` atualiza perfil e preferências atomicamente. O fuso é
validado pelo PostgreSQL, o início do período aceita dias de 1 a 28 e o tema é
sincronizado entre banco, armazenamento local e cabeçalho.

## Validação

Os testes verificam comparações, base zero, período padrão, isolamento das
agregações e atualização atômica das preferências. Playwright confirma os dois
módulos com uma sessão real em desktop e celular.
