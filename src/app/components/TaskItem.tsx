'use client';
import { useState, useRef } from 'react';
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
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Task } from '@/app/types/todo';

function getSignificanceColor(sig: number): 'error' | 'warning' | 'success' | 'default' {
  if (sig >= 8) return 'error';
  if (sig >= 5) return 'warning';
  return 'success';
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
  onSubtaskAdd?: (taskId: string, title: string) => void;
  onSubtaskToggle?: (taskId: string, subtaskId: string) => void;
  onSubtaskDelete?: (taskId: string, subtaskId: string) => void;
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
  onSubtaskAdd,
  onSubtaskToggle,
  onSubtaskDelete,
}: TaskItemProps) {
  const t = useTranslations('TaskItem');
  const [showAdd, setShowAdd] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const [justLogged, setJustLogged] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [sigAnchor, setSigAnchor] = useState<null | HTMLElement>(null);
  const sigTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  const completedSubtasks = subtasks.filter((s) => s.completed).length;
  const sig = task.significance ?? 5;
  const recurring = task.recurring ?? false;

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      onSubtaskAdd?.(task.id, newSubtask.trim());
      setNewSubtask('');
      setShowAdd(false);
    }
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
        secondaryAction={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {renderSignificanceControls(task.id, sig)}
            {/* Log button — only for recurring tasks */}
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

            {subtasks.length > 0 && (
              <Chip
                label={`${completedSubtasks}/${subtasks.length}`}
                size="small"
                variant="outlined"
                sx={{ height: 18, fontSize: '0.65rem', '& .MuiChip-label': { px: 0.75 } }}
              />
            )}

            {/* Three-dot menu */}
            <IconButton edge="end" size="small" onClick={(e) => setMenuAnchor(e.currentTarget)}>
              <MoreVertIcon fontSize="small" />
            </IconButton>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
              slotProps={{ paper: { sx: { minWidth: 200 } } }}
            >
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
                {t('delete')}              </MenuItem>
            </Menu>
          </Box>
        }
        sx={depth === 0 ? {
          borderLeft: '3px solid',
          borderColor: task.completed && !task.recurring ? 'action.disabled' : 'primary.main',
          bgcolor: 'action.hover',
          borderRadius: '0 4px 4px 0',
          mb: 0.25,
        } : undefined}
      >
        <ListItemIcon sx={{ minWidth: 32 }}>
          {depth > 0 && (
            <SubdirectoryArrowRightIcon sx={{ fontSize: 14, color: 'text.secondary', mr: 0.5 }} />
          )}
          {recurring ? (
            <Tooltip title={t('recurringTask')}>
              <RepeatIcon fontSize="small" color="primary" sx={{ ml: '2px' }} />
            </Tooltip>
          ) : (
            <Checkbox edge="start" checked={task.completed} onChange={onToggle} size="small" />
          )}
        </ListItemIcon>
        <ListItemText
          primary={task.title}
          sx={{
            textDecoration: !recurring && task.completed ? 'line-through' : 'none',
            opacity: !recurring && task.completed ? 0.6 : 1,
          }}
        />
      </ListItem>

      {/* Inline add-subtask input */}
      {showAdd && (
        <Box sx={{ pl: 5, pr: 7, mb: 0.5, display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            placeholder={t('addSubtaskPlaceholder')}
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddSubtask();
              if (e.key === 'Escape') { setShowAdd(false); setNewSubtask(''); }
            }}
            autoFocus
            fullWidth
          />
          <IconButton color="primary" size="small" onClick={handleAddSubtask}>
            <AddIcon />
          </IconButton>
        </Box>
      )}

      {/* Subtasks — rendered recursively */}
      {subtasks.map((subtask) => (
        <Box
          key={subtask.id}
          sx={{
            ml: 2,
            width: 'calc(100% - 16px)',
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
            onSubtaskAdd={onSubtaskAdd}
            onSubtaskToggle={onSubtaskToggle}
            onSubtaskDelete={onSubtaskDelete}
          />
        </Box>
      ))}
    </>
  );
}
