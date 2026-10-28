# AsyncFlow / AsyncRunner

Aplicação de estudo para execução de jobs assíncronos com prioridade, worker em Go,
API HTTP e dashboard React + TypeScript. Usa armazenamento **em memória**: jobs e
assinaturas de webhooks são perdidos ao reiniciar o backend.

## Stack e padrões

- Backend: Go, `net/http`, `log/slog`, UUID e testes com `testing`/`httptest`.
- Frontend: React, TypeScript estrito, MUI Material, TanStack React Query e Axios.
- Testes de interface: Vitest, React Testing Library, user-event e MSW.
- Docker Compose com healthchecks; GitHub Actions com lint, testes e build.
- Composição e dependências explícitas, sem framework de DI ou abstrações genéricas.

## Executar com Docker

Pré-requisito: Docker Desktop/Engine ativo, com containers Linux e Compose v2.
Na raiz deste repositório:

```sh
docker compose up --build --wait
```

- Home de apresentação: http://localhost:5173
- Dashboard: http://localhost:5173/dashboard
- API: http://localhost:8080
- Saúde da API: http://localhost:8080/health
- API pelo proxy do frontend: http://localhost:5173/api/jobs

```sh
docker compose logs -f backend
docker compose down
```

As portas são publicadas somente em `127.0.0.1`. O frontend usa Nginx não-root e
proxy `/api`, evitando URLs fixas de backend no bundle. Rotas como `/dashboard`
e `/new` também funcionam ao recarregar a página.

## Home e navegação

- `/`: apresentação do AsyncFlow, fluxo ilustrativo, objetivo de estudo, tecnologias
  e links para experimentar o dashboard e consultar o código no GitHub.
- `/dashboard`: resumo da fila, criação de jobs e acompanhamento automático.
- `/new`: formulário de criação dedicado.

A home é estática e não consulta a API. O polling existe apenas enquanto o
dashboard está montado. O logo e o item **Início** retornam à apresentação.
O diagrama da home é ilustrativo; a execução real é demonstrada no dashboard.

### Frontend na Vercel

Configure a Root Directory como `frontend`, framework Vite, Node 24, build
`npm run build` e saída `dist`. `frontend/vercel.json` configura o fallback da SPA
para permitir abrir e recarregar as rotas diretamente.

Defina `VITE_API_URL` com a URL HTTPS do backend, **sem `/api` no final**, por exemplo
`https://seu-backend.onrender.com`. `/api` é somente o proxy do ambiente local;
no backend as rotas são `/jobs`, `/webhooks` e `/health`.
A variável é incorporada no build: alterá-la exige novo deploy do frontend.
Configure `CORS_ORIGIN` no backend com a origem exata publicada na Vercel, sem
barra final. A configuração local não publica nem modifica os serviços remotos.

## Desenvolvimento sem Docker

Requisitos: Go 1.26.5 (versão usada no CI) e Node.js 24 com npm.

Terminal 1:

```sh
cd backend
go mod download
go run ./api
```

Terminal 2:

```sh
cd frontend
npm ci
npm run dev
```

O Vite encaminha `/api` para `http://localhost:8080`. Não é necessário criar `.env`.
Use `frontend/.env.example` como referência para apontar para outra API. Variáveis
`VITE_*` são públicas e incorporadas no build, nunca devem conter secrets.

| Variável | Padrão | Uso |
| --- | --- | --- |
| `HTTP_ADDR` | `:8080` | Endereço de escuta do backend |
| `CORS_ORIGIN` | `http://localhost:5173` | Única origem permitida para chamadas diretas cross-origin |
| `VITE_API_URL` | `/api` | Base da API no frontend, definida no build |

## API

Contrato: [OpenAPI 3.1](docs/openapi.yaml). Pode ser importado no Swagger Editor,
Postman ou Insomnia. Erros: [catálogo](docs/errors.md).

| Método | Rota | Resultado |
| --- | --- | --- |
| GET | `/health` | `200`, saúde do processo HTTP |
| POST | `/jobs` | `201`, job criado e header `Location` |
| GET | `/jobs` | `200`, array de jobs ordenado por criação |
| GET | `/jobs/{id}` | `200` ou `404` |
| POST | `/webhooks` | `201`, cadastro sem corpo de resposta |

Exemplo:

```sh
curl -X POST http://localhost:8080/jobs \
  -H 'Content-Type: application/json' \
  -d '{"name":"Gerar relatório","priority":3}'
```

No PowerShell, utilize `curl.exe` ou `Invoke-RestMethod`.
O nome é obrigatório (1–200 caracteres após trim); prioridade aceita `1` (baixa),
`2` (média) ou `3` (alta). Campos desconhecidos, múltiplos objetos JSON e corpos
acima de 16 KiB são rejeitados com `400` e detalhes de validação.

### Execução e retry

- `pending → processing → completed` ou `pending → processing → pending/failed`.
- O claim é atômico: maior prioridade primeiro; em empate, FIFO.
- Até três tentativas; espera de polling entre execuções evita retry em loop quente.
- O executor demonstrativo aguarda um segundo e conclui com sucesso. Não há falha
  aleatória: falhas e limite de retry são exercitados com executor injetado nos testes.
- Há um worker serial. O mecanismo de claim suporta concorrência, mas não garante
  justiça entre prioridades sob entrada contínua de jobs de alta prioridade.
- `ScheduledAt` não tem agendamento implementado e não é aceito na criação.

### Webhooks

```json
{"url":"https://seu-dominio.example/events","event":"job.completed"}
```

Eventos: `job.completed` e `job.failed`, enviados após a transição terminal.
Payload: `event_id`, `event_name`, `job_id`, `timestamp`.
Subscrições duplicadas são ignoradas; limite de 20 destinos por evento.

Somente HTTPS na porta 443, sem credenciais na URL. O cliente tem timeout de cinco
segundos, não segue redirects e valida os endereços DNS ao conectar, bloqueando
IPs privados, locais e especiais. URLs e nomes dos jobs não são registrados nos logs.
`201` confirma o cadastro, não a conectividade do destino.

Entrega **best effort**, sem retry persistente, assinatura, outbox ou DLQ. Uma falha
é registrada, mas não altera o resultado do job. Destinos lentos podem atrasar o
worker, pois a entrega é sequencial e limitada por timeout. Para uso em produção,
extrair a entrega para uma fila durável com idempotência por `event_id`.

## Organização

```text
backend/
  api/main.go              # Composição, servidor, sinais e shutdown
  internal/jobs/           # Validação, armazenamento protegido e transições
  internal/httpapi/        # Rotas, JSON, CORS, erros e access logs
  internal/worker/         # Execução injetável e cancelamento
  internal/webhooks/       # Cadastro e entrega de eventos
  queues/jobs.go           # Modelo único do job
frontend/src/
  app/                    # Providers, router e tema MUI
  features/jobs/           # API, tipos, hooks, componentes, páginas e testes
  features/home/           # Apresentação estática do projeto, sem consultas à API
  shared/api/             # Cliente HTTP e mensagens de erro
  test/                   # Setup compartilhado de testes e MSW
docs/                     # Contrato e catálogo de erros
.github/workflows/        # CI
```

Arquivos nos antigos caminhos `controller/`, `models/`, `routes/` e
`src/templates`, `src/services`, `src/hooks`, `src/styles` são adaptadores/exports
de transição, sem implementação duplicada. As antigas funções de acesso global
do backend não fazem parte de uma API pública de biblioteca e foram substituídas.

### Convenções frontend

- Dados remotos pertencem ao React Query; inputs e feedbacks ficam no estado local.
- Queries têm chave centralizada, cache, cancelamento e polling apenas com aba ativa.
- Mutations não são repetidas automaticamente para não duplicar jobs.
- Um único `JobForm` serve dashboard e página de criação; erro preserva os valores.
- MUI e tokens de `app/theme.ts` são a fonte do visual; status possuem texto e cor.
- Axios valida a forma da resposta na fronteira; não há fallback para campos inexistentes.
- Componentes `.tsx`, lógica `.ts`, nomes novos em kebab-case; testes junto da feature.

## Qualidade

```sh
# backend/
gofmt -w .
go vet ./...
go test -cover ./...
go test -race ./...
go build ./...

# frontend/
npm run format:check
npm run lint
npm run typecheck
npm test
npm run test:coverage
npm run build
npm audit

# Navegador real (Chrome/Chromium)
npx playwright install chromium
npm run test:e2e
```

O race detector precisa de compilador C compatível; é executado no Ubuntu do CI.
O Playwright sobe API e Vite em portas locais dedicadas (8080/5173); encerre outras
instâncias antes de rodar. Para usar Chrome já instalado, defina
`PLAYWRIGHT_CHANNEL=chrome` (no PowerShell: `$env:PLAYWRIGHT_CHANNEL='chrome'`).
Os testes E2E exercitam criação real até conclusão, navegação, erro recuperável e
layout mobile sem overflow da página. Screenshots ficam em `frontend/test-results/`.
`npm run format` aplica a formatação do frontend. Cobertura não substitui testes
de comportamento: os testes cobrem validação, seleção concorrente, retry, handlers,
criação pela interface, falhas da API e estados da listagem.

O workflow executa checks de backend e frontend, publica cobertura e então sobe o
Compose para smoke tests de health, proxy e SPA. Não faz deploy, push de imagens
ou commits. Branch protection deve ser configurada no GitHub para exigir os checks.

## Logs e limites

Logs JSON em inglês: requisição (`request_id`, método, status e duração) e execução
(`job_id`, tentativa, status). `X-Request-ID` é gerado pelo servidor e devolvido ao
cliente; nomes, corpos e URLs de webhook não são logados. Há timeouts HTTP,
cancelamento do worker e shutdown com prazo de dez segundos.

Esta é uma aplicação local de estudo, **não pronta para exposição pública**:
não possui autenticação, quotas de jobs, paginação, persistência, rate limiting,
assinatura de webhooks ou isolamento por usuário. `/health` mede o processo HTTP,
não a capacidade de uma fila/banco externo. Antes de produção, adicionar esses
controles, allowlist de destinos/egress, revisão de segurança e observabilidade distribuída.
