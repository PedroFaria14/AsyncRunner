import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

interface CreateJobTemplateProps {
  name: string;
  setName: (name: string) => void;
  priority: number;
  setPriority: (priority: number) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isCreating: boolean;
  onCancel: () => void;
}

export const CreateJobTemplate = ({
  name,
  setName,
  priority,
  setPriority,
  handleSubmit,
  isCreating,
  onCancel,
}: CreateJobTemplateProps) => {
  return (
    <>
      <Container maxWidth="sm" sx={{ mt: 10 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 3,
            boxShadow: "0px 10px 30px rgba(0,0,0,0.1)",
          }}
        >
          <Typography variant="h5" fontWeight="700" mb={1}>
            Criar Novo Job
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Defina o nome e a urgência do seu processo.
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Nome do Job"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 3 }}
              required
              placeholder="Ex: Processar Relatório Mensal"
            />

            {/* ADICIONADO: Campo de Seleção de Prioridade */}
            <FormControl fullWidth sx={{ mb: 4 }}>
              <InputLabel id="priority-label">Prioridade</InputLabel>
              <Select
                labelId="priority-label"
                value={priority}
                label="Prioridade"
                onChange={(e) => setPriority(Number(e.target.value))}
              >
                <MenuItem value={1}>🟢 Low (Baixa)</MenuItem>
                <MenuItem value={2}>🟡 Medium (Média)</MenuItem>
                <MenuItem value={3}>🔴 High (Alta)</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={onCancel}
                sx={{ borderRadius: 2 }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isCreating}
                sx={{ borderRadius: 2, fontWeight: "bold" }}
              >
                {isCreating ? "Criando..." : "Confirmar"}
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </>
  );
};
