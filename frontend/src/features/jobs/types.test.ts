import { expect, it } from 'vitest';
import { isJob } from './types';

it('rejects incompatible API shapes instead of hiding contract errors', () => {
  expect(isJob(null)).toBe(false);
  expect(isJob({ status: 'RUNNING' })).toBe(false);
  expect(
    isJob({
      id: '1',
      name: 'job',
      status: 'pending',
      priority: '1',
      created_at: 'bad',
      attempts: 0,
      max_attempts: 3,
    }),
  ).toBe(false);
});
