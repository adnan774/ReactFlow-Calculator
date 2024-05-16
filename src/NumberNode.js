import React from 'react';
import { Handle, Position } from 'reactflow';

const NumberNode = ({ id, data }) => {
  const handleChange = (event) => {
    const value = event.target.value;
    data.onChange(id, value);
  };

  return (
    <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
      <input
        type="number"
        value={data.value}
        onChange={handleChange}
        style={{ width: '100%' }}
      />
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </div>
  );
};

export default NumberNode;
