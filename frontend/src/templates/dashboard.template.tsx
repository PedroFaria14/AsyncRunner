import React, { useState } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  MenuItem,
  Stack,
  LinearProgress,
  CircularProgress,
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

import { JobModels } from "../models/Job.models";

interface DashboardProps {
  jobs: JobModels[];
  isLoading: boolean;
  isError: boolean;
  isCreating: boolean;
  getChipColor: (
    status: string,
  ) => "warning" | "info" | "success" | "error" | "default";
  createJob: (name: string, priority: number) => Promise<void>;
}

export const DashboardTemplate: React.FC<DashboardProps> = ({
  jobs,
  isLoading,
  isError,
  isCreating,
  getChipColor,
  createJob,
}) => {
  const [name, setName] = useState("");
  const [priority, setPriority] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await createJob(name, priority);
    setName("");
  };

  const getPriorityLabel = (prio: number) => {
    switch (prio) {
      case 3:
        return "HIGH";
      case 2:
        return "MEDIUM";
      default:
        return "LOW";
    }
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#1a237e" }}
      >
        AsyncFlow Manager 🚀
      </Typography>

      {isError && (
        <Paper
          sx={{
            p: 2,
            mb: 2,
            bgcolor: "#ffebee",
            color: "#c62828",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <ErrorOutlineIcon />
          <Typography variant="body2">
            Erro ao conectar com o servidor. Verifique o backend.
          </Typography>
        </Paper>
      )}

      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Novo Job
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}
        >
          <TextField
            label="Nome do Job"
            variant="outlined"
            size="small"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ flexGrow: 1 }}
            disabled={isCreating}
          />
          <TextField
            select
            label="Prioridade"
            size="small"
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value))}
            sx={{ width: 150 }}
            disabled={isCreating}
          >
            <MenuItem value={1}>Low</MenuItem>
            <MenuItem value={2}>Medium</MenuItem>
            <MenuItem value={3}>High</MenuItem>
          </TextField>
          <Button
            variant="contained"
            type="submit"
            disabled={isCreating || !name}
            sx={{ px: 4, minWidth: 120 }}
          >
            {isCreating ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Criar Job"
            )}
          </Button>
        </Box>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell>ID / Nome</TableCell>
              <TableCell align="center">Prioridade</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Tentativas (Retry)</TableCell>
              <TableCell align="center">Criado em</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {job.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {job.id.substring(0, 8)}...
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={getPriorityLabel(job.priority)}
                    variant="outlined"
                    size="small"
                    color={job.priority === 3 ? "secondary" : "default"}
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={job.status.toUpperCase()}
                    color={getChipColor(job.status)}
                    sx={{ fontWeight: "bold", minWidth: 100 }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Stack spacing={0.5} alignItems="center">
                    <Typography variant="caption" fontWeight="bold">
                      {job.attempts} / {job.max_attempts}
                    </Typography>
                    <Box sx={{ width: "80px" }}>
                      <LinearProgress
                        variant="determinate"
                        value={(job.attempts / (job.max_attempts || 1)) * 100}
                        color={job.status === "failed" ? "error" : "primary"}
                        sx={{ height: 6, borderRadius: 5 }}
                      />
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="caption">
                    {new Date(job.created_at).toLocaleTimeString()}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};
