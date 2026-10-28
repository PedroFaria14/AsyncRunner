export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type JobPriority = 1 | 2 | 3;

export interface Job {
  id: string;
  name: string;
  status: JobStatus;
  priority: JobPriority;
  created_at: string;
  attempts: number;
  max_attempts: number;
}

export interface CreateJobInput {
  name: string;
  priority: JobPriority;
}

export function isJob(value: unknown): value is Job {
  if (!value || typeof value !== 'object') return false;
  const job = value as Record<string, unknown>;
  return (
    typeof job.id === 'string' &&
    typeof job.name === 'string' &&
    typeof job.status === 'string' &&
    ['pending', 'processing', 'completed', 'failed'].includes(job.status) &&
    typeof job.priority === 'number' &&
    [1, 2, 3].includes(job.priority) &&
    typeof job.created_at === 'string' &&
    !Number.isNaN(Date.parse(job.created_at)) &&
    Number.isInteger(job.attempts) &&
    Number(job.attempts) >= 0 &&
    Number(job.attempts) <= 3 &&
    job.max_attempts === 3
  );
}
