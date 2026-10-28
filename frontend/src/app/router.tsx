import { BrowserRouter, Link, NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material';
import { DashboardPage } from '../features/jobs/pages/dashboard';
import { CreateJob } from '../pages/CreateJob/CreateJob.page';
import QueuePlayNextIcon from '@mui/icons-material/QueuePlayNext';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import AddIcon from '@mui/icons-material/Add';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: 'absolute',
          left: -10000,
          '&:focus': { left: 8, top: 8, zIndex: 1400, bgcolor: 'background.paper', p: 2 },
        }}
      >
        Ir para o conteúdo
      </Box>
      <AppBar
        position="static"
        elevation={0}
        sx={{ borderBottom: '1px solid', borderColor: 'rgba(255,255,255,0.15)' }}
      >
        <Toolbar
          sx={{
            width: '100%',
            maxWidth: 1200,
            mx: 'auto',
            px: { xs: 2, sm: 3 },
            gap: 1,
            flexWrap: 'wrap',
            py: 1,
          }}
        >
          <Typography
            component={Link}
            to="/dashboard"
            variant="h6"
            sx={{
              flexGrow: 1,
              color: 'inherit',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <QueuePlayNextIcon aria-hidden="true" />
            AsyncFlow
          </Typography>
          <Box component="nav" aria-label="Navegação principal">
            <Button
              component={NavLink}
              to="/dashboard"
              color="inherit"
              startIcon={<DashboardOutlinedIcon />}
              sx={{ '&.active': { bgcolor: 'rgba(255,255,255,0.16)' }, px: { xs: 1, sm: 2 } }}
            >
              Dashboard
            </Button>
            <Button
              component={NavLink}
              to="/new"
              color="inherit"
              startIcon={<AddIcon />}
              sx={{ '&.active': { bgcolor: 'rgba(255,255,255,0.16)' }, px: { xs: 1, sm: 2 } }}
            >
              Novo job
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Container
        component="main"
        id="main-content"
        tabIndex={-1}
        maxWidth="lg"
        sx={{ py: { xs: 3, sm: 5 } }}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/new" element={<CreateJob />} />
          <Route
            path="*"
            element={
              <Box>
                <Typography variant="h4" component="h1">
                  Página não encontrada
                </Typography>
                <Button component={Link} to="/dashboard">
                  Voltar ao dashboard
                </Button>
              </Box>
            }
          />
        </Routes>
      </Container>
    </BrowserRouter>
  );
}
