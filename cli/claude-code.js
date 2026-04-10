/**
 * Claude Code subprocess adapter.
 *
 * Spawns the `claude` CLI as a child process with stream-json I/O,
 * following patterns from Angy's ClaudeProcess.ts.
 *
 * Provides two functions:
 *   - queryLLM(prompt) → string   — single-turn text query (style selection, etc.)
 *   - runAgent(prompt, opts)       — multi-turn agent with tools (code generation)
 */
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

// ── Binary resolution ────────────────────────────────────────────────────

function resolveClaudeBinary() {
  const home = homedir();
  const candidates = [
    join(home, '.local', 'bin', 'claude'),
    join(home, '.nix-profile', 'bin', 'claude'),
    '/opt/homebrew/bin/claude',
    '/usr/local/bin/claude',
    '/snap/bin/claude',
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return 'claude'; // fallback to PATH
}

// ── Build enhanced PATH ──────────────────────────────────────────────────

function buildEnhancedPath() {
  const home = homedir();
  const extra = [
    join(home, '.local', 'bin'),
    join(home, '.nix-profile', 'bin'),
    '/opt/homebrew/bin',
    '/opt/homebrew/sbin',
    '/usr/local/bin',
    '/usr/bin',
    '/bin',
    '/usr/sbin',
    '/sbin',
  ];

  // Check for NVM
  const nvmBase = join(home, '.nvm', 'versions', 'node');
  if (existsSync(nvmBase)) {
    try {
      const versions = readdirSync(nvmBase).sort();
      if (versions.length > 0) {
        extra.unshift(join(nvmBase, versions[versions.length - 1], 'bin'));
      }
    } catch { /* nvm not available */ }
  }

  const current = process.env.PATH || '';
  return [...extra, ...current.split(':')].join(':');
}

// ── Spawn claude process ─────────────────────────────────────────────────

/**
 * Spawn a claude CLI process and communicate via stream-json.
 *
 * @param {object} opts
 * @param {string} opts.prompt - The message to send
 * @param {string} [opts.model] - Model to use
 * @param {string} [opts.systemPrompt] - Appended system prompt
 * @param {string} [opts.workingDir] - Working directory for the agent
 * @param {string} [opts.sessionId] - Session ID (new session if omitted)
 * @param {string} [opts.resumeSessionId] - Resume an existing session
 * @param {string[]} [opts.tools] - Tool whitelist (e.g. ['Read','Glob','Grep'])
 * @param {boolean} [opts.toolsOnly=false] - If true, restrict to read-only tools (for queries)
 * @param {(event: object) => void} [opts.onEvent] - Stream event callback
 * @returns {Promise<{ text: string, sessionId: string, costUsd: number }>}
 */
export function spawnClaude(opts) {
  return new Promise((resolve, reject) => {
    const claudeBin = resolveClaudeBinary();

    const args = [
      '-p',
      '--input-format', 'stream-json',
      '--output-format', 'stream-json',
      '--verbose',
    ];

    if (opts.model) {
      args.push('--model', opts.model);
    }

    if (opts.resumeSessionId) {
      args.push('--resume', opts.resumeSessionId);
    } else {
      args.push('--session-id', opts.sessionId || randomUUID());
    }

    if (opts.systemPrompt) {
      args.push('--append-system-prompt', opts.systemPrompt);
    }

    if (opts.workingDir) {
      args.push('--add-dir', opts.workingDir);
    }

    // Tool access
    if (opts.toolsOnly) {
      args.push('--permission-mode', 'bypassPermissions');
      args.push('--tools', 'Read,Glob,Grep');
    } else {
      args.push('--permission-mode', 'bypassPermissions');
      const tools = opts.tools || ['Bash', 'Read', 'Edit', 'Write', 'Glob', 'Grep'];
      args.push('--tools', tools.join(','));
    }

    const env = {
      ...process.env,
      PATH: buildEnhancedPath(),
      CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING: '1',
      CLAUDE_CODE_AUTO_COMPACT_WINDOW: '400000',
    };

    const child = spawn(claudeBin, args, {
      cwd: opts.workingDir || process.cwd(),
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdoutBuffer = '';
    let accumulatedText = '';
    let sessionId = '';
    let costUsd = 0;
    let completed = false;

    function processLine(line) {
      const trimmed = line.trim();
      if (!trimmed) return;

      let j;
      try {
        j = JSON.parse(trimmed);
      } catch {
        return;
      }

      if (opts.onEvent) opts.onEvent(j);

      const type = j.type;

      // system init — extract session_id
      if (type === 'system') {
        sessionId = j.session_id || sessionId;
        return;
      }

      // result event (final)
      if (type === 'result') {
        sessionId = j.session_id || sessionId;
        costUsd = j.total_cost_usd || j.cost_usd || costUsd;
        completed = true;
        return;
      }

      // assistant snapshot — extract session_id and text
      if (type === 'assistant') {
        sessionId = j.session_id || sessionId;
        const content = j.message?.content;
        if (Array.isArray(content)) {
          for (const block of content) {
            if (block.type === 'text' && block.text) {
              // Only use snapshot text if we haven't been streaming
              if (!accumulatedText) {
                accumulatedText = block.text;
              }
            }
          }
        }
        return;
      }

      // stream_event wrapper — extract text deltas
      if (type === 'stream_event' && j.event) {
        const ev = j.event;
        if (ev.type === 'content_block_delta' && ev.delta) {
          if (ev.delta.type === 'text_delta' && ev.delta.text) {
            accumulatedText += ev.delta.text;
            if (opts.onText) opts.onText(ev.delta.text);
          }
        }
        return;
      }

      // error
      if (type === 'error') {
        const msg = j.error?.message || JSON.stringify(j);
        if (opts.onEvent) opts.onEvent({ type: 'error', message: msg });
      }
    }

    child.stdout.on('data', (data) => {
      stdoutBuffer += data.toString();
      // Process complete lines
      let idx;
      while ((idx = stdoutBuffer.indexOf('\n')) >= 0) {
        const line = stdoutBuffer.substring(0, idx);
        stdoutBuffer = stdoutBuffer.substring(idx + 1);
        processLine(line);
      }
    });

    let stderrOutput = '';
    child.stderr.on('data', (data) => {
      stderrOutput += data.toString();
    });

    child.on('close', (code) => {
      // Process remaining buffer
      if (stdoutBuffer.trim()) {
        processLine(stdoutBuffer);
        stdoutBuffer = '';
      }

      if (code !== 0 && !completed) {
        reject(new Error(`claude exited with code ${code}: ${stderrOutput.slice(0, 500)}`));
      } else {
        resolve({ text: accumulatedText, sessionId, costUsd });
      }
    });

    child.on('error', (err) => {
      reject(new Error(`Failed to start claude: ${err.message}. Is it installed?`));
    });

    // Send the message via stdin
    const contentArray = [{ type: 'text', text: opts.prompt }];
    const envelope = {
      type: 'user',
      message: { role: 'user', content: contentArray },
    };

    child.stdin.write(JSON.stringify(envelope) + '\n');

    // Grace period: after result, kill the process to allow JSONL flush
    const checkDone = setInterval(() => {
      if (completed && child.exitCode === null) {
        clearInterval(checkDone);
        setTimeout(() => {
          try { child.kill(); } catch { /* already dead */ }
        }, 2000);
      }
    }, 100);
  });
}

// ── High-level helpers ───────────────────────────────────────────────────

/**
 * Create a queryLLM function backed by Claude Code subprocess.
 * Used for single-turn queries (style selection, variation strategies).
 *
 * @param {object} [opts]
 * @param {string} [opts.model] - Model override
 * @returns {(prompt: string) => Promise<string>}
 */
export function createClaudeCodeQueryLLM(opts = {}) {
  return async function queryLLM(prompt) {
    const result = await spawnClaude({
      prompt,
      model: opts.model,
      toolsOnly: true, // read-only, no file writes for queries
    });
    return result.text;
  };
}

/**
 * Run Claude Code agent for code generation.
 *
 * @param {object} opts
 * @param {string} opts.prompt - Full generation prompt
 * @param {string} opts.workingDir - Output directory
 * @param {string} [opts.model] - Model override
 * @param {string} [opts.systemPrompt] - System prompt
 * @param {string} [opts.sessionId] - Session ID for new session
 * @param {string} [opts.resumeSessionId] - Resume existing session
 * @param {(text: string) => void} [opts.onText] - Text streaming callback
 * @param {(event: object) => void} [opts.onEvent] - Raw event callback
 * @returns {Promise<{ sessionId: string, costUsd: number }>}
 */
export async function runGeneration(opts) {
  const result = await spawnClaude({
    prompt: opts.prompt,
    model: opts.model,
    systemPrompt: opts.systemPrompt,
    workingDir: opts.workingDir,
    sessionId: opts.sessionId,
    resumeSessionId: opts.resumeSessionId,
    tools: ['Bash', 'Read', 'Edit', 'Write', 'Glob', 'Grep'],
    onText: opts.onText,
    onEvent: opts.onEvent,
  });
  return { sessionId: result.sessionId, costUsd: result.costUsd };
}

/**
 * Continue an iterate session — send a follow-up message.
 *
 * @param {object} opts
 * @param {string} opts.sessionId - Existing session ID to resume
 * @param {string} opts.message - User message
 * @param {string} opts.workingDir - Working directory
 * @param {string} [opts.model] - Model override
 * @param {(text: string) => void} [opts.onText] - Text streaming callback
 * @returns {Promise<{ text: string, costUsd: number }>}
 */
export async function continueSession(opts) {
  const result = await spawnClaude({
    prompt: opts.message,
    model: opts.model,
    workingDir: opts.workingDir,
    resumeSessionId: opts.sessionId,
    tools: ['Bash', 'Read', 'Edit', 'Write', 'Glob', 'Grep'],
    onText: opts.onText,
  });
  return { text: result.text, costUsd: result.costUsd };
}
