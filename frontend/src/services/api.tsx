import axios from 'axios';
import type { JobModels } from '../models/Job.models';



const apiClient = axios.create({
baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getJobs = async (): Promise<JobModels[]> => {
  const { data } = await apiClient.get('/jobs');
  
  return data.map((job: any) => ({
    ...job,
    id: job.id || job.job_id,
    name: job.name || job.event_name || "Sem Nome",
    status: job.status || job.JobStatus || "pending", 
    createdAt: new Date(job.timestamp || job.createdAt || new Date()),
  }));
};

export const createJob = async (name: string): Promise<JobModels> => {
  const response = await apiClient.post('/jobs', { 
    event_name: name 
  }); 
  return response.data;
};