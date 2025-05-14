import React, { useState, useEffect } from 'react';
import { Paper, TextField, Button, Box, Alert, List, ListItem, ListItemText, FormGroup, FormControlLabel, Checkbox } from '@mui/material';
import axios from 'axios';

const mockSuggestions = [
  'Requirement: All user passwords must be at least 12 characters.',
  'Control: Multi-factor authentication is required for all admin accounts.',
  'Requirement: Data must be encrypted at rest and in transit.'
];

const RequirementForm: React.FC = () => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [labels, setLabels] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  useEffect(() => {
    axios.get<string[]>('http://127.0.0.1:8000/labels').then(res => setLabels(res.data));
  }, []);

  const handleSuggest = () => {
    // Mock AI suggestion logic
    setSuggestions(mockSuggestions.filter(s => s.toLowerCase().includes(input.toLowerCase())));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Control/requirement created!');
    setInput('');
    setSuggestions([]);
    setSelectedLabels([]);
  };

  const handleLabelToggle = (label: string) => {
    setSelectedLabels(sel => sel.includes(label) ? sel.filter(l => l !== label) : [...sel, label]);
  };

  return (
    <Paper sx={{ maxWidth: 700, margin: '2rem auto', p: 3 }}>
      <form onSubmit={handleSubmit}>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            multiline
            minRows={6}
            maxRows={16}
            placeholder="Write a control statement or requirement...."
            value={input}
            onChange={e => setInput(e.target.value)}
            fullWidth
            sx={{ fontSize: '1.2rem', background: '#f8fafc', borderRadius: 2 }}
            InputProps={{ style: { fontSize: '1.2rem', padding: 16 } }}
          />
          <Button variant="outlined" onClick={handleSuggest} disabled={!input} sx={{ borderColor: '#0076ce', color: '#0076ce' }}>
            Suggest Similar
          </Button>
          {suggestions.length > 0 && (
            <List>
              {suggestions.map((s, i) => (
                <ListItem key={i}>
                  <ListItemText primary={s} />
                </ListItem>
              ))}
            </List>
          )}
          <Box mt={2} mb={1} color="#0076ce" fontWeight={600} fontSize={16}>
            Sources
          </Box>
          <FormGroup row>
            {labels.map(label => (
              <FormControlLabel
                key={label}
                control={<Checkbox checked={selectedLabels.includes(label)} onChange={() => handleLabelToggle(label)} />}
                label={label}
              />
            ))}
          </FormGroup>
          <Button type="submit" variant="contained" sx={{ background: '#0076ce' }} disabled={!input}>
            Create
          </Button>
          {message && <Alert severity="success">{message}</Alert>}
        </Box>
      </form>
    </Paper>
  );
};

export default RequirementForm; 