import { render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { JobList } from './job-list';
import type { Job } from '../types';

afterEach(() => vi.unstubAllGlobals());

it('shows every job field in the mobile card without a horizontally scrolling table', () => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
  const job: Job = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Relatório financeiro',
    priority: 3,
    status: 'processing',
    attempts: 2,
    max_attempts: 3,
    created_at: '2026-01-01T12:00:00Z',
  };
  render(<JobList jobs={[job]} />);
  const card = within(screen.getByRole('list', { name: 'Jobs em processamento' })).getByRole(
    'listitem',
  );
  expect(within(card).getByRole('heading', { name: job.name })).toBeVisible();
  expect(within(card).getByText(job.id)).toBeVisible();
  expect(within(card).getByText('Processando')).toBeVisible();
  expect(within(card).getByText('Alta')).toBeVisible();
  expect(within(card).getByText('2 / 3')).toBeVisible();
  expect(within(card).getByText(new Date(job.created_at).toLocaleString('pt-BR'))).toBeVisible();
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
});
