# ElevenLabs TTS Integration for Claude Code

> **Make your AI assistant talk to you!** This guide shows you how to set up voice announcements in Claude Code using ElevenLabs text-to-speech, so Claude can audibly confirm commands and announce when tasks are complete.

## 🎯 What You'll Get

- **Voice acknowledgment** when you give Claude a command
- **Voice confirmation** when Claude completes a task
- **Multiple voice options** (male, female, character voices)
- **Voice switching** on the fly
- **Hands-free workflow** - hear updates without watching the terminal

## 📋 Prerequisites

1. **Claude Code CLI** installed and working
2. **ElevenLabs API account** (free tier works!)
3. **ElevenLabs API key**
4. **Basic terminal knowledge**

## 🚀 Quick Setup

### Step 1: Get Your ElevenLabs API Key

1. Sign up at [ElevenLabs](https://elevenlabs.io)
2. Go to your profile → API Keys
3. Copy your API key (keep it secret!)

### Step 2: Set Up Environment Variable

Add your API key to your shell profile:

```bash
# For bash (~/.bashrc) or zsh (~/.zshrc)
export ELEVENLABS_API_KEY="your_api_key_here"

# Reload your shell
source ~/.bashrc  # or source ~/.zshrc
```

### Step 3: Create the Voice Manager Script

Create `.claude/hooks/voice-manager.sh`:

```bash
#!/bin/bash
# Voice Manager - Handle voice switching and listing
# Usage: voice-manager.sh [list|switch|get] [voice_name]

VOICE_FILE="/tmp/claude-tts-voice-${USER}.txt"

# Voice mapping (customize with your own ElevenLabs voice IDs!)
declare -A VOICES=(
  ["Cowboy"]="KTPVrSVAEUSJRClDzBw7"
  ["GentleGirl"]="TC0Zp7WVFzhA8zpTlRqV"
  ["Alex"]="zYcjlYFOd3taleS0gkk3"
  ["Sarah"]="ruirxsoakN0GWmGNIo04"
  ["Marcus"]="DGzg6RaUqxGRTHSBjfgF"
  ["Emma"]="vfaqCOvlrKi4Zp7C2IAm"
  ["Sophia"]="flHkNRp1BlvT73UL6gyz"
  ["David"]="9yzdeviXkFddZ4Oz8Mok"
)

case "$1" in
  list)
    echo "🎤 Available TTS Voices:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    CURRENT_VOICE=$(cat "$VOICE_FILE" 2>/dev/null || echo "Cowboy")
    for voice in "${!VOICES[@]}"; do
      if [ "$voice" = "$CURRENT_VOICE" ]; then
        echo "  ▶ $voice (current)"
      else
        echo "    $voice"
      fi
    done | sort
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Usage: Voice Switch <name>"
    ;;

  switch)
    VOICE_NAME="$2"
    if [[ -z "$VOICE_NAME" ]]; then
      echo "❌ Error: Please specify a voice name"
      exit 1
    fi

    # Check if voice exists (case-insensitive)
    FOUND=""
    for voice in "${!VOICES[@]}"; do
      if [[ "${voice,,}" == "${VOICE_NAME,,}" ]]; then
        FOUND="$voice"
        break
      fi
    done

    if [[ -z "$FOUND" ]]; then
      echo "❌ Unknown voice: $VOICE_NAME"
      echo ""
      echo "Available voices:"
      for voice in "${!VOICES[@]}"; do
        echo "  - $voice"
      done | sort
      exit 1
    fi

    echo "$FOUND" > "$VOICE_FILE"
    echo "✅ Voice switched to: $FOUND"
    echo "🎤 Voice ID: ${VOICES[$FOUND]}"
    ;;

  get)
    if [ -f "$VOICE_FILE" ]; then
      cat "$VOICE_FILE"
    else
      echo "Cowboy"
    fi
    ;;

  *)
    echo "Usage: voice-manager.sh [list|switch|get] [voice_name]"
    exit 1
    ;;
esac
```

Make it executable:
```bash
chmod +x .claude/hooks/voice-manager.sh
```

### Step 4: Create the TTS Player Script

Create `.claude/hooks/play-tts.sh`:

```bash
#!/bin/bash
# TTS Player - Play text using ElevenLabs API
# Usage: play-tts.sh "text to speak"

# Get the message to speak
MESSAGE="$1"

if [ -z "$MESSAGE" ]; then
  echo "Error: No message provided"
  exit 1
fi

# Check for API key
if [ -z "$ELEVENLABS_API_KEY" ]; then
  echo "Error: ELEVENLABS_API_KEY not set"
  exit 1
fi

# Get current voice
VOICE_FILE="/tmp/claude-tts-voice-${USER}.txt"
CURRENT_VOICE=$(cat "$VOICE_FILE" 2>/dev/null || echo "Cowboy")

# Voice IDs mapping (must match voice-manager.sh)
declare -A VOICES=(
  ["Cowboy"]="KTPVrSVAEUSJRClDzBw7"
  ["GentleGirl"]="TC0Zp7WVFzhA8zpTlRqV"
  ["Alex"]="zYcjlYFOd3taleS0gkk3"
  ["Sarah"]="ruirxsoakN0GWmGNIo04"
  ["Marcus"]="DGzg6RaUqxGRTHSBjfgF"
  ["Emma"]="vfaqCOvlrKi4Zp7C2IAm"
  ["Sophia"]="flHkNRp1BlvT73UL6gyz"
  ["David"]="9yzdeviXkFddZ4Oz8Mok"
)

VOICE_ID="${VOICES[$CURRENT_VOICE]}"

# Call ElevenLabs API and play audio
curl -s -X POST \
  "https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}" \
  -H "xi-api-key: ${ELEVENLABS_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"${MESSAGE}\",\"model_id\":\"eleven_monolingual_v1\"}" \
  --output /tmp/tts-output.mp3

# Play the audio (adjust for your system)
if command -v afplay &> /dev/null; then
  # macOS
  afplay /tmp/tts-output.mp3
elif command -v mpg123 &> /dev/null; then
  # Linux
  mpg123 -q /tmp/tts-output.mp3
elif command -v ffplay &> /dev/null; then
  # Linux (ffmpeg)
  ffplay -nodisp -autoexit -loglevel quiet /tmp/tts-output.mp3
else
  echo "No audio player found. Install mpg123 or ffplay."
fi

# Cleanup
rm -f /tmp/tts-output.mp3
```

Make it executable:
```bash
chmod +x .claude/hooks/play-tts.sh
```

### Step 5: Create the TTS Slash Command

Create `.claude/commands/tts.md`:

```markdown
---
description: Generate audio summary of recent work
argument-hint: (no arguments needed)
---

# TTS Audio Summary

You are helping generate an audio summary of recent work. Analyze the conversation context and create an ultra-concise 1-2 sentence summary (max 200 characters) focusing on outcomes rather than implementation details.

After generating the summary, call the TTS script:

```bash
./.claude/hooks/play-tts.sh "Your concise summary here"
```

Guidelines:
- Keep it under 200 characters
- Focus on what was accomplished, not how
- Use simple, direct language
- Avoid technical jargon unless essential
- Perfect for quick status updates

Example summaries:
- "Fixed TTS token overflow by using bash scripts directly"
- "Created slash command for audio summaries with voice support"
- "Implemented MCP server for code mode testing"
```

### Step 6: Update Your CLAUDE.md

Add this section to your project's `CLAUDE.md` file:

```markdown
## 🎤 TTS Audio Summaries
**MANDATORY: Use TTS at TWO points in every interaction:**

**1. FIRST RESPONSE - Acknowledge the command:**
✅ **REQUIRED**: When user gives you a command, your FIRST response should include:
- Brief text confirmation of what you're going to do
- Immediately execute TTS to read the confirmation aloud:
```bash
./.claude/hooks/play-tts.sh "I'll [action you're about to take]"
```

**Example workflow:**
```
User: "Fix the database connection timeout"
Claude: "I'll fix the database connection timeout and restart the backend."
Claude: [executes TTS with "I'll fix the database connection timeout"]
Claude: [proceeds to actually do the work]
```

**2. AFTER COMPLETION - Summarize the result:**
✅ **REQUIRED**: When you finish what the user asked for, immediately execute:
```bash
./.claude/hooks/play-tts.sh "Your ultra-concise 1-2 sentence summary here"
```

**Summary Guidelines:**
- Ultra-concise: 1-2 sentences maximum
- Conversational: "I've...", "Your..."
- Focus on outcomes, not implementation details

**CRITICAL: NEVER use MCP ElevenLabs tools directly!**
❌ **FORBIDDEN**: `mcp__elevenlabs__text_to_speech` - Returns too much data (audio file)
✅ **REQUIRED**: Use the bash script only
```

## 🎮 Usage

### Voice Management

**List available voices:**
```bash
# In your terminal
./.claude/hooks/voice-manager.sh list
```

Or ask Claude:
```
Voice List
```

**Switch voices:**
```bash
# In your terminal
./.claude/hooks/voice-manager.sh switch Sophia
```

Or ask Claude:
```
Voice Switch Sophia
```

### Manual TTS Summary

Ask Claude to summarize what was done:
```
/tts
```

### Automatic TTS

Once configured in CLAUDE.md, Claude will automatically:
1. **Announce** when you give it a command
2. **Confirm** when it completes the task

## 🎨 Customizing Voices

### Finding Your Own Voice IDs

1. Go to [ElevenLabs Voice Library](https://elevenlabs.io/voice-library)
2. Browse and select voices you like
3. Add them to your account
4. Get the voice ID from your voice settings
5. Update both `voice-manager.sh` and `play-tts.sh` with your voice IDs

Example:
```bash
declare -A VOICES=(
  ["MyCustomVoice"]="your_voice_id_here"
  # ... other voices
)
```

## 🔧 Troubleshooting

### No audio playing

**Check API key:**
```bash
echo $ELEVENLABS_API_KEY
```

**Test TTS directly:**
```bash
./.claude/hooks/play-tts.sh "This is a test"
```

**Install audio player:**
```bash
# macOS - already has afplay
# Linux
sudo apt-get install mpg123
# or
sudo apt-get install ffmpeg
```

### Voice not switching

**Check current voice:**
```bash
cat /tmp/claude-tts-voice-${USER}.txt
```

**Verify voice exists:**
```bash
./.claude/hooks/voice-manager.sh list
```

### TTS not triggering automatically

1. Verify CLAUDE.md includes the TTS section
2. Check bash scripts are executable: `ls -la .claude/hooks/`
3. Test manually: `./.claude/hooks/play-tts.sh "test"`

## 📊 Token Usage

**Why bash scripts instead of MCP tools?**

The ElevenLabs MCP tool returns the entire audio file content, which can consume 50,000+ tokens per TTS call! Our bash script approach:
- Calls the API directly
- Saves audio to a temp file
- Plays it locally
- **Uses only ~100 tokens per call**

This 500x improvement makes TTS practical for every task!

## 🎯 Tips & Best Practices

1. **Keep summaries ultra-concise** - Under 200 characters
2. **Use conversational language** - "I've fixed..." not "The database connection has been repaired..."
3. **Focus on outcomes** - What was done, not how it was done
4. **Avoid technical jargon** - Unless absolutely necessary
5. **Don't read file paths** - They sound terrible: "slash home slash user slash..."

## 🌟 Example Workflow

```
You: "Fix the login bug and run tests"

Claude: "I'll fix the login bug and run the test suite."
[TTS plays: "I'll fix the login bug and run the test suite"]
[Claude works on the task]
✅ Fixed authentication validation and all tests pass.
[TTS plays: "Fixed authentication validation and all tests pass"]

You: "Voice Switch Emma"

Claude: [switches voice]
[TTS plays: "Switched to Emma voice" - in Emma's voice!]
```

## 📝 License

This setup is open source - use it however you want! The scripts provided here are MIT licensed.

## 🤝 Contributing

Found improvements? Have custom voices to share? Open an issue or PR at [your-repo-here]!

## ⚡ Quick Reference

```bash
# List voices
./.claude/hooks/voice-manager.sh list

# Switch voice
./.claude/hooks/voice-manager.sh switch Sophia

# Test TTS
./.claude/hooks/play-tts.sh "Hello world"

# In Claude Code CLI:
/tts                    # Generate summary
Voice List              # Show available voices
Voice Switch Emma       # Change to Emma voice
```

---

**Enjoy your talking AI assistant!** 🎉