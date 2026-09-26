import { Card, CardContent, Typography } from "@mui/material";

export default function DashboardSection({ title, children }) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="h6" component="h2">
          {title}
        </Typography>

        {children}
      </CardContent>
    </Card>
  );
}