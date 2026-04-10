'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

interface SphereEntry {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  rating: number;
}

const defaultSpheres: SphereEntry[] = [];   // replaced by locale-aware list inside component


function getRatingColor(r: number): 'error' | 'warning' | 'success' {
  if (r <= 3) return 'error';
  if (r <= 6) return 'warning';
  return 'success';
}

export default function SpheresRater() {
  const t = useTranslations('SpheresRater');

  const defaultSpheres: SphereEntry[] = [
    { id: '1', emoji: '💼', title: t('sphere1Title'), desc: t('sphere1Desc'), rating: 5 },
    { id: '2', emoji: '💰', title: t('sphere2Title'), desc: t('sphere2Desc'), rating: 5 },
    { id: '3', emoji: '❤️', title: t('sphere3Title'), desc: t('sphere3Desc'), rating: 5 },
    { id: '4', emoji: '👨‍👩‍👧', title: t('sphere4Title'), desc: t('sphere4Desc'), rating: 5 },
    { id: '5', emoji: '🧠', title: t('sphere5Title'), desc: t('sphere5Desc'), rating: 5 },
    { id: '6', emoji: '🎮', title: t('sphere6Title'), desc: t('sphere6Desc'), rating: 5 },
    { id: '7', emoji: '🏡', title: t('sphere7Title'), desc: t('sphere7Desc'), rating: 5 },
    { id: '8', emoji: '🌿', title: t('sphere8Title'), desc: t('sphere8Desc'), rating: 5 },
  ];

  const [spheres, setSpheres] = useState<SphereEntry[]>(defaultSpheres);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Persist ratings/titles to localStorage so the register page can use them
  useEffect(() => {
    localStorage.setItem(
      'pendingSphereRatings',
      JSON.stringify(spheres.map((s) => ({ id: s.id, name: s.title, rating: s.rating }))),
    );
  }, [spheres]);

  const startEdit = (sphere: SphereEntry) => {
    setEditingId(sphere.id);
    setEditValue(sphere.title);
  };

  const saveEdit = (id: string) => {
    const trimmed = editValue.trim();
    if (trimmed) {
      setSpheres((prev) => prev.map((s) => (s.id === id ? { ...s, title: trimmed } : s)));
    }
    setEditingId(null);
  };

  const cancelEdit = () => setEditingId(null);

  const changeRating = (id: string, delta: number) => {
    setSpheres((prev) =>
      prev.map((s) => (s.id === id ? { ...s, rating: Math.min(10, Math.max(1, s.rating + delta)) } : s)),
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {spheres.map((sphere) => {
          const color = getRatingColor(sphere.rating);
          const isEditing = editingId === sphere.id;
          const isHovered = hoveredId === sphere.id;

          return (
            <Box
              key={sphere.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2,
                py: 1,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              {/* Emoji */}
              <Typography sx={{ fontSize: '1.4rem', lineHeight: 1, flexShrink: 0 }}>
                {sphere.emoji}
              </Typography>

              {/* Editable title */}
              {isEditing ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexGrow: 1 }}>
                  <TextField
                    size="small"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(sphere.id);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    autoFocus
                    sx={{ flexGrow: 1 }}
                  />
                  <IconButton size="small" color="primary" onClick={() => saveEdit(sphere.id)}>
                    <CheckIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={cancelEdit}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <Box
                  sx={{ flexGrow: 1, minWidth: 0 }}
                  onMouseEnter={() => setHoveredId(sphere.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography
                      variant="body1"
                      fontWeight="medium"
                      sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {sphere.title}
                    </Typography>
                    <Tooltip title={t('rename')}>
                      <IconButton
                        size="small"
                        onClick={() => startEdit(sphere)}
                        sx={{ visibility: isHovered ? 'visible' : 'hidden', flexShrink: 0 }}
                      >
                        <EditIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {sphere.desc}
                  </Typography>
                </Box>
              )}

              {/* Rating control */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, flexShrink: 0 }}>
                <IconButton
                  size="small"
                  disabled={sphere.rating <= 1}
                  color={color}
                  onClick={() => changeRating(sphere.id, -1)}
                >
                  <RemoveIcon sx={{ fontSize: 18 }} />
                </IconButton>
                <Chip
                  label={`${sphere.rating}/10`}
                  color={color}
                  size="small"
                  variant="outlined"
                  sx={{ minWidth: 52, fontWeight: 'bold' }}
                />
                <IconButton
                  size="small"
                  disabled={sphere.rating >= 10}
                  color={color}
                  onClick={() => changeRating(sphere.id, 1)}
                >
                  <AddIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
