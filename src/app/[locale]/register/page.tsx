'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import { Link } from '@/i18n/navigation';

export default function RegisterPage() {
  const t = useTranslations('Register');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    let spheres: unknown = undefined;
    try {
      const raw = localStorage.getItem('pendingSphereRatings');
      if (raw) spheres = JSON.parse(raw);
    } catch { /* ignore */ }
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, spheres }),
    });
    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      setError(data.error ?? t('registrationFailed'));
      return;
    }
    localStorage.removeItem('pendingSphereRatings');
    const result = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (result?.ok) {
      router.push('/todo');
    } else {
      router.push('/login');
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    await signIn('google', { callbackUrl: '/todo' });
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 10 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight="bold" textAlign="center" mb={3}>{t('title')}</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Button
          variant="outlined" fullWidth onClick={handleGoogleSignIn} disabled={googleLoading}
          startIcon={googleLoading ? <CircularProgress size={18} /> : (
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.85l6.09-6.09C34.46 3.06 29.5 1 24 1 14.82 1 7.07 6.48 3.52 14.18l7.08 5.5C12.29 13.61 17.67 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.52 24.5c0-1.64-.15-3.22-.42-4.74H24v9h12.68c-.55 2.96-2.2 5.47-4.68 7.16l7.18 5.57C43.25 37.34 46.52 31.36 46.52 24.5z"/>
              <path fill="#FBBC05" d="M10.6 28.32A14.6 14.6 0 0 1 9.5 24c0-1.5.26-2.95.72-4.32l-7.08-5.5A23.94 23.94 0 0 0 0 24c0 3.86.92 7.5 2.52 10.72l8.08-6.4z"/>
              <path fill="#34A853" d="M24 47c5.5 0 10.12-1.82 13.5-4.94l-7.18-5.57C28.56 38.13 26.4 39 24 39c-6.33 0-11.71-4.11-13.4-9.68l-8.08 6.4C6.07 43.52 14.82 47 24 47z"/>
            </svg>
          )}
          sx={{ mb: 2, textTransform: 'none', fontWeight: 500, color: 'text.primary', borderColor: 'divider', '&:hover': { borderColor: 'text.primary' } }}
        >
          {t('continueWithGoogle')}
        </Button>
        <Divider sx={{ mb: 2 }}>{t('or')}</Divider>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label={t('emailLabel')} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth autoComplete="email" autoFocus />
          <TextField label={t('passwordLabel')} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required fullWidth autoComplete="new-password" helperText={t('passwordHelper')} />
          <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ mt: 1 }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : t('submitButton')}
          </Button>
        </Box>
        <Typography variant="body2" textAlign="center" mt={3}>
          {t('hasAccount')}{' '}
          <Link href="/login" style={{ color: 'inherit', fontWeight: 600 }}>{t('signInLink')}</Link>
        </Typography>
      </Paper>
    </Container>
  );
}

