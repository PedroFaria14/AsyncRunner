# Guia do projeto

O AsyncFlow demonstra uma fila de jobs com prioridade, API Go e dashboard React.

1. Com Docker ativo: execute `docker compose up --build --wait` na raiz.
2. Abra http://localhost:5173 para conhecer o projeto e clique em **Experimentar o dashboard**.
   No painel, informe nome e prioridade para criar um job.
3. Acompanhe a atualização automática até a conclusão.
4. Para encerrar: `docker compose down`.

Sem Docker, execute `go run ./api` em `backend/` e `npm ci` seguido de
`npm run dev` em `frontend/`, em terminais separados.

Os dados não persistem após reiniciar. O executor é demonstrativo, sem falhas aleatórias.
Não exponha esta aplicação publicamente sem autenticação e controles adicionais.

- [Instalação, configuração, comandos e limites](README.md)
- [Arquitetura e fluxos](documentacao-opencode.md)
- [Contrato da API](docs/openapi.yaml)
- [Erros](docs/errors.md)
