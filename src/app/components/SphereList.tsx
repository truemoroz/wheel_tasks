'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useSpheresRefetch } from '@/app/components/SpheresRefetchContext';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Collapse from '@mui/material/Collapse';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { LifeSphereGroup } from '@/app/types/todo';
import SphereGroup from '@/app/components/SphereGroup';
import WheelOfLife from "@/app/components/WheelOfLife";

function updateSphere(spheres: LifeSphereGroup[], updated: LifeSphereGroup): LifeSphereGroup[] {
  return spheres.map((s) => (s.id === updated.id ? updated : s));
}

/** Recursively update a task anywhere in the task tree by id */
function updateTaskInTree(tasks: LifeSphereGroup['tasks'], taskId: string, patch: Partial<LifeSphereGroup['tasks'][0]>): LifeSphereGroup['tasks'] {
  return tasks.map((t) =>
    t.id === taskId
      ? { ...t, ...patch }
      : { ...t, subtasks: updateTaskInTree(t.subtasks, taskId, patch) },
  );
}

/** Recursively add a subtask to a parent anywhere in the tree */
function addSubtaskInTree(
  tasks: LifeSphereGroup['tasks'],
  parentId: string,
  newSubtask: LifeSphereGroup['tasks'][0],
): LifeSphereGroup['tasks'] {
  return tasks.map((t) =>
    t.id === parentId
      ? { ...t, subtasks: [...(t.subtasks ?? []), newSubtask] }
      : { ...t, subtasks: addSubtaskInTree(t.subtasks ?? [], parentId, newSubtask) },
  );
}

/** Recursively remove a task (and its descendants) anywhere in the tree */
function removeTaskFromTree(tasks: LifeSphereGroup['tasks'], id: string): LifeSphereGroup['tasks'] {
  return tasks
    .filter((t) => t.id !== id)
    .map((t) => ({ ...t, subtasks: removeTaskFromTree(t.subtasks ?? [], id) }));
}

/** Find a task anywhere in the tree */
function findTaskInTree(tasks: LifeSphereGroup['tasks'], id: string): LifeSphereGroup['tasks'][0] | undefined {
  for (const t of tasks) {
    if (t.id === id) return t;
    const found = findTaskInTree(t.subtasks ?? [], id);
    if (found) return found;
  }
}

export default function SphereList() {
  const t = useTranslations('SphereList');
  const { version } = useSpheresRefetch();
  const [spheres, setSpheres] = useState<LifeSphereGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wheelCollapsed, setWheelCollapsed] = useState(false);
  const [selectedSphereId, setSelectedSphereId] = useState<string | null>(null);
  const hasLoadedOnce = useRef(false);

  useEffect(() => {
    if (!hasLoadedOnce.current) {
      setLoading(true);
    }
    fetch('/api/spheres')
      .then((res) => res.json())
      .then(async (data) => {
        setSpheres(data);
        setLoading(false);
        hasLoadedOnce.current = true;

        // Apply sphere customisations from the landing page (Google OAuth sign-up flow)
        try {
          const raw = localStorage.getItem('pendingSphereRatings');
          if (raw) {
            localStorage.removeItem('pendingSphereRatings');
            const spheres = JSON.parse(raw);
            const res = await fetch('/api/spheres/apply-pending', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ spheres }),
            });
            if (res.ok) {
              const updated = await res.json();
              setSpheres(updated);
            }
          }
        } catch { /* ignore */ }
      })
      .catch(() => {
        setError(t('failedToLoad'));
        setLoading(false);
      });
  }, [t, version]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const sortedSpheres = useMemo(
    () => [...spheres].sort((a, b) => sortOrder === 'asc' ? a.rating - b.rating : b.rating - a.rating),
    [spheres, sortOrder],
  );

  const handleRatingChange = async (id: string, rating: number) => {
    // Optimistic update
    setSpheres((prev) => prev.map((s) => (s.id === id ? { ...s, rating } : s)));
    const sphere = spheres.find((s) => s.id === id);
    if (!sphere) return;
    const res = await fetch(`/api/spheres/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...sphere, rating }),
    });
    if (res.ok) {
      const updated = await res.json();
      setSpheres((prev) => updateSphere(prev, updated));
    }
  };

  const handleNameChange = async (id: string, name: string) => {
    // Optimistic update
    setSpheres((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
    const sphere = spheres.find((s) => s.id === id);
    if (!sphere) return;
    const res = await fetch(`/api/spheres/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...sphere, name }),
    });
    if (res.ok) {
      const updated = await res.json();
      setSpheres((prev) => updateSphere(prev, updated));
    }
  };

  const handleTaskToggle = async (groupId: string, taskId: string) => {
    const sphere = spheres.find((s) => s.id === groupId);
    if (!sphere) return;
    const task = sphere.tasks.find((t) => t.id === taskId);
    if (!task) return;
    // Optimistic update
    setSpheres((prev) =>
      prev.map((s) =>
        s.id === groupId
          ? { ...s, tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)) }
          : s,
      ),
    );
    const res = await fetch(`/api/spheres/${groupId}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !task.completed }),
    });
    if (res.ok) {
      const updated = await res.json();
      setSpheres((prev) => updateSphere(prev, updated));
    }
  };

  const handleTaskAdd = async (groupId: string, title: string) => {
    const res = await fetch(`/api/spheres/${groupId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (res.ok) {
      const updated = await res.json();
      setSpheres((prev) => updateSphere(prev, updated));
    }
  };

  const handleTaskDelete = async (groupId: string, taskId: string) => {
    // Optimistic update
    setSpheres((prev) =>
      prev.map((s) =>
        s.id === groupId ? { ...s, tasks: s.tasks.filter((t) => t.id !== taskId) } : s,
      ),
    );
    const res = await fetch(`/api/spheres/${groupId}/tasks/${taskId}`, { method: 'DELETE' });
    if (res.ok) {
      const updated = await res.json();
      setSpheres((prev) => updateSphere(prev, updated));
    }
  };

  const handleTaskSignificanceChange = async (groupId: string, taskId: string, significance: number) => {
    // Optimistic update
    setSpheres((prev) =>
      prev.map((s) =>
        s.id === groupId
          ? { ...s, tasks: updateTaskInTree(s.tasks, taskId, { significance }) }
          : s,
      ),
    );
    const res = await fetch(`/api/spheres/${groupId}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ significance }),
    });
    if (res.ok) {
      const updated = await res.json();
      setSpheres((prev) => updateSphere(prev, updated));
    }
  };

  const handleTaskRecurringToggle = async (groupId: string, taskId: string) => {
    const sphere = spheres.find((s) => s.id === groupId);
    if (!sphere) return;
    // Find task anywhere in tree
    const findTask = (tasks: LifeSphereGroup['tasks']): LifeSphereGroup['tasks'][0] | undefined => {
      for (const t of tasks) {
        if (t.id === taskId) return t;
        const found = findTask(t.subtasks);
        if (found) return found;
      }
    };
    const task = findTask(sphere.tasks);
    if (!task) return;
    const recurring = !(task.recurring ?? false);
    // Optimistic update
    setSpheres((prev) =>
      prev.map((s) =>
        s.id === groupId ? { ...s, tasks: updateTaskInTree(s.tasks, taskId, { recurring }) } : s,
      ),
    );
    const res = await fetch(`/api/spheres/${groupId}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recurring }),
    });
    if (res.ok) {
      const updated = await res.json();
      setSpheres((prev) => updateSphere(prev, updated));
    }
  };

  const handleTaskLog = async (groupId: string, taskId: string) => {
    await fetch(`/api/spheres/${groupId}/tasks/${taskId}/log`, { method: 'POST' });
    // No sphere state change needed — task stays active
  };

  const handleGoalAdd = async (groupId: string, title: string) => {
    const res = await fetch(`/api/spheres/${groupId}/goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (res.ok) {
      const updated = await res.json();
      setSpheres((prev) => updateSphere(prev, updated));
    }
  };

  const handleGoalDelete = async (groupId: string, goalId: string) => {
    // Optimistic update
    setSpheres((prev) =>
      prev.map((s) =>
        s.id === groupId ? { ...s, goals: s.goals.filter((g) => g.id !== goalId) } : s,
      ),
    );
    const res = await fetch(`/api/spheres/${groupId}/goals/${goalId}`, { method: 'DELETE' });
    if (res.ok) {
      const updated = await res.json();
      setSpheres((prev) => updateSphere(prev, updated));
    }
  };

  const handleGoalEstimationChange = async (groupId: string, goalId: string, estimation: number | null) => {
    // Optimistic update
    setSpheres((prev) =>
      prev.map((s) =>
        s.id === groupId
          ? { ...s, goals: s.goals.map((g) => (g.id === goalId ? { ...g, estimation: estimation ?? undefined } : g)) }
          : s,
      ),
    );
    const res = await fetch(`/api/spheres/${groupId}/goals/${goalId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estimation }),
    });
    if (res.ok) {
      const updated = await res.json();
      setSpheres((prev) => updateSphere(prev, updated));
    }
  };

  const handleSubtaskAdd = async (groupId: string, taskId: string, title: string) => {
    const tempId = `st-${Date.now()}`;
    const newSubtask = { id: tempId, title, completed: false, significance: 5, recurring: false, subtasks: [] };
    // Optimistic update — works at any depth
    setSpheres((prev) =>
      prev.map((s) =>
        s.id === groupId
          ? { ...s, tasks: addSubtaskInTree(s.tasks, taskId, newSubtask) }
          : s,
      ),
    );
    const res = await fetch(`/api/spheres/${groupId}/tasks/${taskId}/subtasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (res.ok) {
      const updated = await res.json();
      setSpheres((prev) => updateSphere(prev, updated));
    }
  };

  const handleSubtaskToggle = async (groupId: string, taskId: string, subtaskId: string) => {
    const sphere = spheres.find((s) => s.id === groupId);
    if (!sphere) return;
    const subtask = findTaskInTree(sphere.tasks, subtaskId);
    if (!subtask) return;
    const completed = !subtask.completed;
    // Optimistic update — works at any depth
    setSpheres((prev) =>
      prev.map((s) =>
        s.id === groupId
          ? { ...s, tasks: updateTaskInTree(s.tasks, subtaskId, { completed }) }
          : s,
      ),
    );
    const res = await fetch(`/api/spheres/${groupId}/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });
    if (res.ok) {
      const updated = await res.json();
      setSpheres((prev) => updateSphere(prev, updated));
    }
  };

  const handleSubtaskDelete = async (groupId: string, taskId: string, subtaskId: string) => {
    // Optimistic update — works at any depth
    setSpheres((prev) =>
      prev.map((s) =>
        s.id === groupId
          ? { ...s, tasks: removeTaskFromTree(s.tasks, subtaskId) }
          : s,
      ),
    );
    const res = await fetch(`/api/spheres/${groupId}/tasks/${taskId}/subtasks/${subtaskId}`, { method: 'DELETE' });
    if (res.ok) {
      const updated = await res.json();
      setSpheres((prev) => updateSphere(prev, updated));
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const selectedSphere = sortedSpheres.find((s) => s.id === selectedSphereId) ?? sortedSpheres[0] ?? null;

  const sharedProps = (group: LifeSphereGroup) => ({
    group,
    view: 'full' as const,
    onRatingChange: handleRatingChange,
    onNameChange: handleNameChange,
    onTaskToggle: handleTaskToggle,
    onTaskAdd: handleTaskAdd,
    onTaskDelete: handleTaskDelete,
    onTaskSignificanceChange: handleTaskSignificanceChange,
    onTaskRecurringToggle: handleTaskRecurringToggle,
    onTaskLog: handleTaskLog,
    onGoalAdd: handleGoalAdd,
    onGoalDelete: handleGoalDelete,
    onGoalEstimationChange: handleGoalEstimationChange,
    onSubtaskAdd: handleSubtaskAdd,
    onSubtaskToggle: handleSubtaskToggle,
    onSubtaskDelete: handleSubtaskDelete,
  });

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '340px minmax(0, 800px)' }, gap: 2, alignItems: 'start', maxWidth: 1200, mx: 'auto', width: '100%', minWidth: 0, overflow: 'hidden' }}>
      {/* Left panel: wheel (collapsible, no title) + sphere selector cards */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
          <Tooltip title={wheelCollapsed ? t('expandDiagram') : t('collapseDiagram')}>
            <IconButton size="small" onClick={() => setWheelCollapsed((v) => !v)}>
              {wheelCollapsed ? <ExpandMoreIcon fontSize="small" /> : <ExpandLessIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title={sortOrder === 'asc' ? t('sortHighFirst') : t('sortLowFirst')}>
            <IconButton size="small" onClick={() => setSortOrder((v) => v === 'asc' ? 'desc' : 'asc')} color="primary">
              {sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
        <Collapse in={!wheelCollapsed}>
          <Box sx={{ mb: 0.5 }}>
            <WheelOfLife spheres={sortedSpheres} />
          </Box>
        </Collapse>
        {sortedSpheres.map((group) => {
          const isSelected = group.id === (selectedSphere?.id ?? null);
          const color = group.rating <= 3 ? 'error' : group.rating <= 6 ? 'warning' : 'success';
          return (
            <Paper
              key={group.id}
              onClick={() => setSelectedSphereId(group.id)}
              sx={{
                p: 1.5, cursor: 'pointer', border: 2,
                borderColor: isSelected ? 'primary.main' : 'transparent',
                '&:hover': { borderColor: isSelected ? 'primary.main' : 'divider' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ flexGrow: 1, fontWeight: isSelected ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {group.name}
                </Typography>
                <Chip label={group.rating} color={color} size="small" />
              </Box>
            </Paper>
          );
        })}
      </Box>

      {/* Right panel: selected sphere full content */}
      <Box>
        {selectedSphere && (
          <Fade key={selectedSphere.id} in timeout={250}>
            <div>
              <SphereGroup {...sharedProps(selectedSphere)} expanded={true} />
            </div>
          </Fade>
        )}
      </Box>
    </Box>
  );
}
