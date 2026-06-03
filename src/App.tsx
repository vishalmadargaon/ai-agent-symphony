import { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';
import type { Connection, Edge, Node } from 'reactflow';
import 'reactflow/dist/style.css';

import { Sidebar } from './components/Sidebar';
import { ConfigPanel } from './components/ConfigPanel';
import { BiomeBackground } from './components/BiomeBackground';
import { TriggerNode } from './components/nodes/TriggerNode';
import { AgentNode } from './components/nodes/AgentNode';
import { OutputNode } from './components/nodes/OutputNode';

// Custom Node Registration
const nodeTypes = {
  triggerNode: TriggerNode,
  agentNode: AgentNode,
  outputNode: OutputNode,
};

interface LogMessage {
  id: string;
  timestamp: string;
  type: 'info' | 'warn' | 'success' | 'error' | 'thinking' | 'gemini';
  text: string;
}

// Initial Biome Layout Nodes
const initialNodes: Node[] = [
  {
    id: 'node-1',
    type: 'triggerNode',
    position: { x: 80, y: 220 },
    data: {
      label: 'On Webhook',
      triggerType: 'webhook',
      config: {
        webhookUrl: 'https://api.symphony.io/v1/triggers/trg_90f2',
      },
    },
  },
  {
    id: 'node-2',
    type: 'agentNode',
    position: { x: 420, y: 160 },
    data: {
      label: 'Research Agent',
      model: 'gemini-3.5-pro',
      temperature: 0.7,
      systemPrompt: 'You are an AI research assistant. Search for clean water metrics and compile details.',
      status: 'idle',
    },
  },
  {
    id: 'node-3',
    type: 'outputNode',
    position: { x: 820, y: 220 },
    data: {
      label: 'Slack Dispatcher',
      outputChannel: 'slack',
      config: {
        channelName: '#symphony-alerts',
      },
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'edge-1',
    source: 'node-1',
    target: 'node-2',
    sourceHandle: 'output',
    targetHandle: 'input',
    className: '',
    style: { stroke: '#84cc16', '--wire-glow': 'rgba(132, 204, 22, 0.45)' } as React.CSSProperties,
  },
  {
    id: 'edge-2',
    source: 'node-2',
    target: 'node-3',
    sourceHandle: 'output',
    targetHandle: 'input',
    className: '',
    style: { stroke: '#06b6d4', '--wire-glow': 'rgba(6, 182, 212, 0.45)' } as React.CSSProperties,
  },
];

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  // Hook nodes data changes back into flow state
  const onUpdateNodeData = useCallback((id: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...newData,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  // Bind onChange listener to nodes
  const nodesWithChangeHandler = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onChange: (newData: any) => onUpdateNodeData(node.id, newData),
      },
    }));
  }, [nodes, onUpdateNodeData]);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) => {
        const sourceNode = nodes.find((n) => n.id === params.source);
        let strokeColor = '#6366f1';
        let glowColor = 'rgba(99, 102, 241, 0.45)';

        if (sourceNode?.type === 'triggerNode') {
          strokeColor = '#84cc16';
          glowColor = 'rgba(132, 204, 22, 0.45)';
        } else if (sourceNode?.type === 'agentNode') {
          strokeColor = '#06b6d4';
          glowColor = 'rgba(6, 182, 212, 0.45)';
        }

        return addEdge(
          {
            ...params,
            className: isSimulating ? 'active' : '',
            style: { stroke: strokeColor, '--wire-glow': glowColor } as React.CSSProperties,
          },
          eds
        );
      }),
    [setEdges, nodes, isSimulating]
  );

  // Detect Selected Node
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return nodes.find((n) => n.id === selectedNodeId) || null;
  }, [selectedNodeId, nodes]);

  // Add a node from catalog
  const onAddNode = useCallback((type: 'triggerNode' | 'agentNode' | 'outputNode', subtype?: string) => {
    const id = `node-${Date.now()}`;
    const x = 200 + Math.random() * 200;
    const y = 150 + Math.random() * 200;
    
    let defaultData = {};
    if (type === 'triggerNode') {
      defaultData = {
        label: subtype || 'Trigger Input',
        triggerType: 'webhook',
        config: {
          webhookUrl: 'https://api.symphony.io/v1/triggers/trg_' + Math.random().toString(36).substr(2, 4),
        },
      };
    } else if (type === 'agentNode') {
      defaultData = {
        label: subtype || 'LLM Agent',
        model: 'gemini-3.5-pro',
        temperature: 0.7,
        systemPrompt: 'You are a general agent helper.',
        status: 'idle',
      };
    } else if (type === 'outputNode') {
      defaultData = {
        label: subtype || 'Output Channel',
        outputChannel: 'slack',
        config: {
          channelName: '#symphony-logs',
        },
      };
    }

    const newNode: Node = {
      id,
      type,
      position: { x, y },
      data: defaultData,
    };

    setNodes((nds) => [...nds, newNode]);
    setSelectedNodeId(id);
    
    addLog('info', `Added new block: ${subtype || type}`);
  }, [setNodes]);

  // Logger helper
  const addLog = useCallback((type: LogMessage['type'], text: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        timestamp,
        type,
        text,
      },
    ]);
  }, []);

  // Run Biome Simulation workflow
  const onRunSimulation = useCallback(async () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setLogs([]); // Reset logs
    
    addLog('info', 'Contacting Symphony backend orchestrator...');

    let pollInterval: any = null;
    let step2Timeout: any = null;

    const cleanup = () => {
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
      if (step2Timeout) {
        clearTimeout(step2Timeout);
        step2Timeout = null;
      }
    };

    try {
      // Send flow data payload to Express backend server
      const response = await fetch('http://localhost:5000/api/run-symphony', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nodes: nodes.map(n => ({ 
            id: n.id, 
            type: n.type, 
            data: { 
              label: n.data.label,
              model: n.data.model,
              temperature: n.data.temperature,
              systemPrompt: n.data.systemPrompt,
              triggerType: n.data.triggerType,
              outputChannel: n.data.outputChannel,
              config: n.data.config,
            } 
          })),
          edges: edges.map(e => ({ id: e.id, source: e.source, target: e.target })),
        }),
      });

      if (response.status !== 202) {
        throw new Error(`Server returned unexpected status ${response.status}`);
      }

      const resData = await response.json();
      const jobId = resData.jobId;

      addLog('success', `Job Accepted (202). Queued JobID: ${jobId}`);
      addLog('info', 'Orchestration pipeline processing in backend queue...');
      
      // Set edges to processing (accelerated gold dash animation)
      setEdges((eds) => eds.map((e) => ({ ...e, className: 'processing' })));
      
      const trigger = nodes.find((n) => n.type === 'triggerNode');
      const agent = nodes.find((n) => n.type === 'agentNode');
      const output = nodes.find((n) => n.type === 'outputNode');

      // Sync log outputs with the 2s per node execution loop of the backend worker
      addLog('info', `[Job ${jobId}] [Step 1] Executing trigger: [${trigger?.data?.label || 'Webhook'}]`);
      if (trigger?.data?.triggerType === 'webhook') {
        addLog('success', `Data stream packet received on Webhook. Processing payload...`);
      } else if (trigger?.data?.triggerType === 'cron') {
        addLog('success', `Cron timer triggered cycle event: ${trigger?.data?.config?.cronExpression}`);
      } else {
        addLog('success', `System telemetry parsed: ${trigger?.data?.config?.eventName}`);
      }

      step2Timeout = setTimeout(() => {
        if (agent) {
          addLog('thinking', `[Job ${jobId}] [Step 2] Transferring packet to Agent [${agent.data.label}]. Invoking ${agent.data.model}...`);
          // Set agent state to thinking (triggering neural pulsing animation)
          setNodes((nds) =>
            nds.map((n) => (n.id === agent.id ? { ...n, data: { ...n.data, status: 'thinking' } } : n))
          );
        }
      }, 1500);

      // Start status polling
      pollInterval = setInterval(async () => {
        try {
          const pollRes = await fetch(`http://localhost:5000/api/jobs/${jobId}`);
          if (!pollRes.ok) {
            throw new Error(`Status query failed: HTTP ${pollRes.status}`);
          }
          const jobData = await pollRes.json();

          if (jobData.status === 'completed') {
            cleanup();

            if (agent) {
              setNodes((nds) =>
                nds.map((n) => (n.id === agent.id ? { ...n, data: { ...n.data, status: 'completed' } } : n))
              );
              addLog('success', `[Job ${jobId}] Agent inference cycle completed successfully.`);
            }

            // Print the actual text response from Gemini API call
            const textResponse = jobData.result || 'Empty response received.';
            addLog('gemini', `[GEMINI AGENT OUTPUT]: "${textResponse}"`);

            if (output) {
              addLog('info', `[Job ${jobId}] [Step 3] Forwarding results to: [${output.data.label}]`);
              if (output.data.outputChannel === 'slack') {
                addLog('success', `Broadcast posted to Slack channel ${output.data.config.channelName || '#general'}`);
              } else if (output.data.outputChannel === 'discord') {
                addLog('success', `Webhook post dispatched to Discord target: ${output.data.config.channelName || '#general'}`);
              } else if (output.data.outputChannel === 'webhook') {
                addLog('success', `Forwarded POST payload status 200 OK to REST API: ${output.data.config.url || 'httpbin.org'}`);
              } else {
                addLog('success', `Committed data twin records to DB collection: ${output.data.config.tableName || 'telemetry'}`);
              }
            }

            addLog('success', `Job ${jobId} execution completed successfully! 🌿`);
            setIsSimulating(false);
            
            // Stop edge animations
            setEdges((eds) => eds.map((e) => ({ ...e, className: '' })));
            
            // Reset agent node status to idle
            setTimeout(() => {
              setNodes((nds) =>
                nds.map((n) => (n.type === 'agentNode' ? { ...n, data: { ...n.data, status: 'idle' } } : n))
              );
            }, 1500);

          } else if (jobData.status === 'failed') {
            cleanup();
            addLog('error', `[Job ${jobId}] Job execution failed: ${jobData.error || 'Unknown error'}`);
            setIsSimulating(false);
            setEdges((eds) => eds.map((e) => ({ ...e, className: '' })));
            
            setNodes((nds) =>
              nds.map((n) => (n.type === 'agentNode' ? { ...n, data: { ...n.data, status: 'idle' } } : n))
            );
          }
        } catch (pollErr: any) {
          console.error('[Polling] Error querying job status:', pollErr);
        }
      }, 1500);

    } catch (error: any) {
      cleanup();
      console.error('API Error:', error);
      addLog('error', `API ERROR: Could not dispatch payload to server. Ensure backend & Redis are active.`);
      setIsSimulating(false);
    }
  }, [nodes, edges, isSimulating, addLog, setEdges, setNodes]);

  return (
    <div className="w-screen h-screen flex bg-canvas text-slate-100 overflow-hidden font-sans relative">
      {/* 3D Gaussian Splats & Particle Canvas */}
      <BiomeBackground />

      {/* Left Node Catalog */}
      <Sidebar
        onAddNode={onAddNode}
        onRunSimulation={onRunSimulation}
        isSimulating={isSimulating}
      />

      {/* Center Canvas */}
      <main className="flex-1 h-full relative z-1">
        <div className="absolute top-5 left-5 z-10 bg-slate-950/45 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 flex items-center gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1] animate-pulse" />
          <span className="font-display font-medium text-xs text-slate-200 tracking-widest uppercase">
            Biome Core Viewport
          </span>
        </div>

        <ReactFlow
          nodes={nodesWithChangeHandler}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          fitView
          attributionPosition="bottom-left"
        >
          <Background color="#1e293b" gap={20} size={1} />
          <Controls className="!bg-slate-950/45 !border-white/10 !rounded-xl !overflow-hidden backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.25)] [&>button]:!bg-transparent [&>button]:!border-white/5 [&>button]:!text-slate-300 [&>button:hover]:!bg-slate-900/40 [&>svg]:!fill-slate-300" />
        </ReactFlow>
      </main>

      {/* Right properties & logs */}
      <ConfigPanel
        selectedNode={selectedNode}
        onUpdateNodeData={onUpdateNodeData}
        logs={logs}
        onClearLogs={() => setLogs([])}
      />
    </div>
  );
}

export default App;
