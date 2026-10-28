import { useCreateJob, useJobsQuery } from '../features/jobs/hooks/use-jobs';

export const useJobs = () => {
  const query = useJobsQuery();
  const mutation = useCreateJob();

  return {
    jobs: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    createJob: mutation.mutate,
    isCreating: mutation.isPending,
  };
};
