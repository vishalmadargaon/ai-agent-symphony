import { useEffect, useRef, useState } from 'react';
import { Settings, Terminal, Cpu, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface LogMessage {
  id: string;
  timestamp: string;
  type: 'info' | 'warn' | 'success' | 'error' | 'thinking' | 'gemini';
  text: string;
}

interface ConfigPanelProps {
  selectedNode: any | null;
  onUpdateNodeData: (id: string, newData: any) => void;
  logs: LogMessage[];
  onClearLogs: () => void;
}

export const ConfigPanel = ({ selectedNode, onUpdateNodeData, logs, onClearLogs }: ConfigPanelProps) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    let textToCopy = text;
    if (text.startsWith('[GEMINI AGENT OUTPUT]: "') && text.endsWith('"')) {
      textToCopy = text.substring('[GEMINI AGENT OUTPUT]: "'.length, text.length - 1);
    }
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId((prev) => (prev === id ? null : prev));
      }, 2000);
    });
  };

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handleFieldChange = (key: string, value: any) => {
    if (!selectedNode) return;
    
    if (key.startsWith('config.')) {
      const configKey = key.split('.')[1];
      onUpdateNodeData(selectedNode.id, {
        config: {
          ...selectedNode.data.config,
          [configKey]: value
        }
      });
    } else {
      onUpdateNodeData(selectedNode.id, { [key]: value });
    }
  };

  const getLogTypeColor = (type: LogMessage['type']) => {
    switch (type) {
      case 'success':
        return 'text-lime-400 font-semibold';
      case 'warn':
        return 'text-amber-400';
      case 'error':
        return 'text-rose-400 font-semibold';
      case 'thinking':
        return 'text-cyan-400 font-semibold animate-pulse';
      case 'gemini':
        return 'text-indigo-400 font-bold border-l-2 border-indigo-500 pl-1.5 py-0.5 bg-indigo-950/20 my-1 rounded block shadow-[0_0_8px_rgba(99,102,241,0.15)]';
      default:
        return 'text-slate-300';
    }
  };

  return (
    <motion.aside
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="w-80 h-full bg-slate-950/40 backdrop-blur-xl border-l border-white/10 flex flex-col z-10 select-none shadow-[-5px_0_30px_rgba(0,0,0,0.3)]"
    >
      {/* Inspector Header */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-violet-400" />
          <h2 className="font-display font-medium text-slate-200 text-sm tracking-wide">
            Inspector Panel
          </h2>
        </div>
      </div>

      {/* Inspector Details */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {selectedNode ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${
                selectedNode.type === 'triggerNode' 
                  ? 'text-lime-400 bg-lime-400' 
                  : selectedNode.type === 'agentNode' 
                    ? 'text-cyan-400 bg-cyan-400' 
                    : 'text-pink-400 bg-pink-400'
              }`} />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest">
                {selectedNode.data.label}
              </h3>
            </div>

            {/* Trigger Configuration */}
            {selectedNode.type === 'triggerNode' && (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[9px] text-slate-400 font-semibold uppercase tracking-widest mb-1">
                    Label
                  </label>
                  <input
                    type="text"
                    value={selectedNode.data.label}
                    onChange={(e) => handleFieldChange('label', e.target.value)}
                    className="w-full bg-slate-950/70 border border-white/10 rounded-lg py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-lime-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-slate-400 font-semibold uppercase tracking-widest mb-1">
                    Trigger Mechanism
                  </label>
                  <select
                    value={selectedNode.data.triggerType}
                    onChange={(e) => handleFieldChange('triggerType', e.target.value)}
                    className="w-full bg-slate-950/70 border border-white/10 rounded-lg py-1.5 px-2.5 text-xs text-slate-200 focus:outline-none focus:border-lime-500/50 cursor-pointer"
                  >
                    <option value="webhook">Webhook Request</option>
                    <option value="cron">Cron Schedule</option>
                    <option value="event">System Event</option>
                  </select>
                </div>
                {selectedNode.data.triggerType === 'cron' && (
                  <div>
                    <label className="block text-[9px] text-slate-400 font-semibold uppercase tracking-widest mb-1">
                      Cron Pattern
                    </label>
                    <input
                      type="text"
                      value={selectedNode.data.config.cronExpression || ''}
                      onChange={(e) => handleFieldChange('config.cronExpression', e.target.value)}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-1.5 px-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-lime-500/50"
                    />
                  </div>
                )}
                {selectedNode.data.triggerType === 'event' && (
                  <div>
                    <label className="block text-[9px] text-slate-400 font-semibold uppercase tracking-widest mb-1">
                      Event Identifier
                    </label>
                    <input
                      type="text"
                      value={selectedNode.data.config.eventName || ''}
                      onChange={(e) => handleFieldChange('config.eventName', e.target.value)}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-lime-500/50"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Agent Configuration */}
            {selectedNode.type === 'agentNode' && (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[9px] text-slate-400 font-semibold uppercase tracking-widest mb-1">
                    Agent Label
                  </label>
                  <input
                    type="text"
                    value={selectedNode.data.label}
                    onChange={(e) => handleFieldChange('label', e.target.value)}
                    className="w-full bg-slate-950/70 border border-white/10 rounded-lg py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-slate-400 font-semibold uppercase tracking-widest mb-1">
                    Model
                  </label>
                  <select
                    value={selectedNode.data.model}
                    onChange={(e) => handleFieldChange('model', e.target.value)}
                    className="w-full bg-slate-950/70 border border-white/10 rounded-lg py-1.5 px-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
                  >
                    <option value="gemini-3.5-pro">Gemini 3.5 Pro (Recommended)</option>
                    <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
                    <option value="claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                    <option value="gpt-4o">GPT-4o</option>
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest">
                      Creativity (Temp)
                    </label>
                    <span className="text-xs font-mono text-cyan-400 font-bold">{selectedNode.data.temperature.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={selectedNode.data.temperature}
                    onChange={(e) => handleFieldChange('temperature', parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-slate-400 font-semibold uppercase tracking-widest mb-1">
                    System Instructions
                  </label>
                  <textarea
                    rows={4}
                    value={selectedNode.data.systemPrompt}
                    onChange={(e) => handleFieldChange('systemPrompt', e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 font-sans resize-none"
                    placeholder="Enter instructions..."
                  />
                </div>
              </div>
            )}

            {/* Output Configuration */}
            {selectedNode.type === 'outputNode' && (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[9px] text-slate-400 font-semibold uppercase tracking-widest mb-1">
                    Node Label
                  </label>
                  <input
                    type="text"
                    value={selectedNode.data.label}
                    onChange={(e) => handleFieldChange('label', e.target.value)}
                    className="w-full bg-slate-950/70 border border-white/10 rounded-lg py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-pink-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-slate-400 font-semibold uppercase tracking-widest mb-1">
                    Channel Destination
                  </label>
                  <select
                    value={selectedNode.data.outputChannel}
                    onChange={(e) => handleFieldChange('outputChannel', e.target.value)}
                    className="w-full bg-slate-950/70 border border-white/10 rounded-lg py-1.5 px-2.5 text-xs text-slate-200 focus:outline-none focus:border-pink-500/50 cursor-pointer"
                  >
                    <option value="slack">Slack Notification</option>
                    <option value="discord">Discord Webhook</option>
                    <option value="webhook">REST Webhook Forward</option>
                    <option value="db">SQL/NoSQL Database</option>
                  </select>
                </div>
                {selectedNode.data.outputChannel === 'slack' && (
                  <div>
                    <label className="block text-[9px] text-slate-400 font-semibold uppercase tracking-widest mb-1">
                      Slack Channel
                    </label>
                    <input
                      type="text"
                      value={selectedNode.data.config.channelName || ''}
                      onChange={(e) => handleFieldChange('config.channelName', e.target.value)}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-pink-500/50"
                    />
                  </div>
                )}
                {selectedNode.data.outputChannel === 'webhook' && (
                  <div>
                    <label className="block text-[9px] text-slate-400 font-semibold uppercase tracking-widest mb-1">
                      Webhook Endpoint
                    </label>
                    <input
                      type="text"
                      value={selectedNode.data.config.url || ''}
                      onChange={(e) => handleFieldChange('config.url', e.target.value)}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-pink-500/50"
                    />
                  </div>
                )}
                {selectedNode.data.outputChannel === 'db' && (
                  <div>
                    <label className="block text-[9px] text-slate-400 font-semibold uppercase tracking-widest mb-1">
                      Target Table
                    </label>
                    <input
                      type="text"
                      value={selectedNode.data.config.tableName || ''}
                      onChange={(e) => handleFieldChange('config.tableName', e.target.value)}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-pink-500/50"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <Cpu className="w-8 h-8 text-slate-700 mb-3 animate-pulse" />
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              No Active Selection
            </p>
            <p className="text-[10px] text-slate-500 mt-1 max-w-[200px] leading-relaxed">
              Select a node on the biome canvas to inspect parameters.
            </p>
          </div>
        )}
      </div>

      {/* Execution Logs Terminal */}
      <div className="h-72 border-t border-white/10 bg-slate-950/65 flex flex-col font-mono">
        <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between text-[10px] text-slate-400 select-none bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span className="uppercase tracking-widest font-bold">Execution Log</span>
          </div>
          {logs.length > 0 && (
            <button
              onClick={onClearLogs}
              className="text-[9px] hover:text-rose-400 transition-colors uppercase font-bold cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex-1 p-3 overflow-y-auto space-y-1.5 text-[10px] leading-relaxed selection:bg-indigo-500/35 selection:text-white">
          {logs.length > 0 ? (
            logs.map((log) => (
              <div key={log.id} className="flex items-start gap-1.5 justify-between group/log">
                <div className="flex items-start gap-1.5 min-w-0">
                  <span className="text-slate-500 font-medium shrink-0">[{log.timestamp}]</span>
                  <span className={`${getLogTypeColor(log.type)} break-all`}>
                    {log.text}
                  </span>
                </div>
                {log.type === 'gemini' && (
                  <button
                    onClick={() => handleCopy(log.id, log.text)}
                    className="ml-2 shrink-0 p-1 text-slate-400 hover:text-indigo-400 hover:bg-white/5 rounded transition-all cursor-pointer flex items-center gap-1 select-none"
                    title="Copy response"
                  >
                    {copiedId === log.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-wider">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[8px] opacity-0 group-hover/log:opacity-100 transition-opacity font-bold uppercase tracking-wider">Copy</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="h-full flex items-center justify-center text-slate-600 italic select-none text-[9px]">
              Ready for orchestration.
            </div>
          )}
          <div ref={terminalEndRef} />
        </div>
      </div>
    </motion.aside>
  );
};
