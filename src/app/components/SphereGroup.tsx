'use client';
import { useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Chip from '@mui/material/Chip';
import Slider from '@mui/material/Slider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import FlagIcon from '@mui/icons-material/Flag';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { LifeSphereGroup } from '@/app/types/todo';

function getRatingColor(rating: number): 'error' | 'warning' | 'success' | 'default' {
  if (rating <= 3) return 'error';
  if (rating <= 6) return 'warning';
  return 'success';
}

interface SphereGroupProps {
  group: LifeSphereGroup;
  onRatingChange: (id: string, rating: number) => void;
  onNameChange: (id: string, name: string) => void;
  onTaskToggle: (groupId: string, taskId: string) => void;
  onTaskAdd: (groupId: string, title: string) => void;
  onTaskDelete: (groupId: string, taskId: string) => void;
  onGoalAdd: (groupId: string, title: string) => void;
  onGoalDelete: (groupId: string, goalId: string) => void;
  /** Which section to render. Defaults to 'full'. */
  view?: 'full' | 'goals' | 'tasks';
}

export default function SphereGroup({
  group,
  onRatingChange,
  onNameChange,
  onTaskToggle,
  onTaskAdd,
  onTaskDelete,
  onGoalAdd,
  onGoalDelete,
  view = 'full',
}: SphereGroupProps) {
  const [newTask, setNewTask] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(group.name);

  const handleSaveName = () => {
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== group.name) {
      onNameChange(group.id, trimmed);
    } else {
      setNameValue(group.name);
    }
    setEditingName(false);
  };

  const handleCancelName = () => {
    setNameValue(group.name);
    setEditingName(false);
  };

  const handleAddTask = () => {
    if (newTask.trim()) {
      onTaskAdd(group.id, newTask.trim());
      setNewTask('');
    }
  };

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      onGoalAdd(group.id, newGoal.trim());
      setNewGoal('');
    }
  };

  const completedCount = group.tasks.filter((t) => t.completed).length;
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', mr: 2 }}>
          {editingName ? (
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <TextField
                size="small"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') handleCancelName();
                }}
                autoFocus
                sx={{ flexGrow: 1 }}
              />
              <Box
                component="span"
                role="button"
                tabIndex={0}
                onClick={handleSaveName}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSaveName(); }}
                aria-label="save name"
                sx={{
                  display: 'inline-flex', alignItems: 'center', cursor: 'pointer',
                  borderRadius: '50%', padding: '4px', color: 'primary.main',
                  '&:hover': { backgroundColor: 'action.hover' },
                }}
              >
                <CheckIcon fontSize="small" />
              </Box>
              <Box
                component="span"
                role="button"
                tabIndex={0}
                onClick={handleCancelName}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCancelName(); }}
                aria-label="cancel edit"
                sx={{
                  display: 'inline-flex', alignItems: 'center', cursor: 'pointer',
                  borderRadius: '50%', padding: '4px', color: 'action.active',
                  '&:hover': { backgroundColor: 'action.hover' },
                }}
              >
                <CloseIcon fontSize="small" />
              </Box>
            </Box>
          ) : (
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}
            >
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                {group.name}
              </Typography>
              <Box
                component="span"
                role="button"
                tabIndex={0}
                onClick={(e) => { e.stopPropagation(); setEditingName(true); }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); setEditingName(true); } }}
                aria-label="edit name"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  borderRadius: '50%',
                  padding: '4px',
                  color: 'action.active',
                  '&:hover': { backgroundColor: 'action.hover' },
                }}
              >
                <EditIcon fontSize="small" />
              </Box>
            </Box>
          )}
          <Chip
            label={`${group.rating}/10`}
            color={getRatingColor(group.rating)}
            size="small"
          />
          <Typography variant="body2" color="text.secondary">
            {completedCount}/{group.tasks.length} tasks
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {/* Rating Slider — only in full view */}
        {view === 'full' && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Current State Rating
            </Typography>
            <Slider
              value={group.rating}
              min={1}
              max={10}
              step={1}
              marks
              valueLabelDisplay="auto"
              onChange={(_, value) => onRatingChange(group.id, value as number)}
            />
          </Box>
        )}
        {view === 'full' && <Divider sx={{ mb: 2 }} />}
        {/* Goals */}
        {(view === 'full' || view === 'goals') && (
          <>
            <Typography variant="subtitle2" gutterBottom>
              Goals
            </Typography>
            <List dense>
              {group.goals.map((goal) => (
                <ListItem
                  key={goal.id}
                  secondaryAction={
                    <IconButton edge="end" size="small" onClick={() => onGoalDelete(group.id, goal.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <FlagIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={goal.title} />
                </ListItem>
              ))}
            </List>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                size="small"
                placeholder="Add a goal..."
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
                fullWidth
              />
              <IconButton color="primary" onClick={handleAddGoal}>
                <AddIcon />
              </IconButton>
            </Box>
          </>
        )}
        {view === 'full' && <Divider sx={{ mb: 2 }} />}
        {/* Tasks */}
        {(view === 'full' || view === 'tasks') && (
          <>
            <Typography variant="subtitle2" gutterBottom>
              Tasks
            </Typography>
            <List dense>
              {group.tasks.map((task) => (
                <ListItem
                  key={task.id}
                  secondaryAction={
                    <IconButton edge="end" size="small" onClick={() => onTaskDelete(group.id, task.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Checkbox
                      edge="start"
                      checked={task.completed}
                      onChange={() => onTaskToggle(group.id, task.id)}
                      size="small"
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={task.title}
                    sx={{
                      textDecoration: task.completed ? 'line-through' : 'none',
                      opacity: task.completed ? 0.6 : 1,
                    }}
                  />
                </ListItem>
              ))}
            </List>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                placeholder="Add a task..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                fullWidth
              />
              <IconButton color="primary" onClick={handleAddTask}>
                <AddIcon />
              </IconButton>
            </Box>
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
