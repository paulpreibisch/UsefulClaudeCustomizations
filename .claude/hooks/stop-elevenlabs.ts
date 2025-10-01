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
  // Available voice IDs (replace with your own ElevenLabs voice IDs)
  // These will be dynamically assigned to sessions found in .vscode/sessions.json
  availableVoiceIds: [
    'zYcjlYFOd3taleS0gkk3',  // Custom Voice 1 - Replace with your voice ID
    'ruirxsoakN0GWmGNIo04',  // Custom Voice 2 - Replace with your voice ID
    'DGzg6RaUqxGRTHSBjfgF',  // Custom Voice 3 - Replace with your voice ID
    'vfaqCOvlrKi4Zp7C2IAm',  // Custom Voice 4 - Replace with your voice ID
    'KTPVrSVAEUSJRClDzBw7',  // Custom Voice 5 - Replace with your voice ID
    'flHkNRp1BlvT73UL6gyz',  // Custom Voice 6 - Replace with your voice ID
    '9yzdeviXkFddZ4Oz8Mok',  // Custom Voice 7 - Replace with your voice ID
    'yjJ45q8TVCrtMhEKurxY',  // Custom Voice 8 - Replace with your voice ID
    '0SpgpJ4D3MpHCiWdyTg3',  // Custom Voice 9 - Replace with your voice ID
  ],

  // Voice name to ID mapping (for user-specified voices)
  // From ElevenLabs Character Voices Collection
  // Note: Keys are lowercase for case-insensitive matching
  voiceNameMap: {
    'Northern Terry': 'wo6udizrrtpIxWGp2qJk',
    'Grandpa Spuds Oxley': 'NOpBlnGInO9m6vDvFkFC',
    'Ms. Walker': 'DLsHlh26Ugcm6ELvS0qi',
    'Ms Walker': 'DLsHlh26Ugcm6ELvS0qi',
    'Ralf Eisend': 'A9evEp8yGjv4c3WsIKuY',
    'Amy': 'bhJUNIXWQQ94l8eI2VUf',
    'Michael': 'U1Vk2oyatMdYs096Ety7',
    'Jessica Anne Bogart': 'flHkNRp1BlvT73UL6gyz',
    'Aria': 'TC0Zp7WVFzhA8zpTlRqV',
    'Lutz Laugh': '9yzdeviXkFddZ4Oz8Mok',
    'Dr. Von Fusion': 'yjJ45q8TVCrtMhEKurxY',
    'Dr Von Fusion': 'yjJ45q8TVCrtMhEKurxY',
    'Matthew Schmitz': '0SpgpJ4D3MpHCiWdyTg3',
    'Demon Monster': 'vfaqCOvlrKi4Zp7C2IAm',
    'Cowboy Bob': 'KTPVrSVAEUSJRClDzBw7',
    'Drill Sergeant': 'DGzg6RaUqxGRTHSBjfgF'
  },

  // Default fallback voice ID if session not found in mapping
  defaultVoiceId: 'zYcjlYFOd3taleS0gkk3',

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

// DEBUG: Log that hook started
const startLog = join(process.cwd(), '.claude', 'hook-started.log');
try {
  writeFileSync(startLog, `Hook started at ${new Date().toISOString()}\n`);
} catch (e) {
  // Ignore
}

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

// Function to build dynamic voice mapping from sessions.json
function buildDynamicVoiceMapping(): {[key: string]: string} {
  try {
    const sessionsPath = join(process.cwd(), '.vscode', 'sessions.json');

    if (!existsSync(sessionsPath)) {
      console.log('ℹ️ No .vscode/sessions.json found, using default voice for all sessions');
      return {};
    }

    const sessionsConfig: SessionsConfig = JSON.parse(readFileSync(sessionsPath, 'utf8'));
    const activeSessionGroup = sessionsConfig.sessions[sessionsConfig.active] || [];

    // Build voice mapping by assigning voices to sessions in order
    const voiceMapping: {[key: string]: string} = {};

    activeSessionGroup.forEach((session, index) => {
      const voiceIndex = index % CONFIG.availableVoiceIds.length;
      voiceMapping[session.name] = CONFIG.availableVoiceIds[voiceIndex];
      console.log(`🎭 Mapped session "${session.name}" to voice ${voiceIndex + 1}: ${CONFIG.availableVoiceIds[voiceIndex]}`);
    });

    return voiceMapping;
  } catch (error) {
    console.log('⚠️ Error building dynamic voice mapping:', error);
    return {};
  }
}

// Function to get voice ID for a specific session
function getVoiceForSession(sessionName: string): string {
  if (!sessionName) {
    console.log(`🎭 Using default voice (no session detected)`);
    return CONFIG.defaultVoiceId;
  }

  // Build dynamic voice mapping from current sessions.json
  const sessionVoices = buildDynamicVoiceMapping();
  const voiceId = sessionVoices[sessionName] || CONFIG.defaultVoiceId;

  if (sessionVoices[sessionName]) {
    console.log(`🎭 Using dynamically assigned voice for "${sessionName}"`);
  } else {
    console.log(`🎭 Session "${sessionName}" not found in current sessions, using default voice`);
  }

  return voiceId;
}

// Function to check if response contains voice markers and extract summary
function checkForVoiceMarker(response: string): { shouldSpeak: boolean; summary: string; voiceOverride?: string } {
  // Check for TASK_COMPLETE marker with optional voice (both HTML and plain text formats)
  const completeMatch = response.match(/(?:<!--\s*)?TASK_COMPLETE:\s*(.+?)(?:\s*\[VOICE:\s*(.+?)\])?(?:\s*-->)?$/m);
  if (completeMatch) {
    const summary = completeMatch[1].trim();
    const voiceOverride = completeMatch[2]?.trim();
    console.log(`✅ Found TASK_COMPLETE marker: "${summary}"${voiceOverride ? ` (voice: ${voiceOverride})` : ''}`);
    return { shouldSpeak: true, summary, voiceOverride };
  }

  // Check for ACKNOWLEDGE marker with optional voice (both HTML and plain text formats)
  const ackMatch = response.match(/(?:<!--\s*)?ACKNOWLEDGE:\s*(.+?)(?:\s*\[VOICE:\s*(.+?)\])?(?:\s*-->)?$/m);
  if (ackMatch) {
    const summary = ackMatch[1].trim();
    const voiceOverride = ackMatch[2]?.trim();
    console.log(`👋 Found ACKNOWLEDGE marker: "${summary}"${voiceOverride ? ` (voice: ${voiceOverride})` : ''}`);
    return { shouldSpeak: true, summary, voiceOverride };
  }

  // No marker found - don't speak
  console.log(`🔇 No voice marker found, skipping TTS`);
  return { shouldSpeak: false, summary: '' };
}

// Function to generate a concise summary from Claude's response (legacy fallback)
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
    const data: any = input ? JSON.parse(input) : {};

    // DEBUG: Log what we receive to a file
    const debugLog = join(process.cwd(), '.claude', 'debug-hook.log');
    writeFileSync(debugLog, JSON.stringify(data, null, 2));
    console.log('🔍 DEBUG: Logged payload to .claude/debug-hook.log');

    // Read the transcript to get the actual response
    let response = '';
    if (data.transcript_path && existsSync(data.transcript_path)) {
      const transcript = readFileSync(data.transcript_path, 'utf8');
      // Parse JSONL (each line is a JSON object)
      const lines = transcript.trim().split('\n').filter(l => l.trim());

      // Find the last assistant message by iterating backwards
      for (let i = lines.length - 1; i >= 0; i--) {
        try {
          const entry = JSON.parse(lines[i]);
          if (entry.type === 'assistant' && entry.message?.content) {
            const content = entry.message.content;

            // Content can be a string or an array of content blocks
            if (typeof content === 'string') {
              response = content;
            } else if (Array.isArray(content)) {
              // Extract text from content blocks
              response = content
                .filter(block => block.type === 'text')
                .map(block => block.text)
                .join('\n');
            }

            // DEBUG: Log what we extracted
            const extractedLog = join(process.cwd(), '.claude', 'response-extracted.log');
            writeFileSync(extractedLog,
              `Response length: ${response.length}\nFirst 500 chars:\n${response.substring(0, 500)}\n\n` +
              `Looking for markers...\nACKNOWLEDGE: ${response.includes('ACKNOWLEDGE')}\nTASK_COMPLETE: ${response.includes('TASK_COMPLETE')}`
            );
            console.log(`🔍 DEBUG: Extracted response (${response.length} chars), logged to .claude/response-extracted.log`);

            break;
          }
        } catch (e) {
          // Skip invalid lines
          console.log(`⚠️ Skipping invalid JSON line: ${e}`);
        }
      }
    }

    // Check for voice markers first
    const markerCheck = checkForVoiceMarker(response);

    // If no marker found, exit early without TTS
    if (!markerCheck.shouldSpeak) {
      console.log('ℹ️ No voice marker detected - skipping TTS generation');
      process.exit(0);
    }

    // Detect current terminal session
    const sessionName = detectTerminalSession();

    // Use the summary from the marker
    const baseSummary = markerCheck.summary;

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
    // Voice override takes precedence over session-based voice
    let voiceId: string;
    if (markerCheck.voiceOverride) {
      // Check if it's a voice name or direct ID
      // Try exact match first (Title Case)
      if (CONFIG.voiceNameMap[markerCheck.voiceOverride]) {
        voiceId = CONFIG.voiceNameMap[markerCheck.voiceOverride];
        console.log(`🎤 Using user-specified voice by name: ${markerCheck.voiceOverride} (${voiceId})`);
      } else {
        // Try case-insensitive match
        const matchedKey = Object.keys(CONFIG.voiceNameMap).find(
          key => key.toLowerCase() === markerCheck.voiceOverride!.toLowerCase()
        );
        if (matchedKey) {
          voiceId = CONFIG.voiceNameMap[matchedKey];
          console.log(`🎤 Using user-specified voice by name: ${matchedKey} (${voiceId})`);
        } else if (markerCheck.voiceOverride.match(/^[a-zA-Z0-9]{15,30}$/)) {
          // Looks like a direct voice ID
          voiceId = markerCheck.voiceOverride;
          console.log(`🎤 Using user-specified voice by ID: ${voiceId}`);
        } else {
          console.log(`⚠️ Unknown voice "${markerCheck.voiceOverride}", falling back to session voice`);
          voiceId = getVoiceForSession(sessionName);
        }
      }
    } else {
      voiceId = getVoiceForSession(sessionName);
    }

    // Generate unique filename for this audio based on summary
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    // Convert summary to snake_case filename (max 10 words)
    const summaryWords = baseSummary
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .split(/\s+/) // Split by whitespace
      .filter(word => word.length > 0) // Remove empty strings
      .slice(0, 10); // Take first 10 words

    const filename = summaryWords.length > 0
      ? `${summaryWords.join('_')}-${timestamp}.mp3`
      : `summary-${timestamp}.mp3`;

    const audioPath = join(audioDir, filename);

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