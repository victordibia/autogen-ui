import React, { useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant
} from 'reactflow';

import 'reactflow/dist/style.css';
import AgentNode from '../../components/nodes/agent';
import ChatNode from '../../components/nodes/chat';

const nodeTypes = { agent: AgentNode, chat: ChatNode };

export default function FlowView() {
  const initialNodes = [
    {
      id: '1',
      position: { x: 0, y: 0 },
      data: { label: 'User Proxy' },
      type: 'agent'
    },
    {
      id: '3',
      position: { x: 300, y: 130 },
      data: { label: 'Assistant' },
      type: 'agent'
    },
    {
      id: '4',
      position: { x: 700, y: 130 },
      data: { label: 'Output' },
      type: 'chat'
    }
  ];

  const initialEdges = [{ id: 'e1-3', source: '1', target: '3' }];
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="border rounded p-2">
      <div style={{ width: '100%', height: 'calc(100vh - 180px' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
        >
          <Controls />
          <MiniMap />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}
