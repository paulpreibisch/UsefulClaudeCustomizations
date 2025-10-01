# Migration to Marker-Based TTS System

**Date**: 2025-10-01
**Backup Location**: `.claude/backups/20251001_123703/`

## What Changed

### Old System (Manual Bash Calls)
- Claude manually executed `play-tts.sh` via Bash tool
- Required two explicit TTS calls per task
- Easy to forget or skip
- Blocking - Claude had to wait for TTS to complete

### New System (Automatic Markers)
- Claude adds HTML comment markers to responses
- Stop hook automatically detects markers and generates TTS
- Non-blocking - TTS happens in background
- Impossible to forget - just add markers

## File Changes

### 1. Hooks
- **Old**: `.claude/hooks/stop-tts.ts` (spawned separate agent)
- **New**: `.claude/hooks/stop-elevenlabs-new.ts` (marker-based detection)
- **Backup**: `.claude/backups/20251001_123703/hooks_backup/`

### 2. Settings
- **File**: `.claude/settings.json`
- **Changed**: Stop hook now points to `stop-elevenlabs-new.ts`
- **Backup**: `.claude/backups/20251001_123703/settings.json`

### 3. Documentation
- **File**: `CLAUDE.md` (lines 790-877)
- **Changed**: Completely rewritten TTS section
- **Backup**: `.claude/backups/20251001_123703/CLAUDE.md`

### 4. Output Style
- **New File**: `.claude/output-styles/voice-summaries-enhanced.md`
- **Purpose**: Instructs Claude to use marker-based system

## How to Use

### Basic Usage (No Voice Specified)
```markdown
I'll fix the bug and run tests.<!-- ACKNOWLEDGE: Fixing bug and running tests -->

[... work completed ...]

Fixed the bug successfully.<!-- TASK_COMPLETE: Fixed bug successfully -->
```

### With User-Specified Voice
```markdown
User: "Fix the bug using Sarah voice"

I'll fix the bug and run tests.<!-- ACKNOWLEDGE: Fixing bug [VOICE: Sarah] -->

[... work completed ...]

Fixed the bug successfully.<!-- TASK_COMPLETE: Fixed bug [VOICE: Sarah] -->
```

## Voice Names and IDs

| Voice Name | Voice ID |
|------------|----------|
| Cowboy | KTPVrSVAEUSJRClDzBw7 |
| Joanne | TC0Zp7WVFzhA8zpTlRqV |
| Alex | zYcjlYFOd3taleS0gkk3 |
| Sarah | ruirxsoakN0GWmGNIo04 |
| Marcus | DGzg6RaUqxGRTHSBjfgF |
| Deep Male | vfaqCOvlrKi4Zp7C2IAm |
| Sophia | flHkNRp1BlvT73UL6gyz |
| David | 9yzdeviXkFddZ4Oz8Mok |
| Isabella | yjJ45q8TVCrtMhEKurxY |
| Michael | 0SpgpJ4D3MpHCiWdyTg3 |
| Southern Mama | DLsHlh26Ugcm6ELvS0qi |
| Amy (Chinese) | bhJUNIXWQQ94l8eI2VUf |
| Grandpa Oxley | NOpBlnGInO9m6vDvFkFC |
| Northern Terry | wo6udizrrtpIxWGp2qJk |
| Charollot | XB0fDUnXU5powFXDhCwa |

## Benefits of New System

1. **Non-Blocking**: TTS generation happens after response completes
2. **Automatic**: Can't be forgotten - markers trigger TTS automatically
3. **Cleaner Context**: No audio data in Claude's context window
4. **Consistent**: Same behavior every time
5. **Session-Aware**: Supports session-based voice mapping (if configured)
6. **User Control**: Still supports per-command voice override

## Rollback Instructions

If you need to revert to the old system:

```bash
# Restore old files
cp .claude/backups/20251001_123703/CLAUDE.md ./CLAUDE.md
cp .claude/backups/20251001_123703/settings.json .claude/settings.json

# Old hook is still available at:
# .claude/hooks/stop-tts.ts (agent-based)
# .claude/hooks/play-tts.sh (manual script)
```

## Testing the New System

1. Restart Claude Code to load new settings
2. Send a test command: "Test the TTS system"
3. Claude should respond with markers
4. Audio should play automatically at start and end

## Troubleshooting

**No audio playing:**
- Check that `ELEVENLABS_API_KEY` is set
- Verify `.claude/settings.json` points to `stop-elevenlabs-new.ts`
- Check hook logs for marker detection messages

**Wrong voice:**
- Verify voice name matches exactly (case-insensitive)
- Check that voice ID exists in CONFIG.voiceNameMap
- Review marker format: `[VOICE: VoiceName]`

**Markers visible in output:**
- HTML comments should be invisible in markdown rendering
- If visible, check your markdown renderer settings
