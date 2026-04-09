'use client';
import { useState, useRef } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Chip from '@mui/material/Chip';
import Popover from '@mui/material/Popover';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import FlagIcon from '@mui/icons-material/Flag';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { LifeSphereGroup } from '@/app/types/todo';
import TaskItem from '@/app/components/TaskItem';

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
  onTaskSignificanceChange?: (groupId: string, taskId: string, significance: number) => void;
  onTaskRecurringToggle?: (groupId: string, taskId: string) => void;
  onTaskLog?: (groupId: string, taskId: string) => Promise<void>;
  onGoalAdd: (groupId: string, title: string) => void;
  onGoalDelete: (groupId: string, goalId: string) => void;
  onGoalEstimationChange?: (groupId: string, goalId: string, estimation: number | null) => void;
  onSubtaskAdd?: (groupId: string, taskId: string, title: string) => void;
  onSubtaskToggle?: (groupId: string, taskId: string, subtaskId: string) => void;
  onSubtaskDelete?: (groupId: string, taskId: string, subtaskId: string) => void;
  /** Which section to render. Defaults to 'full'. */
  view?: 'full' | 'goals' | 'tasks';
  /** Sort order for goals. Defaults to 'default'. */
  goalSort?: 'default' | 'asc' | 'desc';
}

export default function SphereGroup({
  group,
  onRatingChange,
  onNameChange,
  onTaskToggle,
  onTaskAdd,
  onTaskDelete,
  onTaskSignificanceChange,
  onTaskRecurringToggle,
  onTaskLog,
  onGoalAdd,
  onGoalDelete,
  onGoalEstimationChange,
  onSubtaskAdd,
  onSubtaskToggle,
  onSubtaskDelete,
  view = 'full',
  goalSort = 'default',
}: SphereGroupProps) {
  const [newTask, setNewTask] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(group.name);
  const [ratingAnchor, setRatingAnchor] = useState<null | HTMLElement>(null);
  const [titleHovered, setTitleHovered] = useState(false);
  const ratingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openRating = (e: React.MouseEvent<HTMLElement>) => {
    if (ratingTimer.current) clearTimeout(ratingTimer.current);
    setRatingAnchor(e.currentTarget);
  };
  const closeRating = () => {
    ratingTimer.current = setTimeout(() => setRatingAnchor(null), 150);
  };
  const cancelCloseRating = () => {
    if (ratingTimer.current) clearTimeout(ratingTimer.current);
  };

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

  const sortedGoals = goalSort === 'default'
    ? group.goals
    : [...group.goals].sort((a, b) => {
        const aVal = a.estimation ?? null;
        const bVal = b.estimation ?? null;
        if (aVal === null && bVal === null) return 0;
        if (aVal === null) return 1;
        if (bVal === null) return -1;
        return goalSort === 'asc' ? aVal - bVal : bVal - aVal;
      });
  return (
    <Accordion sx={{ maxWidth: '100%', overflow: 'hidden' }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, width: '100%', mr: 2, overflow: 'hidden' }}>
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
              onMouseEnter={() => setTitleHovered(true)}
              onMouseLeave={() => setTitleHovered(false)}
            >
              <Typography variant="h6" sx={{ flexGrow: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
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
                  visibility: titleHovered ? 'visible' : 'hidden',
                  '&:hover': { backgroundColor: 'action.hover' },
                }}
              >
                <EditIcon fontSize="small" />
              </Box>
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
            <Chip
              label={`${group.rating}/10`}
              color={getRatingColor(group.rating)}
              size="small"
              onMouseEnter={openRating}
              onMouseLeave={closeRating}
              sx={{ cursor: 'default' }}
            />
            <Popover
              open={Boolean(ratingAnchor)}
              anchorEl={ratingAnchor}
              onClose={() => setRatingAnchor(null)}
              anchorOrigin={{ vertical: 'center', horizontal: 'center' }}
              transformOrigin={{ vertical: 'center', horizontal: 'center' }}
              disableAutoFocus
              disableEnforceFocus
              slotProps={{
                paper: {
                  onMouseEnter: cancelCloseRating,
                  onMouseLeave: closeRating,
                  sx: { display: 'flex', alignItems: 'center', p: 0.25 },
                },
              }}
            >
              <Box
                component="span"
                role="button"
                tabIndex={group.rating <= 1 ? -1 : 0}
                aria-label="decrease rating"
                aria-disabled={group.rating <= 1}
                onClick={() => {
                  if (group.rating <= 1) return;
                  const next = group.rating - 1;
                  onRatingChange(group.id, next);
                }}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && group.rating > 1) {
                    const next = group.rating - 1;
                    onRatingChange(group.id, next);
                  }
                }}
                sx={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '50%', padding: '4px', color: 'action.active',
                  cursor: group.rating <= 1 ? 'default' : 'pointer',
                  opacity: group.rating <= 1 ? 0.38 : 1,
                  '&:hover': { backgroundColor: group.rating <= 1 ? 'transparent' : 'action.hover' },
                }}
              >
                <RemoveIcon fontSize="small" />
              </Box>
              <Chip
                label={`${group.rating}/10`}
                color={getRatingColor(group.rating)}
                size="small"
              />
              <Box
                component="span"
                role="button"
                tabIndex={group.rating >= 10 ? -1 : 0}
                aria-label="increase rating"
                aria-disabled={group.rating >= 10}
                onClick={() => {
                  if (group.rating >= 10) return;
                  const next = group.rating + 1;
                  onRatingChange(group.id, next);
                }}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && group.rating < 10) {
                    const next = group.rating + 1;
                    onRatingChange(group.id, next);
                  }
                }}
                sx={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '50%', padding: '4px', color: 'action.active',
                  cursor: group.rating >= 10 ? 'default' : 'pointer',
                  opacity: group.rating >= 10 ? 0.38 : 1,
                  '&:hover': { backgroundColor: group.rating >= 10 ? 'transparent' : 'action.hover' },
                }}
              >
                <AddIcon fontSize="small" />
              </Box>
            </Popover>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' }, whiteSpace: 'nowrap' }}>
            {completedCount}/{group.tasks.length} tasks
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {/* Rating Slider */}
        {/*{(view === 'full' || view === 'goals') && (*/}
        {/*  <Box sx={{ mb: 3 }}>*/}
        {/*    <Typography variant="subtitle2" gutterBottom>*/}
        {/*      Current State Rating*/}
        {/*    </Typography>*/}
        {/*    <Slider*/}
        {/*      value={sliderValue}*/}
        {/*      min={1}*/}
        {/*      max={10}*/}
        {/*      step={1}*/}
        {/*      marks*/}
        {/*      valueLabelDisplay="auto"*/}
        {/*      onChange={(_, value) => setSliderValue(value as number)}*/}
        {/*      onChangeCommitted={(_, value) => onRatingChange(group.id, value as number)}*/}
        {/*    />*/}
        {/*  </Box>*/}
        {/*)}*/}
        {(view === 'full' || view === 'goals') && <Divider sx={{ mb: 2 }} />}
        {/* Goals */}
        {(view === 'full' || view === 'goals') && (
          <>
            <Typography variant="subtitle2" gutterBottom>
              Goals
            </Typography>
            <List dense>
              {sortedGoals.map((goal) => (
                <ListItem
                  key={goal.id}
                  secondaryAction={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {/*<TextField*/}
                      {/*  size="small"*/}
                      {/*  helperText="Estimation"*/}
                      {/*  // type="number"*/}
                      {/*  placeholder="Est."*/}
                      {/*  value={goal.estimation ?? ''}*/}
                      {/*  onChange={(e) => {*/}
                      {/*    const val = e.target.value === '' ? null : Number(e.target.value);*/}
                      {/*    onGoalEstimationChange?.(group.id, goal.id, val);*/}
                      {/*  }}*/}
                      {/*  slotProps={{ htmlInput: { min: 1, style: { width: 36 } } }}*/}
                      {/*  sx={{ width: { xs: 60, sm: 72 } }}*/}
                      {/*/>*/}
                      <IconButton edge="end" size="small" onClick={() => onGoalDelete(group.id, goal.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
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
                <TaskItem
                  key={task.id}
                  task={task}
                  groupId={group.id}
                  onToggle={() => onTaskToggle(group.id, task.id)}
                  onDelete={() => onTaskDelete(group.id, task.id)}
                  onSignificanceChange={(taskId, sig) => onTaskSignificanceChange?.(group.id, taskId, sig)}
                  onRecurringToggle={(taskId) => onTaskRecurringToggle?.(group.id, taskId)}
                  onLog={onTaskLog}
                  onSubtaskAdd={(taskId, title) => onSubtaskAdd?.(group.id, taskId, title)}
                  onSubtaskToggle={(taskId, subtaskId) => onSubtaskToggle?.(group.id, taskId, subtaskId)}
                  onSubtaskDelete={(taskId, subtaskId) => onSubtaskDelete?.(group.id, taskId, subtaskId)}
                />
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
