import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  getSmoothStepPath,
} from 'react-flow-renderer';
import { BaseEdge } from 'reactflow';
import { nanoid } from 'nanoid';
import 'reactflow/dist/style.css';
import './App.css';
import Sidebar from './components/Sidebar';
import NumberNode from './components/NumberNode';
import OperatorNode from './components/OperatorNode';
import ResultNode from './components/ResultNode';

// Initial empty arrays for nodes and edges
const initialNodes = [];
const initialEdges = [];

// Defining custom node types
const nodeTypes = {
  numberInput: NumberNode,
  operator: OperatorNode,
  result: ResultNode,
};

// Custom edge component to render smooth step edges
const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd }) => {
  const edgePath = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{ stroke: '#222', strokeWidth: 2 }}
      markerEnd={markerEnd}
    />
  );
};

// Defining custom edge types
const edgeTypes = {
  custom: CustomEdge,
};

// Main Calculator component
const Calculator = () => {
  // Creating refs for react flow wrapper and instance
  const reactFlowWrapper = useRef(null);
  const reactFlowInstance = useRef(null);

  // State management for nodes and edges
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeValues, setNodeValues] = useState({});
  const [calculateFlag, setCalculateFlag] = useState(false);

  // Function to update node values and set calculation flag
  const updateNodeValue = useCallback((id, value) => {
    console.log(`Updating node value: id=${id}, value=${value}`);
    setNodeValues((prevValues) => ({
      ...prevValues,
      [id]: value,
    }));
    setCalculateFlag(true);

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          node.data = {
            ...node.data,
            value: value,
          };
        }
        return node;
      })
    );
  }, [setNodeValues, setNodes]);

  // Function to evaluate expressions based on operator
  const evaluate = ({ currentOperand, previousOperand, operation }) => {
    const prev = parseFloat(previousOperand);
    const current = parseFloat(currentOperand);
    if (isNaN(prev) || isNaN(current)) return "";
    let computation = "";
    switch (operation) {
      case "+":
        computation = prev + current;
        break;
      case "-":
        computation = prev - current;
        break;
      case "*":
        computation = prev * current;
        break;
      case "÷":
        computation = prev / current;
        break;
      default:
        computation = "";
        break;
    }
    return computation.toString();
  };






  
  const calculateResults = useCallback(() => {
    if (!calculateFlag) return; // Only calculate if the flag is set
    console.log('Starting calculation...');

    // Create a shallow copy of node values to work with
    const values = { ...nodeValues };

    // Object to store the results of operator nodes
    const operatorResults = {};

    // Iterate over each edge to collect values from number nodes connected to operators
    edges.forEach((edge) => {
        const sourceNode = nodes.find((node) => node.id === edge.source);
        const targetNode = nodes.find((node) => node.id === edge.target);

        if (sourceNode && targetNode) {
            const sourceValue = parseFloat(values[sourceNode.id] !== undefined ? values[sourceNode.id] : sourceNode.data.value);
            const targetValue = parseFloat(values[targetNode.id] !== undefined ? values[targetNode.id] : targetNode.data.value);
            console.log(`Edge from ${sourceNode.id} to ${targetNode.id}: sourceValue = ${sourceValue}, targetValue = ${targetValue}`);

            if (targetNode.type === 'operator') {
                if (!operatorResults[targetNode.id]) {
                    operatorResults[targetNode.id] = { left: null, right: null };
                }

                if (edge.targetHandle === 'left' && sourceNode.type === 'numberInput') {
                    operatorResults[targetNode.id].left = sourceValue;
                    console.log(`Operator ${targetNode.id} collecting value from left: ${sourceValue}`);
                } else if (edge.targetHandle === 'right' && sourceNode.type === 'numberInput') {
                    operatorResults[targetNode.id].right = sourceValue;
                    console.log(`Operator ${targetNode.id} collecting value from right: ${sourceValue}`);
                }
            } else if (sourceNode.type === 'operator') {
                if (!operatorResults[sourceNode.id]) {
                    operatorResults[sourceNode.id] = { left: null, right: null };
                }

                if (edge.sourceHandle === 'right' && targetNode.type === 'numberInput') {
                    operatorResults[sourceNode.id].right = targetValue;
                    console.log(`Operator ${sourceNode.id} collecting value from right: ${targetValue}`);
                }
            }
        }
    });

    console.log('Operator results collected:', operatorResults);

    // Calculate results for operator nodes
    Object.keys(operatorResults).forEach((operatorId) => {
        const operatorNode = nodes.find((node) => node.id === operatorId);
        const operatorValue = operatorNode?.data.value;
        let result;

        console.log(`Calculating for operator node ${operatorId} with operator ${operatorValue}`);

        const operatorInput = operatorResults[operatorId];

        if (operatorNode && operatorInput.left !== null && operatorInput.right !== null) {
            const leftValue = operatorInput.left;
            const rightValue = operatorInput.right;

            console.log(`Operator ${operatorId} inputs: leftValue = ${leftValue}, rightValue = ${rightValue}`);

            result = evaluate({ currentOperand: rightValue.toString(), previousOperand: leftValue.toString(), operation: operatorValue });
            console.log(`Result of operation for operator ${operatorId}: ${result}`);

            operatorResults[operatorId].result = result;
        } else {
            console.warn(`Operator node ${operatorId} does not have exactly two inputs. Inputs received: ${JSON.stringify(operatorInput)}`);
        }
    });

    // Update result nodes connected to numberInput nodes
    edges.forEach((edge) => {
        const sourceNode = nodes.find((node) => node.id === edge.source);
        const targetNode = nodes.find((node) => node.id === edge.target);

        if (sourceNode && targetNode) {
            if ((sourceNode.type === 'numberInput' && targetNode.type === 'result') || (sourceNode.type === 'result' && targetNode.type === 'numberInput')) {
                let numberNode, resultNode;
                if (sourceNode.type === 'numberInput') {
                    numberNode = sourceNode;
                    resultNode = targetNode;
                } else {
                    numberNode = targetNode;
                    resultNode = sourceNode;
                }

                const operatorEdge = edges.find(e => (e.source === numberNode.id && nodes.some(n => n.id === e.target && n.type === 'operator')) || (e.target === numberNode.id && nodes.some(n => n.id === e.source && n.type === 'operator')));
                const operatorNode = operatorEdge ? nodes.find(n => n.id === (operatorEdge.source === numberNode.id ? operatorEdge.target : operatorEdge.source)) : null;

                const resultValue = operatorNode && operatorResults[operatorNode.id]
                    ? operatorResults[operatorNode.id].result
                    : null;

                if (resultValue !== null) {
                    setNodes((nds) =>
                        nds.map((n) => {
                            if (n.id === resultNode.id && n.data.value !== resultValue) {
                                n.data = {
                                    ...n.data,
                                    value: resultValue,
                                };
                                console.log(`Update of result node ${n.id} with value ${resultValue}`);
                            }
                            return n;
                        })
                    );
                }
            }
        }
    });

    console.log('Calculation completed.');
    setCalculateFlag(false); // Reset the flag after calculation
}, [nodeValues, edges, nodes, setNodes, calculateFlag]);






  




  
  
  
  
  
  
  
  
  
  












  // Function to handle new edge connections
  const onConnect = useCallback(
    (params) => {
      console.log('Edge connected:', params);
      setEdges((eds) => addEdge({ ...params, type: 'custom' }, eds));
      setCalculateFlag(true); // Trigger calculation when a new edge is added
    },
    [setEdges]
  );

  // Effect to recalculate results when node values or edges change
  useEffect(() => {
    calculateResults();
  }, [nodeValues, edges, calculateResults]);

  // Function to handle drag over event
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Function to handle drop event
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (!type) return;

      const position = reactFlowInstance.current.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      // Generate a unique ID for the new node using nanoid
      const id = nanoid();
      // Create a new node object with specified properties
      const newNode = {
        id,
        type,
        position,
        data: {
          id,
          value: type === 'operator' ? '+' : 0,
          onChange: updateNodeValue,
        },
      };

      console.log('New node added:', newNode);
      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes, updateNodeValue]
  );

  return (
    <div className="dndflow">
      <Sidebar />
      <div className="reactflow-wrapper" ref={reactFlowWrapper} onDragOver={onDragOver} onDrop={onDrop}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={(instance) => (reactFlowInstance.current = instance)}
            style={{ width: '100%', height: '100%' }}
          >
            <MiniMap />
            <Controls />
            <Background />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </div>
  );
};

export default Calculator;
