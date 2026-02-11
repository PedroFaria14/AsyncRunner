import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../../hooks/useJobs';
import { CreateJobTemplate } from '../../templates/createJob.template';
import { useQueryClient } from '@tanstack/react-query'; 

export const CreateJob = () => {
  const [name, setName] = useState('');
  const [priority, setPriority] = useState(1);
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { createJob, isCreating } = useJobs(); 

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;

  
    createJob({ name, priority }, { 
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['jobs'] }); 
        navigate('/');
      },
      onError: (err) => {
        console.error("Erro ao criar job:", err);
      }
    });
  };

  return (
    <CreateJobTemplate
      name={name}
      setName={setName}
      priority={priority}
      setPriority={setPriority}
      handleSubmit={handleSubmit}
      isCreating={isCreating}
      onCancel={() => navigate('/')}
    />
  );
};