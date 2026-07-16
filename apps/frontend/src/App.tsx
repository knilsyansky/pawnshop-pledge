import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { theme } from './shared/theme';
import { PledgeForm } from './components/PledgeForm';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', py: 4 }}>
        <PledgeForm />
      </Box>
    </ThemeProvider>
  );
}

export default App;
