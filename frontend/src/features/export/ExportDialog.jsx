import { useEffect, useState } from "react";
import {
  AccessTime,
  CheckCircle,
  Close,
  Download,
  MenuBook,
  Print,
  School,
  TableChart,
  Upcoming,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { API_URL, authFetch } from "../../utils/api";

export default function ExportDialog({ open, onClose }) {
  const [activeTab, setActiveTab] = useState(0);
  const [downloading, setDownloading] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [error, setError] = useState("");

  // Fetch report data when dialog opens
  useEffect(() => {
    if (open) {
      const fetchSummary = async () => {
        setLoadingReport(true);
        setError("");
        try {
          const res = await authFetch(`${API_URL}/api/export/report/summary`);
          if (!res.ok) throw new Error("Failed to load academic summary data");
          const json = await res.json();
          setReportData(json.data);
        } catch (err) {
          console.error("Error loading report summary:", err);
          setError(err.message || "Failed to load summary data");
        } finally {
          setLoadingReport(false);
        }
      };

      fetchSummary();
    }
  }, [open]);

  // Handle CSV Download
  const handleDownloadCsv = async (endpoint, filename, typeKey) => {
    setDownloading(typeKey);
    setError("");
    try {
      const res = await authFetch(endpoint);
      if (!res.ok) throw new Error(`Failed to download ${filename}`);

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`Error downloading ${filename}:`, err);
      setError(err.message || "Download failed");
    } finally {
      setDownloading(null);
    }
  };

  // Handle PDF / Print Generation
  const handlePrintPdf = () => {
    if (!reportData) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to open the printable PDF report.");
      return;
    }

    const { student, overview, subjects, upcomingDeadlines, recentSessions } =
      reportData;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>Academic_Report_${student.name.replace(/\s+/g, "_")}</title>
          <style>
            @page { size: A4 portrait; margin: 15mm; }
            * { box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              color: #1e293b;
              line-height: 1.5;
              margin: 0;
              padding: 24px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #2563eb;
              padding-bottom: 16px;
              margin-bottom: 24px;
            }
            .title {
              font-size: 22px;
              font-weight: 700;
              color: #1e3a8a;
              margin: 0 0 4px 0;
            }
            .subtitle {
              font-size: 13px;
              color: #64748b;
              margin: 0;
            }
            .meta {
              text-align: right;
              font-size: 12px;
              color: #475569;
            }
            .meta strong { color: #0f172a; }
            .kpi-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 12px;
              margin-bottom: 24px;
            }
            .kpi-card {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              padding: 12px;
              text-align: center;
            }
            .kpi-value {
              font-size: 20px;
              font-weight: 700;
              color: #1d4ed8;
              margin-bottom: 2px;
            }
            .kpi-label {
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #64748b;
              font-weight: 600;
            }
            h2 {
              font-size: 15px;
              font-weight: 700;
              color: #0f172a;
              border-left: 4px solid #2563eb;
              padding-left: 8px;
              margin: 24px 0 10px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              font-size: 12px;
            }
            th {
              background: #f1f5f9;
              text-align: left;
              padding: 8px 10px;
              border-bottom: 1.5px solid #cbd5e1;
              font-weight: 600;
              color: #334155;
            }
            td {
              padding: 7px 10px;
              border-bottom: 1px solid #e2e8f0;
            }
            tr:nth-child(even) td { background: #f8fafc; }
            .badge {
              display: inline-block;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 10px;
              font-weight: 600;
            }
            .badge-high { background: #fee2e2; color: #991b1b; }
            .badge-medium { background: #fef3c7; color: #92400e; }
            .badge-low { background: #dcfce7; color: #166534; }
            .badge-completed { background: #dcfce7; color: #166534; }
            .badge-planned { background: #e0f2fe; color: #075985; }
            .bar-bg {
              background: #e2e8f0;
              border-radius: 4px;
              height: 7px;
              width: 70px;
              display: inline-block;
              vertical-align: middle;
              margin-right: 6px;
            }
            .bar-fill {
              background: #2563eb;
              height: 100%;
              border-radius: 4px;
            }
            .footer {
              margin-top: 32px;
              border-top: 1px solid #e2e8f0;
              padding-top: 12px;
              font-size: 11px;
              color: #94a3b8;
              text-align: center;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">Smart Study Planner</h1>
              <p class="subtitle">Official Academic Progress & Performance Summary Report</p>
            </div>
            <div class="meta">
              <div>Student: <strong>${student.name}</strong></div>
              <div>Email: ${student.email}</div>
              <div>Report Date: <strong>${new Date().toLocaleDateString(undefined, { dateStyle: "long" })}</strong></div>
            </div>
          </div>

          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-value">${overview.overallProgress}%</div>
              <div class="kpi-label">Syllabus Completed</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-value">${overview.completedTopics} / ${overview.totalTopics}</div>
              <div class="kpi-label">Topics Mastered</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-value">${overview.totalStudyHours}h</div>
              <div class="kpi-label">Study Hours Logged</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-value">${overview.completedSessions}</div>
              <div class="kpi-label">Completed Sessions</div>
            </div>
          </div>

          <h2>1. Subject Syllabus Breakdown</h2>
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Total Topics</th>
                <th>Completed</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              ${subjects
                .map(
                  (s) => `
                <tr>
                  <td><strong>${s.name}</strong></td>
                  <td>${s.topicCount}</td>
                  <td>${s.completedTopics}</td>
                  <td>
                    <span class="bar-bg">
                      <span class="bar-fill" style="width: ${s.progress}%;"></span>
                    </span>
                    <strong>${s.progress}%</strong>
                  </td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <h2>2. Upcoming Examinations & Deadlines</h2>
          ${
            upcomingDeadlines.length === 0
              ? "<p style='font-size:12px; color:#64748b;'>No active upcoming deadlines.</p>"
              : `
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Title</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Priority</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${upcomingDeadlines
                    .map(
                      (d) => `
                    <tr>
                      <td><strong>${d.type}</strong></td>
                      <td>${d.title}</td>
                      <td>${d.subject_name}</td>
                      <td>${d.deadline_date}</td>
                      <td><span class="badge badge-${(d.priority || "Medium").toLowerCase()}">${d.priority}</span></td>
                      <td>${d.status}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            `
          }

          <h2>3. Recent Study Sessions (Last 15)</h2>
          ${
            recentSessions.length === 0
              ? "<p style='font-size:12px; color:#64748b;'>No study sessions logged yet.</p>"
              : `
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Subject</th>
                    <th>Topic</th>
                    <th>Duration</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${recentSessions
                    .map(
                      (ss) => `
                    <tr>
                      <td>${ss.session_date}</td>
                      <td>${ss.subject_name}</td>
                      <td>${ss.topic_name}</td>
                      <td>${ss.duration_minutes} mins</td>
                      <td><span class="badge badge-${ss.status.toLowerCase()}">${ss.status}</span></td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            `
          }

          <div class="footer">
            Generated automatically by Smart Study Planner | Keep up the dedicated preparation!
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: "flex", alignItems: "center" }}>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: "bold" }}>
          Export Academic Data & Reports
        </Typography>
        <IconButton aria-label="close" onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}
      >
        <Tab icon={<Download fontSize="small" />} iconPosition="start" label="Export CSV" />
        <Tab icon={<Print fontSize="small" />} iconPosition="start" label="Academic Report (PDF)" />
      </Tabs>

      <DialogContent sx={{ py: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Tab 0: CSV Export Options */}
        {activeTab === 0 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Download your academic data as structured, RFC 4180-compliant CSV files. These files can
              be opened in Microsoft Excel, Google Sheets, or any data analysis tool.
            </Typography>

            <Grid container spacing={2}>
              {/* Option 1: Study Sessions */}
              <Grid size={{ xs: 12 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                      sx={{
                        p: 1.2,
                        borderRadius: 2,
                        bgcolor: "primary.light",
                        color: "primary.dark",
                        display: "flex",
                      }}
                    >
                      <AccessTime />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Study Sessions Log
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Dates, duration in minutes, completion status, difficulty, and study notes.
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={
                      downloading === "sessions" ? (
                        <CircularProgress size={16} />
                      ) : (
                        <Download />
                      )
                    }
                    disabled={downloading !== null}
                    onClick={() =>
                      handleDownloadCsv(
                        `${API_URL}/api/export/sessions/csv`,
                        "study_sessions_log.csv",
                        "sessions"
                      )
                    }
                  >
                    Download CSV
                  </Button>
                </Paper>
              </Grid>

              {/* Option 2: Syllabus & Topics */}
              <Grid size={{ xs: 12 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                      sx={{
                        p: 1.2,
                        borderRadius: 2,
                        bgcolor: "success.light",
                        color: "success.dark",
                        display: "flex",
                      }}
                    >
                      <MenuBook />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Syllabus & Topics Breakdown
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        All subjects, syllabus topics, difficulty levels, and completion status.
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={
                      downloading === "syllabus" ? (
                        <CircularProgress size={16} />
                      ) : (
                        <Download />
                      )
                    }
                    disabled={downloading !== null}
                    onClick={() =>
                      handleDownloadCsv(
                        `${API_URL}/api/export/syllabus/csv`,
                        "syllabus_progress.csv",
                        "syllabus"
                      )
                    }
                  >
                    Download CSV
                  </Button>
                </Paper>
              </Grid>

              {/* Option 3: Deadlines & Exams */}
              <Grid size={{ xs: 12 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                      sx={{
                        p: 1.2,
                        borderRadius: 2,
                        bgcolor: "warning.light",
                        color: "warning.dark",
                        display: "flex",
                      }}
                    >
                      <Upcoming />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Deadlines & Examination Timetable
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Unified list of pending assignments, scheduled exams, and priority levels.
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={
                      downloading === "deadlines" ? (
                        <CircularProgress size={16} />
                      ) : (
                        <Download />
                      )
                    }
                    disabled={downloading !== null}
                    onClick={() =>
                      handleDownloadCsv(
                        `${API_URL}/api/export/deadlines/csv`,
                        "deadlines_exams.csv",
                        "deadlines"
                      )
                    }
                  >
                    Download CSV
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Tab 1: Academic Report (PDF Print Preview) */}
        {activeTab === 1 && (
          <Box>
            {loadingReport ? (
              <Box sx={{ textAlign: "center", py: 5 }}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Compiling academic summary...
                </Typography>
              </Box>
            ) : reportData ? (
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Review your academic performance report below, then click to print or save as PDF.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Print />}
                    onClick={handlePrintPdf}
                    sx={{ px: 2.5 }}
                  >
                    Print / Save as PDF
                  </Button>
                </Box>

                {/* Formatted Paper Preview */}
                <Paper
                  variant="outlined"
                  sx={{
                    p: { xs: 2, sm: 3 },
                    bgcolor: "grey.50",
                    borderRadius: 2,
                    maxHeight: 400,
                    overflowY: "auto",
                  }}
                >
                  {/* Document Header */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      borderBottom: "2px solid #1976d2",
                      pb: 1.5,
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        Smart Study Planner
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Academic Progress & Performance Report
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography variant="body2" fontWeight="bold">
                        {reportData.student.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {reportData.student.email}
                      </Typography>
                    </Box>
                  </Box>

                  {/* KPI Overview Grid */}
                  <Grid container spacing={1.5} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Box sx={{ p: 1.5, bgcolor: "white", borderRadius: 1.5, textAlign: "center", border: "1px solid #e0e0e0" }}>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          {reportData.overview.overallProgress}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Syllabus Done
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Box sx={{ p: 1.5, bgcolor: "white", borderRadius: 1.5, textAlign: "center", border: "1px solid #e0e0e0" }}>
                        <Typography variant="h6" fontWeight="bold" color="success.main">
                          {reportData.overview.completedTopics}/{reportData.overview.totalTopics}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Topics Done
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Box sx={{ p: 1.5, bgcolor: "white", borderRadius: 1.5, textAlign: "center", border: "1px solid #e0e0e0" }}>
                        <Typography variant="h6" fontWeight="bold" color="info.main">
                          {reportData.overview.totalStudyHours}h
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Hours Logged
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Box sx={{ p: 1.5, bgcolor: "white", borderRadius: 1.5, textAlign: "center", border: "1px solid #e0e0e0" }}>
                        <Typography variant="h6" fontWeight="bold" color="warning.main">
                          {reportData.upcomingDeadlines.length}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Deadlines
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Subjects Summary */}
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                    Subject Progress Summary
                  </Typography>
                  <Stack spacing={1}>
                    {reportData.subjects.map((s) => (
                      <Box
                        key={s.id}
                        sx={{
                          p: 1.2,
                          bgcolor: "white",
                          borderRadius: 1,
                          border: "1px solid #e0e0e0",
                        }}
                      >
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                          <Typography variant="body2" fontWeight="bold">
                            {s.name}
                          </Typography>
                          <Typography variant="caption" fontWeight="bold">
                            {s.progress}% ({s.completedTopics}/{s.topicCount} topics)
                          </Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={s.progress} sx={{ height: 6, borderRadius: 3 }} />
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              </Box>
            ) : null}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
