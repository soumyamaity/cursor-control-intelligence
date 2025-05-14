import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Typography, Tooltip, CircularProgress, Alert, Checkbox, TextField, Autocomplete, Box, Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';

interface DocumentMeta {
  filename: string;
  size: number;
  upload_time: string;
  url: string;
  label?: string;
  selected?: boolean;
}

interface DocumentListProps {
  enableSelect?: boolean;
  onSelectChange?: (selected: string[]) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({ enableSelect = false, onSelectChange }) => {
  const [documents, setDocuments] = useState<DocumentMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [editingLabels, setEditingLabels] = useState<{ [filename: string]: string }>({});

  const fetchDocuments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get<DocumentMeta[]>('http://127.0.0.1:8000/documents');
      setDocuments(response.data);
    } catch (err) {
      setError('Failed to fetch documents.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLabels = async () => {
    try {
      const response = await axios.get<string[]>('http://127.0.0.1:8000/labels');
      setLabels(response.data);
    } catch {}
  };

  useEffect(() => {
    fetchDocuments();
    fetchLabels();
  }, []);

  useEffect(() => {
    if (onSelectChange) onSelectChange(selected);
  }, [selected, onSelectChange]);

  const handleDelete = async (filename: string) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/documents/${filename}`);
      setDocuments(docs => docs.filter(doc => doc.filename !== filename));
      setSelected(sel => sel.filter(f => f !== filename));
      fetchLabels();
    } catch (err) {
      setError('Failed to delete document.');
    }
  };

  const handleSelect = async (filename: string) => {
    await axios.patch(`http://127.0.0.1:8000/documents/${filename}`, { selected: !documents.find(doc => doc.filename === filename)?.selected });
    fetchDocuments();
  };

  const handleLabelInput = (filename: string, value: string) => {
    setEditingLabels(labels => ({ ...labels, [filename]: value }));
  };

  const handleLabelCommit = async (filename: string) => {
    const newLabel = editingLabels[filename];
    if (newLabel !== undefined) {
      await axios.patch(
        `http://127.0.0.1:8000/documents/${filename}`,
        { label: newLabel },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setEditingLabels(labels => {
        const copy = { ...labels };
        delete copy[filename];
        return copy;
      });
      await fetchDocuments();
      await fetchLabels();
    }
  };

  return (
    <>
      <Paper sx={{ maxWidth: 800, margin: '2rem auto', p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#0076ce', fontWeight: 600 }}>
          Uploaded Documents
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {enableSelect && <TableCell>Select</TableCell>}
                  <TableCell>Filename</TableCell>
                  <TableCell>Label</TableCell>
                  <TableCell>Size (bytes)</TableCell>
                  <TableCell>Upload Time</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.filename}>
                    {enableSelect && (
                      <TableCell>
                        <Checkbox checked={doc.selected || false} onChange={() => handleSelect(doc.filename)} />
                      </TableCell>
                    )}
                    <TableCell>{doc.filename}</TableCell>
                    <TableCell>
                      <Autocomplete
                        freeSolo
                        options={labels.filter(l => l.toLowerCase().includes((editingLabels[doc.filename] ?? doc.label ?? '').toLowerCase()))}
                        value={editingLabels[doc.filename] !== undefined ? editingLabels[doc.filename] : (doc.label || '')}
                        onInputChange={(_, value) => handleLabelInput(doc.filename, value)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Label"
                            size="small"
                            onBlur={() => handleLabelCommit(doc.filename)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleLabelCommit(doc.filename);
                              }
                            }}
                          />
                        )}
                        onChange={(_, value) => {
                          if (typeof value === 'string') handleLabelInput(doc.filename, value);
                        }}
                      />
                    </TableCell>
                    <TableCell>{doc.size}</TableCell>
                    <TableCell>{new Date(doc.upload_time).toLocaleString()}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Download">
                        <IconButton component="a" href={`http://127.0.0.1:8000${doc.url}`} target="_blank" rel="noopener noreferrer">
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDelete(doc.filename)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      <Paper sx={{ maxWidth: 800, margin: '2rem auto', p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, color: '#0076ce', fontWeight: 600 }}>
          All Labels
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {labels.map(label => (
            <Chip key={label} label={label} color="primary" />
          ))}
        </Box>
      </Paper>
    </>
  );
};

export default DocumentList; 