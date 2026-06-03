import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { symphonyQueue, isRedisAvailable } from './queue.js';
import { executeWorkflow } from './engine.js';

dotenv.config();

// Startup validation check
if (!process.env.GEMINI_API_KEY) {
  console.warn('\n==================================================');
  console.warn('[PRE-FLIGHT WARNING]: GEMINI_API_KEY is missing. Operating in simulated execution fallback mode.');
  console.warn('==================================================\n');
}

const app = express();
const port = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.includes(origin) || 
                      origin.endsWith('.vercel.app');

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

// Job Results cache for in-memory fallback runs
export const jobResults = new Map<string, { status: string; result?: string; error?: string }>();

// Main Symphony Orchestrator Endpoint
app.post('/api/run-symphony', async (req, res) => {
  try {
    const { nodes, edges } = req.body;

    if (!nodes || !Array.isArray(nodes)) {
      res.status(400).json({ error: 'Nodes array is required in workflow payload' });
      return;
    }

    let jobId = '';

    if (isRedisAvailable && symphonyQueue) {
      // Add job to BullMQ queue
      const job = await symphonyQueue.add('orchestrate', { nodes, edges });
      jobId = job.id || `job_gen_${Date.now()}`;
      console.log(`[API] Enqueued symphony workflow job. JobID: ${jobId}`);
    } else {
      // Bypassing BullMQ, running local in-memory fallback
      jobId = `job_mem_${Date.now()}`;
      console.log(`[API] Redis offline. Enqueued job in-memory. JobID: ${jobId}`);
      
      // Update local state map
      jobResults.set(jobId, { status: 'processing' });
      
      // Execute in-memory processor in background (do not await)
      executeWorkflow(jobId, nodes, edges, '[Memory-Fallback]')
        .then((result) => {
          jobResults.set(jobId, { status: 'completed', result });
        })
        .catch((err) => {
          jobResults.set(jobId, { status: 'failed', error: err.message });
        });
    }

    // Return 202 Accepted instantly
    res.status(202).json({
      status: 'accepted',
      jobId,
      message: 'Workflow Symphony execution enqueued successfully',
    });
  } catch (error: any) {
    console.error('[API] Error queueing symphony workflow:', error);
    res.status(500).json({ error: 'Failed to queue workflow orchestration' });
  }
});

// Job status polling endpoint
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check in-memory fallback cache first
    if (jobResults.has(id)) {
      res.json(jobResults.get(id));
      return;
    }

    // If Redis is active, query BullMQ
    if (isRedisAvailable && symphonyQueue) {
      const job = await symphonyQueue.getJob(id);
      if (!job) {
        res.status(404).json({ error: 'Job not found' });
        return;
      }

      const state = await job.getState(); // 'active' | 'completed' | 'failed' | 'waiting'
      res.json({
        status: state === 'active' || state === 'waiting' ? 'processing' : state,
        result: job.returnvalue,
        error: job.failedReason,
      });
      return;
    }

    res.status(404).json({ error: 'Job not found' });
  } catch (error: any) {
    console.error('[API] Error fetching job status:', error);
    res.status(500).json({ error: 'Failed to query job state' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Symphony API Backend',
    mode: isRedisAvailable ? 'BullMQ-Redis' : 'In-Memory Fallback',
    geminiKeyConfigured: !!process.env.GEMINI_API_KEY,
  });
});

app.listen(port, () => {
  console.log(`[Server] Symphony backend listening on port ${port} [Mode: ${isRedisAvailable ? 'BullMQ-Redis' : 'In-Memory Fallback'}]`);
});
