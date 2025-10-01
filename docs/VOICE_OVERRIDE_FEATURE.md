# Voice Override Feature

**Date Added**: 2025-10-01

## Overview

The marker-based TTS system now supports **user-specified voice overrides**, allowing users to choose specific ElevenLabs voices for individual commands.

## How It Works

### Marker Format

Add the voice name to your markers using the `[VOICE: VoiceName]` syntax:

```markdown
<!-- ACKNOWLEDGE: Summary text [VOICE: Aria] -->
<!-- TASK_COMPLETE: Summary text [VOICE: Aria] -->
```

### Voice Name Resolution

The system resolves voice names in this order:

1. **Exact match** (Title Case): `Aria` → `TC0Zp7WVFzhA8zpTlRqV`
2. **Case-insensitive match**: `aria` → `TC0Zp7WVFzhA8zpTlRqV`
3. **Direct voice ID**: `TC0Zp7WVFzhA8zpTlRqV` → Used directly
4. **Fallback**: Use session-based voice mapping

## Supported Voices

All voice names from the ElevenLabs Character Voices Collection (see README.md):

| Voice Name | Voice ID | Description |
|------------|----------|-------------|
| **Northern Terry** | `wo6udizrrtpIxWGp2qJk` | Eccentric & husky from North England |
| **Grandpa Spuds Oxley** | `NOpBlnGInO9m6vDvFkFC` | Friendly grandpa storyteller |
| **Ms. Walker** | `DLsHlh26Ugcm6ELvS0qi` | Warm & caring Southern mom |
| **Ralf Eisend** | `A9evEp8yGjv4c3WsIKuY` | International audiobook speaker |
| **Amy** | `bhJUNIXWQQ94l8eI2VUf` | Young, natural, relaxed |
| **Michael** | `U1Vk2oyatMdYs096Ety7` | Deep British urban voice |
| **Jessica Anne Bogart** | `flHkNRp1BlvT73UL6gyz` | The Villain! Wickedly eloquent |
| **Aria** | `TC0Zp7WVFzhA8zpTlRqV` | Sexy female villain voice |
| **Lutz Laugh** | `9yzdeviXkFddZ4Oz8Mok` | Chuckling and giggly |
| **Dr. Von Fusion** | `yjJ45q8TVCrtMhEKurxY` | Energetic, quirky eccentric |
| **Matthew Schmitz** | `0SpgpJ4D3MpHCiWdyTg3` | Elitist, arrogant tyrant |
| **Demon Monster** | `vfaqCOvlrKi4Zp7C2IAm` | Deep demon for horror/fantasy |
| **Cowboy Bob** | `KTPVrSVAEUSJRClDzBw7` | Rich voice with rugged warmth |
| **Drill Sergeant** | `DGzg6RaUqxGRTHSBjfgF` | Harsh, commanding authority |

## Usage Examples

### Example 1: User Specifies Voice

```
User: "Fix the authentication bug using Aria voice"

Claude response:
I'll fix the authentication bug and run tests.<!-- ACKNOWLEDGE: Fixing authentication bug [VOICE: Aria] -->

[... work in progress ...]

Fixed the authentication bug in src/auth.ts:45. All tests pass.<!-- TASK_COMPLETE: Fixed bug, tests pass [VOICE: Aria] -->
```

**Result**: Both acknowledgement and completion play in Aria's voice.

### Example 2: No Voice Specified

```
User: "Fix the authentication bug"

Claude response:
I'll fix the authentication bug and run tests.<!-- ACKNOWLEDGE: Fixing authentication bug -->

[... work in progress ...]

Fixed the authentication bug. All tests pass.<!-- TASK_COMPLETE: Fixed bug, tests pass -->
```

**Result**: Uses session-based voice mapping (or default voice).

### Example 3: Case-Insensitive Match

```markdown
<!-- ACKNOWLEDGE: Testing [VOICE: aria] -->
<!-- ACKNOWLEDGE: Testing [VOICE: ARIA] -->
<!-- ACKNOWLEDGE: Testing [VOICE: Aria] -->
```

All three variations resolve to the same voice ID: `TC0Zp7WVFzhA8zpTlRqV`

## Output Style Configuration

Use the **voice-summaries-enhanced.md** output style to enable this feature.

The output style instructs Claude to:
1. Detect when user specifies a voice in their request
2. Add `[VOICE: VoiceName]` to markers
3. Use the same voice for both acknowledgement and completion

## Implementation Details

### Hook File
`hooks/stop-elevenlabs.ts` (lines 73-93, 531-559)

### Voice Mapping
```typescript
voiceNameMap: {
  'Northern Terry': 'wo6udizrrtpIxWGp2qJk',
  'Grandpa Spuds Oxley': 'NOpBlnGInO9m6vDvFkFC',
  // ... etc
}
```

### Detection Logic
```typescript
// Check for ACKNOWLEDGE marker with optional voice
const ackMatch = response.match(/<!--\s*ACKNOWLEDGE:\s*(.+?)(?:\s*\[VOICE:\s*(.+?)\])?\s*-->/);
if (ackMatch) {
  const summary = ackMatch[1].trim();
  const voiceOverride = ackMatch[2]?.trim();
  // ... resolve voice and generate TTS
}
```

## Benefits

1. **User Control**: Users can choose specific voices per command
2. **Backward Compatible**: Works with existing session-based mapping
3. **Flexible**: Supports both voice names and direct IDs
4. **Case-Insensitive**: Works regardless of capitalization
5. **Consistent**: Same voice used for acknowledgement and completion

## Troubleshooting

### Voice Not Working
- Check voice name spelling (use Title Case: "Aria", not "aria")
- Verify voice ID exists in `CONFIG.voiceNameMap`
- Check console logs for voice resolution messages

### Wrong Voice Playing
- Ensure `[VOICE: VoiceName]` is inside the marker
- Check for typos in voice name
- Verify both acknowledgement and completion use same voice

### Voice Override Ignored
- Make sure output style is active
- Check that marker format is correct: `<!-- ACKNOWLEDGE: text [VOICE: Name] -->`
- Verify hook is detecting markers (check console output)
