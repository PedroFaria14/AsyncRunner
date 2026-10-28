import { useNavigate } from 'react-router-dom';
import { Button, Paper, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { JobForm } from '../../features/jobs/components/job-form';

export const CreateJob = () => {
  const navigate = useNavigate();

  return (
    <Stack spacing={2} sx={{ maxWidth: 600, mx: 'auto' }}>
      <Button
        component={Link}
        to="/dashboard"
        startIcon={<ArrowBackIcon />}
        sx={{ alignSelf: 'flex-start' }}
      >
        Voltar ao dashboard
      </Button>
      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Novo job
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Defina a tarefa e a prioridade. O processamento acontece em segundo plano.
        </Typography>
        <JobForm onCreated={() => navigate('/dashboard')} />
      </Paper>
    </Stack>
  );
};
