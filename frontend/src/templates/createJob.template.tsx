import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
} from "@mui/material";

interface CreateJobTemplateProps {
  name: string;
  setName: (name: string) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isCreating: boolean;
  onCancel: () => void;
}

export const CreateJobTemplate = ({
  name,
  setName,
  handleSubmit,
  isCreating,
  onCancel,
}: CreateJobTemplateProps) => {
  return (
    <>
      <Container maxWidth="sm" sx={{ mt: 10 }}>
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" fontWeight="700" mb={3}>
            Criar Novo Job
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
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button variant="outlined" fullWidth onClick={onCancel}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isCreating}
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
