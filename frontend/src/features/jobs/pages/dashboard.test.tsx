import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { expect, it } from 'vitest';
import { server } from '../../../test/setup';
import { DashboardPage } from './dashboard';
import { FeedbackProvider } from '../../../shared/components/feedback-provider';

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  render(
    <QueryClientProvider client={client}>
      <FeedbackProvider>
        <DashboardPage />
      </FeedbackProvider>
    </QueryClientProvider>,
  );
}

it('shows loading followed by the empty state', async () => {
  server.use(http.get('*/api/jobs', () => HttpResponse.json([])));
  renderPage();
  expect(screen.getByLabelText('Carregando jobs')).toBeVisible();
  expect(await screen.findByText('Nenhum job na fila.')).toBeVisible();
});

it('shows API jobs with canonical status and attempts', async () => {
  server.use(
    http.get('*/api/jobs', () =>
      HttpResponse.json([
        {
          id: 'job-1',
          name: 'Relatório mensal',
          priority: 3,
          status: 'completed',
          attempts: 1,
          max_attempts: 3,
          created_at: '2026-01-01T00:00:00Z',
        },
      ]),
    ),
  );
  renderPage();
  expect(await screen.findByText('Relatório mensal')).toBeVisible();
  expect(screen.getByText('Concluído')).toBeVisible();
  expect(screen.getByText('1 / 3')).toBeVisible();
});

it('shows an actionable error when the server is unavailable', async () => {
  server.use(http.get('*/api/jobs', () => new HttpResponse(null, { status: 503 })));
  renderPage();
  expect(await screen.findByRole('button', { name: 'Tentar novamente' })).toBeVisible();
  expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível conectar');
});
