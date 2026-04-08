'use client';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import { useColorMode } from '@/app/components/ColorModeContext';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import Tooltip from '@mui/material/Tooltip';

export default function AppBarComponent() {
    const { mode, toggleColorMode } = useColorMode();
    const { data: session } = useSession();

    return (
        <AppBar position="static">
            <Toolbar>
                <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    sx={{ mr: 2 }}
                >
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}>
                    Dashboard
                </Typography>
                {/* xs spacer so nav items stay right-aligned when title is hidden */}
                <Box sx={{ flexGrow: 1, display: { xs: 'block', sm: 'none' } }} />
                {/*<Button color="inherit" component={Link} href="/">*/}
                {/*    Home*/}
                {/*</Button>*/}
                <Button color="inherit" component={Link} href="/todo">
                    Todo
                </Button>
                <Button color="inherit" component={Link} href="/history">
                    History
                </Button>
                {/*<Button color="inherit" component={Link} href="/dashboard">*/}
                {/*    Dashboard*/}
                {/*</Button>*/}
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



