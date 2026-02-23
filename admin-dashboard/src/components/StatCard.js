import React from "react";
import { Paper, Typography, Box } from "@mui/material";

export default function StatCard({ title, value, hint }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 4,
        bgcolor: "background.paper",
        boxShadow: "0 10px 28px rgba(0,0,0,0.28)",
      }}
    >
      <Typography sx={{ fontSize: 12, opacity: 0.7, letterSpacing: 0.4 }}>
        {title}
      </Typography>

      <Box sx={{ mt: 0.7, display: "flex", alignItems: "baseline", gap: 1 }}>
        <Typography sx={{ fontSize: 34, fontWeight: 900, letterSpacing: -0.5 }}>
          {value}
        </Typography>
        {hint ? (
          <Typography sx={{ fontSize: 12, opacity: 0.6 }}>
            {hint}
          </Typography>
        ) : null}
      </Box>
    </Paper>
  );
}