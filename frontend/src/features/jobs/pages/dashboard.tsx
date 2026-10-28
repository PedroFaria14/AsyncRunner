import {
  Alert,
  Box,
  Button,
  Chip,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { JobForm } from '../components/job-form';
import { useJobsQuery } from '../hooks/use-jobs';
import { errorMessage } from '../../../shared/api/client';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { JobList } from '../components/job-list';
import { JobSummary } from '../components/job-summary';

export function DashboardPage() {
  const query = useJobsQuery();
  return (
    <Stack spacing={3}>
      <Box>
        <Typography
          variant="overline"
          color="primary.main"
          sx={{ fontWeight: 700, letterSpacing: '0.1em' }}
        >
          Painel operacional
        </Typography>
        <Typography variant="h4" component="h1">
          Execução de jobs
        </Typography>
        <Typography color="text.secondary">
          Acompanhe a fila, as prioridades e as tentativas de execução.
        </Typography>
      </Box>
      <JobSummary jobs={query.data} loading={query.isPending} />
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography
          variant="h6"
          component="h2"
          sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <AddCircleOutlineIcon color="primary" fontSize="small" aria-hidden="true" />
          Novo job
        </Typography>
        <JobForm compact />
      </Paper>
      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h6" component="h2">
              Fila de processamento
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Atualização automática a cada 3 segundos com a aba ativa.
            </Typography>
            {query.dataUpdatedAt > 0 && (
              <Typography variant="caption" color={query.isError ? 'error.main' : 'text.secondary'}>
                Última leitura às {new Date(query.dataUpdatedAt).toLocaleTimeString('pt-BR')}
                {query.isError ? ' · Falha na atualização' : ''}
              </Typography>
            )}
          </Box>
          {query.data && (
            <Chip
              variant="outlined"
              size="small"
              label={`${query.data.length} ${query.data.length === 1 ? 'job' : 'jobs'}`}
            />
          )}
        </Box>
        <Box sx={{ height: 2 }}>
          {query.isFetching && !query.isPending && (
            <LinearProgress aria-label="Atualizando jobs" sx={{ height: 2 }} />
          )}
        </Box>
        {query.isError && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" onClick={() => void query.refetch()}>
                Tentar novamente
              </Button>
            }
          >
            {errorMessage(query.error)}
          </Alert>
        )}
        {query.isPending ? (
          <Box sx={{ p: 2 }} aria-label="Carregando jobs">
            <Skeleton height={48} />
            <Skeleton height={48} />
            <Skeleton height={48} />
          </Box>
        ) : query.data?.length === 0 ? (
          <Box
            sx={{
              px: 3,
              py: 5,
              textAlign: 'center',
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <InboxOutlinedIcon
              sx={{ color: 'text.secondary', fontSize: 40, mb: 1 }}
              aria-hidden="true"
            />
            <Typography sx={{ fontWeight: 650 }}>Nenhum job na fila.</Typography>
            <Typography color="text.secondary">
              Crie uma tarefa usando o formulário acima.
            </Typography>
          </Box>
        ) : (
          query.data && <JobList jobs={query.data} />
        )}
      </Paper>
    </Stack>
  );
}
