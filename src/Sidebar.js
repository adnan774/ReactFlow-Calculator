import React from 'react';
import { Box, Button, Typography } from '@mui/material';

const Sidebar = ({ onDragStart }) => {
  return (
    <Box sx={{ width: 200, height: '100vh', bgcolor: 'background.paper', p: 2 }}>
      <Typography variant="h6">Nodes</Typography>
      <Button
        variant="contained"
        onDragStart={(event) => onDragStart(event, 'numberNode')}
        draggable
        fullWidth
        sx={{ mb: 2 }}
      >
        Number Node
      </Button>
      <Button
        variant="contained"
        onDragStart={(event) => onDragStart(event, 'operatorNode')}
        draggable
        fullWidth
        sx={{ mb: 2 }}
      >
        Operator Node
      </Button>
      <Button
        variant="contained"
        onDragStart={(event) => onDragStart(event, 'resultNode')}
        draggable
        fullWidth
        sx={{ mb: 2 }}
      >
        Result Node
      </Button>
      <Button
        variant="contained"
        onDragStart={(event) => onDragStart(event, 'default')}
        draggable
        fullWidth
      >
        Default Node
      </Button>
    </Box>
  );
};

export default Sidebar;
