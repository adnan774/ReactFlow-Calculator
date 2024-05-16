import React from 'react';
import { Handle, Position } from 'reactflow';

const ResultNode = ({ data }) => {
  return (
    <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
      <strong>Result: {data.result}</strong>
      <Handle type="target" position={Position.Left} />
    </div>
  );
};

export default ResultNode;
