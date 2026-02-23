import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Paper,
  TextField,
  Typography,
  Button,
  Alert,
} from "@mui/material";
import ShieldIcon from "@mui/icons-material/Shield";

export default function Login({ setToken }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:8000/admin/login", {
        username,
        password,
      });

      localStorage.setItem("token", res.data.access_token);
      setToken(res.data.access_token);
    } catch (err) {
      setError("Invalid username or password.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "grid",
        placeItems: "center",
        px: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 460,
          borderRadius: 5,
          p: 3,
          boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ShieldIcon sx={{ color: "primary.main" }} />
          <Box>
            <Typography sx={{ fontSize: 12, opacity: 0.7, lineHeight: 1 }}>
              CounterScam
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
              Admin Login
            </Typography>
          </Box>
        </Box>

        <Typography sx={{ mt: 1.5, opacity: 0.7 }}>
          Sign in to view checks, analytics, and reports.
        </Typography>

        {error ? <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert> : null}

        <Box component="form" onSubmit={handleLogin} sx={{ mt: 2.5, display: "grid", gap: 1.6 }}>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
          />
          <TextField
            label="Password"
            value={password}
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{ mt: 0.5, borderRadius: 3, fontWeight: 900, py: 1.2 }}
          >
            Sign In
          </Button>
        </Box>

        <Typography sx={{ mt: 2, fontSize: 12, opacity: 0.6 }}>
          Tip: If you get logged out, your token expired — sign in again.
        </Typography>
      </Paper>
    </Box>
  );
}