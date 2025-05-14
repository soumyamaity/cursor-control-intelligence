import React, { useState } from 'react';
import { Paper, Typography, Button, List, ListItem, ListItemText } from '@mui/material';

const mockInsights = [
  'Review and update password policy to require 12+ characters.',
  'Enable multi-factor authentication for all users.',
  'Schedule quarterly compliance training for staff.',
  'Automate encryption key rotation every 90 days.'
];

const Insights: React.FC = () => {
  const [insights] = useState<string[]>(mockInsights);

  const handleExport = () => {
    const csv = ['Insight', ...insights.map(i => `"${i.replace(/"/g, '""')}"`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'insights.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Paper sx={{ maxWidth: 600, margin: '2rem auto', p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, color: '#0076ce', fontWeight: 600 }}>
        Actionable Insights (Mock)
      </Typography>
      <Button variant="outlined" sx={{ borderColor: '#0076ce', color: '#0076ce', mb: 2 }} onClick={handleExport}>
        Export Insights to CSV
      </Button>
      <List>
        {insights.map((insight, i) => (
          <ListItem key={i}>
            <ListItemText primary={insight} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default Insights; 