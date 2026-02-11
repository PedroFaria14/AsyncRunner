import { DashboardTemplate } from '../../templates/dashboard.template'
import { useJobs } from '../../hooks/useJobs';

import { useNavigate } from 'react-router-dom';

const getChipColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending': return 'warning';
    case 'processing': return 'info';
    case 'completed': return 'success';
    case 'failed': return 'error';
    default: return 'default';
  }
};

export const Dashboard = () => {
    const { jobs, isLoading, isError, createJob, isCreating } = useJobs();
    const navigate = useNavigate();

    const handleCreateJob = async (name: string, priority: number) => {
        try {
            await createJob({ name, priority });
        } catch (error) {
            console.error("Erro ao criar job:", error);
        }
    };

    return ( 
       <DashboardTemplate 
          jobs={jobs} 
          isLoading={isLoading} 
          isError={isError}
          isCreating={isCreating} 
          getChipColor={getChipColor}
          createJob={handleCreateJob} 
        />
    );
};