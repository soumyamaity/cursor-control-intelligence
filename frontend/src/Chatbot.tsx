import React, { useState } from 'react';
import { Paper, Typography, Box, TextField, Button, List, ListItem, ListItemText } from '@mui/material';

const mockAnswer = (q: string) => `AI answer to: "${q}" (mocked)`;

const Chatbot: React.FC = () => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<{ q: string; a: string }[]>([]);

  const handleSend = () => {
    if (!input) return;
    const answer = mockAnswer(input);
    setHistory(h => [...h, { q: input, a: answer }]);
    setInput('');
  };

  const handleExport = () => {
    const csv = [
      'Question,Answer',
      ...history.map(h => `"${h.q.replace(/"/g, '""')}","${h.a.replace(/"/g, '""')}"`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat_history.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Paper sx={{ maxWidth: 600, margin: '2rem auto', p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, color: '#0076ce', fontWeight: 600 }}>
        AI Chatbot (Mock)
      </Typography>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="Ask a question..."
          value={input}
          onChange={e => setInput(e.target.value)}
          fullWidth
        />
        <Button variant="contained" sx={{ background: '#0076ce' }} onClick={handleSend} disabled={!input}>
          Send
        </Button>
      </Box>
      <Button variant="outlined" sx={{ borderColor: '#0076ce', color: '#0076ce', mb: 2 }} onClick={handleExport} disabled={history.length === 0}>
        Export Chat to CSV
      </Button>
      <List>
        {history.map((h, i) => (
          <ListItem key={i} alignItems="flex-start">
            <ListItemText
              primary={<><b>Q:</b> {h.q}</>}
              secondary={<><b>A:</b> {h.a}</>}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default Chatbot; 