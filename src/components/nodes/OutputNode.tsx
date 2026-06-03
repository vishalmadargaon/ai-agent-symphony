import React from 'react';
import { Handle, Position } from 'reactflow';
import { Send, Hash, Link2, Database, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

interface OutputNodeData {
  label: string;
  outputChannel: 'slack' | 'discord' | 'webhook' | 'db';
  config: {
    channelName?: string;
    url?: string;
    tableName?: string;
  };
  onChange: (newData: Partial<OutputNodeData>) => void;
}

export const OutputNode = ({ data, selected }: { data: OutputNodeData, selected?: boolean }) => {
  const handleChannelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as OutputNodeData['outputChannel'];
    data.onChange({
      outputChannel: val,
      config: {
        channelName: val === 'slack' ? '#symphony-alerts' : val === 'discord' ? 'general' : '',
        url: val === 'webhook' ? 'https://webhook.site/#!/receive' : '',
        tableName: val === 'db' ? 'execution_records' : '',
      }
    });
  };

  const handleConfigChange = (key: string, value: string) => {
    data.onChange({
      config: {
        ...data.config,
        [key]: value,
      }
    });
  };

  const getIcon = () => {
    switch (data.outputChannel) {
      case 'slack':
        return <MessageSquare className="w-4 h-4 text-pink-400" />;
      case 'discord':
        return <Hash className="w-4 h-4 text-pink-400" />;
      case 'webhook':
        return <Link2 className="w-4 h-4 text-pink-400" />;
      case 'db':
        return <Database className="w-4 h-4 text-pink-400" />;
      default:
        return <Send className="w-4 h-4 text-pink-400" />;
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
      className={`liquid-glass pink-glass p-4 min-w-[245px] select-none ${
        selected ? 'border-pink-500/50 shadow-[0_0_30px_rgba(236,72,153,0.2)]' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-pink-500/10 border border-pink-500/20 shadow-[0_0_10px_rgba(236,72,153,0.1)]">
            {getIcon()}
          </div>
          <div>
            <h3 className="font-display font-medium text-slate-100 text-sm tracking-wide">
              {data.label}
            </h3>
            <span className="text-[10px] uppercase tracking-wider text-pink-400 font-bold">
              Dispatch Channel
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-3">
        <div>
          <label className="block text-[9px] text-slate-400 font-semibold uppercase tracking-widest mb-1">
            Destination Platform
          </label>
          <select
            value={data.outputChannel}
            onChange={handleChannelChange}
            className="w-full bg-slate-950/70 border border-white/10 rounded-lg py-1 px-2 text-xs text-slate-200 focus:outline-none focus:border-pink-500/50 cursor-pointer"
          >
            <option value="slack">Slack Notification</option>
            <option value="discord">Discord Webhook</option>
            <option value="webhook">REST Webhook Forward</option>
            <option value="db">SQL/NoSQL Database</option>
          </select>
        </div>

        {data.outputChannel === 'slack' && (
          <div>
            <label className="block text-[9px] text-slate-400 font-semibold uppercase tracking-widest mb-1">
              Slack Channel
            </label>
            <input
              type="text"
              value={data.config.channelName || ''}
              onChange={(e) => handleConfigChange('channelName', e.target.value)}
              className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-1 px-2 text-xs text-slate-200 focus:outline-none focus:border-pink-500/50"
            />
          </div>
        )}

        {data.outputChannel === 'discord' && (
          <div>
            <label className="block text-[9px] text-slate-400 font-semibold uppercase tracking-widest mb-1">
              Discord Channel Name
            </label>
            <input
              type="text"
              value={data.config.channelName || ''}
              onChange={(e) => handleConfigChange('channelName', e.target.value)}
              className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-1 px-2 text-xs text-slate-200 focus:outline-none focus:border-pink-500/50"
            />
          </div>
        )}

        {data.outputChannel === 'webhook' && (
          <div>
            <label className="block text-[9px] text-slate-400 font-semibold uppercase tracking-widest mb-1">
              Forward URL
            </label>
            <input
              type="text"
              value={data.config.url || ''}
              onChange={(e) => handleConfigChange('url', e.target.value)}
              className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-1 px-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-pink-500/50"
            />
          </div>
        )}

        {data.outputChannel === 'db' && (
          <div>
            <label className="block text-[9px] text-slate-400 font-semibold uppercase tracking-widest mb-1">
              Table / Collection
            </label>
            <input
              type="text"
              value={data.config.tableName || ''}
              onChange={(e) => handleConfigChange('tableName', e.target.value)}
              className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-1 px-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-pink-500/50"
            />
          </div>
        )}
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        style={{ color: '#ec4899' }}
        className="!bg-pink-500 hover:scale-130 transition-transform"
      />
    </motion.div>
  );
};
