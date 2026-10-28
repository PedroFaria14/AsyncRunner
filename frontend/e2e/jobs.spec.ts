import { expect, test } from '@playwright/test';

test('creates and follows a real job to completion on desktop and mobile', async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'Execução de jobs' })).toBeVisible();
  await expect(page).toHaveTitle('AsyncFlow — Execução de jobs');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await expect(page.getByRole('link', { name: 'Dashboard', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  const name = `Job E2E ${Date.now()}`;
  await page.getByLabel('Nome do job').fill(name);
  await page.getByRole('button', { name: 'Criar job', exact: true }).click();
  const row = page.getByRole('row').filter({ hasText: name });
  await expect(row).toBeVisible();
  await expect(row.getByText('Concluído', { exact: true })).toBeVisible({ timeout: 15_000 });
  await page.screenshot({ path: info.outputPath('desktop.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  const card = page
    .getByRole('list', { name: 'Jobs em processamento' })
    .getByRole('listitem')
    .filter({ hasText: name });
  await expect(card.getByText('Concluído', { exact: true })).toBeVisible();
  await expect(card.getByText('Tentativas', { exact: true })).toBeVisible();
  await expect(card.getByText('1 / 3', { exact: true })).toBeVisible();
  await expect(card.getByText('Criado em', { exact: true })).toBeVisible();
  await expect(page.getByRole('table')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Criar job', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: info.outputPath('mobile.png'), fullPage: true });
  expect(errors).toEqual([]);
});

test('supports direct navigation to creation and returns to the dashboard', async ({ page }) => {
  await page.goto('/new');
  await expect(page.getByRole('link', { name: 'Novo job', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await page.getByLabel('Nome do job').fill(`Página de criação ${Date.now()}`);
  await page.getByRole('button', { name: 'Criar job', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('status')).toHaveText('Job criado e adicionado à fila.');
  await page.goto('/not-found');
  await expect(page.getByRole('heading', { name: 'Página não encontrada' })).toBeVisible();
  await page.getByRole('link', { name: 'Voltar ao dashboard' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
});

test('shows a recoverable list error without hiding the form', async ({ page }) => {
  await page.route('**/api/jobs', (route) =>
    route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }),
  );
  await page.goto('/dashboard');
  await expect(page.getByRole('button', { name: 'Tentar novamente' })).toBeVisible();
  await expect(page.getByLabel('Nome do job')).toBeVisible();
});
