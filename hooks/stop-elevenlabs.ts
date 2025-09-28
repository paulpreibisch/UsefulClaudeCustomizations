#!/usr/bin/env tsx

/**
 * ElevenLabs Voice Summary Stop Hook for Claude Code
 *
 * This hook automatically generates natural voice summaries of completed tasks
 * using the ElevenLabs text-to-speech API.
 *
 * Requirements:
 * - ElevenLabs API key (set as ELEVENLABS_API_KEY environment variable)
 * - tsx installed globally: npm install -g tsx
 *
 * @author Your Name
 * @license MIT
 */

import { exec } from 'child_process';
import { existsSync, writeFileSync, readFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface StopPayload {
  response?: string;
  timestamp?: string;
  sessionId?: string;
  taskSummary?: string;
}

interface TerminalSession {
  name: string;
  icon?: string;
  cwd: string;
  shell?: string;
  commands?: string[];
}

interface SessionsConfig {
  active: string;
  sessions: {
    [key: string]: TerminalSession[];
  };
}

interface HistoryEntry {
  id: string;
  timestamp: string;
  userPrompt?: string;
  claudeResponse?: string;
  sessionId?: string;
  projectPath: string;
  audioGenerated?: boolean;
  audioPath?: string;
}

// Configuration
const CONFIG = {
  // Session-specific voice mapping for Terminal Keeper sessions
  // Each session gets a unique, consistent voice for easy audio identification
  sessionVoices: {
    'SageDev 1': 'yOsUZuYik0dKCynjfgaE',      // Your custom voice (Session 1)
    'SageDev 2': 'EXAVITQu4vr4xnSDxMaL',      // Rachel - Professional newsreader (female)
    'WSL SageDev': 'JBFqnCBsd6RMkjVDRZzb',    // George - Calm narrator (male)
    'WSL SageDev 2': 'MF3mGyEYCl7XYWbV9V6O',  // Emily - Bubbly teenager (female)
    'WSL SageDev 3': 'TxGEqnHWrfWFTfGW9XjX',  // Josh - Energetic young adult (male)
    'TypeScript': 'onwK4e9ZLuTAKqWW03F9',      // Daniel - British accent (male)
    'Frontend': 'pNInz6obpgDQGcFmaJgB',        // Adam - Friendly guy next door (male)
    'Backend': 'ErXwobaYiN019PkySvjV',         // Antoni - Well-rounded (male)
    'Testing': 'oWAxZDx7w5VEj9dCyTzz',        // Grace - Soft spoken (female)
  },

  // Default fallback voice ID if session not found in mapping
  defaultVoiceId: 'yOsUZuYik0dKCynjfgaE',

  // Voice settings for natural speech
  voiceSettings: {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.0,
    use_speaker_boost: true
  },

  // Maximum summary length in characters
  maxSummaryLength: 150,

  // Timeout for hook execution (ms)
  timeout: 15000
};

// Read input from stdin
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('readable', () => {
  let chunk;
  while ((chunk = process.stdin.read()) !== null) {
    input += chunk;
  }
});

// Function to detect current terminal session
function detectTerminalSession(): string {
  try {
    // Check if session is manually specified via environment variable
    const manualSession = process.env.CLAUDE_SESSION_NAME;
    if (manualSession) {
      console.log(`🖥️ Session specified via CLAUDE_SESSION_NAME: ${manualSession}`);
      return manualSession;
    }

    // Look for sessions.json in .vscode directory
    const sessionsPath = join(process.cwd(), '.vscode', 'sessions.json');

    if (!existsSync(sessionsPath)) {
      console.log('ℹ️ No .vscode/sessions.json found, skipping session detection');
      return '';
    }

    const sessionsConfig: SessionsConfig = JSON.parse(readFileSync(sessionsPath, 'utf8'));
    const currentCwd = process.cwd();

    // Get the active session group
    const activeSessionGroup = sessionsConfig.sessions[sessionsConfig.active] || [];

    // Try multiple methods to detect the session
    let matchedSession = '';

    // Method 1: Try to match by exact CWD
    const exactMatch = activeSessionGroup.find(session => session.cwd === currentCwd);
    if (exactMatch) {
      matchedSession = exactMatch.name;
      console.log(`🖥️ Session detected by CWD match: ${matchedSession}`);
      return matchedSession;
    }

    // Method 2: Smart fallback - if all sessions have same CWD, try to differentiate
    const cwdMatches = activeSessionGroup.filter(session => session.cwd === currentCwd);

    if (cwdMatches.length > 1) {
      // Multiple sessions with same CWD - try to use a round-robin or time-based selection
      const sessionIndex = Math.floor(Date.now() / 30000) % cwdMatches.length; // Changes every 30 seconds
      matchedSession = cwdMatches[sessionIndex].name;
      console.log(`🖥️ Session detected by time-based selection: ${matchedSession} (${sessionIndex + 1}/${cwdMatches.length})`);
    } else if (cwdMatches.length === 1) {
      matchedSession = cwdMatches[0].name;
      console.log(`🖥️ Session detected by unique CWD match: ${matchedSession}`);
    } else {
      // Try partial CWD matching
      const partialMatch = activeSessionGroup.find(session =>
        session.cwd && (
          currentCwd.startsWith(session.cwd) ||
          session.cwd.startsWith(currentCwd)
        )
      );

      if (partialMatch) {
        matchedSession = partialMatch.name;
        console.log(`🖥️ Session detected by partial CWD match: ${matchedSession}`);
      }
    }

    // Fallback: Use first session if no specific match found
    if (!matchedSession && activeSessionGroup.length > 0) {
      matchedSession = activeSessionGroup[0].name;
      console.log(`🖥️ Session detected by fallback (first session): ${matchedSession}`);
    }

    if (matchedSession) {
      return matchedSession;
    } else {
      console.log('ℹ️ Could not match current terminal to any defined session');
      return '';
    }

  } catch (error) {
    console.log('⚠️ Error detecting terminal session:', error);
    return '';
  }
}

// Function to get voice ID for a specific session
function getVoiceForSession(sessionName: string): string {
  if (!sessionName) {
    console.log(`🎭 Using default voice (no session detected)`);
    return CONFIG.defaultVoiceId;
  }

  const voiceId = CONFIG.sessionVoices[sessionName] || CONFIG.defaultVoiceId;

  if (CONFIG.sessionVoices[sessionName]) {
    console.log(`🎭 Using session-specific voice for "${sessionName}"`);
  } else {
    console.log(`🎭 Session "${sessionName}" not in voice mapping, using default voice`);
  }

  return voiceId;
}

// Function to generate a concise summary from Claude's response
function generateSummary(response: string): string {
  // Clean the response first
  const cleanedResponse = response
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]+`/g, '') // Remove inline code
    .trim();

  // Split into sentences
  const sentences = cleanedResponse.match(/[^.!?]+[.!?]+/g) || [];

  // Priority patterns for finding the most relevant summary
  const priorityPatterns = [
    // Specific action completions
    /(?:I've|I have|I've just|Successfully)\s+(.+?)(?:\.|!|$)/i,
    /(?:Created|Updated|Added|Fixed|Implemented|Configured|Modified|Deleted|Generated)\s+(.+?)(?:\.|!|$)/i,
    // File operations
    /(?:File|Files|Directory|Folder)\s+(?:created|updated|modified|deleted|written)\s+(.+?)(?:\.|!|$)/i,
    // Check mark completions
    /✅\s*(.+?)(?:\.|!|$)/i,
    // Task descriptions
    /(?:The|Your)\s+(.+?)\s+(?:has been|have been|is now|are now)\s+(.+?)(?:\.|!|$)/i,
    // General completions
    /(?:Completed|Finished|Done with)\s+(.+?)(?:\.|!|$)/i
  ];

  let summary = '';

  // Try to extract from patterns
  for (const pattern of priorityPatterns) {
    for (const sentence of sentences) {
      const match = sentence.match(pattern);
      if (match) {
        // Get the captured group or the whole match
        summary = (match[1] || match[0]).trim();

        // If we captured something meaningful, use it
        if (summary.length > 10 && summary.length < CONFIG.maxSummaryLength) {
          break;
        }
      }
    }
    if (summary) break;
  }

  // If no pattern matched, try to find the most informative sentence
  if (!summary) {
    // Look for sentences with action verbs
    const actionVerbs = ['created', 'updated', 'added', 'fixed', 'modified', 'configured',
                        'deleted', 'implemented', 'generated', 'built', 'installed', 'set up'];

    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      if (actionVerbs.some(verb => lowerSentence.includes(verb))) {
        summary = sentence.trim();
        break;
      }
    }
  }

  // If still no summary, take the first substantial sentence
  if (!summary) {
    for (const sentence of sentences) {
      const cleaned = sentence.trim();
      if (cleaned.length > 20 && cleaned.length < CONFIG.maxSummaryLength &&
          !cleaned.startsWith('This') && !cleaned.startsWith('Here') &&
          !cleaned.startsWith('Let me')) {
        summary = cleaned;
        break;
      }
    }
  }

  // Last resort: extract first line that's not a greeting or meta text
  if (!summary) {
    const lines = cleanedResponse.split('\n').filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 10 &&
             !trimmed.startsWith('#') &&
             !trimmed.startsWith('//') &&
             !trimmed.toLowerCase().startsWith('hello') &&
             !trimmed.toLowerCase().startsWith('hi ');
    });

    if (lines.length > 0) {
      summary = lines[0].trim();
    }
  }

  // Default fallback
  if (!summary || summary.length < 5) {
    summary = 'Task completed successfully';
  }

  // Clean up the summary
  summary = summary
    .replace(/[*`~_#]/g, '') // Remove markdown formatting
    .replace(/\[.*?\]/g, '') // Remove brackets
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/^["']|["']$/g, '') // Remove quotes
    .trim();

  // Ensure it ends properly
  if (!summary.match(/[.!?]$/)) {
    summary += '.';
  }

  // Ensure it's not too long for TTS
  if (summary.length > CONFIG.maxSummaryLength) {
    summary = summary.substring(0, CONFIG.maxSummaryLength - 3) + '...';
  }

  console.log(`🔍 Extracted summary: "${summary}"`);

  return summary;
}

// Function to call ElevenLabs API directly
async function generateSpeechWithElevenLabs(text: string, outputPath: string, voiceId: string): Promise<boolean> {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    console.error('❌ ELEVENLABS_API_KEY not set. Please set it in your environment.');
    console.error('   Get your API key from: https://elevenlabs.io');
    return false;
  }

  try {
    console.log(`🎤 Generating speech with voice ID: ${voiceId}`);
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: CONFIG.voiceSettings
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ ElevenLabs API error: ${response.status} - ${errorText}`);
      return false;
    }

    const audioBuffer = await response.arrayBuffer();
    writeFileSync(outputPath, Buffer.from(audioBuffer));

    console.log(`✅ Generated speech file: ${outputPath}`);
    return true;
  } catch (error) {
    console.error('❌ Error generating speech with ElevenLabs:', error);
    return false;
  }
}

// Function to play audio file
async function playAudioFile(audioPath: string): Promise<void> {
  const platform = process.platform;
  let cmd: string;

  if (platform === 'darwin') {
    // macOS: use afplay
    cmd = `afplay "${audioPath}"`;
  } else if (platform === 'win32') {
    // Windows: use PowerShell
    cmd = `powershell -c "(New-Object Media.SoundPlayer '${audioPath}').PlaySync()"`;
  } else {
    // Linux/WSL: try multiple players
    cmd = `paplay "${audioPath}" 2>/dev/null || aplay "${audioPath}" 2>/dev/null || play "${audioPath}" 2>/dev/null`;
  }

  try {
    await execAsync(cmd, { timeout: 10000 });
    console.log('✅ Audio playback completed');
  } catch (error) {
    console.error('❌ Error playing audio:', error);
  }
}

// Function to update history with audio information
function updateHistory(audioPath: string, summary: string) {
  try {
    const historyDir = join(process.cwd(), '.claude', 'history');
    const indexPath = join(historyDir, 'index.json');

    if (!existsSync(historyDir)) {
      mkdirSync(historyDir, { recursive: true });
    }

    if (!existsSync(indexPath)) {
      writeFileSync(indexPath, '[]');
      return;
    }

    const index: string[] = JSON.parse(readFileSync(indexPath, 'utf8'));
    if (index.length === 0) return;

    // Get the most recent entry
    const latestEntryId = index[0];
    const entryPath = join(historyDir, `${latestEntryId}.json`);

    if (!existsSync(entryPath)) return;

    const historyEntry: HistoryEntry = JSON.parse(readFileSync(entryPath, 'utf8'));

    // Update with audio information
    historyEntry.audioGenerated = true;
    historyEntry.audioPath = audioPath;
    historyEntry.claudeResponse = summary;

    writeFileSync(entryPath, JSON.stringify(historyEntry, null, 2));

    console.log(`✅ Updated history entry with audio: ${latestEntryId}`);
  } catch (error) {
    console.error('❌ Error updating history:', error);
  }
}

process.stdin.on('end', async () => {
  try {
    const data: StopPayload = input ? JSON.parse(input) : {};

    // Detect current terminal session
    const sessionName = detectTerminalSession();

    // Generate summary from Claude's response
    const baseSummary = data.taskSummary || generateSummary(data.response || '');

    // Prepend session name if detected
    const summary = sessionName
      ? `Session ${sessionName}: ${baseSummary}`
      : baseSummary;

    console.log(`📝 Task Summary: ${summary}`);

    // Create audio directory if it doesn't exist
    const audioDir = join(process.cwd(), '.claude', 'audio');
    if (!existsSync(audioDir)) {
      mkdirSync(audioDir, { recursive: true });
    }

    // Get the appropriate voice for this session
    const voiceId = getVoiceForSession(sessionName);

    // Generate unique filename for this audio
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const audioPath = join(audioDir, `summary-${timestamp}.mp3`);

    // Generate speech using ElevenLabs with session-specific voice
    const speechGenerated = await generateSpeechWithElevenLabs(summary, audioPath, voiceId);

    if (speechGenerated && existsSync(audioPath)) {
      // Update history with audio information
      updateHistory(audioPath, summary);

      // Play the generated audio
      await playAudioFile(audioPath);
    } else {
      console.log('⚠️ Speech generation failed, falling back to text summary only');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error in stop hook:', error);
    process.exit(1);
  }
});

// Handle timeout
setTimeout(() => {
  console.log('⏱️ Hook timeout - completing without audio');
  process.exit(0);
}, CONFIG.timeout);