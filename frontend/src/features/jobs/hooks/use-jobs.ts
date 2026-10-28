import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createJob, getJobs } from '../api/jobs';

export const jobKeys = { all: ['jobs'] as const };

export function useJobsQuery() {
  return useQuery({
    queryKey: jobKeys.all,
    queryFn: ({ signal }) => getJobs(signal),
    staleTime: 2_000,
    refetchInterval: 3_000,
    refetchIntervalInBackground: false,
  });
}

export function useCreateJob() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: createJob,
    retry: false,
    onSuccess: () => client.invalidateQueries({ queryKey: jobKeys.all }),
  });
}
