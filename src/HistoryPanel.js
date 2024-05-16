import React from 'react';

const HistoryPanel = ({ history, index }) => {
  return (
    <div style={{ position: 'absolute', bottom: 10, left: 10, backgroundColor: 'white', padding: 10 }}>
      <h4>History</h4>
      <ul>
        {history.stack.slice(0, index + 1).map((entry, idx) => (
          <li key={idx}>{`Change ${idx + 1}`}</li>
        ))}
      </ul>
    </div>
  );
};

export default HistoryPanel;
