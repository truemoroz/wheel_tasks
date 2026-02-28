'use client';
import { useState, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { LifeSphereGroup } from '@/app/types/todo';
import SphereGroup from '@/app/components/SphereGroup';
import WheelOfLife from "@/app/components/WheelOfLife";

function updateSphere(spheres: LifeSphereGroup[], updated: LifeSphereGroup): LifeSphereGroup[] {
  return spheres.map((s) => (s.id === updated.id ? updated : s));
}

export default function SphereList() {
  const [spheres, setSpheres] = useState<LifeSphereGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [goalsCollapsed, setGoalsCollapsed] = useState(false);

  useEffect(() => {
    fetch('/api/spheres')
      .then((res) => res.json())
      .then((data) => {
        setSpheres(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load spheres from server.');
        setLoading(false);
      });
  }, []);

  const sortedSpheres = useMemo(
    () => [...spheres].sort((a, b) => a.rating - b.rating),
    [spheres],
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

  return (
    <>
      <WheelOfLife spheres={sortedSpheres} />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: goalsCollapsed ? '40px 1fr' : '1fr 1fr',
          },
          gap: 2,
          alignItems: 'start',
          transition: 'grid-template-columns 0.3s ease',
        }}
      >
      {/* Goals column */}
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ mb: 1, px: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          {!goalsCollapsed && (
            <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
              Goals
            </Typography>
          )}
          <Tooltip title={goalsCollapsed ? 'Expand goals' : 'Collapse goals'}>
            <IconButton size="small" onClick={() => setGoalsCollapsed((v) => !v)}>
              {goalsCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Tooltip>
        </Box>
        {!goalsCollapsed && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {sortedSpheres.map((group) => (
              <SphereGroup
                key={group.id}
                group={group}
                view="goals"
                onRatingChange={handleRatingChange}
                onNameChange={handleNameChange}
                onTaskToggle={handleTaskToggle}
                onTaskAdd={handleTaskAdd}
                onTaskDelete={handleTaskDelete}
                onGoalAdd={handleGoalAdd}
                onGoalDelete={handleGoalDelete}
              />
            ))}
          </Box>
        )}
      </Box>
      {/* Tasks column */}
      <Box>
        <Box sx={{ mb: 1, px: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            Tasks
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {sortedSpheres.map((group) => (
            <SphereGroup
              key={group.id}
              group={group}
              view="tasks"
              onRatingChange={handleRatingChange}
              onNameChange={handleNameChange}
              onTaskToggle={handleTaskToggle}
              onTaskAdd={handleTaskAdd}
              onTaskDelete={handleTaskDelete}
              onGoalAdd={handleGoalAdd}
              onGoalDelete={handleGoalDelete}
            />
          ))}
        </Box>
      </Box>
    </Box>
    </>
  );
}
