import type { JobStatus } from './types';

export const jobStatuses: Record<
  JobStatus,
  { label: string; color: 'warning' | 'info' | 'success' | 'error' }
> = {
  pending: { label: 'Pendente', color: 'warning' },
  processing: { label: 'Processando', color: 'info' },
  completed: { label: 'Concluído', color: 'success' },
  failed: { label: 'Falhou', color: 'error' },
};

export const jobPriorities = { 1: 'Baixa', 2: 'Média', 3: 'Alta' };
export const formatJobDate = (value: string) => new Date(value).toLocaleString('pt-BR');
