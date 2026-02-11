import type { JobModels } from "../../models/Job.models";

import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

interface DashboardTemplateProps {
  jobs: JobModels[];
  isLoading: boolean;
  isError: boolean;
  isCreating: boolean;
  createJob: () => void;
  getChipColor: (
    status: string,
  ) =>
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning";
}

export const DashboardTemplate = ({
  jobs,
  isLoading,
  isError,
  createJob,
  getChipColor,
}: DashboardTemplateProps) => {
  console.log("CONTEÚDO DE JOBS:", jobs);

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
        {/* CABEÇALHO RESPONSIVO */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight="700"
              color="primary"
              sx={{ fontSize: { xs: "1.75rem", md: "2.125rem" } }}
            >
              Job Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gerencie e monitore seus processos em tempo real
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => createJob()}
            disabled={isLoading}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: "bold",
              whiteSpace: "nowrap",
              minWidth: "fit-content",
            }}
          >
            Novo Job
          </Button>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* MENSAGEM DE ERRO (CORS OU API FORA) */}
        {isError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Erro ao conectar com o backend Go. Verifique se o servidor está
            rodando na porta 8080.
          </Alert>
        )}

        {/* LOADING STATE */}
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 10,
            }}
          >
            <CircularProgress size={60} thickness={4} />
            <Typography sx={{ mt: 2 }} color="text.secondary">
              Carregando jobs...
            </Typography>
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 3,
              boxShadow: "0px 4px 20px rgba(0,0,0,0.05)",
              overflowX: "auto",
            }}
          >
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ bgcolor: "#f8f9fa" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>NOME DO JOB</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    DATA DE CRIAÇÃO
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }} align="center">
                    STATUS
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 5 }}>
                      <Typography color="text.secondary">
                        Nenhum job encontrado. Clique em "Novo Job" para
                        começar.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  jobs.map((job) => (
                    <TableRow
                      key={job.id}
                      hover
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {/* Nome do Job com proteção para textos longos */}
                        <Typography
                          fontWeight="600"
                          sx={{
                            maxWidth: "250px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {job.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {job.id.substring(0, 8)}...
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {job.createdAt instanceof Date &&
                        !isNaN(job.createdAt.getTime())
                          ? job.createdAt.toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Processando data..."}
                      </TableCell>

                      <TableCell align="center">
                        <Chip
                          label={job.status.toUpperCase()}
                          color={getChipColor(job.status)}
                          variant="outlined"
                          sx={{
                            fontWeight: "bold",
                            width: 110,
                            textTransform: "uppercase",
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* STATUS DO POLLING */}
        <Box sx={{ mt: 2, textAlign: "right" }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontStyle: "italic" }}
          >
            ● Atualização automática ativa (3s)
          </Typography>
        </Box>
      </Container>
    </>
  );
};
