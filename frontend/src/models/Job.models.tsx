

export interface JobModels {
  userId: string;
  status: 'pending' | 'started' | 'completed' | 'failed'; 
  createdAt: Date;
  name: string;
}

const getStatusColor = (status: JobModels['status']): string => {
  switch (status) {
    case 'pending':
        return 'gray';
    case 'started':
        return 'blue';
    case 'completed':
        return 'green';
    case 'failed':
        return 'red';
    default:
        return 'black';
  }
};

const getFormattedDate = (date: Date): string => {
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

const isProcessing = (status: JobModels['status']): boolean => {
    return status === 'pending' || status === 'started';
}

