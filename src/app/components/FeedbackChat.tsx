'use client';
import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TelegramIcon from '@mui/icons-material/Telegram';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

type Status = 'idle' | 'sending' | 'sent' | 'error';

const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? '';

export default function FeedbackChat() {
  const t = useTranslations('Feedback');
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const messageRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open && status === 'idle') {
      setTimeout(() => messageRef.current?.focus(), 120);
    }
  }, [open, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message }),
      });
      if (res.ok) {
        setStatus('sent');
        setName('');
        setMessage('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => setStatus('idle'), 300);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1300,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 1,
      }}
    >
      {/* Chat panel */}
      <Collapse in={open} unmountOnExit>
        <Paper
          elevation={8}
          sx={{ width: { xs: 'calc(100vw - 48px)', sm: 360 }, borderRadius: 3, overflow: 'hidden' }}
        >
          {/* Header */}
          <Box
            sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              px: 2, py: 1.5, bgcolor: 'primary.main', color: 'primary.contrastText',
            }}
          >
            <TelegramIcon fontSize="small" />
            <Typography variant="subtitle2" fontWeight={700} sx={{ flexGrow: 1 }}>
              {t('title')}
            </Typography>
            <IconButton size="small" color="inherit" onClick={handleClose} aria-label="close chat">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Body */}
          <Box sx={{ p: 2 }}>
            {status === 'sent' ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3, gap: 1.5 }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 48 }} />
                <Typography variant="body2" textAlign="center" color="text.secondary">
                  {t('successMessage')}
                </Typography>
                <Button size="small" onClick={() => setStatus('idle')} variant="outlined" sx={{ mt: 1 }}>
                  {t('sendAnother')}
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>

                {/* Primary CTA — open bot in Telegram */}
                {BOT_USERNAME && (
                  <>
                    <Typography variant="caption" color="text.secondary">
                      {t('telegramPrompt')}
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      href={`https://t.me/${BOT_USERNAME}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<TelegramIcon />}
                      endIcon={<OpenInNewIcon sx={{ fontSize: '14px !important' }} />}
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      {t('openInTelegram')}
                    </Button>
                    <Divider sx={{ my: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">{t('or')}</Typography>
                    </Divider>
                    <Typography variant="caption" color="text.secondary">
                      {t('formFallback')}
                    </Typography>
                  </>
                )}

                {!BOT_USERNAME && (
                  <Typography variant="caption" color="text.secondary">
                    {t('subtitle')}
                  </Typography>
                )}

                {/* Form */}
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <TextField
                    size="small"
                    label={t('nameLabel')}
                    placeholder={t('namePlaceholder')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                    autoComplete="name"
                  />
                  <TextField
                    size="small"
                    label={t('messageLabel')}
                    placeholder={t('messagePlaceholder')}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    multiline
                    minRows={3}
                    maxRows={6}
                    fullWidth
                    required
                    inputRef={messageRef}
                  />
                  {status === 'error' && (
                    <Typography variant="caption" color="error">{t('errorMessage')}</Typography>
                  )}
                  <Button
                    type="submit"
                    variant={BOT_USERNAME ? 'outlined' : 'contained'}
                    disabled={status === 'sending' || !message.trim()}
                    endIcon={status === 'sending' ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                    fullWidth
                  >
                    {t('sendButton')}
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Paper>
      </Collapse>

      {/* Toggle button */}
      <Tooltip title={open ? '' : t('buttonTooltip')} placement="left">
        <Box
          component="button"
          onClick={() => (open ? handleClose() : setOpen(true))}
          aria-label={open ? 'close feedback' : 'open feedback'}
          sx={{
            width: 56, height: 56, borderRadius: '50%', border: 'none',
            bgcolor: 'primary.main', color: 'primary.contrastText',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: 4,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': { transform: 'scale(1.08)', boxShadow: 6 },
          }}
        >
          {open ? <CloseIcon /> : <ChatIcon />}
        </Box>
      </Tooltip>
    </Box>
  );
}
