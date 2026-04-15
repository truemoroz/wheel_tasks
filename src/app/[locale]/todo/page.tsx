'use client';
import Container from '@mui/material/Container';
import SphereList from '@/app/components/SphereList';

export default function TodoPage() {
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 1, sm: 2 }, px: { xs: 1.5, sm: 3 }, height: '100%', overflow: 'hidden', boxSizing: 'border-box' }}>
      <SphereList />
    </Container>
  );
}



