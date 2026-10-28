import { Box, Paper, Skeleton, Typography } from '@mui/material';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import SyncIcon from '@mui/icons-material/Sync';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import type { Job, JobStatus } from '../types';

const metrics = [
  { status: 'pending', label: 'Na fila', color: 'warning.main', Icon: PendingActionsIcon },
  { status: 'processing', label: 'Em execução', color: 'info.main', Icon: SyncIcon },
  { status: 'completed', label: 'Concluídos', color: 'success.main', Icon: TaskAltIcon },
  { status: 'failed', label: 'Falhos', color: 'error.main', Icon: ErrorOutlineIcon },
] as const;

export function JobSummary({ jobs, loading }: { jobs?: readonly Job[]; loading: boolean }) {
  const counts = jobs?.reduce<Record<JobStatus, number>>(
    (result, job) => {
      result[job.status]++;
      return result;
    },
    { pending: 0, processing: 0, completed: 0, failed: 0 },
  );

  return (
    <Box component="section" aria-label="Resumo dos jobs">
      <Box
        component="dl"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
          gap: { xs: 1.5, sm: 2 },
          m: 0,
        }}
      >
        {metrics.map(({ status, label, color, Icon }) => (
          <Paper
            key={status}
            variant="outlined"
            sx={{
              p: { xs: 2, sm: 2.5 },
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <Typography component="dt" variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Icon sx={{ color, fontSize: 22 }} aria-hidden="true" />
            <Typography
              component="dd"
              sx={{
                m: 0,
                fontSize: '1.75rem',
                lineHeight: 1.3,
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {loading ? <Skeleton width={45} /> : (counts?.[status] ?? '—')}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
