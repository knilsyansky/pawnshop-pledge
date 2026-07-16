import { Container, CssBaseline, Typography, Box } from '@mui/material';

function App() {
  return (
    <>
      <CssBaseline />
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Pawnshop Pledge UI
          </Typography>
          <Typography>
            Frontend foundation is ready. Add pages and API integration in later stages.
          </Typography>
        </Box>
      </Container>
    </>
  );
}

export default App;
