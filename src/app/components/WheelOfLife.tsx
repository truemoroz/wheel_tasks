'use client';
import { useMemo } from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { LifeSphereGroup } from '@/app/types/todo';

interface WheelOfLifeProps {
  spheres: LifeSphereGroup[];
}

const SIZE = 360;
const CENTER = SIZE / 2;
const MAX_RADIUS = CENTER - 48; // leave room for labels
const LEVELS = 10;


function polarToCartesian(angleDeg: number, radius: number): [number, number] {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [CENTER + radius * Math.cos(rad), CENTER + radius * Math.sin(rad)];
}

export default function WheelOfLife({ spheres }: WheelOfLifeProps) {
  const theme = useTheme();
  const count = spheres.length;

  const sliceAngle = 360 / (count || 1);

  const sliceColors = useMemo(
    () => [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.error.main,
      theme.palette.warning.main,
      theme.palette.success.main,
      theme.palette.info.main,
      theme.palette.primary.dark,
      theme.palette.secondary.dark,
    ],
    [theme],
  );

  const segments = useMemo(() => {
    return spheres.map((sphere, i) => {
      const startAngle = i * sliceAngle;
      const endAngle = (i + 1) * sliceAngle;
      const r = (sphere.rating / LEVELS) * MAX_RADIUS;

      const [x1, y1] = polarToCartesian(startAngle, r);
      const [x2, y2] = polarToCartesian(endAngle, r);

      const largeArc = sliceAngle > 180 ? 1 : 0;

      // Pie-slice path: move to center, line to arc start, arc to arc end, back to center
      const d = [
        `M ${CENTER} ${CENTER}`,
        `L ${x1} ${y1}`,
        `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
        'Z',
      ].join(' ');

      return { d, color: sliceColors[i % sliceColors.length], sphere };
    });
  }, [spheres, sliceAngle, sliceColors]);

  const rings = useMemo(
    () => Array.from({ length: LEVELS }, (_, i) => ((i + 1) / LEVELS) * MAX_RADIUS),
    [],
  );

  const spokes = useMemo(
    () =>
      spheres.map((_, i) => {
        const [x, y] = polarToCartesian(i * sliceAngle, MAX_RADIUS);
        return { x, y };
      }),
    [spheres, sliceAngle],
  );

  const labels = useMemo(
    () =>
      spheres.map((sphere, i) => {
        const midAngle = (i + 0.5) * sliceAngle;
        const [x, y] = polarToCartesian(midAngle, MAX_RADIUS + 22);
        return { x, y, name: sphere.name, rating: sphere.rating };
      }),
    [spheres, sliceAngle],
  );

  const isDark = theme.palette.mode === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';
  const spokeColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)';
  const textColor = theme.palette.text.primary;

  if (count === 0) return null;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Box sx={{ textAlign: 'center' }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ display: 'block' }}>
          {/* Background circle */}
          <circle
            cx={CENTER} cy={CENTER} r={MAX_RADIUS}
            fill={isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'}
            stroke={gridColor} strokeWidth={1}
          />
          {/* Grid rings */}
          {rings.map((r, i) => (
            <circle key={i} cx={CENTER} cy={CENTER} r={r} fill="none" stroke={gridColor} strokeWidth={1} />
          ))}
          {/* Spokes */}
          {spokes.map((pt, i) => (
            <line key={i} x1={CENTER} y1={CENTER} x2={pt.x} y2={pt.y} stroke={spokeColor} strokeWidth={1} />
          ))}
          {/* Filled rating segments */}
          {segments.map(({ d, color }, i) => (
            <path key={i} d={d} fill={color} fillOpacity={0.55} stroke={color} strokeWidth={1} strokeOpacity={0.9} />
          ))}
          {/* Labels */}
          {labels.map(({ x, y, name, rating }, i) => {
            const midAngle = (i + 0.5) * sliceAngle;
            const anchor =
              Math.abs(midAngle - 90) < 20 || Math.abs(midAngle - 270) < 20
                ? 'middle'
                : midAngle < 180
                ? 'start'
                : 'end';
            return (
              <g key={i}>
                <text x={x} y={y - 5} textAnchor={anchor} fontSize={10} fontWeight={600} fill={textColor} fontFamily={theme.typography.fontFamily}>
                  {name}
                </text>
                <text x={x} y={y + 8} textAnchor={anchor} fontSize={9} fill={sliceColors[i % sliceColors.length]} fontFamily={theme.typography.fontFamily} fontWeight={700}>
                  {rating}/10
                </text>
              </g>
            );
          })}
        </svg>
      </Box>
    </Box>
  );
}

