/**
 * AgentLoop-based LLM query adapter for the web app.
 *
 * Provides a simple `queryLLM(prompt) → string` function that wraps
 * @angycode/core AgentLoop for quick single-turn queries (style selection,
 * variation strategies, etc.).
 *
 * The heavy-lifting code generation in process-job.js and process-iterate.js
 * still creates AgentLoop directly (they need streaming, multi-turn, tools, etc.).
 */
import {
  AgentLoop,
  createProvider,
  createDefaultRegistry,
  DatabaseImpl,
} from '@angycode/core';

/**
 * Create a queryLLM function backed by @angycode/core AgentLoop.
 *
 * @param {object} opts
 * @param {string} opts.model - Model ID (e.g. 'claude-sonnet-4-6')
 * @param {string} opts.providerName - Provider name ('anthropic' | 'gemini')
 * @param {string} opts.apiKey - API key
 * @returns {(prompt: string) => Promise<string>}
 */
export function createAgentLoopQueryLLM({ model, providerName, apiKey }) {
  return async function queryLLM(prompt) {
    const provider = createProvider({ name: providerName, apiKey });
    const agentDb = new DatabaseImpl();
    const tools = createDefaultRegistry();

    const agent = new AgentLoop({
      provider,
      tools,
      db: agentDb,
      workingDir: process.cwd(),
      maxTokens: 2048,
      maxTurns: 1,
      model,
      providerName,
      disabledTools: ['bash', 'read', 'write', 'edit', 'glob', 'grep', 'webfetch'],
    });

    let result = '';
    agent.on('event', (event) => {
      if (event.type === 'text') {
        result += event.text;
      }
    });

    try {
      await agent.run(prompt);
    } finally {
      agentDb.close();
    }

    return result;
  };
}
