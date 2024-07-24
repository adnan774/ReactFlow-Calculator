import React from 'react';

const Sidebar = () => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside>
      <div className="description">Drag these nodes to the pane on the right.</div>
      <div className="dndnode input" onDragStart={(event) => onDragStart(event, 'numberInput')} draggable>
        Number Input Node
      </div>
      <div className="dndnode operator" onDragStart={(event) => onDragStart(event, 'operator')} draggable>
        Operator Node
      </div>
      <div className="dndnode result" onDragStart={(event) => onDragStart(event, 'result')} draggable>
        Result Node
      </div>
    </aside>
  );
};

export default Sidebar;
