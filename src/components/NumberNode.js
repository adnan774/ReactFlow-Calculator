import React from 'react';
import { Handle } from 'react-flow-renderer';

const NumberNode = ({ id, data }) => {

  console.log('Rendering Node:', { id, data,  });

  return (
  <div className="custom-node">
    <Handle type="target" position="left" id="left" />
    <input
      type="number"
      value={data.value}
      onChange={(e) => data.onChange(id, parseFloat(e.target.value) || 0)}
    />
    <Handle type="source" position="right" id="right" />
  </div>
);
};

export default NumberNode;
