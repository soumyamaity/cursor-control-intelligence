import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, Typography, Paper, LinearProgress, Alert } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setMessage('');
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setMessage('');
    setError('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post<{ filename: string }>(
        'http://127.0.0.1:8000/upload',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setMessage(`Upload successful: ${response.data.filename}`);
    } catch (error) {
      setError('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, margin: '2rem auto', background: '#f8fafc' }}>
      <Typography variant="h6" gutterBottom sx={{ color: '#0076ce', fontWeight: 600 }}>
        Upload a Document
      </Typography>
      <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
        <Button
          variant="contained"
          component="label"
          startIcon={<CloudUploadIcon />}
          sx={{ background: '#0076ce', ':hover': { background: '#005fa3' } }}
        >
          Choose File
          <input type="file" hidden onChange={handleFileChange} />
        </Button>
        {file && (
          <Typography variant="body2" color="text.secondary">
            Selected: {file.name}
          </Typography>
        )}
        <Button
          variant="outlined"
          onClick={handleUpload}
          disabled={!file || loading}
          sx={{ width: '100%', borderColor: '#0076ce', color: '#0076ce', ':hover': { borderColor: '#005fa3', color: '#005fa3' } }}
        >
          Upload
        </Button>
        {loading && <LinearProgress sx={{ width: '100%' }} />}
        {message && <Alert severity="success" sx={{ width: '100%' }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>}
      </Box>
    </Paper>
  );
};

export default FileUpload; 