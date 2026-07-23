# Shell autenticado da aplicação

Esta documentação descreve a Etapa 4 do MeuSaldo: layout persistente, navegação
responsiva, cabeçalho, preferência de tema e estados compartilhados das rotas
autenticadas.

## Escopo entregue

- sidebar fixa a partir do breakpoint `lg`;
- barra de navegação inferior em telas menores;
- cabeçalho persistente com contexto da rota, tema e logout;
- ação destacada para criar uma movimentação;
- tema claro, escuro ou sincronizado com o sistema;
- fallback de carregamento e recuperação de erro para o conteúdo das rotas
  privadas;
- rotas protegidas para as funcionalidades previstas no MVP;
- página `/mais`, que mantém todos os destinos acessíveis no celular;
- helpers puros e testados para correspondência de rotas e preferência de tema.

Contas, categorias, movimentações, dashboard, orçamentos, recorrências,
relatórios e configurações exibem dados reais. Não restam placeholders
funcionais no shell do MVP.

## Arquitetura de renderização

O layout em `src/app/(dashboard)/layout.tsx` carrega somente a preferência de
tema autenticada. O restante dos dados permanece em cada página, evitando
waterfalls de domínio no shell.

Cada página privada chama `requireUser()` no servidor. O Proxy também redireciona
visitantes, mas é apenas a primeira barreira: a autorização não depende do
layout nem de uma verificação no navegador. Quando as páginas passarem a ler
dados, o PostgreSQL continuará aplicando RLS como última barreira.

O shell possui o único elemento `main`. Páginas, estados de carregamento e erros
renderizam seções internas, evitando landmarks principais aninhados.

## Navegação

| Destino               | Desktop        | Celular    | Implementação funcional |
| --------------------- | -------------- | ---------- | ----------------------- |
| `/dashboard`          | sidebar        | Início     | Etapa 7 (concluída)     |
| `/movimentacoes`      | sidebar        | Movimentos | Etapa 6 (concluída)     |
| `/movimentacoes/nova` | ação destacada | Novo       | Etapa 6 (concluída)     |
| `/contas`             | sidebar        | Mais       | Etapa 5 (concluída)     |
| `/categorias`         | sidebar        | Mais       | Etapa 5 (concluída)     |
| `/orcamentos`         | sidebar        | Orçamentos | Etapa 8 (concluída)     |
| `/recorrencias`       | sidebar        | Mais       | Etapa 9 (concluída)     |
| `/relatorios`         | sidebar        | Mais       | Etapa 10 (concluída)    |
| `/configuracoes`      | sidebar        | Mais       | Etapa 10 (concluída)    |
| `/mais`               | —              | Mais       | Etapa 4                 |

O catálogo central fica em `src/config/navigation.ts`. A correspondência exige
limite de segmento: por exemplo, `/contas/123` mantém Contas ativa, mas
`/contas-extras` não. `aria-current="page"` é usado somente quando o link aponta
para a página exata; uma seção pai pode permanecer destacada sem anunciar que é
a página atual.

## Responsividade e acessibilidade

- todos os controles principais têm alvo de toque de pelo menos 44 px;
- um link de salto move o foco diretamente para o conteúdo principal;
- os landmarks de navegação possuem nomes distintos;
- o título contextual é atualizado durante a navegação no cliente;
- estados ativos não dependem apenas de ícones;
- o conteúdo reserva espaço para a barra inferior e para a safe area do aparelho;
- animações de skeleton e progresso respeitam `prefers-reduced-motion`;
- ícones decorativos são ocultados de tecnologias assistivas;
- foco visível, texto e superfícies usam os tokens do tema.

## Tema

`next-themes` aplica a classe `light` ou `dark` ao elemento `html`. A preferência
inicial vem de `user_settings`; o botão percorre sistema, claro e escuro e
persiste a escolha no PostgreSQL e no armazenamento local.

O layout raiz usa `suppressHydrationWarning` somente no elemento alterado pela
biblioteca. O botão permanece desabilitado até a hidratação, usando
`useSyncExternalStore` para evitar conteúdo divergente entre servidor e cliente.

## Estados compartilhados

`src/app/(dashboard)/loading.tsx` mantém o shell visível e apresenta um skeleton
sem valores financeiros simulados. `error.tsx` registra apenas o `digest` do erro
inesperado e oferece tanto a tentativa do Next.js 16 com `unstable_retry` quanto
um retorno seguro ao dashboard. `global-error.tsx` protege também falhas acima
desse segmento, e `not-found.tsx` oferece recuperação acessível para endereços
desconhecidos.

## Execução e validação local

Prepare `.env.local`, inicie o Supabase e o servidor web:

```bash
npm run supabase:start
npm run dev
```

Depois de entrar, valide manualmente:

- [ ] sidebar e ação principal em uma janela com pelo menos 1024 px;
- [ ] barra inferior, safe area e página Mais em uma largura de 320 px;
- [ ] destaque correto da rota e de subrotas;
- [ ] navegação completa apenas com teclado e link de salto;
- [ ] ciclos sistema, claro e escuro após recarregar a página;
- [ ] logout e tentativa de acesso direto a cada rota privada;
- [ ] skeleton durante uma navegação pendente e recuperação de erro;
- [ ] contraste e zoom de 200% nos dois temas.

As verificações automatizadas são:

```bash
npm test
npm run check
npm run test:e2e
npm audit --audit-level=moderate
```

Os testes Vitest cobrem o ciclo de tema, normalização de valores, rotas exatas,
subrotas, colisões de prefixo, títulos de página e invariantes do catálogo. O
build de produção valida também as fronteiras entre Server e Client Components.

Os cenários Playwright verificam o shell autenticado em Chromium desktop e
mobile, executam axe-core com critérios WCAG 2 A/AA e confirmam os
redirecionamentos de sessão.
