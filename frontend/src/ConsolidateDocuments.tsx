import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Paper, Typography, Box, Button, Checkbox, FormControlLabel, CircularProgress, Alert, TextareaAutosize
} from '@mui/material';

interface DocumentMeta {
  filename: string;
  size: number;
  upload_time: string;
  url: string;
}

const ConsolidateDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentMeta[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get<DocumentMeta[]>('http://127.0.0.1:8000/documents')
      .then(res => setDocuments(res.data))
      .catch(() => setError('Failed to fetch documents.'));
  }, []);

  const handleToggle = (filename: string) => {
    setSelected(sel => sel.includes(filename) ? sel.filter(f => f !== filename) : [...sel, filename]);
  };

  const handleConsolidate = async () => {
    setLoading(true);
    setError('');
    setResult('');
    try {
      const response = await axios.post<{ consolidated: string }>('http://127.0.0.1:8000/consolidate', selected);
      setResult(response.data.consolidated);
    } catch {
      setError('Failed to consolidate documents.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ maxWidth: 800, margin: '2rem auto', p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, color: '#0076ce', fontWeight: 600 }}>
        Consolidate Documents
      </Typography>
      <Box display="flex" flexDirection="column" gap={1} mb={2}>
        {documents.map(doc => (
          <FormControlLabel
            key={doc.filename}
            control={<Checkbox checked={selected.includes(doc.filename)} onChange={() => handleToggle(doc.filename)} />}
            label={doc.filename}
          />
        ))}
      </Box>
      <Button variant="contained" sx={{ background: '#0076ce' }} disabled={selected.length < 2 || loading} onClick={handleConsolidate}>
        Consolidate Selected
      </Button>
      {loading && <CircularProgress sx={{ ml: 2 }} />}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {result && (
        <Box mt={3}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Consolidated Result:</Typography>
          <TextareaAutosize
            minRows={10}
            style={{ width: '100%', fontFamily: 'monospace', marginTop: 8 }}
            value={result}
            readOnly
          />
        </Box>
      )}
    </Paper>
  );
};

export default ConsolidateDocuments; 