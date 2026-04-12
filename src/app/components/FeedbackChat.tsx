'use client';
import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TelegramIcon from '@mui/icons-material/Telegram';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';

type Status = 'idle' | 'sending' | 'sent' | 'error';
type LinkStatus = 'idle' | 'loading' | 'linked' | 'not-linked' | 'generating' | 'generated';

const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? '';

export default function FeedbackChat() {
  const t = useTranslations('Feedback');
  const { data: session, status: authStatus } = useSession();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [linkStatus, setLinkStatus] = useState<LinkStatus>('idle');
  const [deepLink, setDeepLink] = useState<string | null>(null);
  const [unlinking, setUnlinking] = useState(false);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open && status === 'idle' && tab === 0) {
      setTimeout(() => messageRef.current?.focus(), 120);
    }
  }, [open, status, tab]);

  // Fetch link status when "My Bot" tab is active
  useEffect(() => {
    if (open && tab === 1 && authStatus === 'authenticated') {
      setLinkStatus('loading');
      fetch('/api/telegram/link')
        .then((r) => r.json())
        .then((data) => setLinkStatus(data.linked ? 'linked' : 'not-linked'))
        .catch(() => setLinkStatus('not-linked'));
    }
    if (tab !== 1) setDeepLink(null);
  }, [open, tab, authStatus]);

  if (authStatus !== 'authenticated') return null;

  const handleGenerateLink = async () => {
    setLinkStatus('generating');
    try {
      const res = await fetch('/api/telegram/link', { method: 'POST' });
      const data = await res.json();
      if (data.deepLink) {
        setDeepLink(data.deepLink);
        setLinkStatus('generated');
      } else {
        setLinkStatus('not-linked');
      }
    } catch {
      setLinkStatus('not-linked');
    }
  };

  const handleCheckStatus = async () => {
    setLinkStatus('loading');
    try {
      const res = await fetch('/api/telegram/link');
      const data = await res.json();
      setLinkStatus(data.linked ? 'linked' : 'generated');
    } catch {
      setLinkStatus('not-linked');
    }
  };

  const handleUnlink = async () => {
    setUnlinking(true);
    try {
      await fetch('/api/telegram/link', { method: 'DELETE' });
      setLinkStatus('not-linked');
      setDeepLink(null);
    } catch {
      // ignore
    } finally {
      setUnlinking(false);
    }
  };

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

          {/* Tabs — only when BOT_USERNAME is set */}
          {BOT_USERNAME && (
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: 'divider', minHeight: 36 }}
              TabIndicatorProps={{ style: { height: 2 } }}
            >
              <Tab label={t('tabFeedback')} sx={{ minHeight: 36, fontSize: '0.75rem', py: 0.5 }} />
              <Tab label={t('tabMyBot')} sx={{ minHeight: 36, fontSize: '0.75rem', py: 0.5 }} />
            </Tabs>
          )}

          {/* Body */}
          <Box sx={{ p: 2 }}>

            {/* ── Feedback tab ── */}
            {tab === 0 && (
              <>
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
              </>
            )}

            {/* ── My Bot tab ── */}
            {tab === 1 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minHeight: 160 }}>
                {authStatus !== 'authenticated' ? (
                  <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 3 }}>
                    {t('signInToLink')}
                  </Typography>

                ) : linkStatus === 'loading' || linkStatus === 'idle' ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={28} />
                  </Box>

                ) : linkStatus === 'linked' ? (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon color="success" fontSize="small" />
                      <Typography variant="body2" color="success.main" fontWeight={600}>
                        {t('botLinked')}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">{t('botCommands')}</Typography>
                    <Box component="ul" sx={{ m: 0, pl: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {['/spheres', '/tasks', '/goals', '/help'].map((cmd) => (
                        <Box component="li" key={cmd}>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{cmd}</Typography>
                        </Box>
                      ))}
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      href={`https://t.me/${BOT_USERNAME}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<TelegramIcon />}
                      endIcon={<OpenInNewIcon sx={{ fontSize: '14px !important' }} />}
                      sx={{ textTransform: 'none', mt: 0.5 }}
                    >
                      {t('openTelegramBot')}
                    </Button>
                    <Button
                      variant="text"
                      size="small"
                      color="error"
                      startIcon={unlinking ? <CircularProgress size={14} color="inherit" /> : <LinkOffIcon />}
                      onClick={handleUnlink}
                      disabled={unlinking}
                      sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
                    >
                      {t('unlinkButton')}
                    </Button>
                  </>

                ) : linkStatus === 'generated' && deepLink ? (
                  <>
                    <Typography variant="caption" color="text.secondary">{t('linkInstructions')}</Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      href={deepLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<TelegramIcon />}
                      endIcon={<OpenInNewIcon sx={{ fontSize: '14px !important' }} />}
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      {t('openLinkInTelegram')}
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      onClick={handleCheckStatus}
                    >
                      {t('checkStatus')}
                    </Button>
                  </>

                ) : (
                  <>
                    <Typography variant="caption" color="text.secondary">{t('botNotLinked')}</Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleGenerateLink}
                      disabled={linkStatus === 'generating'}
                      startIcon={
                        linkStatus === 'generating'
                          ? <CircularProgress size={16} color="inherit" />
                          : <LinkIcon />
                      }
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      {linkStatus === 'generating' ? t('linking') : t('linkButton')}
                    </Button>
                  </>
                )}
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
