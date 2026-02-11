import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getJobs, createJob } from '../services/api';

export const useJobs = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['jobs'],
    queryFn: getJobs,
    refetchInterval: 3000, 
    refetchIntervalInBackground: true,
  });

  const mutation = useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  return {
    jobs: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    createJob: mutation.mutate,
    isCreating: mutation.isPending
  };
};

