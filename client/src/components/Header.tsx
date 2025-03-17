import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import Box from '@mui/material/Box';

interface HeaderProps {
  onRefresh: () => void;
  onIngest: () => void;
}

function Header({ onRefresh, onIngest }: HeaderProps) {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Limitless Data Ingestor
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            color="inherit" 
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
          >
            Refresh
          </Button>
          <Button 
            color="inherit" 
            variant="outlined"
            startIcon={<CloudDownloadIcon />}
            onClick={onIngest}
          >
            Trigger Ingestion
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
