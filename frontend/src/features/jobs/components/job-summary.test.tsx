import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import { JobSummary } from './job-summary';
import type { Job, JobStatus } from '../types';

it('counts actual jobs separately by state', () => {
  const states: JobStatus[] = [
    'pending',
    'completed',
    'processing',
    'pending',
    'failed',
    'completed',
    'completed',
  ];
  const jobs: Job[] = states.map((status, index) => ({
    id: String(index),
    name: `Job ${index}`,
    status,
    priority: 1,
    attempts: 0,
    max_attempts: 3,
    created_at: '2026-01-01T00:00:00Z',
  }));
  render(<JobSummary jobs={jobs} loading={false} />);
  const summary = within(screen.getByRole('region', { name: 'Resumo dos jobs' }));
  for (const [label, count] of [
    ['Na fila', '2'],
    ['Em execução', '1'],
    ['Concluídos', '3'],
    ['Falhos', '1'],
  ]) {
    const metric = summary.getByText(label).parentElement!;
    expect(within(metric).getByText(count)).toBeVisible();
  }
});

it('does not present unavailable data as zero jobs', () => {
  render(<JobSummary loading={false} />);
  const summary = within(screen.getByRole('region', { name: 'Resumo dos jobs' }));
  expect(summary.getAllByText('—')).toHaveLength(4);
  expect(summary.queryByText('0')).not.toBeInTheDocument();
});
