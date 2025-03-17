import React, { ReactElement } from 'react';
import { Paper, Typography, Box, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

interface StatusCardProps {
  status: {
    status: string;
    stats: {
      totalEntries: number;
      parsedEntries: number;
      unparsedEntries: number;
      dbSize: number;
      lastUpdated: string;
    };
    timestamp: string;
  } | null;
}

function StatusCard({ status }: StatusCardProps): ReactElement | null {
  if (!status) return null;

  const isRunning = status.status === 'running';
  const lastUpdated = status.stats.lastUpdated 
    ? new Date(status.stats.lastUpdated).toLocaleString() 
    : 'Never';

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Service Status
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="body1" sx={{ mr: 2 }}>
          Status:
        </Typography>
        <Chip 
          icon={isRunning ? <CheckCircleIcon /> : <ErrorIcon />}
          label={isRunning ? 'Running' : 'Stopped'}
          color={isRunning ? 'success' : 'error'}
          variant="outlined"
        />
      </Box>
      
      <Typography variant="body2" color="text.secondary">
        Last Updated: {lastUpdated}
      </Typography>
      
      <Typography variant="body2" color="text.secondary">
        Database Size: {(status.stats.dbSize / (1024 * 1024)).toFixed(2)} MB
      </Typography>
      
      <Typography variant="body2" color="text.secondary">
        Server Time: {new Date(status.timestamp).toLocaleString()}
      </Typography>
    </Paper>
  );
}

export default StatusCard;
