import React, { useState } from 'react';
import FileUpload from './FileUpload';
import DocumentList from './DocumentList';
import ConsolidateDocuments from './ConsolidateDocuments';
import RequirementForm from './RequirementForm';
import RelationshipMap from './RelationshipMap';
import Chatbot from './Chatbot';
import Insights from './Insights';
import './App.css';
import { ThemeProvider, createTheme, CssBaseline, Box, Tabs, Tab, Paper, Typography, Button } from '@mui/material';

const dellTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0076ce', // Dell blue
    },
    secondary: {
      main: '#222222', // Dell dark gray
    },
    background: {
      default: '#f4f7fa', // Dell site background
      paper: '#ffffff',
    },
    text: {
      primary: '#222222',
      secondary: '#0076ce',
    },
  },
  typography: {
    fontFamily: 'Segoe UI, Arial, sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      color: '#0076ce',
    },
  },
});

const TABS = [
  { label: 'Controls & Requirements', component: <RequirementForm /> },
  { label: 'Mapping', component: <RelationshipMap /> },
  { label: 'Chatbot', component: <Chatbot /> },
  { label: 'Supporting Documents', component: <Insights /> },
  { label: 'Source of Truth', component: <SourceControlTab /> },
];

function SourceControlTab() {
  // Placeholder for local folder selection
  const handleSelectFolder = () => {
    alert('Local folder selection is not supported in browsers for security reasons. Please use file upload.');
  };
  return (
    <Paper sx={{ maxWidth: 900, margin: '2rem auto', p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, color: '#0076ce', fontWeight: 600 }}>
        Source Control
      </Typography>
      <Box mb={2}>
        <Button variant="outlined" sx={{ borderColor: '#0076ce', color: '#0076ce' }} onClick={handleSelectFolder}>
          Locate Local Folder (Not Supported)
        </Button>
      </Box>
      <FileUpload />
      <DocumentList enableSelect />
      <ConsolidateDocuments />
    </Paper>
  );
}

function App() {
  const [tab, setTab] = useState(TABS.length - 1);
  return (
    <ThemeProvider theme={dellTheme}>
      <CssBaseline />
      <Box minHeight="100vh" sx={{ background: dellTheme.palette.background.default, py: 6 }}>
        <Box textAlign="center" mb={4}>
          <h1 style={{ color: dellTheme.palette.primary.main, fontWeight: 700, fontFamily: 'Segoe UI, Arial, sans-serif' }}>
            SRO Control Intelligence
          </h1>
        </Box>
        <Box maxWidth={900} mx="auto">
          <Tabs value={tab} onChange={(_, v) => setTab(v)} centered sx={{ mb: 3 }}>
            {TABS.map((t, i) => <Tab key={t.label} label={t.label} />)}
          </Tabs>
          {TABS[tab].component}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
