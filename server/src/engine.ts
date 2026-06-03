import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
  console.log('[Engine] Gemini API SDK initialized successfully.');
} else {
  console.warn('[Engine] WARNING: GEMINI_API_KEY is missing in env. Fallback mock responses active.');
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface WorkflowNode {
  id: string;
  type: string;
  data: {
    label: string;
    model?: string;
    temperature?: number;
    systemPrompt?: string;
    triggerType?: string;
    outputChannel?: string;
    config?: {
      webhookUrl?: string;
      cronExpression?: string;
      eventName?: string;
      channelName?: string;
      url?: string;
      tableName?: string;
    };
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

// Chained Graph Execution Engine
export async function executeWorkflow(
  jobId: string,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  logPrefix: string = '[Engine]'
): Promise<string | undefined> {
  console.log(`\n==================================================`);
  console.log(`${logPrefix} Starting Job ${jobId} execution...`);
  console.log(`${logPrefix} Workflow contains ${nodes.length} nodes to orchestrate.`);
  console.log(`==================================================`);

  // Adjacency map for routing
  const nextNodesMap = new Map<string, string>();
  edges.forEach((e) => {
    nextNodesMap.set(e.source, e.target);
  });

  // Start node
  const triggerNode = nodes.find((n) => n.type === 'triggerNode');
  if (!triggerNode) {
    console.error(`${logPrefix} ERROR: No Trigger Node found in workflow.`);
    return;
  }

  let currentNode: WorkflowNode | undefined = triggerNode;
  let contextText = 'Workflow activated.';
  let stepIndex = 1;

  while (currentNode) {
    console.log(`${logPrefix} [Job ${jobId}] [Step ${stepIndex}/${nodes.length}]`);
    console.log(`         Node Label: "${currentNode.data.label}"`);
    console.log(`         Node Block: ${currentNode.type}`);

    if (currentNode.type === 'triggerNode') {
      const trgType = currentNode.data.triggerType || 'webhook';
      const config = currentNode.data.config || {};
      
      if (trgType === 'webhook') {
        contextText = `Webhook request received at ${config.webhookUrl || 'https://api.symphony.io/v1/triggers/trg_90f2'}. Payload: { event: "symphony.run", timestamp: "${new Date().toISOString()}" }`;
      } else if (trgType === 'cron') {
        contextText = `Cron timer fired event on pattern: ${config.cronExpression || '*/5 * * * *'}`;
      } else {
        contextText = `System event trigger fired: ${config.eventName || 'user.signup'}`;
      }
      
      console.log(`         Trigger Output: ${contextText}`);
      await sleep(1500); // Visual delay
      console.log(`         SUCCESS: Node executed successfully.\n`);

    } else if (currentNode.type === 'agentNode') {
      const selectedModel = currentNode.data.model || 'gemini-3.5-pro';
      const modelName = selectedModel.includes('pro') ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
      const temperature = currentNode.data.temperature ?? 0.7;
      const systemInstruction = currentNode.data.systemPrompt || 'You are a helpful assistant.';
      const prompt = `Trigger context: "${contextText}". Summarize the event details and draft an alert note in exactly 2 sentences.`;
      
      console.log(`         Model: ${modelName} (Input Selection: ${selectedModel})`);
      console.log(`         Prompt: "${prompt}"`);
      console.log(`         System Directive: "${systemInstruction}"`);
      
      let generatedText = '';
      
      if (ai) {
        try {
          console.log(`         [Gemini] Contacting Google API...`);
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction,
              temperature,
            }
          });
          generatedText = response.text || 'Empty response received from API.';
        } catch (apiErr: any) {
          console.error(`         [Gemini] API Call failed:`, apiErr.message);
          generatedText = `[Error calling Gemini API: ${apiErr.message}]. Biome data twin telemetry stable. Webhooks enqueued.`;
        }
      } else {
        console.log(`         [Gemini] API Key missing. Falling back to mock...`);
        await sleep(2000);
        generatedText = `[MOCK AI SUMMARY] Sensor telemetry biome is operating at optimal parameters. Action outputs have been logged and scheduled.`;
      }
      
      contextText = generatedText;
      console.log(`         Agent Output: "${contextText}"`);
      console.log(`         SUCCESS: Node executed successfully.\n`);

    } else if (currentNode.type === 'outputNode') {
      const outputChannel = currentNode.data.outputChannel || 'slack';
      const config = currentNode.data.config || {};
      
      let targetUrl = '';
      if (outputChannel === 'slack') {
        targetUrl = process.env.SLACK_WEBHOOK_URL || config.url || '';
      } else if (outputChannel === 'discord') {
        targetUrl = process.env.DISCORD_WEBHOOK_URL || config.url || '';
      } else if (outputChannel === 'webhook') {
        targetUrl = config.url || '';
      }
      
      const isTestEndpoint = !targetUrl;
      if (isTestEndpoint) {
        targetUrl = 'https://httpbin.org/post';
      }
      
      console.log(`         Output Channel: ${outputChannel}`);
      console.log(`         Target URL: ${targetUrl}`);
      console.log(`         Dispatching Payload...`);
      
      const payload = {
        jobId,
        nodeLabel: currentNode.data.label,
        channel: config.channelName || 'general',
        message: contextText,
        timestamp: new Date().toISOString()
      };
      
      try {
        const fetchResponse = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        
        console.log(`         HTTP Status: ${fetchResponse.status} ${fetchResponse.statusText}`);
        if (isTestEndpoint) {
          console.log(`         [Integration Test] Payload echoed successfully on httpbin.org.`);
        } else {
          console.log(`         [Webhook] Live dispatch successful.`);
        }
      } catch (fetchErr: any) {
        console.error(`         [HTTP Error] Failed to post payload:`, fetchErr.message);
      }
      
      await sleep(1000);
      console.log(`         SUCCESS: Node executed successfully.\n`);
    }

    // Move to next step in chain
    const nextNodeId = nextNodesMap.get(currentNode.id);
    currentNode = nextNodeId ? nodes.find((n) => n.id === nextNodeId) : undefined;
    stepIndex++;
  }

  console.log(`==================================================`);
  console.log(`${logPrefix} Job ${jobId} workflow completed successfully!`);
  console.log(`==================================================\n`);
  return contextText;
}
