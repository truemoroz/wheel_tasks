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
import DeleteIcon from '@mui/icons-material/Delete';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import { Task } from '@/app/types/todo';

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  onSubtaskAdd?: (taskId: string, title: string) => void;
  onSubtaskToggle?: (taskId: string, subtaskId: string) => void;
  onSubtaskDelete?: (taskId: string, subtaskId: string) => void;
}

export default function TaskItem({ task, onToggle, onDelete, onSubtaskAdd, onSubtaskToggle, onSubtaskDelete }: TaskItemProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');

  const subtasks = task.subtasks ?? [];
  const completedSubtasks = subtasks.filter((s) => s.completed).length;

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      onSubtaskAdd?.(task.id, newSubtask.trim());
      setNewSubtask('');
      setShowAdd(false);
    }
  };

  return (
    <>
      <ListItem
        secondaryAction={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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
          <Checkbox edge="start" checked={task.completed} onChange={onToggle} size="small" />
        </ListItemIcon>
        <ListItemText
          primary={task.title}
          sx={{ textDecoration: task.completed ? 'line-through' : 'none', opacity: task.completed ? 0.6 : 1 }}
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
            <IconButton edge="end" size="small" onClick={() => onSubtaskDelete?.(task.id, subtask.id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
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
