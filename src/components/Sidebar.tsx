import { Play, Clock, Bot, Send, Database, Plus, Sparkles, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  onAddNode: (type: 'triggerNode' | 'agentNode' | 'outputNode', nodeSubtype?: string) => void;
  onRunSimulation: () => void;
  isSimulating: boolean;
}

export const Sidebar = ({ onAddNode, onRunSimulation, isSimulating }: SidebarProps) => {
  return (
    <motion.aside
      initial={{ x: -320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="w-80 h-full bg-slate-950/40 backdrop-blur-xl border-r border-white/10 flex flex-col z-10 select-none shadow-[5px_0_30px_rgba(0,0,0,0.3)]"
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-white/5 flex items-center gap-3">
        <div className="relative">
          <motion.div 
            animate={isSimulating ? { rotate: 360 } : {}}
            transition={isSimulating ? { repeat: Infinity, duration: 3, ease: "linear" } : {}}
            className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.2)]"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </motion.div>
          {isSimulating && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
          )}
        </div>
        <div>
          <h1 className="font-display font-bold text-slate-100 text-sm tracking-wider uppercase">
            Biome Symphony
          </h1>
          <span className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase">
            Digital Twin v1.0
          </span>
        </div>
      </div>

      {/* Node Catalog */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Category: Triggers */}
        <div>
          <h3 className="text-[9px] uppercase font-bold tracking-widest text-lime-400 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-500 shadow-[0_0_6px_#84cc16]" />
            1. Trigger Nodes
          </h3>
          <div className="space-y-2.5">
            <motion.button
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onAddNode('triggerNode', 'Webhook')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/30 hover:bg-slate-950/60 border border-white/5 hover:border-lime-500/30 transition-all group cursor-pointer text-left shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-lime-500/10 text-lime-400 group-hover:scale-105 transition-transform border border-lime-500/25">
                  <Play className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Webhook Trigger</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">POST request input flow</p>
                </div>
              </div>
              <Plus className="w-4 h-4 text-slate-500 group-hover:text-lime-400 transition-colors" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onAddNode('triggerNode', 'Cron Scheduler')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/30 hover:bg-slate-950/60 border border-white/5 hover:border-lime-500/30 transition-all group cursor-pointer text-left shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-lime-500/10 text-lime-400 group-hover:scale-105 transition-transform border border-lime-500/25">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Cron Scheduler</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Interval-based trigger</p>
                </div>
              </div>
              <Plus className="w-4 h-4 text-slate-500 group-hover:text-lime-400 transition-colors" />
            </motion.button>
          </div>
        </div>

        {/* Category: LLM Agents */}
        <div>
          <h3 className="text-[9px] uppercase font-bold tracking-widest text-cyan-400 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_6px_#06b6d4]" />
            2. LLM Orchestrators
          </h3>
          <div className="space-y-2.5">
            <motion.button
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onAddNode('agentNode', 'Research Agent')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/30 hover:bg-slate-950/60 border border-white/5 hover:border-cyan-500/30 transition-all group cursor-pointer text-left shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-105 transition-transform border border-cyan-500/25">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Research Agent</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Intelligent search biomes</p>
                </div>
              </div>
              <Plus className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onAddNode('agentNode', 'Code Orchestrator')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/30 hover:bg-slate-950/60 border border-white/5 hover:border-cyan-500/30 transition-all group cursor-pointer text-left shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-105 transition-transform border border-cyan-500/25">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Code Orchestrator</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Executes sandboxed scripts</p>
                </div>
              </div>
              <Plus className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </motion.button>
          </div>
        </div>

        {/* Category: Outputs */}
        <div>
          <h3 className="text-[9px] uppercase font-bold tracking-widest text-pink-400 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_6px_#ec4899]" />
            3. Action Outputs
          </h3>
          <div className="space-y-2.5">
            <motion.button
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onAddNode('outputNode', 'Slack Dispatch')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/30 hover:bg-slate-950/60 border border-white/5 hover:border-pink-500/30 transition-all group cursor-pointer text-left shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 group-hover:scale-105 transition-transform border border-pink-500/25">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Slack Dispatch</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Post notification payloads</p>
                </div>
              </div>
              <Plus className="w-4 h-4 text-slate-500 group-hover:text-pink-400 transition-colors" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onAddNode('outputNode', 'Database Store')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/30 hover:bg-slate-950/60 border border-white/5 hover:border-pink-500/30 transition-all group cursor-pointer text-left shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 group-hover:scale-105 transition-transform border border-pink-500/25">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Database Store</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Write records to biome table</p>
                </div>
              </div>
              <Plus className="w-4 h-4 text-slate-500 group-hover:text-pink-400 transition-colors" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Simulator Run Panel */}
      <div className="p-5 border-t border-white/5 bg-slate-950/40 backdrop-blur-md">
        <motion.button
          whileHover={{ scale: isSimulating ? 1 : 1.03 }}
          whileTap={{ scale: isSimulating ? 1 : 0.97 }}
          onClick={onRunSimulation}
          disabled={isSimulating}
          className={`w-full py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 font-display font-medium text-xs tracking-wider uppercase transition-all cursor-pointer ${
            isSimulating
              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 cursor-not-allowed shadow-[0_0_15px_rgba(16,185,129,0.05)]'
              : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white border border-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:shadow-[0_0_30px_rgba(99,102,241,0.45)]'
          }`}
        >
          <Sparkles className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
          {isSimulating ? 'Running Symphony...' : 'Run Biome Symphony'}
        </motion.button>
      </div>
    </motion.aside>
  );
};
