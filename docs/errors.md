# Catálogo de erros

O AsyncFlow é uma aplicação independente, sem `.agent/` ou dependência da `int-go-lib`.
O contrato mantém os objetos/arrays de sucesso existentes e usa um objeto `error` nas falhas.
Não são gerados campos de envelope como `timestamp`, `locale` ou `correlationId`.
O identificador de requisição é devolvido no header `X-Request-ID`.

| Código | HTTP | Significado |
| --- | --- | --- |
| `VALIDATION_ERROR` | 400 | JSON inválido, corpo acima de 16 KiB ou campo inválido; inclui `details` com `field` e `message` |
| `JOB_NOT_FOUND` | 404 | Job não existe |
| `ROUTE_NOT_FOUND` | 404 | Rota não existe |
| `METHOD_NOT_ALLOWED` | 405 | Método não permitido; consulte o header `Allow` |
| `INTERNAL_ERROR` | 500 | Falha inesperada; detalhes internos não são enviados ao cliente |

Mensagens de interface estão em português. Internacionalização negociada via `Accept-Language`
não está implementada; este catálogo não representa a governança de APIs da plataforma INTEGRA.
