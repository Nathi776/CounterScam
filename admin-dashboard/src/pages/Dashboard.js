import React, { useEffect, useMemo, useState } from "react";
import { getStats, getRecentChecks, getAnalytics } from "../api/api";
import StatCard from "../components/StatCard";
import AppShell from "../components/AppShell";

import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Skeleton,
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

const verdictChip = (verdict) => {
  const v = (verdict || "").toLowerCase();
  if (v === "phishing") return { label: "phishing", color: "error" };
  if (v === "suspicious") return { label: "suspicious", color: "warning" };
  return { label: v || "safe", color: "success" };
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, recentRes, analyticsRes] = await Promise.all([
        getStats(),
        getRecentChecks(),
        getAnalytics(),
      ]);

      setStats(statsRes.data);
      setRecent(Array.isArray(recentRes.data) ? recentRes.data : []);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  const attackTrend = useMemo(() => {
    const trend = analytics?.attack_trend || [];
    return {
      labels: trend.map((t) => t.date),
      datasets: [{ label: "Checks", data: trend.map((t) => t.count) }],
    };
  }, [analytics]);

  const pieData = useMemo(() => {
    return {
      labels: ["Phishing", "Safe"],
      datasets: [{ data: [stats?.phishing_detected || 0, stats?.safe || 0] }],
    };
  }, [stats]);

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  return (
    <AppShell title="Admin Dashboard" onRefresh={loadData} onLogout={logout}>
      {/* OVERVIEW */}
      <Box id="overview" sx={{ mb: 2 }}>
        <Typography variant="h4">Security Overview</Typography>
        <Typography sx={{ opacity: 0.7, mt: 0.5 }}>
          Live stats from CounterScam checks.
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={3}>
          {loading ? (
            <Skeleton variant="rounded" height={110} />
          ) : (
            <StatCard title="Total checks" value={stats.total_checks} />
          )}
        </Grid>

        <Grid item xs={12} md={3}>
          {loading ? (
            <Skeleton variant="rounded" height={110} />
          ) : (
            <StatCard title="Phishing detected" value={stats.phishing_detected} />
          )}
        </Grid>

        <Grid item xs={12} md={3}>
          {loading ? (
            <Skeleton variant="rounded" height={110} />
          ) : (
            <StatCard title="Safe" value={stats.safe} />
          )}
        </Grid>

        <Grid item xs={12} md={3}>
          {loading ? (
            <Skeleton variant="rounded" height={110} />
          ) : (
            <StatCard
              title="Flag rate"
              value={
                stats.total_checks
                  ? `${Math.round((stats.phishing_detected / stats.total_checks) * 100)}%`
                  : "0%"
              }
              hint="phishing/total"
            />
          )}
        </Grid>
      </Grid>

      {/* RECENT TABLE */}
      <Paper id="recent" sx={{ mt: 3, p: 2.5, borderRadius: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: 16 }}>Recent checks</Typography>
            <Typography sx={{ fontSize: 12, opacity: 0.7 }}>
              Latest scans (URLs & messages)
            </Typography>
          </Box>

          <Chip
            label={`${recent.length} items`}
            variant="outlined"
            sx={{ borderColor: "rgba(255,255,255,0.14)" }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {loading ? (
          <Box sx={{ display: "grid", gap: 1 }}>
            <Skeleton variant="rounded" height={44} />
            <Skeleton variant="rounded" height={44} />
            <Skeleton variant="rounded" height={44} />
          </Box>
        ) : recent.length === 0 ? (
          <Typography sx={{ opacity: 0.7 }}>
            No checks yet. Submit a few URL checks to populate this table.
          </Typography>
        ) : (
          <TableContainer sx={{ borderRadius: 3 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell width={160}>Time</TableCell>
                  <TableCell width={110}>Type</TableCell>
                  <TableCell width={140}>Verdict</TableCell>
                  <TableCell width={80}>Risk</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell width={56} align="right"></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {recent.map((r) => {
                  const vc = verdictChip(r.verdict);
                  return (
                    <TableRow
                      key={r.id}
                      hover
                      sx={{
                        "&:hover": { bgcolor: "rgba(255,255,255,0.03)" },
                      }}
                    >
                      <TableCell sx={{ fontSize: 12, opacity: 0.75 }}>
                        {r.created_at ? new Date(r.created_at).toLocaleString() : "-"}
                      </TableCell>

                      <TableCell sx={{ textTransform: "uppercase", fontSize: 11, opacity: 0.8 }}>
                        {r.type || "url"}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={vc.label}
                          color={vc.color}
                          size="small"
                          sx={{ fontWeight: 900, textTransform: "capitalize" }}
                        />
                      </TableCell>

                      <TableCell sx={{ fontWeight: 800 }}>
                        {typeof r.risk_score === "number" ? r.risk_score : "-"}
                      </TableCell>

                      <TableCell
                        sx={{
                          maxWidth: 520,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontSize: 13,
                        }}
                        title={r.value || r.url || ""}
                      >
                        {r.value || r.url || "-"}
                      </TableCell>

                      <TableCell align="right">
                        <Tooltip title="Copy">
                          <IconButton
                            size="small"
                            onClick={() => copyText(r.value || r.url || "")}
                          >
                            <ContentCopyIcon fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* ANALYTICS */}
      <Grid id="analytics" container spacing={2.5} sx={{ mt: 0.5 }}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ mt: 3, p: 2.5, borderRadius: 4 }}>
            <Typography sx={{ fontWeight: 900, fontSize: 16 }}>Attack trend</Typography>
            <Typography sx={{ fontSize: 12, opacity: 0.7, mb: 2 }}>
              Checks per day (last 7 days)
            </Typography>

            {loading ? (
              <Skeleton variant="rounded" height={280} />
            ) : (
              <Bar
                data={attackTrend}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { grid: { display: false } },
                    y: { grid: { color: "rgba(255,255,255,0.06)" } },
                  },
                }}
              />
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper sx={{ mt: 3, p: 2.5, borderRadius: 4 }}>
            <Typography sx={{ fontWeight: 900, fontSize: 16 }}>
              Phishing vs Safe
            </Typography>
            <Typography sx={{ fontSize: 12, opacity: 0.7, mb: 2 }}>
              Overall distribution
            </Typography>

            {loading ? (
              <Skeleton variant="rounded" height={280} />
            ) : (
              <Pie
                data={pieData}
                options={{
                  responsive: true,
                  plugins: { legend: { position: "bottom" } },
                }}
              />
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* TOP DOMAINS */}
      <Paper sx={{ mt: 3, p: 2.5, borderRadius: 4 }}>
        <Typography sx={{ fontWeight: 900, fontSize: 16 }}>
          Most targeted domains
        </Typography>
        <Typography sx={{ fontSize: 12, opacity: 0.7, mb: 2 }}>
          Based on flagged activity
        </Typography>

        {loading ? (
          <Box sx={{ display: "grid", gap: 1 }}>
            <Skeleton variant="rounded" height={34} />
            <Skeleton variant="rounded" height={34} />
            <Skeleton variant="rounded" height={34} />
          </Box>
        ) : (analytics?.top_domains || []).length === 0 ? (
          <Typography sx={{ opacity: 0.7 }}>No targeted domains yet.</Typography>
        ) : (
          <Box sx={{ display: "grid", gap: 1 }}>
            {analytics.top_domains.map((d, i) => (
              <Paper
                key={i}
                sx={{
                  p: 1.6,
                  borderRadius: 3,
                  bgcolor: "rgba(255,255,255,0.03)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography sx={{ fontWeight: 800 }}>{d.domain}</Typography>
                <Chip label={`${d.count} attacks`} size="small" />
              </Paper>
            ))}
          </Box>
        )}
      </Paper>
    </AppShell>
  );
}