import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import theme from './styles/theme';
import { Dashboard } from './pages/Dashboards/Dashboard.page';
import { CreateJob } from './pages/CreateJob/CreateJob.page';

const queryClient = new QueryClient();
export
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/new" element={<CreateJob />} />
            
            <Route path="*" element={<h1>404 - Página não encontrada</h1>} />
          </Routes>
        </BrowserRouter>
        
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;