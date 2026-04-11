'use client';
import Container from '@mui/material/Container';
import SphereList from '@/app/components/SphereList';

export default function TodoPage() {
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1.5, sm: 3 } }}>
      <SphereList />
    </Container>
  );
}



