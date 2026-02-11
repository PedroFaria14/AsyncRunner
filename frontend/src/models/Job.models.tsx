export interface JobModels {
  id: string; 
  userId: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'; 
  priority: 1 | 2 | 3;
  createdAt: string; 
  name: string;
    attempts: number;      
  max_attempts: number;  
  created_at: string;    
}

const getStatusColor = (status: JobModels['status']): string => {
  const colors = {
    'PENDING': 'gray',
    'RUNNING': 'blue',
    'COMPLETED': 'green',
    'FAILED': 'red'
  };
  return colors[status] || 'black';
};

const getPriorityStyles = (priority: JobModels['priority']) => {
  switch (priority) {
    case 3: return { label: 'HIGH', color: '#ef4444', icon: '🔴' };   
    case 2: return { label: 'MEDIUM', color: '#f59e0b', icon: '🟡' };
    case 1: return { label: 'LOW', color: '#10b981', icon: '🟢' };    
    default: return { label: 'LOW', color: '#6b7280', icon: '⚪' };
  }
};