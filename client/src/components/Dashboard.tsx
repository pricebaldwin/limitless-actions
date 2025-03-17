import React from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DashboardProps {
  status: {
    status: string;
    stats: {
      total: number;
      parsed: number;
      unparsed: number;
      latest?: string;
    };
    timestamp: string;
  } | null;
}

interface ChartData {
  name: string;
  value: number;
}

function Dashboard({ status }: DashboardProps): JSX.Element | null {
  // If status is not available yet, show loading
  if (!status || !status.stats) {
    return null;
  }

  const { stats } = status;
  
  // Data for the parsed vs unparsed pie chart
  const data: ChartData[] = [
    { name: 'Parsed', value: stats.parsed },
    { name: 'Unparsed', value: stats.unparsed },
  ];
  
  // Colors for the pie chart
  const COLORS = ['#4caf50', '#ff9800'];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} md={8}>
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: 240,
          }}
        >
          <Typography component="h2" variant="h6" color="primary" gutterBottom>
            Processing Status
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Total Entries: {stats.total}
          </Typography>
          {stats.total > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }: { name: string; percent: number }) => 
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value} entries`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              No data available yet. Trigger an ingestion to fetch data.
            </Typography>
          )}
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: 240,
          }}
        >
          <Typography component="h2" variant="h6" color="primary" gutterBottom>
            Recent Activity
          </Typography>
          <Typography variant="body2">
            Latest Entry: {stats.latest ? new Date(stats.latest).toLocaleString() : 'None'}
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Last Updated: {new Date(status.timestamp).toLocaleString()}
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Service Status: <span style={{ color: '#4caf50', fontWeight: 'bold' }}>{status.status}</span>
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default Dashboard;
