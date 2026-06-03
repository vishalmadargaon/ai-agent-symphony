import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Bot, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface AgentNodeData {
  label: string;
  model: string;
  temperature: number;
  systemPrompt: string;
  status: 'idle' | 'thinking' | 'completed' | 'error';
  onChange: (newData: Partial<AgentNodeData>) => void;
}

export const AgentNode = ({ data, selected }: { data: AgentNodeData, selected?: boolean }) => {
  const [expanded, setExpanded] = useState(false);

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    data.onChange({ model: e.target.value });
  };

  const handleTempChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    data.onChange({ temperature: parseFloat(e.target.value) });
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    data.onChange({ systemPrompt: e.target.value });
  };

  const getStatusBadge = () => {
    switch (data.status) {
      case 'thinking':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/35 text-[9px] font-bold tracking-wider uppercase animate-pulse">
            <Sparkles className="w-2.5 h-2.5 animate-spin" />
            Active
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/35 text-[9px] font-bold tracking-wider uppercase">
            Ready
          </span>
        );
      case 'error':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/35 text-[9px] font-bold tracking-wider uppercase">
            Error
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-slate-500/20 text-slate-400 border border-white/5 text-[9px] font-bold tracking-wider uppercase">
            Standby
          </span>
        );
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ 
        scale: selected ? 1.04 : 1, 
        opacity: 1,
        y: selected ? -4 : 0
      }}
      whileHover={{ scale: selected ? 1.04 : 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 350, damping: 18 }}
      className={`liquid-glass cyan-glass p-4 min-w-[285px] select-none ${
        data.status === 'thinking' ? 'neural-pulse' : ''
      } ${selected ? 'border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.2)]' : ''}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
            <Bot className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-display font-medium text-slate-100 text-sm tracking-wide">
              {data.label}
            </h3>
            <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold">
              Cognitive Agent
            </span>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Body */}
      <div className="space-y-3">
        {/* Model Selection */}
        <div>
          <label className="block text-[9px] text-slate-400 font-semibold uppercase tracking-widest mb-1">
            Model Endpoint
          </label>
          <select
            value={data.model}
            onChange={handleModelChange}
            className="w-full bg-slate-950/70 border border-white/10 rounded-lg py-1.5 px-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
          >
            <option value="gemini-3.5-pro">Gemini 3.5 Pro (Recommended)</option>
            <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
            <option value="claude-3.5-sonnet">Claude 3.5 Sonnet</option>
            <option value="gpt-4o">GPT-4o</option>
          </select>
        </div>

        {/* Temperature */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest">
              Temperature
            </label>
            <span className="text-[10px] font-mono text-cyan-400 font-bold">{data.temperature.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={data.temperature}
            onChange={handleTempChange}
            className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>

        {/* System Prompt (Collapsible) */}
        <div className="border-t border-white/5 pt-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-between w-full text-[9px] text-slate-400 font-semibold uppercase tracking-widest hover:text-slate-200 transition-colors cursor-pointer"
          >
            <span>Neural Directive</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          
          {expanded && (
            <textarea
              rows={3}
              value={data.systemPrompt}
              onChange={handlePromptChange}
              placeholder="Inject system instructions..."
              className="w-full mt-1.5 bg-slate-950/50 border border-white/10 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 font-sans resize-none"
            />
          )}
        </div>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        style={{ color: '#06b6d4' }}
        className="!bg-cyan-500 hover:scale-130 transition-transform"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        style={{ color: '#06b6d4' }}
        className="!bg-cyan-500 hover:scale-130 transition-transform"
      />
    </motion.div>
  );
};
