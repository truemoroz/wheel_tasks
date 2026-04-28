'use client';
import { useMemo } from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { LifeSphereGroup } from '@/app/types/todo';

/** Maps rating 1–10 to a colour along red → yellow → green → blue → purple. */
export function ratingToColor(rating: number): string {
  // Stops: 1=red, 4=yellow, 6=green, 8=blue, 10=purple
  const stops: [number, [number, number, number]][] = [
    [1,  [220,  38,  38]],  // red-600
    [3,  [234, 179,   8]],  // yellow-500
    [5,  [ 34, 197,  94]],  // green-500
    [7,  [ 59, 130, 246]],  // blue-500
    [9, [168,  85, 247]],  // purple-500
  ];

  const clamped = Math.max(1, Math.min(10, rating));

  // Find the two surrounding stops
  let lo = stops[0], hi = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (clamped >= stops[i][0] && clamped <= stops[i + 1][0]) {
      lo = stops[i];
      hi = stops[i + 1];
      break;
    }
  }

  const t = (clamped - lo[0]) / (hi[0] - lo[0]);
  const r = Math.round(lo[1][0] + t * (hi[1][0] - lo[1][0]));
  const g = Math.round(lo[1][1] + t * (hi[1][1] - lo[1][1]));
  const b = Math.round(lo[1][2] + t * (hi[1][2] - lo[1][2]));
  return `rgb(${r},${g},${b})`;
}

interface WheelOfLifeProps {
  spheres: LifeSphereGroup[];
}

const SIZE = 400;
const PAD = 50; // extra viewBox padding so labels never overflow the SVG layout box
const CENTER = SIZE / 2;
const MAX_RADIUS = CENTER - 50; // leave room for labels (50 px clearance matches PAD)
const LEVELS = 10;

/** Split a sphere name into at most 2 balanced lines. */
function splitLabel(name: string): [string, string?] {
  if (name.length <= 11) return [name];
  const words = name.split(' ');
  if (words.length === 1) return [name];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
}


function polarToCartesian(angleDeg: number, radius: number): [number, number] {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [CENTER + radius * Math.cos(rad), CENTER + radius * Math.sin(rad)];
}

export default function WheelOfLife({ spheres }: WheelOfLifeProps) {
  const theme = useTheme();
  const count = spheres.length;

  const sliceAngle = 360 / (count || 1);

  const segments = useMemo(() => {
    return spheres.map((sphere, i) => {
      const radius = (sphere.rating / LEVELS) * MAX_RADIUS;
      const color  = ratingToColor(sphere.rating);
      const GAP_HALF = 2; // 2 px offset per side → 4 px total gap

      // Boundary spoke angles (our polar system: 0°=top, CW)
      const sBound = i * sliceAngle;           // start (CCW) boundary
      const eBound = (i + 1) * sliceAngle;     // end   (CW)  boundary
      const sRad = (sBound - 90) * Math.PI / 180;
      const eRad = (eBound - 90) * Math.PI / 180;

      // Spoke direction unit vectors
      const dsx = Math.cos(sRad), dsy = Math.sin(sRad);
      const dex = Math.cos(eRad), dey = Math.sin(eRad);

      // Perpendiculars pointing INTO the sector
      //  • start spoke → 90° CW on screen (y-down): (-y, x)
      //  • end   spoke → 90° CCW on screen:         ( y,-x)
      const psx = -dsy, psy = dsx;   // start perp toward interior
      const pex =  dey, pey = -dex;  // end   perp toward interior

      // Inner vertex: where the two offset lines meet (along mid-angle)
      const halfSpan = (sliceAngle / 2) * Math.PI / 180;
      const dInner   = GAP_HALF / Math.sin(halfSpan);
      const midAngle = sBound + sliceAngle / 2;
      const midRad   = (midAngle - 90) * Math.PI / 180;
      const ix = CENTER + dInner * Math.cos(midRad);
      const iy = CENTER + dInner * Math.sin(midRad);

      // Skip if the segment radius can't clear the inner vertex
      if (radius <= dInner + 1) return { d: '', color, sphere };

      // Outer vertices: offset spoke lines intersect the arc circle
      const tOuter = Math.sqrt(Math.max(0, radius * radius - GAP_HALF * GAP_HALF));
      const osx = CENTER + GAP_HALF * psx + tOuter * dsx;   // outer on start side
      const osy = CENTER + GAP_HALF * psy + tOuter * dsy;
      const oex = CENTER + GAP_HALF * pex + tOuter * dex;   // outer on end side
      const oey = CENTER + GAP_HALF * pey + tOuter * dey;

      // ── Corner rounding ─────────────────────────────────────────────────
      const edgeLenS = Math.hypot(osx - ix, osy - iy);
      const edgeLenE = Math.hypot(oex - ix, oey - iy);
      const cr = Math.min(8, edgeLenS * 0.25, edgeLenE * 0.25, radius * 0.15);

      // Unit vectors along edges: inner → outer
      const usx = (osx - ix) / edgeLenS, usy = (osy - iy) / edgeLenS;
      const uex = (oex - ix) / edgeLenE, uey = (oey - iy) / edgeLenE;

      // Points near inner vertex (cr away along each edge)
      const isx = ix + usx * cr, isy = iy + usy * cr;
      const iex = ix + uex * cr, iey = iy + uey * cr;

      // Points near outer corners (cr away along edge toward inner)
      const oisx = osx - usx * cr, oisy = osy - usy * cr;
      const oiex = oex - uex * cr, oiey = oey - uey * cr;

      // Points on the arc just past each outer corner (trim arc for rounding)
      const osAngle = Math.atan2(osy - CENTER, osx - CENTER) * 180 / Math.PI + 90;
      const oeAngle = Math.atan2(oey - CENTER, oex - CENTER) * 180 / Math.PI + 90;
      const crDeg   = (cr / radius) * (180 / Math.PI);
      const [a1x, a1y] = polarToCartesian(osAngle + crDeg, radius);
      const [a2x, a2y] = polarToCartesian(oeAngle - crDeg, radius);

      const arcSpan = ((oeAngle - osAngle) % 360 + 360) % 360;
      const largeArc = arcSpan > 180 ? 1 : 0;

      const d = [
        `M ${isx} ${isy}`,                                         // near inner, start side
        `L ${oisx} ${oisy}`,                                       // up start edge
        `Q ${osx} ${osy} ${a1x} ${a1y}`,                          // round outer-start corner
        `A ${radius} ${radius} 0 ${largeArc} 1 ${a2x} ${a2y}`,   // outer arc (CW = sweep 1)
        `Q ${oex} ${oey} ${oiex} ${oiey}`,                        // round outer-end corner
        `L ${iex} ${iey}`,                                         // down end edge
        `Q ${ix} ${iy} ${isx} ${isy}`,                            // round inner vertex
        'Z',
      ].join(' ');

      return { d, color, sphere };
    });
  }, [spheres, sliceAngle]);

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
        // Labels near top (≈0°) or bottom (≈180°) extend vertically — push them further out
        const normAngle = ((midAngle % 360) + 360) % 360;
        const nearTopOrBottom =
          normAngle < 45 || normAngle > 315 ||
          (normAngle > 135 && normAngle < 225);
        const offset = nearTopOrBottom ? 24 : 14;
        const [x, y] = polarToCartesian(midAngle, MAX_RADIUS + offset);
        return { x, y, name: sphere.name, rating: sphere.rating, color: ratingToColor(sphere.rating) };
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
      {/* maxWidth caps the chart; padding-top:100% is the only cross-browser reliable
          technique for preserving a 1:1 SVG aspect ratio inside overflow:auto containers */}
      <Box sx={{ width: '100%', maxWidth: SIZE }}>
        <Box sx={{ position: 'relative', paddingTop: '100%' }}>
          <Box sx={{ position: 'absolute', inset: 0 }}>
            <svg
              width="100%"
              height="100%"
              viewBox={`${-PAD} ${-PAD} ${SIZE + 2 * PAD} ${SIZE + 2 * PAD}`}
              style={{ display: 'block', overflow: 'hidden' }}
            >
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
          {labels.map(({ x, y, name, rating, color }, i) => {
            const midAngle = (i + 0.5) * sliceAngle;
            const anchor =
              Math.abs(midAngle - 90) < 20 || Math.abs(midAngle - 270) < 20
                ? 'middle'
                : midAngle < 180
                ? 'start'
                : 'end';
            const lines = splitLabel(name);
            const lineHeight = 16;
            const totalHeight = lines.length * lineHeight;
            const startY = y - totalHeight / 2 + 2;
            return (
              <g key={i}>
                {lines.map((line, li) => (
                  <text
                    key={li}
                    x={x}
                    y={startY + li * lineHeight}
                    textAnchor={anchor}
                    fontSize={14}
                    fontWeight={600}
                    fill={textColor}
                    fontFamily={theme.typography.fontFamily}
                  >
                    {line}
                  </text>
                ))}
                <text
                  x={x}
                  y={startY + lines.length * lineHeight + 2}
                  textAnchor={anchor}
                  fontSize={16}
                  fill={color}
                  fontFamily={theme.typography.fontFamily}
                  fontWeight={700}
                >
                  {rating}
                </text>
              </g>
            );
          })}
        </svg>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

