import React, { useEffect, useRef, useState } from 'react';
import { Paper, Typography, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';
// @ts-ignore
import { Network } from 'vis-network/peer/esm/vis-network';
// @ts-ignore
import { DataSet } from 'vis-data/peer/esm/vis-data';

const getColor = (type: string) => {
  switch (type) {
    case 'label': return '#bdbdbd';
    case 'control': return '#388e3c';
    case 'requirement': return '#fbc02d';
    case 'standard': return '#1976d2';
    case 'policy': return '#d32f2f';
    default: return '#0076ce';
  }
};

const mappingLevels = [
  { value: 'all', label: 'All Objects' },
  { value: 'file', label: 'File Level' },
  { value: 'label', label: 'Label Level' },
  { value: 'control', label: 'Control Level' },
  { value: 'requirement', label: 'Requirement Level' },
  { value: 'standard', label: 'Standard Level' },
  { value: 'policy', label: 'Policy Level' },
];

// Dummy data for controls, requirements, standards, policies
const mockControls = [
  { id: 'C1', text: 'MFA for all users', label: 'HR' },
  { id: 'C2', text: 'Access logs retained 1 year', label: 'IT' },
];
const mockRequirements = [
  { id: 'R1', text: 'Encrypt all data at rest', label: 'IT' },
  { id: 'R2', text: 'Quarterly audit', label: 'Finance' },
];
const mockStandards = [
  { id: 'S1', text: 'ISO 27001', label: 'IT' },
  { id: 'S2', text: 'SOC 2', label: 'Finance' },
];
const mockPolicies = [
  { id: 'P1', text: 'Password Policy', label: 'HR' },
  { id: 'P2', text: 'Data Retention Policy', label: 'IT' },
];

const RelationshipMap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mappingLevel, setMappingLevel] = useState('all');
  const [documents, setDocuments] = useState<any[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get('http://127.0.0.1:8000/documents'),
      axios.get('http://127.0.0.1:8000/labels'),
    ])
      .then(([docsRes, labelsRes]) => {
        setDocuments(docsRes.data);
        setLabels(labelsRes.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch documents or labels.');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!containerRef.current || loading || error) return;
    let nodes: any[] = [];
    let edges: any[] = [];
    // Helper to add label edges
    const addLabelEdges = (arr: any[], type: string) => {
      arr.forEach((item, idx) => {
        if (item.label) {
          edges.push({ id: `${type}-${item.id || item.filename}-label`, from: item.id || item.filename, to: item.label, label: 'label', color: { color: getColor('label') }, font: { align: 'top' } });
        }
      });
    };
    if (mappingLevel === 'file') {
      nodes = documents.map(doc => ({ id: doc.filename, label: doc.filename, shape: 'box', color: '#f4f7fa', font: { color: '#0076ce', size: 18, face: 'Segoe UI' } }));
      documents.forEach((docA, idxA) => {
        documents.forEach((docB, idxB) => {
          if (idxA < idxB && docA.label && docA.label === docB.label) {
            edges.push({ from: docA.filename, to: docB.filename, label: 'same label', color: { color: '#bdbdbd' }, font: { align: 'top' } });
          }
        });
      });
    } else if (mappingLevel === 'label') {
      nodes = labels.map(l => ({ id: l, label: l, shape: 'ellipse', color: '#e3f2fd', font: { color: '#1976d2', size: 18, face: 'Segoe UI' } }));
    } else if (mappingLevel === 'control') {
      nodes = mockControls.map(c => ({ id: c.id, label: c.text, shape: 'hexagon', color: '#e8f5e9', font: { color: getColor('control'), size: 16, face: 'Segoe UI' } }));
      addLabelEdges(mockControls, 'control');
    } else if (mappingLevel === 'requirement') {
      nodes = mockRequirements.map(r => ({ id: r.id, label: r.text, shape: 'diamond', color: '#fffde7', font: { color: getColor('requirement'), size: 16, face: 'Segoe UI' } }));
      addLabelEdges(mockRequirements, 'requirement');
    } else if (mappingLevel === 'standard') {
      nodes = mockStandards.map(s => ({ id: s.id, label: s.text, shape: 'star', color: '#e3f2fd', font: { color: getColor('standard'), size: 16, face: 'Segoe UI' } }));
      addLabelEdges(mockStandards, 'standard');
    } else if (mappingLevel === 'policy') {
      nodes = mockPolicies.map(p => ({ id: p.id, label: p.text, shape: 'ellipse', color: '#ffebee', font: { color: getColor('policy'), size: 16, face: 'Segoe UI' } }));
      addLabelEdges(mockPolicies, 'policy');
    } else {
      // all
      nodes = [
        ...documents.map(doc => ({ id: doc.filename, label: doc.filename, shape: 'box', color: '#f4f7fa', font: { color: '#0076ce', size: 18, face: 'Segoe UI' } })),
        ...labels.map(l => ({ id: l, label: l, shape: 'ellipse', color: '#e3f2fd', font: { color: '#1976d2', size: 18, face: 'Segoe UI' } })),
        ...mockControls.map(c => ({ id: c.id, label: c.text, shape: 'hexagon', color: '#e8f5e9', font: { color: getColor('control'), size: 16, face: 'Segoe UI' } })),
        ...mockRequirements.map(r => ({ id: r.id, label: r.text, shape: 'diamond', color: '#fffde7', font: { color: getColor('requirement'), size: 16, face: 'Segoe UI' } })),
        ...mockStandards.map(s => ({ id: s.id, label: s.text, shape: 'star', color: '#e3f2fd', font: { color: getColor('standard'), size: 16, face: 'Segoe UI' } })),
        ...mockPolicies.map(p => ({ id: p.id, label: p.text, shape: 'ellipse', color: '#ffebee', font: { color: getColor('policy'), size: 16, face: 'Segoe UI' } })),
      ];
      addLabelEdges(documents, 'file');
      addLabelEdges(mockControls, 'control');
      addLabelEdges(mockRequirements, 'requirement');
      addLabelEdges(mockStandards, 'standard');
      addLabelEdges(mockPolicies, 'policy');
    }
    const data = { nodes: new DataSet(nodes), edges: new DataSet(edges) };
    const options = {
      layout: { hierarchical: false },
      edges: { arrows: { to: { enabled: true, scaleFactor: 1 } }, smooth: true },
      nodes: { borderWidth: 2, shadow: true },
      physics: { enabled: true },
      height: '400px',
    };
    const network = new Network(containerRef.current, data, options);
    return () => network.destroy();
  }, [mappingLevel, documents, labels, loading, error]);

  return (
    <Paper sx={{ maxWidth: 900, margin: '2rem auto', p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, color: '#0076ce', fontWeight: 600 }}>
        Mapping (Document Relationships)
      </Typography>
      <FormControl sx={{ mb: 2, minWidth: 220 }}>
        <InputLabel id="mapping-level-label">Mapping Level</InputLabel>
        <Select
          labelId="mapping-level-label"
          value={mappingLevel}
          label="Mapping Level"
          onChange={e => setMappingLevel(e.target.value)}
        >
          {mappingLevels.map(opt => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </Select>
      </FormControl>
      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <div ref={containerRef} style={{ height: 400, background: '#fff', borderRadius: 8, border: '1px solid #e0e0e0' }} />
      )}
    </Paper>
  );
};

export default RelationshipMap; 