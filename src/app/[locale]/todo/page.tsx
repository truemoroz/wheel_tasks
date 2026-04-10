'use client';
import { useTranslations } from 'next-intl';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import SphereList from '@/app/components/SphereList';

export default function TodoPage() {
  const t = useTranslations('Todo');
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1.5, sm: 3 } }}>
      <Box sx={{ mb: { xs: 2, sm: 3 } }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
          {t('title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('subtitle')}
        </Typography>
      </Box>
      <SphereList />
    </Container>
  );
}

