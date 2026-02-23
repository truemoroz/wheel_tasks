'use client';
import { useState, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import { LifeSphereGroup } from '@/app/types/todo';
import { initialSpheres } from '@/app/data/initialSpheres';
import SphereGroup from '@/app/components/SphereGroup';
const STORAGE_KEY = 'wheel-tasks-spheres';
function loadSpheres(): LifeSphereGroup[] {
  if (typeof window === 'undefined') return initialSpheres;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore parse errors
  }
  return initialSpheres;
}
export default function SphereList() {
  const [spheres, setSpheres] = useState<LifeSphereGroup[]>(initialSpheres);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setSpheres(loadSpheres());
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(spheres));
    }
  }, [spheres, hydrated]);
  const sortedSpheres = useMemo(
    () => [...spheres].sort((a, b) => b.rating - a.rating),
    [spheres],
  );
  const handleRatingChange = (id: string, rating: number) => {
    setSpheres((prev) =>
      prev.map((s) => (s.id === id ? { ...s, rating } : s)),
    );
  };
  const handleTaskToggle = (groupId: string, taskId: string) => {
    setSpheres((prev) =>
      prev.map((s) =>
        s.id === groupId
          ? {
              ...s,
              tasks: s.tasks.map((t) =>
                t.id === taskId ? { ...t, completed: !t.completed } : t,
              ),
            }
          : s,
      ),
    );
  };
  const handleTaskAdd = (groupId: string, title: string) => {
    setSpheres((prev) =>
      prev.map((s) =>
        s.id === groupId
          ? {
              ...s,
              tasks: [
                ...s.tasks,
                { id: `t-${Date.now()}`, title, completed: false },
              ],
            }
          : s,
      ),
    );
  };
  const handleTaskDelete = (groupId: string, taskId: string) => {
    setSpheres((prev) =>
      prev.map((s) =>
        s.id === groupId
          ? { ...s, tasks: s.tasks.filter((t) => t.id !== taskId) }
          : s,
      ),
    );
  };
  const handleGoalAdd = (groupId: string, title: string) => {
    setSpheres((prev) =>
      prev.map((s) =>
        s.id === groupId
          ? {
              ...s,
              goals: [
                ...s.goals,
                { id: `g-${Date.now()}`, title },
              ],
            }
          : s,
      ),
    );
  };
  const handleGoalDelete = (groupId: string, goalId: string) => {
    setSpheres((prev) =>
      prev.map((s) =>
        s.id === groupId
          ? { ...s, goals: s.goals.filter((g) => g.id !== goalId) }
          : s,
      ),
    );
  };
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {sortedSpheres.map((group) => (
        <SphereGroup
          key={group.id}
          group={group}
          onRatingChange={handleRatingChange}
          onTaskToggle={handleTaskToggle}
          onTaskAdd={handleTaskAdd}
          onTaskDelete={handleTaskDelete}
          onGoalAdd={handleGoalAdd}
          onGoalDelete={handleGoalDelete}
        />
      ))}
    </Box>
  );
}
