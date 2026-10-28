# Validação da implementação

Executada em 28/10/2026, Windows, Go 1.26.5 e Node 24.18.0.

## Aprovado localmente

- `gofmt`, `go test -cover ./...`, `go vet ./...`, `go build ./...` e `go mod verify`.
- Frontend: Prettier, ESLint, TypeScript/build e sete testes Vitest/Testing Library/MSW.
- Três testes E2E Playwright com Chrome instalado: criação real e conclusão pelo
  worker, navegação e erro recuperável na listagem.
- Screenshots desktop (1280 px) e mobile (390 px), sem overflow horizontal da página.
- `npm audit`: zero vulnerabilidades reportadas no lockfile ao fim da execução.
- OpenAPI validado pelo Redocly CLI (`--extends=minimal`): sem erros; aviso esperado
  pelo servidor local `localhost`, pois não existe ambiente público configurado.
- Workflow validado por `actionlint` (sem execução de shellcheck/pyflakes).
- `docker compose config --quiet` e `git diff --check`.

## Pendente / ambiente

- Build e execução das imagens/healthchecks: Docker instalado, mas daemon Docker Desktop
  Linux indisponível. Com Docker ativo, executar `docker compose up --build --wait`
  e conferir `/health`, frontend e proxy `/api/jobs`.
- Race detector local: `go test -race ./...` requer CGo/compilador C neste Windows.
  O check está presente no workflow Ubuntu, mas o workflow remoto ainda não foi executado.
- A configuração do GitHub Actions foi criada e validada estaticamente; não foram
  criados commits, pushes, pull requests, deploys nem regras remotas de branch protection.

## Limites conhecidos

- Persistência em memória, sem autenticação, rate limiting ou paginação.
- Executor demonstrativo sem falha aleatória; retry validado com falhas injetadas.
- Webhooks best effort, sem assinatura, retry durável, outbox ou DLQ.
- Mensagens em português, sem negociação i18n por `Accept-Language`.
- Aplicação não deve ser exposta publicamente sem os controles descritos no README.
