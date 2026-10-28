# Validação da implementação

Executada em 28/10/2026, Windows, Go 1.26.5 e Node 24.18.0.

## Aprovado localmente

- `gofmt`, `go test -cover ./...`, `go vet ./...`, `go build ./...` e `go mod verify`.
- Frontend: Prettier, ESLint, TypeScript/build e dez testes Vitest/Testing Library/MSW.
- Quatro testes E2E Playwright com Chrome, executados contra o Docker: home,
  criação real e conclusão pelo worker, navegação e erro recuperável na listagem.
- Home validada em desktop (1440 px) e mobile (390 e 320 px), sem overflow horizontal.
- Ausência de requisições de jobs na home, inclusive após reload e retorno do
  dashboard, observada por tempo superior ao intervalo de polling (3 segundos).
- CTAs, link do GitHub, navegação ativa e retorno à home pelo logo validados.
- `npm audit`: zero vulnerabilidades reportadas no lockfile ao fim da execução.
- OpenAPI validado pelo Redocly CLI (`--extends=minimal`): sem erros; aviso esperado
  pelo servidor local `localhost`, pois não existe ambiente público configurado.
- Workflow validado por `actionlint` (sem execução de shellcheck/pyflakes).
- `docker compose config --quiet` e `git diff --check`.
- Build Docker e execução dos serviços aprovados; backend e frontend healthy,
  com usuários não-root. API, proxy `/api`, healthchecks e acesso direto a rotas validados.
- `go test -race ./...` aprovado em container Linux com Go 1.26.5 e compilador C.
- Após adicionar a home, somente o frontend foi reconstruído/recriado, preservando
  o processo do backend. Healthcheck do frontend aprovado após a atualização.

## Pendente / ambiente

- A configuração do GitHub Actions foi validada estaticamente; a execução remota
  não foi acompanhada nesta sessão.
- O fallback da Vercel foi adicionado ao repositório, mas esta alteração ainda
  depende de publicação pelo usuário para ser validada na hospedagem remota.
- Nenhum commit, push, pull request ou deploy remoto foi executado pelo agente nesta etapa.

## Limites conhecidos

- Persistência em memória, sem autenticação, rate limiting ou paginação.
- Executor demonstrativo sem falha aleatória; retry validado com falhas injetadas.
- Webhooks best effort, sem assinatura, retry durável, outbox ou DLQ.
- Mensagens em português, sem negociação i18n por `Accept-Language`.
- Aplicação não deve ser exposta publicamente sem os controles descritos no README.
