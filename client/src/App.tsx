import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import StatusCard from './components/StatusCard';
import LifelogList from './components/LifelogList';
import axios from 'axios';

interface ServiceStatus {
  status: string;
  stats: {
    totalEntries: number;
    parsedEntries: number;
    unparsedEntries: number;
    dbSize: number;
    lastUpdated: string;
  };
  timestamp: string;
}

interface LifelogEntry {
  id: string;
  userId: string;
  content: Record<string, any>;
  timestamp: string;
  parsed: boolean;
  parseAttempts: number;
  createdAt: string;
  updatedAt: string;
}

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App(): JSX.Element {
  const [status, setStatus] = useState<ServiceStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lifelogs, setLifelogs] = useState<LifelogEntry[]>([]);

  // Fetch service status
  const fetchStatus = async () => {
    try {
      const response = await axios.get('/api/status');
      setStatus(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching status:', err);
      setError('Failed to fetch service status');
    } finally {
      setLoading(false);
    }
  };

  // Fetch lifelogs
  const fetchLifelogs = async () => {
    try {
      const response = await axios.get('/api/lifelogs');
      setLifelogs(response.data.entries);
    } catch (err) {
      console.error('Error fetching lifelogs:', err);
      // Don't update error state here to avoid overriding status error
    }
  };

  // Trigger manual ingestion
  const triggerIngestion = async () => {
    try {
      await axios.post('/api/ingest');
      // Wait a bit and then refresh the data
      setTimeout(() => {
        fetchStatus();
        fetchLifelogs();
      }, 2000);
    } catch (err) {
      console.error('Error triggering ingestion:', err);
      setError('Failed to trigger data ingestion');
    }
  };

  // Initial data load
  useEffect(() => {
    fetchStatus();
    fetchLifelogs();

    // Set up polling for refreshing data
    const statusInterval = setInterval(fetchStatus, 30000); // Every 30 seconds
    const lifelogsInterval = setInterval(fetchLifelogs, 60000); // Every minute

    return () => {
      clearInterval(statusInterval);
      clearInterval(lifelogsInterval);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header onRefresh={fetchStatus} onIngest={triggerIngestion} />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {loading ? (
          <p>Loading service status...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : (
          <>
            <Dashboard status={status} />
            <StatusCard status={status} />
            <LifelogList lifelogs={lifelogs} />
          </>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;
