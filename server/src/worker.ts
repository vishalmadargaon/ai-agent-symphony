import { Worker, Job } from 'bullmq';
import { connectionOptions, isRedisAvailable } from './queue.js';
import { executeWorkflow } from './engine.js';
import type { WorkflowNode, WorkflowEdge } from './engine.js';

interface WorkflowPayload {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

if (isRedisAvailable) {
  // Initialize BullMQ Worker only if Redis is available
  const worker = new Worker<WorkflowPayload>(
    'symphony-exec-queue',
    async (job: Job<WorkflowPayload>) => {
      const { nodes, edges } = job.data;
      return await executeWorkflow(job.id || 'job_worker', nodes, edges, '[Worker]');
    },
    {
      connection: connectionOptions,
    }
  );

  worker.on('ready', () => {
    console.log('[Worker] Connected and listening to "symphony-exec-queue"');
  });

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed with error:`, err);
  });
} else {
  console.warn(`[Worker] Redis offline. Bypassing BullMQ worker instantiation.`);
  console.log(`[Worker] Standby: Server is running in-memory fallback execution mode.`);
}
