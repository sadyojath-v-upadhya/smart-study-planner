import { Box, Card, CardContent, Typography } from "@mui/material";

export default function StatCard({ title, value, icon, color = "primary" }) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>

          <Box
            sx={{
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 2,
              bgcolor: `${color}.light`,
              color: `${color}.main`,
            }}
          >
            {icon}
          </Box>
        </Box>

        <Typography variant="h4" sx={{ mt: 2 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}