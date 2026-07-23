# Qualidade do MVP

A Etapa 11 fecha o roadmap funcional com verificações reproduzíveis.

## Camadas automatizadas

- `npm audit --audit-level=moderate`: dependências conhecidas;
- `npm run check`: Prettier, ESLint, TypeScript, 106 testes Vitest e build;
- `npm run db:lint`: análise das funções e do schema;
- `npm run db:test`: 98 asserções pgTAP em seis suítes;
- `npm run test:e2e`: 8 cenários Playwright em Chromium desktop e mobile.

Os testes de navegador criam um usuário confirmado descartável e dados
financeiros isolados. Eles validam login, módulos finais, valores reais, 404,
cabeçalhos de segurança e axe-core com WCAG 2 A, AA e 2.1 AA.

## Segurança

- autenticação repetida em ações e RLS como última barreira;
- CSP com origens restritas, bloqueio de objetos e enquadramento;
- `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` e
  `Permissions-Policy`;
- respostas de autenticação sem cache;
- erros globais sem exposição de detalhes internos;
- zero vulnerabilidades na auditoria da entrega.

## Desempenho e resiliência

Agregações volumosas executam no PostgreSQL e retornam DTOs reduzidos. Gráficos
ficam em fronteiras de cliente carregadas por rota; formulários e leituras
permanecem no servidor quando não exigem interação. O shell oferece loading,
erro recuperável, erro global e 404 acessível.

A CI possui jobs independentes para web, banco e navegador e guarda traces e
capturas somente quando um cenário falha.
