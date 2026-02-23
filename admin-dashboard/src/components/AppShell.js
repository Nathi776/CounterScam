import React from "react";
import {
  Box,
  Drawer,
  Toolbar,
  AppBar,
  Typography,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import LinkIcon from "@mui/icons-material/Link";
import TimelineIcon from "@mui/icons-material/Timeline";
import LogoutIcon from "@mui/icons-material/Logout";
import RefreshIcon from "@mui/icons-material/Refresh";
import ShieldIcon from "@mui/icons-material/Shield";

const drawerWidth = 260;

export default function AppShell({ title, onRefresh, onLogout, children }) {
  const nav = [
    { label: "Overview", icon: <DashboardIcon />, target: "overview" },
    { label: "Recent checks", icon: <LinkIcon />, target: "recent" },
    { label: "Analytics", icon: <TimelineIcon />, target: "analytics" },
  ];

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          bgcolor: "background.paper",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ShieldIcon sx={{ color: "primary.main" }} />
            <Box>
              <Typography sx={{ fontSize: 12, opacity: 0.7, lineHeight: 1 }}>
                CounterScam
              </Typography>
              <Typography sx={{ fontWeight: 900, lineHeight: 1.1 }}>
                {title}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title="Refresh">
              <IconButton onClick={onRefresh}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Logout">
              <IconButton onClick={onLogout}>
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            bgcolor: "background.paper",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ px: 1.5, pt: 1.5 }}>
          <List>
            {nav.map((n) => (
              <ListItemButton
                key={n.target}
                onClick={() => scrollTo(n.target)}
                sx={{
                  borderRadius: 3,
                  mb: 0.5,
                  "&.Mui-selected, &:hover": {
                    bgcolor: "rgba(124,58,237,0.12)",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{n.icon}</ListItemIcon>
                <ListItemText primary={n.label} />
              </ListItemButton>
            ))}
          </List>

          <Box sx={{ mt: 2, p: 2, borderRadius: 4, bgcolor: "rgba(255,255,255,0.04)" }}>
            <Typography sx={{ fontWeight: 800, fontSize: 13 }}>Tip</Typography>
            <Typography sx={{ fontSize: 12, opacity: 0.75, mt: 0.5 }}>
              Run a few URL checks to see your charts and recent history update.
            </Typography>
          </Box>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1 }}>
        <Toolbar />
        <Box sx={{ px: 3, py: 3, maxWidth: 1200 }}>{children}</Box>
      </Box>
    </Box>
  );
}