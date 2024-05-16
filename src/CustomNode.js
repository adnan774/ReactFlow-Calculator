import React from 'react';
import { Card, CardContent, Typography, TextField, Box } from '@mui/material';
import { Handle, Position } from 'reactflow';

const CustomNode = ({ data }) => {
  return (
    <Card variant="outlined" style={{ width: 200, textAlign: 'center' }}>
      <CardContent>
        <Typography variant="h6">{data.label}</Typography>
        {data.onChange && (
          <TextField
            type="number"
            value={data.value || ''}
            onChange={(e) => data.onChange(data.id, e.target.value)}
            fullWidth
            margin="normal"
          />
        )}
      </CardContent>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
};

export default CustomNode;
