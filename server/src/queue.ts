import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

export let isRedisAvailable = false;
export let symphonyQueue: Queue | null = null;

// Shared Redis Connection Options
export const connectionOptions = {
  host: redisHost,
  port: redisPort,
  maxRetriesPerRequest: null, // Critical requirement for BullMQ
};

// Create a check connection client
const testRedis = new Redis({
  host: redisHost,
  port: redisPort,
  connectTimeout: 1000,
  lazyConnect: true,
});

// Swallow background connection error logs
testRedis.on('error', () => {});

try {
  console.log(`[Queue] Testing Redis connection at ${redisHost}:${redisPort}...`);
  await testRedis.connect();
  isRedisAvailable = true;
  symphonyQueue = new Queue('symphony-exec-queue', {
    connection: connectionOptions,
  });
  console.log(`[Queue] Redis connected successfully. BullMQ active.`);
  testRedis.disconnect();
} catch (err) {
  console.warn(`[Queue] Redis connection failed (ECONNREFUSED).`);
  console.warn(`[Queue] Fallback: Activating in-memory local task queue.`);
  isRedisAvailable = false;
  symphonyQueue = null;
}
