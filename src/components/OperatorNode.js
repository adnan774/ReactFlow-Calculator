import React from 'react';
import { Handle } from 'react-flow-renderer';

const OperatorNode = ({ id, data }) => {

  console.log('Rendering ResultNode:', { id, data,  });

  return (
  <div className="custom-node">
    <Handle type="target" position="left" id="left" />
    <select value={data.value} onChange={(e) => data.onChange(id, e.target.value)}>
      <option value="+">+</option>
      <option value="-">-</option>
      <option value="*">*</option>
      <option value="/">/</option>
    </select>
    <Handle type="source" position="right" id="right" />
  </div>
);
};




export default OperatorNode;
