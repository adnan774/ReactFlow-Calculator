import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from 'reactflow';
import { Box, Button, Typography, FormControl, FormLabel, Input, Stack } from '@mui/material'; // Use Material UI components
import { v4 as uuidv4 } from 'uuid';
import { Menu, Item, contextMenu } from 'react-contexify';
import 'reactflow/dist/style.css';
import 'react-contexify/dist/ReactContexify.css';
import NumberNode from './NumberNode';
import OperatorNode from './OperatorNode';
import ResultNode from './ResultNode';
import Sidebar from './Sidebar';

const nodeTypes = { numberNode: NumberNode, operatorNode: OperatorNode, resultNode: ResultNode };
const menuId = 'contextMenu';

const initialNodes = [
  { id: '1', type: 'numberNode', position: { x: 100, y: 100 }, data: { value: 0 } },
  { id: '2', type: 'operatorNode', position: { x: 300, y: 100 }, data: { operator: '+' } },
  { id: '3', type: 'numberNode', position: { x: 500, y: 100 }, data: { value: 0 } },
  { id: '4', type: 'resultNode', position: { x: 700, y: 100 }, data: { result: 0 } },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
  { id: 'e2-3', source: '2', target: '3', type: 'smoothstep' },
  { id: 'e3-4', source: '3', target: '4', type: 'smoothstep' },
];

const saveFlow = (reactFlowInstance) => {
  const flow = reactFlowInstance.toObject();
  localStorage.setItem('saved-flow', JSON.stringify(flow));
};

const restoreFlow = (setNodes, setEdges) => {
  const savedFlow = JSON.parse(localStorage.getItem('saved-flow'));
  if (savedFlow) {
    const nodesWithDefaults = savedFlow.nodes.map((node) => {
      const type = node.type || 'default';
      const data = { ...node.data };

      if (type === 'numberNode') {
        data.value = data.value ?? 0;
      } else if (type === 'operatorNode') {
        data.operator = data.operator ?? '+';
      } else if (type === 'resultNode') {
        data.result = data.result ?? 0;
      }

      return { ...node, type, data };
    });
    setNodes(nodesWithDefaults);
    setEdges(savedFlow.edges || []);
  }
};

const getId = () => `dndnode_${uuidv4()}`;

const App = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [editingNode, setEditingNode] = useState(null);
  const [newLabel, setNewLabel] = useState('');
  const reactFlowInstanceRef = useRef(null);
  const historyRef = useRef({ index: 0, stack: [{ nodes: initialNodes, edges: initialEdges }] });

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (!type) return;

      const position = reactFlowInstanceRef.current.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const evaluateResult = useCallback(() => {
    const numberNodes = nodes.filter((n) => n.type === 'numberNode');
    const operatorNode = nodes.find((n) => n.type === 'operatorNode');
    const resultNode = nodes.find((n) => n.type === 'resultNode');

    if (operatorNode && resultNode && numberNodes.length > 1) {
      const values = numberNodes.map((n) => n.data.value || 0);
      let result = values[0];

      switch (operatorNode.data.operator) {
        case '+':
          result = values.reduce((acc, val) => acc + val, 0);
          break;
        case '-':
          result = values.reduce((acc, val) => acc - val);
          break;
        case '*':
          result = values.reduce((acc, val) => acc * val, 1);
          break;
        case '/':
          result = values.reduce((acc, val) => acc / val);
          break;
        default:
          break;
      }

      setNodes((nds) =>
        nds.map((n) => (n.id === resultNode.id ? { ...n, data: { ...n.data, result } } : n))
      );
    }
  }, [nodes, setNodes]);

  const handleNumberChange = useCallback((id, value) => {
    setNodes((nds) =>
      nds.map((node) => (node.id === id ? { ...node, data: { ...node.data, value: parseInt(value, 10) || 0 } } : node))
    );
    evaluateResult();
  }, [evaluateResult, setNodes]);

  const handleOperatorChange = useCallback((id, operator) => {
    setNodes((nds) =>
      nds.map((node) => (node.id === id ? { ...node, data: { ...node.data, operator } } : node))
    );
    evaluateResult();
  }, [evaluateResult, setNodes]);

  useEffect(() => {
    evaluateResult();
  }, [nodes, evaluateResult]);

  const onNodeDoubleClick = (event, node) => {
    setEditingNode(node.id);
    setNewLabel(node.data.label);
  };

  const saveLabel = () => {
    const updatedNodes = nodes.map((node) =>
      node.id === editingNode ? { ...node, data: { ...node.data, label: newLabel } } : node
    );
    setNodes(updatedNodes);
    setEditingNode(null);
  };

  const handleConnect = useCallback((params) => {
    const newEdges = addEdge(
      { ...params, animated: true, style: { stroke: 'blue', strokeDasharray: '5, 5' } },
      edges
    );
    setEdges(newEdges);
  }, [edges, setEdges]);

  const saveCurrentFlow = () => {
    if (reactFlowInstanceRef.current) {
      saveFlow(reactFlowInstanceRef.current);
    }
  };

  const restoreCurrentFlow = () => {
    restoreFlow(setNodes, setEdges);
  };

  const updateHistory = useCallback((newNodes, newEdges) => {
    const history = historyRef.current;
    const newIndex = history.index + 1;
    history.stack = history.stack.slice(0, newIndex);
    history.stack.push({ nodes: newNodes, edges: newEdges });
    history.index = newIndex;
  }, []);

  const undo = useCallback(() => {
    const history = historyRef.current;
    if (history.index > 0) {
      history.index--;
      const { nodes, edges } = history.stack[history.index];
      setNodes(nodes);
      setEdges(edges);
    }
  }, [setNodes, setEdges]);

  const redo = useCallback(() => {
    const history = historyRef.current;
    if (history.index < history.stack.length - 1) {
      history.index++;
      const { nodes, edges } = history.stack[history.index];
      setNodes(nodes);
      setEdges(edges);
    }
  }, [setNodes, setEdges]);

  // Show context menu on right-click
  const onNodeContextMenu = (event, node) => {
    event.preventDefault();
    contextMenu.show({
      id: menuId,
      event: event,
      props: { nodeId: node.id },
    });
  };

  // Handle context menu item actions
  const handleMenuClick = ({ props }) => {
    const updatedNodes = nodes.filter((node) => node.id !== props.nodeId);
    const updatedEdges = edges.filter((edge) => edge.source !== props.nodeId && edge.target !== props.nodeId);
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    updateHistory(updatedNodes, updatedEdges);
  };

  return (
    <ReactFlowProvider>
      <Box display="flex" height="100vh">
        <Sidebar onDragStart={(event, nodeType) => {
          event.dataTransfer.setData('application/reactflow', nodeType);
          event.dataTransfer.effectAllowed = 'move';
        }} />
        <Box flex="1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes.map((node) => {
              if (node.type === 'numberNode') {
                return { ...node, data: { ...node.data, onChange: handleNumberChange } };
              } else if (node.type === 'operatorNode') {
                return { ...node, data: { ...node.data, onChange: handleOperatorChange } };
              }
              return node;
            })}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
            onNodeDoubleClick={onNodeDoubleClick}
            onInit={(instance) => (reactFlowInstanceRef.current = instance)}
            onNodeContextMenu={onNodeContextMenu}
            onDrop={onDrop}
            onDragOver={onDragOver}
          >
            <MiniMap />
            <Controls />
            <Background />
          </ReactFlow>
          {/* Context Menu */}
          <Menu id={menuId}>
            <Item onClick={handleMenuClick}>Delete Node</Item>
          </Menu>
          {/* Node Editing Form */}
          {editingNode && (
            <Box position="absolute" top="10px" right="10px" bgcolor="white" p="10px">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveLabel();
                }}
              >
                <FormControl>
                  <FormLabel>Edit Label</FormLabel>
                  <Input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                  />
                </FormControl>
                <Button type="submit" variant="contained" color="primary" mt={2}>Save</Button>
                <Button type="button" variant="outlined" onClick={() => setEditingNode(null)} mt={2}>
                  Cancel
                </Button>
              </form>
            </Box>
          )}
          {/* Undo, Redo, Save, and Restore Buttons */}
          <Stack direction="row" position="absolute" bottom="10px" right="10px" bgcolor="white" p={2} spacing={2}>
            <Button variant="contained" onClick={undo}>Undo</Button>
            <Button variant="contained" onClick={redo}>Redo</Button>
            <Button variant="contained" onClick={saveCurrentFlow}>Save</Button>
            <Button variant="contained" onClick={restoreCurrentFlow}>Restore</Button>
          </Stack>
        </Box>
      </Box>
    </ReactFlowProvider>
  );
}

export default App;
