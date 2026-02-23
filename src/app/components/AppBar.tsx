'use client';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useColorMode } from '@/app/components/ColorModeContext';
import Link from 'next/link';

export default function AppBarComponent() {
    const { mode, toggleColorMode } = useColorMode();

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
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Dashboard
                </Typography>
                <Button color="inherit" component={Link} href="/">
                    Home
                </Button>
                <Button color="inherit" component={Link} href="/todo">
                    Todo
                </Button>
                <Button color="inherit" component={Link} href="/dashboard">
                    Dashboard
                </Button>
                <IconButton color="inherit" onClick={toggleColorMode} aria-label="toggle theme">
                    {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
            </Toolbar>
        </AppBar>
    );
}

