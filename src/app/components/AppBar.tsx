'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter, Link } from '@/i18n/navigation';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import { useColorMode } from '@/app/components/ColorModeContext';
import { useSession, signOut } from 'next-auth/react';
import Tooltip from '@mui/material/Tooltip';

export default function AppBarComponent() {
    const t = useTranslations('AppBar');
    const { mode, toggleColorMode } = useColorMode();
    const { data: session } = useSession();
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const handleLocaleChange = (_: React.MouseEvent, newLocale: string | null) => {
        if (newLocale && newLocale !== locale) {
            router.replace(pathname, { locale: newLocale });
        }
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <IconButton
                    size="large" edge="start" color="inherit" aria-label="menu"
                    sx={{ mr: 2 }} onClick={(e) => setMenuAnchor(e.currentTarget)}
                >
                    <MenuIcon />
                </IconButton>
                <Menu
                    anchorEl={menuAnchor} open={Boolean(menuAnchor)}
                    onClose={() => setMenuAnchor(null)}
                    slotProps={{ paper: { sx: { minWidth: 180 } } }}
                >
                    <MenuItem component={Link} href="/" onClick={() => setMenuAnchor(null)}>
                        <ListItemIcon><HomeIcon fontSize="small" /></ListItemIcon>
                        {t('home')}
                    </MenuItem>
                    <Divider />
                    <MenuItem component={Link} href="/login" onClick={() => setMenuAnchor(null)}>
                        <ListItemIcon><LoginIcon fontSize="small" /></ListItemIcon>
                        {t('signIn')}
                    </MenuItem>
                    <MenuItem component={Link} href="/register" onClick={() => setMenuAnchor(null)}>
                        <ListItemIcon><PersonAddIcon fontSize="small" /></ListItemIcon>
                        {t('register')}
                    </MenuItem>
                    <Divider />
                    <MenuItem component={Link} href="/changelog" onClick={() => setMenuAnchor(null)}>
                        <ListItemIcon><HistoryEduIcon fontSize="small" /></ListItemIcon>
                        {t('releaseHistory')}
                    </MenuItem>
                </Menu>

                <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }} />
                <Box sx={{ flexGrow: 1, display: { xs: 'block', sm: 'none' } }} />

                {session?.user && (
                    <>
                        <Button color="inherit" component={Link} href="/todo">{t('todo')}</Button>
                        <Button color="inherit" component={Link} href="/history">{t('history')}</Button>
                    </>
                )}

                {/* Language switcher */}
                <ToggleButtonGroup
                    value={locale}
                    exclusive
                    onChange={handleLocaleChange}
                    size="small"
                    sx={{ mx: 1, '& .MuiToggleButton-root': { color: 'inherit', borderColor: 'rgba(255,255,255,0.4)', py: 0.25, px: 1, fontSize: '0.75rem' }, '& .Mui-selected': { bgcolor: 'rgba(255,255,255,0.2) !important', color: 'inherit' } }}
                >
                    <ToggleButton value="en">EN</ToggleButton>
                    <ToggleButton value="ru">RU</ToggleButton>
                </ToggleButtonGroup>

                <IconButton color="inherit" onClick={toggleColorMode} aria-label="toggle theme">
                    {mode === 'dark' ? <DarkModeIcon /> : <LightModeIcon />}
                </IconButton>

                {session?.user && (
                    <>
                        <Typography variant="body2" sx={{ ml: 1, mr: 0.5, opacity: 0.85, display: { xs: 'none', sm: 'block' } }}>
                            {session.user.name ?? session.user.email}
                        </Typography>
                        <Tooltip title={t('signOut')}>
                            <IconButton color="inherit" onClick={() => signOut({ callbackUrl: '/login' })} aria-label="sign out">
                                <LogoutIcon />
                            </IconButton>
                        </Tooltip>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
}
