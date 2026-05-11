'use client';
import { useState, useEffect, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, DynamicToolUIPart, UIMessage } from 'ai';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AddTaskIcon from '@mui/icons-material/AddTask';
import { useSession } from 'next-auth/react';
import { useSpheresRefetch } from '@/app/components/SpheresRefetchContext';

/** Extract plain text from a UIMessage's parts array */
function getMessageText(m: UIMessage): string {
  return m.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('');
}

/** Collect dynamic-tool parts from a UIMessage */
function getDynamicToolParts(m: UIMessage): DynamicToolUIPart[] {
  return m.parts.filter((p): p is DynamicToolUIPart => p.type === 'dynamic-tool');
}

interface AgentChatProps {
  open: boolean;
  onClose: () => void;
  sphereId: string;
}

export default function AgentChat({ open, onClose, sphereId }: AgentChatProps) {
  const t = useTranslations('AgentChat');
  const { status: authStatus } = useSession();
  const { triggerRefetch } = useSpheresRefetch();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/agent' }),
    onFinish: () => triggerRefetch(),
    // Removed body: { sphereId } from here
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  const handleSend = () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    sendMessage({ text }, { body: { sphereId } }); // Pass sphereId with each message
  };

  // Auto-scroll to latest message
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  // All hooks must be called unconditionally at the top level.
  // The conditional return must come after all hook calls.
  if (authStatus !== 'authenticated') return null;

  if (!open) return null; // Only render the chat panel if open is true

  return (
    <Paper
      elevation={8}
      sx={{
        width: { xs: 'calc(100vw - 48px)', sm: 360 },
        borderRadius: 3,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        mt: 2, // Add some margin top to separate from other content
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex', alignItems: 'center', gap: 1,
          px: 2, py: 1.5, bgcolor: 'text.primary', color: 'background.paper',
        }}
      >
        <SmartToyIcon fontSize="small" />
        <Typography variant="subtitle2" fontWeight={700} sx={{ flexGrow: 1 }}>
          {t('title')}
        </Typography>
        <IconButton size="small" color="inherit" onClick={onClose} aria-label="close agent chat">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Messages */}
      <Box
        sx={{
          px: 2, pt: 2, pb: 1,
          maxHeight: 340,
          minHeight: 120,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {messages.length === 0 && (
          <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ mt: 2, px: 1 }}>
            {t('emptyState')}
          </Typography>
        )}

        {messages.map((m) => {
          const text = getMessageText(m);
          const completedTools = getDynamicToolParts(m).filter(
            (p) => p.state === 'output-available',
          );

          if (m.role === 'user') {
            return (
              <Box key={m.id} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Box sx={{ px: 1.5, py: 0.75, borderRadius: 2, maxWidth: '80%', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{text}</Typography>
                </Box>
              </Box>
            );
          }

          if (m.role === 'assistant') {
            return (
              <Box key={m.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
                {completedTools.map((tp, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 0.5,
                      px: 1, py: 0.25, borderRadius: 1,
                      bgcolor: 'success.light', color: 'success.contrastText',
                      fontSize: '0.7rem',
                    }}
                  >
                    <AddTaskIcon sx={{ fontSize: '0.85rem' }} />
                    <span>{tp.toolName === 'createTask' ? t('taskCreated') : t('goalCreated')}</span>
                  </Box>
                ))}
                {text && (
                  <Box sx={{ px: 1.5, py: 0.75, borderRadius: 2, maxWidth: '80%', bgcolor: 'action.hover', color: 'text.primary' }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{text}</Typography>
                  </Box>
                )}
              </Box>
            );
          }

          return null;
        })}

        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 0.5 }}>
            <CircularProgress size={14} />
            <Typography variant="caption" color="text.secondary">{t('thinking')}</Typography>
          </Box>
        )}

        {error && (
          <Typography variant="caption" color="error">{t('errorMessage')}</Typography>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box
        sx={{ px: 2, pb: 2, pt: 1, display: 'flex', gap: 1, alignItems: 'flex-end' }}
      >
        <TextField
          size="small"
          fullWidth
          multiline
          maxRows={3}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('inputPlaceholder')}
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <IconButton
          type="button"
          color="primary"
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          sx={{ flexShrink: 0 }}
        >
          {isLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
        </IconButton>
      </Box>
    </Paper>
  );
}
