'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import AddIcon from '@mui/icons-material/Add';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { LifeSphereGroup, LinkedTaskOption } from '@/app/types/todo';
import AgentChat from '@/app/components/AgentChat';
import TaskItem from '@/app/components/TaskItem';

interface SphereTasksProps {
  group: LifeSphereGroup;
  onTaskToggle: (groupId: string, taskId: string) => void;
  onTaskAdd: (groupId: string, title: string) => void;
  onTaskDelete: (groupId: string, taskId: string) => void;
  onTaskTitleChange?: (groupId: string, taskId: string, title: string) => void;
  onTaskSignificanceChange?: (groupId: string, taskId: string, significance: number) => void;
  onTaskRecurringToggle?: (groupId: string, taskId: string) => void;
  onTaskLinksChange?: (groupId: string, taskId: string, linkedTaskIds: string[]) => void;
  taskLinkOptions?: LinkedTaskOption[];
  onTaskLog?: (groupId: string, taskId: string) => Promise<void>;
  onSubtaskAdd?: (groupId: string, taskId: string, title: string) => void;
  onSubtaskToggle?: (groupId: string, taskId: string, subtaskId: string) => void;
  onSubtaskDelete?: (groupId: string, taskId: string, subtaskId: string) => void;
}

export default function SphereTasks({
  group,
  onTaskToggle,
  onTaskAdd,
  onTaskDelete,
  onTaskTitleChange,
  onTaskSignificanceChange,
  onTaskRecurringToggle,
  onTaskLinksChange,
  taskLinkOptions = [],
  onTaskLog,
  onSubtaskAdd,
  onSubtaskToggle,
  onSubtaskDelete,
}: SphereTasksProps) {
  const t = useTranslations('SphereGroup');
  const [newTask, setNewTask] = useState('');
  const [agentChatOpen, setAgentChatOpen] = useState(false);
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [collapsedTaskIds, setCollapsedTaskIds] = useState<Set<string>>(new Set());

  const handleAddTask = () => {
    if (newTask.trim()) {
      onTaskAdd(group.id, newTask.trim());
      setNewTask('');
    }
  };

  const visibleTasks = showCompletedTasks
    ? group.tasks
    : group.tasks.filter(task => !task.completed);

  const handleSubtasksCollapseToggle = (taskId: string) => {
    setCollapsedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ mb: 0 }}>
          {t('tasks')}
        </Typography>
        <IconButton size="small" onClick={() => setAgentChatOpen(true)} aria-label="open AI assistant">
          <SmartToyIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => setShowCompletedTasks((prev) => !prev)}
          aria-label={showCompletedTasks ? t('hideCompleted') : t('showCompleted')}
        >
          {showCompletedTasks ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
        </IconButton>
      </Box>
      <List dense>
        {[...visibleTasks].sort((a, b) => (b.significance ?? 5) - (a.significance ?? 5)).map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            groupId={group.id}
            onToggle={() => onTaskToggle(group.id, task.id)}
            onDelete={() => onTaskDelete(group.id, task.id)}
            onTitleChange={(taskId, title) => onTaskTitleChange?.(group.id, taskId, title)}
            onSignificanceChange={(taskId, sig) => onTaskSignificanceChange?.(group.id, taskId, sig)}
            onRecurringToggle={(taskId) => onTaskRecurringToggle?.(group.id, taskId)}
            onTaskLinksChange={(taskId, linkedTaskIds) => onTaskLinksChange?.(group.id, taskId, linkedTaskIds)}
            taskLinkOptions={taskLinkOptions}
            onLog={onTaskLog}
            onSubtaskAdd={(taskId, title) => onSubtaskAdd?.(group.id, taskId, title)}
            onSubtaskToggle={(taskId, subtaskId) => onSubtaskToggle?.(group.id, taskId, subtaskId)}
            onSubtaskDelete={(taskId, subtaskId) => onSubtaskDelete?.(group.id, taskId, subtaskId)}
            showCompletedTasks={showCompletedTasks}
            collapsedTaskIds={collapsedTaskIds}
            onSubtasksCollapseToggle={handleSubtasksCollapseToggle}
          />
        ))}
      </List>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          size="small"
          placeholder={t('addTaskPlaceholder')}
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
          fullWidth
        />
        <IconButton color="primary" onClick={handleAddTask}>
          <AddIcon />
        </IconButton>
      </Box>
      <Drawer
        anchor="right"
        open={agentChatOpen}
        onClose={() => setAgentChatOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: { xs: 'calc(100vw - 48px)', sm: 360 },
              boxShadow: 8,
            },
          },
        }}
      >
        <AgentChat open={agentChatOpen} onClose={() => setAgentChatOpen(false)} sphereId={group.id} />
      </Drawer>
    </>
  );
}
