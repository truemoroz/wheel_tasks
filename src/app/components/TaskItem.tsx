'use client';
import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import Divider from '@mui/material/Divider';
import AddIcon from '@mui/icons-material/Add';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import DeleteIcon from '@mui/icons-material/Delete';
import RepeatIcon from '@mui/icons-material/Repeat';
import RepeatOneIcon from '@mui/icons-material/RepeatOne';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import ShortcutIcon from '@mui/icons-material/Shortcut';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { Task } from '@/app/types/todo';

function getSignificanceColor(sig: number): 'error' | 'warning' | 'success' | 'default' {
  if (sig >= 8) return 'error';
  if (sig >= 5) return 'warning';
  return 'success';
}

const URL_PATTERN = /[a-z][a-z0-9+.-]*:\/\/[^\s]+/gi;
const UNSAFE_PROTOCOLS = new Set(['javascript:', 'data:', 'vbscript:']);

function getLinkLabel(url: string) {
  return url.length > 20 ? `${url.slice(0, 17)}...` : url;
}

function isClickableUrl(url: string) {
  try {
    return !UNSAFE_PROTOCOLS.has(new URL(url).protocol);
  } catch {
    return false;
  }
}

function renderTaskTitle(title: string) {
  const parts = [];
  let lastIndex = 0;

  for (const match of title.matchAll(URL_PATTERN)) {
    const url = match[0];
    const index = match.index ?? 0;

    if (index > lastIndex) {
      parts.push(title.slice(lastIndex, index));
    }

    parts.push(
      isClickableUrl(url) ? (
        <Box
          key={`${url}-${index}`}
          component="a"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          title={url}
          onClick={(e) => e.stopPropagation()}
          sx={{
            color: 'primary.main',
            textDecoration: 'underline',
            textUnderlineOffset: '2px',
            overflowWrap: 'anywhere',
          }}
        >
          {getLinkLabel(url)}
        </Box>
      ) : (
        url
      ),
    );
    lastIndex = index + url.length;
  }

  if (lastIndex < title.length) {
    parts.push(title.slice(lastIndex));
  }

  return parts.length > 0 ? parts : title;
}

interface TaskItemProps {
  task: Task;
  groupId: string;
  depth?: number;
  onToggle: () => void;
  onDelete: () => void;
  onSignificanceChange?: (taskId: string, significance: number) => void;
  onRecurringToggle?: (taskId: string) => void;
  onLog?: (groupId: string, taskId: string) => Promise<void>;
  onTitleChange?: (taskId: string, title: string) => void;
  onSubtaskAdd?: (taskId: string, title: string) => void;
  onSubtaskToggle?: (taskId: string, subtaskId: string) => void;
  onSubtaskDelete?: (taskId: string, subtaskId: string) => void;
  showCompletedTasks?: boolean;
}

export default function TaskItem({
  task,
  groupId,
  depth = 0,
  onToggle,
  onDelete,
  onSignificanceChange,
  onRecurringToggle,
  onLog,
  onTitleChange,
  onSubtaskAdd,
  onSubtaskToggle,
  onSubtaskDelete,
  showCompletedTasks = true,
}: TaskItemProps) {
  const t = useTranslations('TaskItem');
  const [showAdd, setShowAdd] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(task.title);
  const [justLogged, setJustLogged] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [sigAnchor, setSigAnchor] = useState<null | HTMLElement>(null);
  const sigTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const subtaskInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showAdd) {
      const timer = setTimeout(() => subtaskInputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [showAdd]);

  useEffect(() => {
    if (editingTitle) {
      const timer = setTimeout(() => titleInputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [editingTitle]);

  const openSig = (e: React.MouseEvent<HTMLElement>) => {
    if (sigTimer.current) clearTimeout(sigTimer.current);
    setSigAnchor(e.currentTarget);
  };
  const closeSig = () => {
    sigTimer.current = setTimeout(() => setSigAnchor(null), 150);
  };
  const cancelCloseSig = () => {
    if (sigTimer.current) clearTimeout(sigTimer.current);
  };

  const subtasks = task.subtasks ?? [];
  const visibleSubtasks = showCompletedTasks ? subtasks : subtasks.filter((subtask) => !subtask.completed);
  const sig = task.significance ?? 5;
  const recurring = task.recurring ?? false;

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      onSubtaskAdd?.(task.id, newSubtask.trim());
      setNewSubtask('');
      setShowAdd(false);
    }
  };

  const handleSaveTitle = () => {
    const title = titleValue.trim();
    if (title && title !== task.title) {
      onTitleChange?.(task.id, title);
    } else {
      setTitleValue(task.title);
    }
    setEditingTitle(false);
  };

  const handleCancelTitle = () => {
    setTitleValue(task.title);
    setEditingTitle(false);
  };

  const handleLog = async () => {
    if (justLogged) return;
    await onLog?.(groupId, task.id);
    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 1500);
  };

  const renderSignificanceControls = (id: string, value: number) => {
    const color = getSignificanceColor(value);
    return (
      <>
        <Tooltip title={t('hoverToChangeSignificance')}>
          <Chip
            label={`🏆${value}`}
            variant="outlined"
            color={color}
            size="small"
            onMouseEnter={openSig}
            onMouseLeave={closeSig}
            sx={{ height: 20, fontSize: '0.65rem', '& .MuiChip-label': { px: 0.75 }, minWidth: 36, cursor: 'default' }}
          />
        </Tooltip>
        <Popover
          open={Boolean(sigAnchor)}
          anchorEl={sigAnchor}
          onClose={() => setSigAnchor(null)}
          anchorOrigin={{ vertical: 'center', horizontal: 'center' }}
          transformOrigin={{ vertical: 'center', horizontal: 'center' }}
          disableAutoFocus
          disableEnforceFocus
          slotProps={{
            paper: {
              onMouseEnter: cancelCloseSig,
              onMouseLeave: closeSig,
              sx: { display: 'flex', alignItems: 'center', p: 0.25 },
            },
          }}
        >
          <IconButton size="small" disabled={value <= 1} color={color}
            onClick={() => onSignificanceChange?.(id, value - 1)}>
            <ArrowLeftIcon sx={{ fontSize: 24 }} />
          </IconButton>
          <Chip
            label={`🏆${value}`}
            variant="outlined"
            color={color}
            size="small"
            sx={{ height: 20, fontSize: '0.65rem', '& .MuiChip-label': { px: 0.75 }, minWidth: 36 }}
          />
          <IconButton size="small" disabled={value >= 10} color={color}
            onClick={() => onSignificanceChange?.(id, value + 1)}>
            <ArrowRightIcon sx={{ fontSize: 24 }} />
          </IconButton>
        </Popover>
      </>
    );
  };

  return (
    <>
      <ListItem
        disableGutters
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          ...(depth === 0 ? {
            borderLeft: '3px solid',
            borderColor: task.completed && !task.recurring ? 'action.disabled' : 'primary.main',
            bgcolor: 'action.hover',
            borderRadius: '0 4px 4px 0',
            mb: 0.25,
            px: 1,
            py: 0.5,
          } : {
            // ml: -2 * depth,
            pl: (depth -1) + depth * 2,
            // px: 0.5,
            py: 0.25,
          }),
        }}
      >
        {/* Leading icon / checkbox */}
        <ListItemIcon sx={{ minWidth: 32, flexShrink: 0, alignItems: 'center' }}>
          {depth > 0 && (
            <ShortcutIcon sx={{ fontSize: 14, color: 'text.secondary', mr: 0.5, transform: 'scaleY(-1)' }} />
          )}
          {recurring ? (
            <Tooltip title={t('recurringTask')}>
              <RepeatIcon fontSize="small" color="primary" sx={{ ml: '2px' }} />
            </Tooltip>
          ) : (
            <Checkbox edge="start" checked={task.completed} onChange={onToggle} size="small" />
          )}
        </ListItemIcon>

        {editingTitle ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexGrow: 1, minWidth: 0 }}>
            <TextField
              inputRef={titleInputRef}
              size="small"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') handleCancelTitle();
              }}
              fullWidth
            />
            <IconButton size="small" color="primary" onClick={handleSaveTitle} aria-label={t('saveTask')}>
              <CheckIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={handleCancelTitle} aria-label={t('cancelEdit')}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <ListItemText
            primary={renderTaskTitle(task.title)}
            sx={{
              flexGrow: 1,
              minWidth: 0,
              m: 0,
              alignSelf: 'center',
              '& .MuiListItemText-primary': {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              },
              textDecoration: !recurring && task.completed ? 'line-through' : 'none',
              opacity: !recurring && task.completed ? 0.6 : 1,
            }}
          />
        )}

        {/* Right-side actions — fixed width, never shrinks */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0, ml: 0.5 }}>
          <Box sx={{ mr: '20px', display: 'flex', alignItems: 'center' }}>{renderSignificanceControls(task.id, sig)}</Box>
          {recurring && (
            <Tooltip title={justLogged ? t('logged') : t('logHistory')}>
              <IconButton
                size="small"
                aria-label="log recurring task"
                onClick={handleLog}
                color={justLogged ? 'success' : 'primary'}
                sx={{ transition: 'color 0.3s' }}
              >
                {justLogged ? <TaskAltIcon fontSize="small" /> : <CheckCircleOutlineIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          )}
          <IconButton edge="end" size="small" onClick={(e) => setMenuAnchor(e.currentTarget)}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
            slotProps={{ paper: { sx: { minWidth: 200 } } }}
          >
            <MenuItem onClick={() => { setTitleValue(task.title); setEditingTitle(true); setMenuAnchor(null); }}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              {t('editTask')}
            </MenuItem>
            <MenuItem onClick={() => { setShowAdd((v) => !v); setMenuAnchor(null); }}>
              <ListItemIcon>
                <AddIcon fontSize="small" color={showAdd ? 'primary' : 'inherit'} />
              </ListItemIcon>
              {showAdd ? t('cancelSubtask') : t('addSubtask')}
            </MenuItem>
            <MenuItem onClick={() => { onRecurringToggle?.(task.id); setMenuAnchor(null); }}>
              <ListItemIcon>
                {recurring ? <RepeatOneIcon fontSize="small" color="primary" /> : <RepeatIcon fontSize="small" />}
              </ListItemIcon>
              {recurring ? t('makeOneTime') : t('makeRecurring')}
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { onDelete(); setMenuAnchor(null); }} sx={{ color: 'error.main' }}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              {t('delete')}
            </MenuItem>
          </Menu>
        </Box>
      </ListItem>

      {/* Inline add-subtask input */}
      {showAdd && (
        <Box sx={{ pl: 5, pr: 7, mb: 0.5, display: 'flex', gap: 1 }}>
          <TextField
            inputRef={subtaskInputRef}
            size="small"
            placeholder={t('addSubtaskPlaceholder')}
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddSubtask();
              if (e.key === 'Escape') { setShowAdd(false); setNewSubtask(''); }
            }}
            fullWidth
          />
          <IconButton color="primary" size="small" onClick={handleAddSubtask}>
            <AddIcon />
          </IconButton>
        </Box>
      )}

      {/* Subtasks — rendered recursively */}
      {visibleSubtasks.map((subtask) => (
        <Box
          key={subtask.id}
          sx={{
            // ml: 0.5,
            // pl: (depth +1) * 1.5,
            // width: "calc(100% - 16px)",
          }}
        >
          <TaskItem
            task={subtask}
            groupId={groupId}
            depth={depth + 1}
            onToggle={() => onSubtaskToggle?.(task.id, subtask.id)}
            onDelete={() => onSubtaskDelete?.(task.id, subtask.id)}
            onSignificanceChange={onSignificanceChange}
            onRecurringToggle={onRecurringToggle}
            onLog={onLog}
            onTitleChange={onTitleChange}
            onSubtaskAdd={onSubtaskAdd}
            onSubtaskToggle={onSubtaskToggle}
            onSubtaskDelete={onSubtaskDelete}
            showCompletedTasks={showCompletedTasks}
          />
        </Box>
      ))}
    </>
  );
}
