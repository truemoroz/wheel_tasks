import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import SphereList from '@/app/components/SphereList';
export default function TodoPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Wheel of Life
        </Typography>
        <Typography variant="body1" color="text.secondary">
          8 spheres of your life. Rate each area, set goals, and track tasks.
          Groups are sorted by rating (lower first).
        </Typography>
      </Box>
      <SphereList />
    </Container>
  );
}
