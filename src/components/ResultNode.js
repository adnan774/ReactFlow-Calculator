import React from 'react';
import { Handle } from 'react-flow-renderer';

const ResultNode = ({ data }) => {
  return (
  <div className="custom-node">
    <Handle type="target" position="left" id="left" />
    <Handle type="source" position="right" id="right" />
    <span>Result: {data.value}</span>
  </div>
);
};

export default ResultNode;
