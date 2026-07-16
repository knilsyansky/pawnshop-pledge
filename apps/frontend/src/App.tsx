import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Tabs, Tab, Container } from '@mui/material';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';

import { theme } from './shared/theme';
import { PledgeForm } from './components/PledgeForm';
import { RedeemForm } from './components/RedeemForm';

function Navigation() {
  const location = useLocation();

  return (
    <Container maxWidth="sm">
      <Tabs
        value={location.pathname === '/redeem' ? '/redeem' : '/'}
        centered
        sx={{ mb: 4 }}
      >
        <Tab label="Залог" value="/" component={Link} to="/" />
        <Tab label="Выкуп" value="/redeem" component={Link} to="/redeem" />
      </Tabs>

      <Routes>
        <Route path="/" element={<PledgeForm />} />
        <Route path="/redeem" element={<RedeemForm />} />
      </Routes>
    </Container>
  );
}


function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <BrowserRouter>
        <Box
          sx={{
            minHeight: '100vh',
            backgroundColor: 'background.default',
            py: 4,
          }}
        >
          <Navigation />
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
