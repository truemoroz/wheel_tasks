'use client';
import dynamic from 'next/dynamic';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const TaskGraph = dynamic(() => import('@/app/components/TaskGraph'), {
  ssr: false,
  loading: () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <CircularProgress />
    </Box>
  ),
});

export default function TaskGraphPage() {
  return (
    <Box sx={{ height: 'calc(100vh - 64px)', width: '100%', overflow: 'hidden' }}>
      <TaskGraph />
    </Box>
  );
}

