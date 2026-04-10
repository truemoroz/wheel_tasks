'use client';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';

type Tag = 'feature' | 'improvement' | 'fix';
const tagColor: Record<Tag, 'primary' | 'success' | 'warning'> = {
  feature: 'primary', improvement: 'success', fix: 'warning',
};

export default function ChangelogPage() {
  const t = useTranslations('Changelog');

  const releases = [
    {
      version: '1.4',
      tag: 'feature' as Tag,
      titleKey: 'v14Title',
      dateKey: 'v14Date',
      headingKey: 'v14Heading',
      bodyKey: 'v14Body',
    },
    {
      version: '1.3',
      tag: 'feature' as Tag,
      titleKey: 'v13Title',
      dateKey: 'v13Date',
      headingKey: 'v13Heading',
      bodyKey: 'v13Body',
    },
    {
      version: '1.2',
      tag: 'feature' as Tag,
      titleKey: 'v12Title',
      dateKey: 'v12Date',
      headingKey: 'v12Heading',
      bodyKey: 'v12Body',
    },
    {
      version: '1.1',
      tag: 'feature' as Tag,
      titleKey: 'v11Title',
      dateKey: 'v11Date',
      headingKey: 'v11Heading',
      bodyKey: 'v11Body',
    },
  ];

  return (
    <Box sx={{ maxWidth: 760, mx: 'auto', px: 3, py: 6 }}>
      <Typography variant="h3" fontWeight={700} gutterBottom>{t('title')}</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 5 }}>{t('subtitle')}</Typography>
      <Stack spacing={5}>
        {releases.map((r) => (
          <Paper key={r.version} variant="outlined" sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 1 }}>
              <Typography variant="h5" fontWeight={700}>
                v{r.version} — {t(r.titleKey as Parameters<typeof t>[0])}
              </Typography>
              <Chip
                label={t(r.tag as Parameters<typeof t>[0])}
                color={tagColor[r.tag]}
                size="small"
                sx={{ textTransform: 'capitalize', fontWeight: 600 }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              {t('released')} {t(r.dateKey as Parameters<typeof t>[0])}
            </Typography>
            <Divider sx={{ my: 2.5 }} />
            <Box>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                {t(r.headingKey as Parameters<typeof t>[0])}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                {t(r.bodyKey as Parameters<typeof t>[0])}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}

