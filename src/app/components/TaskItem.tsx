'use client';
import { useState } from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import RepeatIcon from '@mui/icons-material/Repeat';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import { Task } from '@/app/types/todo';

function getSignificanceColor(sig: number): 'error' | 'warning' | 'success' | 'default' {
  if (sig >= 8) return 'error';
  if (sig >= 5) return 'warning';
  return 'success';
}

interface TaskItemProps {
  task: Task;
  groupId: string;
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
  onToggle,
  onDelete,
  onSignificanceChange,
  onRecurringToggle,
  onLog,
  onSubtaskAdd,
  onSubtaskToggle,
  onSubtaskDelete,
}: TaskItemProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const [justLogged, setJustLogged] = useState(false);

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

  const significanceControls = (
    <>
      <Tooltip title="Decrease significance">
        <span>
          <IconButton size="small" aria-label="decrease significance" disabled={sig <= 1}
            onClick={() => onSignificanceChange?.(task.id, sig - 1)}>
            <RemoveIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={`Significance: ${sig}/10`}>
        <Chip
          label={`★${sig}`}
          color={getSignificanceColor(sig)}
          size="small"
          sx={{ height: 20, fontSize: '0.65rem', '& .MuiChip-label': { px: 0.75 }, minWidth: 36 }}
        />
      </Tooltip>
      <Tooltip title="Increase significance">
        <span>
          <IconButton size="small" aria-label="increase significance" disabled={sig >= 10}
            onClick={() => onSignificanceChange?.(task.id, sig + 1)}>
            <AddIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </span>
      </Tooltip>
    </>
  );

  return (
    <>
      <ListItem
        secondaryAction={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {significanceControls}

            {/* Log button — only for recurring tasks */}
            {recurring && (
              <Tooltip title={justLogged ? 'Logged!' : 'Log — count in history'}>
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

            {/* Recurring toggle */}
            <Tooltip title={recurring ? 'Make one-time task' : 'Make recurring task'}>
              <IconButton
                size="small"
                aria-label="toggle recurring"
                onClick={() => onRecurringToggle?.(task.id)}
                color={recurring ? 'primary' : 'default'}
              >
                <RepeatIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Subtask add toggle */}
            <Tooltip title={showAdd ? 'Cancel' : 'Add subtask'}>
              <IconButton size="small" aria-label="add subtask" onClick={() => setShowAdd((v) => !v)}
                color={showAdd ? 'primary' : 'default'}>
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {subtasks.length > 0 && (
              <Chip
                label={`${completedSubtasks}/${subtasks.length}`}
                size="small"
                variant="outlined"
                sx={{ height: 18, fontSize: '0.65rem', '& .MuiChip-label': { px: 0.75 } }}
              />
            )}

            <IconButton edge="end" size="small" onClick={onDelete}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        }
      >
        <ListItemIcon sx={{ minWidth: 32 }}>
          {recurring ? (
            <Tooltip title="Recurring task">
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
            placeholder="Add subtask…"
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

      {/* Subtasks */}
      {subtasks.map((subtask) => (
        <ListItem
          key={subtask.id}
          sx={{
            pl: 4,
            borderLeft: '3px solid',
            borderColor: subtask.completed ? 'action.disabled' : 'primary.main',
            ml: 2,
            mb: 0.25,
            bgcolor: 'action.hover',
            borderRadius: '0 4px 4px 0',
            width: 'calc(100% - 16px)',
          }}
          secondaryAction={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Tooltip title="Decrease significance">
                <span>
                  <IconButton size="small" aria-label="decrease significance"
                    disabled={(subtask.significance ?? 5) <= 1}
                    onClick={() => onSignificanceChange?.(subtask.id, (subtask.significance ?? 5) - 1)}>
                    <RemoveIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title={`Significance: ${subtask.significance ?? 5}/10`}>
                <Chip
                  label={`★${subtask.significance ?? 5}`}
                  color={getSignificanceColor(subtask.significance ?? 5)}
                  size="small"
                  sx={{ height: 20, fontSize: '0.65rem', '& .MuiChip-label': { px: 0.75 }, minWidth: 36 }}
                />
              </Tooltip>
              <Tooltip title="Increase significance">
                <span>
                  <IconButton size="small" aria-label="increase significance"
                    disabled={(subtask.significance ?? 5) >= 10}
                    onClick={() => onSignificanceChange?.(subtask.id, (subtask.significance ?? 5) + 1)}>
                    <AddIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </span>
              </Tooltip>
              <IconButton edge="end" size="small" onClick={() => onSubtaskDelete?.(task.id, subtask.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          }
        >
          <ListItemIcon sx={{ minWidth: 28 }}>
            <SubdirectoryArrowRightIcon sx={{ fontSize: 14, color: 'text.secondary', mr: 0.5 }} />
            <Checkbox
              edge="start"
              checked={subtask.completed}
              onChange={() => onSubtaskToggle?.(task.id, subtask.id)}
              size="small"
              sx={{ p: 0.5 }}
            />
          </ListItemIcon>
          <ListItemText
            primary={subtask.title}
            slotProps={{ primary: { variant: 'body2' } }}
            sx={{ textDecoration: subtask.completed ? 'line-through' : 'none', opacity: subtask.completed ? 0.5 : 1 }}
          />
        </ListItem>
      ))}
    </>
  );
}
