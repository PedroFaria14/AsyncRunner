import { expect, test } from '@playwright/test';

test('introduces the project without polling and links to the working dashboard', async ({
  page,
}, info) => {
  const errors: string[] = [];
  let jobRequests = 0;
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    if (/\/(?:api\/)?jobs(?:\/|$)/.test(new URL(request.url()).pathname)) jobRequests++;
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Entenda o caminho de uma tarefa em segundo plano.',
  );
  await expect(page.getByRole('heading', { name: 'Como funciona', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sobre o projeto', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Início', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(
    page.getByRole('link', { name: 'Ver código no GitHub', exact: true }),
  ).toHaveAttribute('href', 'https://github.com/PedroFaria14/AsyncRunner');
  await page.screenshot({ path: info.outputPath('home-desktop.png'), fullPage: true });

  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(
      page.getByRole('link', { name: 'Experimentar o dashboard', exact: true }),
    ).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: info.outputPath(`home-mobile-${width}.png`), fullPage: true });
  }

  // Observe longer than the dashboard polling interval, including a reload of the home.
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.waitForTimeout(3500);
  expect(jobRequests).toBe(0);

  const response = page.waitForResponse((response) =>
    /\/(?:api\/)?jobs$/.test(new URL(response.url()).pathname),
  );
  await page.getByRole('link', { name: 'Experimentar o dashboard', exact: true }).click();
  await response;
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Execução de jobs', exact: true })).toBeVisible();
  expect(jobRequests).toBeGreaterThan(0);
  await page.getByRole('link', { name: 'AsyncFlow', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Entenda o caminho de uma tarefa em segundo plano.',
  );
  const requestsAfterLeavingDashboard = jobRequests;
  await page.waitForTimeout(3500);
  expect(jobRequests).toBe(requestsAfterLeavingDashboard);
  expect(errors).toEqual([]);
});
