import React from 'react';
import { Handle, Position } from 'reactflow';
import { Play, Clock, Webhook, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface TriggerNodeData {
  label: string;
  triggerType: 'webhook' | 'cron' | 'event';
  config: {
    webhookUrl?: string;
    cronExpression?: string;
    eventName?: string;
  };
  onChange: (newData: Partial<TriggerNodeData>) => void;
}

export const TriggerNode = ({ data, selected }: { data: TriggerNodeData, selected?: boolean }) => {
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as TriggerNodeData['triggerType'];
    data.onChange({
      triggerType: val,
      config: {
        webhookUrl: val === 'webhook' ? 'https://api.symphony.io/v1/triggers/trg_90f2' : '',
        cronExpression: val === 'cron' ? '*/5 * * * *' : '',
        eventName: val === 'event' ? 'user.signup' : '',
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
    switch (data.triggerType) {
      case 'webhook':
        return <Webhook className="w-4 h-4 text-lime-400" />;
      case 'cron':
        return <Clock className="w-4 h-4 text-lime-400" />;
      case 'event':
        return <Zap className="w-4 h-4 text-lime-400" />;
      default:
        return <Play className="w-4 h-4 text-lime-400" />;
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
      className={`liquid-glass lime-glass p-4 min-w-[245px] select-none ${
        selected ? 'border-lime-500/50 shadow-[0_0_30px_rgba(132,204,22,0.2)]' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-lime-500/10 border border-lime-500/20 shadow-[0_0_10px_rgba(132,204,22,0.1)]">
            {getIcon()}
          </div>
          <div>
            <h3 className="font-display font-medium text-slate-100 text-sm tracking-wide">
              {data.label}
            </h3>
            <span className="text-[10px] uppercase tracking-wider text-lime-400 font-bold">
              Biome Trigger
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-3">
        <div>
          <label className="block text-[9px] text-slate-400 font-semibold uppercase tracking-widest mb-1">
            Trigger Source
          </label>
          <select
            value={data.triggerType}
            onChange={handleTypeChange}
            className="w-full bg-slate-950/70 border border-white/10 rounded-lg py-1 px-2 text-xs text-slate-200 focus:outline-none focus:border-lime-500/50 select-none cursor-pointer"
          >
            <option value="webhook">Webhook Request</option>
            <option value="cron">Cron Schedule</option>
            <option value="event">System Event</option>
          </select>
        </div>

        {data.triggerType === 'webhook' && (
          <div>
            <label className="block text-[9px] text-slate-400 font-semibold uppercase tracking-widest mb-1">
              Webhook Endpoint
            </label>
            <input
              type="text"
              readOnly
              value={data.config.webhookUrl || ''}
              className="w-full bg-slate-950/50 border border-white/5 rounded-lg py-1 px-2 text-[9px] font-mono text-lime-300 select-all cursor-pointer focus:outline-none"
              title="Click to copy endpoint"
            />
          </div>
        )}

        {data.triggerType === 'cron' && (
          <div>
            <label className="block text-[9px] text-slate-400 font-semibold uppercase tracking-widest mb-1">
              Cron Expression
            </label>
            <input
              type="text"
              value={data.config.cronExpression || ''}
              onChange={(e) => handleConfigChange('cronExpression', e.target.value)}
              className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-1 px-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-lime-500/50"
            />
          </div>
        )}

        {data.triggerType === 'event' && (
          <div>
            <label className="block text-[9px] text-slate-400 font-semibold uppercase tracking-widest mb-1">
              Event Trigger Name
            </label>
            <input
              type="text"
              value={data.config.eventName || ''}
              onChange={(e) => handleConfigChange('eventName', e.target.value)}
              className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-1 px-2 text-xs text-slate-200 focus:outline-none focus:border-lime-500/50"
            />
          </div>
        )}
      </div>

      {/* Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        style={{ color: '#84cc16' }}
        className="!bg-lime-500 hover:scale-130 transition-transform"
      />
    </motion.div>
  );
};
