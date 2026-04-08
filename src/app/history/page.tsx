'use client';
import { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { DayEntry } from '@/app/api/history/route';

const RANGE_OPTIONS = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
];

function formatDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  if (days <= 30) return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function getBarColor(significance: number): string {
  if (significance === 0) return '#e0e0e0';
  if (significance <= 15) return '#66bb6a';   // green – light day
  if (significance <= 35) return '#ffa726';   // orange – medium day
  return '#ef5350';                           // red – heavy day
}

type FetchState = {
  data: DayEntry[];
  error: string | null;
  fetchedForDays: number | null;  // null = never fetched
};

export default function HistoryPage() {
  const [days, setDays] = useState(30);
  const [state, setState] = useState<FetchState>({ data: [], error: null, fetchedForDays: null });

  // Derive loading: true whenever `days` doesn't match the last completed fetch
  const loading = state.fetchedForDays !== days;
  const { data, error } = state;

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/history?days=${days}`)
      .then((r) => r.json())
      .then((d: DayEntry[]) => {
        if (!cancelled) setState({ data: d, error: null, fetchedForDays: days });
      })
      .catch(() => {
        if (!cancelled) setState({ data: [], error: 'Failed to load history.', fetchedForDays: days });
      });
    return () => { cancelled = true; };
  }, [days]);

  const totalSignificance = data.reduce((s, d) => s + d.significance, 0);
  const totalCompleted = data.reduce((s, d) => s + d.count, 0);
  const activeDays = data.filter((d) => d.count > 0).length;

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1.5, sm: 3 } }}>
      <Box sx={{ mb: { xs: 2, sm: 3 } }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
          Completion History
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Daily sum of significance for completed tasks and subtasks.
        </Typography>
      </Box>

      {/* Range picker */}
      <Box sx={{ mb: 3 }}>
        <ToggleButtonGroup
          value={days}
          exclusive
          onChange={(_, v) => v && setDays(v)}
          size="small"
        >
          {RANGE_OPTIONS.map((o) => (
            <ToggleButton key={o.value} value={o.value}>
              {o.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {/* Summary chips */}
      {!loading && !error && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          {[
            { label: 'Total significance', value: totalSignificance },
            { label: 'Tasks completed', value: totalCompleted },
            { label: 'Active days', value: `${activeDays} / ${days}` },
          ].map((s) => (
            <Paper key={s.label} variant="outlined" sx={{ px: 2.5, py: 1.5, borderRadius: 2, minWidth: 140 }}>
              <Typography variant="h5" fontWeight="bold">{s.value}</Typography>
              <Typography variant="caption" color="text.secondary">{s.label}</Typography>
            </Paper>
          ))}
        </Box>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <Paper variant="outlined" sx={{ p: { xs: 1, sm: 3 }, borderRadius: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
            Significance per day
          </Typography>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(v) => formatDate(v, days)}
                angle={-45}
                textAnchor="end"
                tick={{ fontSize: 11 }}
                interval={days <= 7 ? 0 : days <= 30 ? 'preserveStartEnd' : Math.floor(days / 10)}
              />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                formatter={(value) => [value ?? 0, 'Significance']}
                labelFormatter={(label) => new Date(label + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
              />
              <Bar dataKey="significance" radius={[4, 4, 0, 0]} maxBarSize={48}>
                {data.map((entry) => (
                  <Cell key={entry.date} fill={getBarColor(entry.significance)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      )}
    </Container>
  );
}

