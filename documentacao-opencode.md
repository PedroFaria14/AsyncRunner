# Contexto técnico do AsyncFlow

## Arquitetura e fluxo

```text
AppProviders → AppRouter → DashboardPage / CreateJob → JobForm
  → useCreateJob → Axios → POST /jobs
  → httpapi → jobs.Service.Create → mapa protegido por mutex
  → invalidação da query ['jobs'] → GET /jobs → tabela MUI

worker.Run → Claim (atômico, prioridade/FIFO) → Execute(context)
  → Finish → completed ou pending/failed
  → webhooks.Notify em transição terminal
```

`api/main.go` compõe dependências, servidor, sinais e shutdown. `jobs.Service` é
uma implementação em memória, não um repository de banco. As consultas retornam
cópias dos jobs, não ponteiros mutáveis do armazenamento. `queues.Job` é o modelo
canônico; `models.Job` é alias de transição.

## Decisões importantes

- `net/http` substitui as dependências HTTP não necessárias: a aplicação é pequena
  e Go já suporta roteamento por método/path. `go.mod` mantém somente UUID.
- Serviço e worker são instanciados explicitamente; não há mapa de jobs global.
- Executor injetado permite testar sucesso, falha e limite de tentativas sem dormir.
- React Query é a fonte de estado remoto; o formulário mantém apenas estado local.
- Um cliente Axios e validação de resposta evitam esconder divergências de contrato.
- MUI usa tema único. Não criar wrappers genéricos quando o componente da biblioteca atende.
- `/api` no navegador é um proxy (Vite/Nginx); as rotas Go continuam `/jobs`, etc.

## Gotchas

- Não usar `await mutation.mutate()`: para fluxo assíncrono, usar `mutateAsync()`.
- Não repetir mutations de criação automaticamente: a API não tem idempotency key.
- Não devolver o mapa interno nem alterar snapshots esperando modificar o serviço.
- Não executar trabalho longo sob mutex; o claim é atômico, execução ocorre fora do lock.
- Jobs são perdidos no restart; não prometer persistência, exactly-once ou agendamento.
- Webhooks são best effort, sequenciais e sem assinatura/outbox/DLQ; não há entrega garantida.
- Status da API são minúsculos (`pending`, `processing`, `completed`, `failed`).
- Testes E2E precisam das portas 8080 e 5173 livres; não reutilizam processos existentes.
- O ambiente Windows sem CGo não executa `-race`; o workflow Ubuntu executa esse check.

## Antes e depois de alterar

1. Ler [README](README.md), [OpenAPI](docs/openapi.yaml) e [catálogo de erros](docs/errors.md).
2. Apresentar plano e obter aprovação para alterações estruturais/contratuais.
3. Manter lógica nova em `backend/internal/` ou `frontend/src/features/`, evitando
   expandir os caminhos antigos de compatibilidade.
4. Testar comportamento e falhas, não detalhes de MUI/React Query.
5. Rodar formatação, lint/vet, testes, build e E2E relevantes; atualizar contrato/documentação.
6. Nunca registrar corpos, nomes de jobs, secrets ou URLs de webhooks nos logs.

Não existe `.agent/` nem integração com `int-go-lib` neste projeto. Não importar
governança de uma plataforma externa ou inventar APIs dessa biblioteca.
