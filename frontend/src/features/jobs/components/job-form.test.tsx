import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '../../../test/setup';
import { JobForm } from './job-form';
import { FeedbackProvider } from '../../../shared/components/feedback-provider';

function setup() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <FeedbackProvider>
        <JobForm />
      </FeedbackProvider>
    </QueryClientProvider>,
  );
  return userEvent.setup();
}

describe('JobForm', () => {
  it('validates whitespace without sending a request', async () => {
    const user = setup();
    await user.type(screen.getByLabelText(/Nome do job/), '   ');
    await user.click(screen.getByRole('button', { name: 'Criar job' }));
    expect(screen.getByText('Informe entre 1 e 200 caracteres.')).toBeVisible();
  });

  it('creates a job and clears the form only after success', async () => {
    server.use(
      http.post('*/api/jobs', async ({ request }) => {
        expect(await request.json()).toEqual({ name: 'Relatório', priority: 1 });
        return HttpResponse.json(
          {
            id: 'job-1',
            name: 'Relatório',
            priority: 1,
            status: 'pending',
            attempts: 0,
            max_attempts: 3,
            created_at: '2026-01-01T00:00:00Z',
          },
          { status: 201 },
        );
      }),
    );
    const user = setup();
    await user.type(screen.getByLabelText(/Nome do job/), 'Relatório');
    await user.click(screen.getByRole('button', { name: 'Criar job' }));
    expect(await screen.findByText('Job criado e adicionado à fila.')).toBeVisible();
    await waitFor(() => expect(screen.getByLabelText(/Nome do job/)).toHaveValue(''));
  });

  it('preserves input and shows the API error when creation fails', async () => {
    server.use(
      http.post('*/api/jobs', () =>
        HttpResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos' } },
          { status: 400 },
        ),
      ),
    );
    const user = setup();
    await user.type(screen.getByLabelText(/Nome do job/), 'Meu job');
    await user.click(screen.getByRole('button', { name: 'Criar job' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Dados inválidos');
    expect(screen.getByLabelText(/Nome do job/)).toHaveValue('Meu job');
  });
});
