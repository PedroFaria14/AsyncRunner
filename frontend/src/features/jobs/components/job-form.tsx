import { useState } from 'react';
import { Alert, Box, Button, MenuItem, Stack, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useCreateJob } from '../hooks/use-jobs';
import type { JobPriority } from '../types';
import { errorMessage } from '../../../shared/api/client';
import { useSuccessMessage } from '../../../shared/components/feedback-context';

export function JobForm({
  onCreated,
  compact = false,
}: {
  onCreated?: () => void;
  compact?: boolean;
}) {
  const [name, setName] = useState('');
  const [priority, setPriority] = useState<JobPriority>(1);
  const [submitted, setSubmitted] = useState(false);
  const notifySuccess = useSuccessMessage();
  const mutation = useCreateJob();
  const valid = name.trim().length > 0 && [...name.trim()].length <= 200;

  return (
    <Box
      component="form"
      noValidate
      onSubmit={async (event) => {
        event.preventDefault();
        setSubmitted(true);
        if (!valid || mutation.isPending) return;
        try {
          await mutation.mutateAsync({ name: name.trim(), priority });
          setName('');
          setSubmitted(false);
          notifySuccess('Job criado e adicionado à fila.');
          onCreated?.();
        } catch {
          /* The mutation error is presented below; preserve the form values. */
        }
      }}
    >
      <Stack spacing={2}>
        {mutation.isError && <Alert severity="error">{errorMessage(mutation.error)}</Alert>}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: compact ? { xs: '1fr', md: 'minmax(0, 1fr) 180px auto' } : '1fr',
            gap: 2,
            alignItems: 'start',
          }}
        >
          <TextField
            label="Nome do job"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            fullWidth
            placeholder="Ex.: Gerar relatório mensal"
            disabled={mutation.isPending}
            error={submitted && !valid}
            helperText={
              submitted && !valid
                ? 'Informe entre 1 e 200 caracteres.'
                : 'Descreva a tarefa que será executada.'
            }
          />
          <TextField
            select
            label="Prioridade"
            fullWidth
            value={priority}
            disabled={mutation.isPending}
            onChange={(event) => setPriority(Number(event.target.value) as JobPriority)}
          >
            <MenuItem value={1}>Baixa</MenuItem>
            <MenuItem value={2}>Média</MenuItem>
            <MenuItem value={3}>Alta</MenuItem>
          </TextField>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isPending}
            startIcon={<AddIcon />}
            sx={{ minHeight: 56, px: 3 }}
          >
            {mutation.isPending ? 'Criando…' : 'Criar job'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
