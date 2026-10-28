import { apiClient } from '../../../shared/api/client';
import { isJob } from '../types';
import type { CreateJobInput, Job } from '../types';

export async function getJobs(signal?: AbortSignal): Promise<Job[]> {
  const { data } = await apiClient.get<unknown>('/jobs', { signal });
  if (!Array.isArray(data) || !data.every(isJob)) throw new Error('Invalid jobs response');
  return data;
}

export async function createJob(input: CreateJobInput): Promise<Job> {
  const { data } = await apiClient.post<unknown>('/jobs', input);
  if (!isJob(data)) throw new Error('Invalid job response');
  return data;
}
