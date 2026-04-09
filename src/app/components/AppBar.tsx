'use client';

import { useState } from 'react';
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
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useColorMode } from '@/app/components/ColorModeContext';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import Tooltip from '@mui/material/Tooltip';

export default function AppBarComponent() {
    const { mode, toggleColorMode } = useColorMode();
    const { data: session } = useSession();
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

    return (
        <AppBar position="static">
            <Toolbar>
                <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    sx={{ mr: 2 }}
                    onClick={(e) => setMenuAnchor(e.currentTarget)}
                >
                    <MenuIcon />
                </IconButton>
                <Menu
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={() => setMenuAnchor(null)}
                    slotProps={{ paper: { sx: { minWidth: 180 } } }}
                >
                    <MenuItem component={Link} href="/" onClick={() => setMenuAnchor(null)}>
                        <ListItemIcon><HomeIcon fontSize="small" /></ListItemIcon>
                        Home
                    </MenuItem>
                    <Divider />
                    <MenuItem component={Link} href="/login" onClick={() => setMenuAnchor(null)}>
                        <ListItemIcon><LoginIcon fontSize="small" /></ListItemIcon>
                        Sign In
                    </MenuItem>
                    <MenuItem component={Link} href="/register" onClick={() => setMenuAnchor(null)}>
                        <ListItemIcon><PersonAddIcon fontSize="small" /></ListItemIcon>
                        Register
                    </MenuItem>
                </Menu>

                <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}>
                </Typography>
                <Box sx={{ flexGrow: 1, display: { xs: 'block', sm: 'none' } }} />
                {session?.user && (
                    <>
                        <Button color="inherit" component={Link} href="/todo">
                            Todo
                        </Button>
                        <Button color="inherit" component={Link} href="/history">
                            History
                        </Button>
                    </>
                )}
                <IconButton color="inherit" onClick={toggleColorMode} aria-label="toggle theme">
                    {mode === 'dark' ? <DarkModeIcon /> : <LightModeIcon />}
                </IconButton>
                {session?.user && (
                    <>
                        <Typography variant="body2" sx={{ ml: 1, mr: 0.5, opacity: 0.85, display: { xs: 'none', sm: 'block' } }}>
                            {session.user.name ?? session.user.email}
                        </Typography>
                        <Tooltip title="Sign out">
                            <IconButton
                                color="inherit"
                                onClick={() => signOut({ callbackUrl: '/login' })}
                                aria-label="sign out"
                            >
                                <LogoutIcon />
                            </IconButton>
                        </Tooltip>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
}

