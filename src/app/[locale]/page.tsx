import { useTranslations } from 'next-intl';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { Link } from '@/i18n/navigation';
import SpheresRater from '@/app/components/SpheresRater';

function HomeContent() {
  const t = useTranslations('Home');
  const steps = [
    { step: '1', title: t('step1Title'), body: t('step1Body') },
    { step: '2', title: t('step2Title'), body: t('step2Body') },
    { step: '3', title: t('step3Title'), body: t('step3Body') },
    { step: '4', title: t('step4Title'), body: t('step4Body') },
  ];

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      {/* Hero */}
      <Box textAlign="center" mb={6}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          {t('heroTitle')}
        </Typography>
        <Typography variant="h6" color="text.secondary" maxWidth={600} mx="auto">
          {t('heroSubtitle')}
        </Typography>
        <Box mt={4} display="flex" justifyContent="center" gap={2} flexWrap="wrap">
          <a href="#rate-your-spheres" style={{ textDecoration: 'none' }}>
            <Button variant="contained" size="large">{t('ctaFree')}</Button>
          </a>
          <Link href="/login" style={{ textDecoration: 'none' }}>
            <Button variant="outlined" size="large">{t('ctaSignIn')}</Button>
          </Link>
        </Box>
      </Box>

      <Divider sx={{ mb: 6 }} />

      {/* What is it */}
      <Box mb={6}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>{t('whatIsTitle')}</Typography>
        <Typography color="text.secondary" lineHeight={1.8}>
          {t.rich('whatIsBody1', {
            strong: (chunks) => <strong>{chunks}</strong>,
            em: (chunks) => <em>{chunks}</em>,
          })}
        </Typography>
        <Typography color="text.secondary" lineHeight={1.8} mt={2}>{t('whatIsBody2')}</Typography>
      </Box>

      {/* How it works */}
      <Box mb={6}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>{t('howItWorksTitle')}</Typography>
        <Grid container spacing={2}>
          {steps.map(({ step, title, body }) => (
            <Grid size={{ xs: 12, sm: 6 }} key={step}>
              <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
                <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>{step}</Typography>
                <Typography fontWeight="medium" gutterBottom>{title}</Typography>
                <Typography variant="body2" color="text.secondary">{body}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Interactive sphere rater */}
      <Box id="rate-your-spheres" mb={6} sx={{ scrollMarginTop: 80 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>{t('rateSpheresTitle')}</Typography>
        <Typography color="text.secondary" lineHeight={1.8} mb={3}>{t('rateSpheresDesc')}</Typography>
        <SpheresRater />
        <Box textAlign="center" mt={3}>
          <Link href="/register" style={{ textDecoration: 'none' }}>
            <Button variant="contained" size="large">{t('saveButton')}</Button>
          </Link>
        </Box>
      </Box>
    </Container>
  );
}

export default function LocaleHomePage() {
  return <HomeContent />;
}

