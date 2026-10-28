import {
  Box,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import type { Job } from '../types';
import { formatJobDate, jobPriorities, jobStatuses } from '../job-presentation';

function StatusChip({ job }: { job: Job }) {
  return (
    <Chip
      size="small"
      label={jobStatuses[job.status].label}
      color={jobStatuses[job.status].color}
    />
  );
}

export function JobList({ jobs }: { jobs: readonly Job[] }) {
  const theme = useTheme();
  const narrow = useMediaQuery(theme.breakpoints.down('md'));

  if (narrow)
    return (
      <Stack
        component="ul"
        aria-label="Jobs em processamento"
        spacing={1.5}
        sx={{ listStyle: 'none', m: 0, p: 2 }}
      >
        {jobs.map((job) => (
          <Paper component="li" key={job.id} variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1.5}>
              <Typography
                component="h3"
                variant="body1"
                sx={{ fontWeight: 650, overflowWrap: 'anywhere', minWidth: 0 }}
              >
                {job.name}
              </Typography>
              <StatusChip job={job} />
            </Stack>
            <Typography
              component="p"
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, mb: 2, overflowWrap: 'anywhere', fontFamily: 'monospace' }}
            >
              {job.id}
            </Typography>
            <Box
              component="dl"
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 2,
                m: 0,
                pt: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box>
                <Typography component="dt" variant="caption" color="text.secondary">
                  Prioridade
                </Typography>
                <Typography component="dd" variant="body2" sx={{ m: 0, mt: 0.5, fontWeight: 600 }}>
                  {jobPriorities[job.priority]}
                </Typography>
              </Box>
              <Box>
                <Typography component="dt" variant="caption" color="text.secondary">
                  Tentativas
                </Typography>
                <Typography component="dd" variant="body2" sx={{ m: 0, mt: 0.5, fontWeight: 600 }}>
                  {job.attempts} / {job.max_attempts}
                </Typography>
              </Box>
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Typography component="dt" variant="caption" color="text.secondary">
                  Criado em
                </Typography>
                <Typography component="dd" variant="body2" sx={{ m: 0, mt: 0.5 }}>
                  <time dateTime={job.created_at}>{formatJobDate(job.created_at)}</time>
                </Typography>
              </Box>
            </Box>
          </Paper>
        ))}
      </Stack>
    );

  return (
    <TableContainer>
      <Table aria-label="Jobs em processamento" sx={{ tableLayout: 'fixed', minWidth: 760 }}>
        <TableHead>
          <TableRow>
            <TableCell scope="col" sx={{ width: '32%' }}>
              Nome
            </TableCell>
            <TableCell scope="col" sx={{ width: '14%' }}>
              Prioridade
            </TableCell>
            <TableCell scope="col" sx={{ width: '18%' }}>
              Status
            </TableCell>
            <TableCell scope="col" sx={{ width: '14%' }}>
              Tentativas
            </TableCell>
            <TableCell scope="col" sx={{ width: '22%' }}>
              Criado em
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id} hover>
              <TableCell component="th" scope="row">
                <Typography variant="body2" sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>
                  {job.name}
                </Typography>
                <Typography
                  component="span"
                  variant="caption"
                  color="text.secondary"
                  title={job.id}
                  sx={{ fontFamily: 'monospace' }}
                >
                  {job.id.slice(0, 8)}
                </Typography>
              </TableCell>
              <TableCell>{jobPriorities[job.priority]}</TableCell>
              <TableCell>
                <StatusChip job={job} />
              </TableCell>
              <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>
                {job.attempts} / {job.max_attempts}
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  <time dateTime={job.created_at}>{formatJobDate(job.created_at)}</time>
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
