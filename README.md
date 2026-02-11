AsyncFlow é um sistema de execução de jobs assíncronos, desenvolvido em Go, com monitoramento de status em tempo real e notificações via webhooks, acompanhado por um dashboard web em React + TypeScript.

O objetivo é simular um cenário real de sistemas modernos, onde tarefas longas são executadas em background, com controle de concorrência, acompanhamento de progresso e integração entre sistemas

---

## 🎯 Funcionalidades

- Criar jobs assíncronos com prioridade: **HIGH, MEDIUM, LOW**
- Worker respeitando prioridade (HIGH > MEDIUM > LOW)
- Status dinâmico: **PENDING → PROCESSING → COMPLETED / FAILED**
- Retry automático em caso de falha (com limite de tentativas)
- Webhooks: notificação de eventos de jobs
- Dashboard em tempo real com **React + Material-UI**
- Polling automático a cada 3 segundos
- Containerização com Docker

---

## 💻 Tecnologias

- Backend: **Go**, Gorilla Mux, Google UUID
- Frontend: **React + TypeScript**, **Material-UI**
- Docker para containerização
- JSON Webhooks para eventos
