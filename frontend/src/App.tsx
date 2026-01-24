import { Container, Typography, Button } from '@mui/material'

function App() {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        AsyncFlow Dashboard
      </Typography>

      <Typography variant="body1">
        Sistema de Jobs Assíncronos em Go
      </Typography>

      <Button variant="contained" sx={{ mt: 2 }}>
        Criar Job
      </Button>
    </Container>
  )
}

export default App
