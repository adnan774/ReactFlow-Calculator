import React from 'react';
import { Handle, Position } from 'reactflow';

const OperatorNode = ({ id, data }) => {
  const handleChange = (event) => {
    const operator = event.target.value;
    data.onChange(id, operator);
  };

  return (
    <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
      <select value={data.operator} onChange={handleChange}>
        <option value="+">+</option>
        <option value="-">-</option>
        <option value="*">*</option>
        <option value="/">/</option>
      </select>
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </div>
  );
};

export default OperatorNode;
