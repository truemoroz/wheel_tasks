'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  NodeProps,
  Node,
  Edge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { useTheme } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { LifeSphereGroup, Task } from '@/app/types/todo';
import { ratingToColor } from '@/app/components/WheelOfLife';

/* ─── node data types ─────────────────────────────────────── */
interface SphereNodeData extends Record<string, unknown> {
  kind: 'sphere';
  sphereId: string;
  label: string;
  rating: number;
  collapsed: boolean;
  side: 'left' | 'right';
  onToggle: (id: string) => void;
}
interface TaskNodeData extends Record<string, unknown> {
  kind: 'task';
  taskId: string;
  label: string;
  completed: boolean;
  hasChildren: boolean;
  collapsed: boolean;
  depth: number;
  side: 'left' | 'right';
  onToggle: (id: string) => void;
}

/* ─── custom nodes ────────────────────────────────────────── */
function RootNode() {
  return (
    <>
      <Handle type="source" position={Position.Right} id="right" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Left} id="left" style={{ opacity: 0 }} />
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          borderRadius: 3,
          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          color: '#fff',
          fontWeight: 700,
          fontSize: 15,
          boxShadow: '0 4px 18px rgba(99,102,241,0.45)',
          userSelect: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        My Life
      </Box>
    </>
  );
}

function SphereNode({ data }: NodeProps) {
  const d = data as unknown as SphereNodeData;
  const color = ratingToColor(d.rating);
  const isLeft = d.side === 'left';
  return (
    <>
      <Handle type="target" position={isLeft ? Position.Right : Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={isLeft ? Position.Left : Position.Right} style={{ opacity: 0 }} />
      <Box
        onClick={() => d.onToggle(d.sphereId)}
        sx={{
          px: 1.8,
          py: 1,
          borderRadius: 2.5,
          bgcolor: color,
          color: '#fff',
          cursor: 'pointer',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 0.8,
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          '&:hover': { filter: 'brightness(1.1)' },
          minWidth: 120,
          maxWidth: 200,
        }}
      >
        <Typography sx={{ fontWeight: 600, fontSize: 13, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#fff' }}>
          {d.label}
        </Typography>
        <Chip label={d.rating} size="small" sx={{ bgcolor: 'rgba(0,0,0,0.25)', color: '#fff', height: 18, fontSize: 11, '& .MuiChip-label': { px: 0.8 } }} />
        {d.collapsed ? <ChevronRightIcon sx={{ fontSize: 16, opacity: 0.9 }} /> : <ExpandMoreIcon sx={{ fontSize: 16, opacity: 0.9 }} />}
      </Box>
    </>
  );
}

function TaskNode({ data }: NodeProps) {
  const d = data as unknown as TaskNodeData;
  const depthColors = ['#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981'];
  const color = depthColors[Math.min(d.depth, depthColors.length - 1)];
  const isLeft = d.side === 'left';
  return (
    <>
      <Handle type="target" position={isLeft ? Position.Right : Position.Left} style={{ opacity: 0 }} />
      {d.hasChildren && (
        <Handle type="source" position={isLeft ? Position.Left : Position.Right} style={{ opacity: 0 }} />
      )}
      <Box
        onClick={d.hasChildren ? () => d.onToggle(d.taskId) : undefined}
        sx={{
          px: 1.5,
          py: 0.7,
          borderRadius: 2,
          border: `2px solid ${color}`,
          bgcolor: d.completed ? 'rgba(0,0,0,0.04)' : 'background.paper',
          cursor: d.hasChildren ? 'pointer' : 'default',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 0.7,
          minWidth: 100,
          maxWidth: 220,
          '&:hover': d.hasChildren ? { bgcolor: `${color}18` } : {},
        }}
      >
        {d.completed
          ? <CheckCircleIcon sx={{ fontSize: 15, color: 'success.main', flexShrink: 0 }} />
          : <RadioButtonUncheckedIcon sx={{ fontSize: 15, color, flexShrink: 0 }} />
        }
        <Typography sx={{ fontSize: 12, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: d.completed ? 'line-through' : 'none', opacity: d.completed ? 0.55 : 1 }}>
          {d.label}
        </Typography>
        {d.hasChildren && (
          d.collapsed
            ? <ChevronRightIcon sx={{ fontSize: 14, color, flexShrink: 0 }} />
            : <ExpandMoreIcon sx={{ fontSize: 14, color, flexShrink: 0 }} />
        )}
      </Box>
    </>
  );
}

const nodeTypes = { root: RootNode, sphere: SphereNode, task: TaskNode };

/* ─── layout helpers ──────────────────────────────────────── */
const SPHERE_X = 220;
const TASK_BASE_X = 460;
const TASK_STEP_X = 240;
const V_GAP = 52;

function countVisibleTaskRows(tasks: Task[], collapsedTasks: Set<string>): number {
  let count = 0;
  for (const t of tasks) {
    count += 1;
    if (!collapsedTasks.has(t.id) && t.subtasks?.length) {
      count += countVisibleTaskRows(t.subtasks, collapsedTasks);
    }
  }
  return count;
}

function addTaskNodes(
  nodes: Node[],
  edges: Edge[],
  tasks: Task[],
  sphereId: string,
  parentTaskId: string | null,
  depth: number,
  rowStart: number,
  collapsedTasks: Set<string>,
  onToggleTask: (id: string) => void,
  graphHeight: number,
  side: 'left' | 'right',
): { rows: number } {
  const xSign = side === 'left' ? -1 : 1;
  let rowCursor = rowStart;
  for (const task of tasks) {
    const hasChildren = (task.subtasks?.length ?? 0) > 0;
    const isCollapsed = collapsedTasks.has(task.id);
    const childRows = (!isCollapsed && hasChildren)
      ? countVisibleTaskRows(task.subtasks, collapsedTasks)
      : 0;
    const actualRowSpan = hasChildren && !isCollapsed ? childRows : 1;
    const nodeY = (rowCursor + actualRowSpan / 2 - 0.5) * V_GAP - graphHeight / 2;
    const nodeX = xSign * (TASK_BASE_X + depth * TASK_STEP_X);

    const nodeId = `task-${task.id}`;
    nodes.push({
      id: nodeId,
      type: 'task',
      position: { x: nodeX, y: nodeY },
      data: {
        kind: 'task',
        taskId: task.id,
        label: task.title,
        completed: task.completed,
        hasChildren,
        collapsed: isCollapsed,
        depth,
        side,
        onToggle: onToggleTask,
      } as unknown as Record<string, unknown>,
    });

    const sourceId = parentTaskId ? `task-${parentTaskId}` : `sphere-${sphereId}`;
    edges.push({
      id: `e-${sourceId}-${nodeId}`,
      source: sourceId,
      target: nodeId,
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed, width: 10, height: 10 },
      style: { strokeWidth: 1.5, stroke: '#94a3b8' },
    });

    if (!isCollapsed && hasChildren) {
      addTaskNodes(nodes, edges, task.subtasks, sphereId, task.id, depth + 1, rowCursor, collapsedTasks, onToggleTask, graphHeight, side);
      rowCursor += childRows;
    } else {
      rowCursor += 1;
    }
  }
  return { rows: rowCursor - rowStart };
}

/** Collect all visible nodes/edges from data + collapsed state */
function buildGraph(
  spheres: LifeSphereGroup[],
  collapsedSpheres: Set<string>,
  collapsedTasks: Set<string>,
  onToggleSphere: (id: string) => void,
  onToggleTask: (id: string) => void,
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const half = Math.ceil(spheres.length / 2);
  const leftSpheres = spheres.slice(0, half);
  const rightSpheres = spheres.slice(half);

  // Count rows per side independently so each side is centred around root
  const countRows = (list: LifeSphereGroup[]) =>
    list.reduce((acc, s) => {
      if (!collapsedSpheres.has(s.id)) {
        return acc + Math.max(1, countVisibleTaskRows(s.tasks, collapsedTasks));
      }
      return acc + 1;
    }, 0);

  const leftRows = countRows(leftSpheres);
  const rightRows = countRows(rightSpheres);
  const leftHeight = leftRows * V_GAP;
  const rightHeight = rightRows * V_GAP;
  // Place root at centre
  nodes.push({
    id: 'root', type: 'root',
    position: { x: 0, y: -V_GAP / 2 },
    data: { kind: 'root' },
  });

  const placeSide = (list: LifeSphereGroup[], side: 'left' | 'right', sideHeight: number) => {
    const xSign = side === 'left' ? -1 : 1;
    let rowCursor = 0;
    for (const sphere of list) {
      const isCollapsed = collapsedSpheres.has(sphere.id);
      const taskRows = isCollapsed ? 0 : countVisibleTaskRows(sphere.tasks, collapsedTasks);
      const sphereRowSpan = Math.max(1, isCollapsed ? 1 : taskRows);
      const sphereY = (rowCursor + sphereRowSpan / 2 - 0.5) * V_GAP - sideHeight / 2;

      nodes.push({
        id: `sphere-${sphere.id}`,
        type: 'sphere',
        position: { x: xSign * SPHERE_X, y: sphereY },
        data: {
          kind: 'sphere',
          sphereId: sphere.id,
          label: sphere.name,
          rating: sphere.rating,
          collapsed: isCollapsed,
          side,
          onToggle: onToggleSphere,
        } as unknown as Record<string, unknown>,
      });
      edges.push({
        id: `e-root-${sphere.id}`,
        source: 'root',
        sourceHandle: side,
        target: `sphere-${sphere.id}`,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12 },
        style: { strokeWidth: 2, stroke: ratingToColor(sphere.rating) },
      });

      if (!isCollapsed) {
        addTaskNodes(nodes, edges, sphere.tasks, sphere.id, null, 0, rowCursor, collapsedTasks, onToggleTask, sideHeight, side);
        rowCursor += Math.max(1, taskRows);
      } else {
        rowCursor += 1;
      }
    }
  };

  placeSide(leftSpheres, 'left', leftHeight);
  placeSide(rightSpheres, 'right', rightHeight);

  return { nodes, edges };
}

/* ─── main component ──────────────────────────────────────── */
export default function TaskGraph() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [spheres, setSpheres] = useState<LifeSphereGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsedSpheres, setCollapsedSpheres] = useState<Set<string>>(new Set());
  const [collapsedTasks, setCollapsedTasks] = useState<Set<string>>(new Set());
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    fetch('/api/spheres')
      .then((r) => r.json())
      .then((data: LifeSphereGroup[]) => { setSpheres(data); setLoading(false); })
      .catch(() => { setError('Failed to load spheres.'); setLoading(false); });
  }, []);

  const onToggleSphere = useCallback((id: string) => {
    setCollapsedSpheres((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }, []);

  const onToggleTask = useCallback((id: string) => {
    setCollapsedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }, []);

  // Rebuild graph whenever data or collapsed state changes
  useEffect(() => {
    if (!spheres.length) return;
    const { nodes: n, edges: e } = buildGraph(spheres, collapsedSpheres, collapsedTasks, onToggleSphere, onToggleTask);
    setNodes(n);
    setEdges(e);
  }, [spheres, collapsedSpheres, collapsedTasks, onToggleSphere, onToggleTask, setNodes, setEdges]);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <CircularProgress />
    </Box>
  );
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ width: '100%', height: '100%', bgcolor: isDark ? '#0f172a' : '#f8fafc' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background color={isDark ? '#334155' : '#cbd5e1'} gap={24} size={1} />
        <Controls />
        <MiniMap
          nodeColor={(n) => {
            const d = n.data as Record<string, unknown>;
            if (d.kind === 'root') return '#6366f1';
            if (d.kind === 'sphere') return ratingToColor((d as unknown as SphereNodeData).rating);
            return '#3b82f6';
          }}
          style={{ background: isDark ? '#1e293b' : '#e2e8f0' }}
        />
      </ReactFlow>
    </Box>
  );
}

