# ElevenLabs Voice Acknowledgements for Claude Code

> **Make Claude talk to you!** Get voice confirmations when Claude starts tasks and completes them.

## 🎯 What This Does

- **Voice acknowledgment** when you give Claude a command ("I'll fix the bug...")
- **Voice confirmation** when Claude completes tasks ("Fixed the bug and tests pass")
- **Multiple voice options** - Switch between different voices on the fly
- **Hands-free workflow** - Hear updates without watching the terminal

## 📋 Prerequisites

1. **Claude Code CLI** - [Install here](https://docs.claude.com/claude-code)
2. **ElevenLabs Account** - [Sign up free](https://elevenlabs.io)
3. **Audio player** (usually already installed):
   - macOS: `afplay` (built-in)
   - Linux: `mpg123` or `ffplay`

## 🚀 Installation

### Step 1: Get Your ElevenLabs API Key

1. Sign up at https://elevenlabs.io
2. Go to Profile → API Keys
3. Copy your API key

### Step 2: Set Environment Variable

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
export ELEVENLABS_API_KEY="your_api_key_here"
```

Reload your shell:
```bash
source ~/.bashrc  # or source ~/.zshrc
```

### Step 3: Install the Scripts

```bash
# Create hooks directory if it doesn't exist
mkdir -p ~/.claude/hooks
mkdir -p ~/.claude/commands

# Copy the scripts
cp voice-manager.sh ~/.claude/hooks/
cp play-tts.sh ~/.claude/hooks/
cp tts.md ~/.claude/commands/

# Make them executable
chmod +x ~/.claude/hooks/voice-manager.sh
chmod +x ~/.claude/hooks/play-tts.sh
```

### Step 4: Install Audio Player (Linux only)

macOS already has `afplay`. Linux users need an audio player:

```bash
# Option 1: mpg123 (recommended)
sudo apt-get install mpg123

# Option 2: ffplay (from ffmpeg)
sudo apt-get install ffmpeg
```

### Step 5: Configure Your Project

Add this to your project's `CLAUDE.md` (or create it if it doesn't exist):

```markdown
## 🎤 TTS Audio Summaries
**MANDATORY: Use TTS at TWO points in every interaction:**

**1. FIRST RESPONSE - Acknowledge the command:**
When user gives you a command, immediately execute:
```bash
~/.claude/hooks/play-tts.sh "I'll [action you're about to take]"
```

**2. AFTER COMPLETION - Summarize the result:**
When you finish the task, execute:
```bash
~/.claude/hooks/play-tts.sh "Your ultra-concise 1-2 sentence summary"
```

**Guidelines:**
- Keep summaries under 200 characters
- Use conversational language: "I've...", "Your..."
- Focus on outcomes, not implementation details
- Avoid file paths and technical jargon

**Example:**
```
User: "Fix the database timeout"
Claude: "I'll fix the database timeout and restart the backend."
[TTS: "I'll fix the database timeout and restart the backend"]
[Claude fixes the issue]
✅ Fixed timeout in connection pool and restarted backend.
[TTS: "Fixed timeout in connection pool and restarted backend"]
```
```

## 🎮 Usage

### Test the Installation

```bash
# Test TTS
~/.claude/hooks/play-tts.sh "Hello, this is a test"

# List available voices
~/.claude/hooks/voice-manager.sh list

# Switch voice
~/.claude/hooks/voice-manager.sh switch Sophia
```

### Voice Commands

**In Claude Code, you can say:**

```
Voice List               # Show all available voices
Voice Switch Sophia      # Change to Sophia voice
Voice Switch Cowboy      # Change to Cowboy voice
/tts                     # Manual summary
```

### Available Voices

- **Cowboy** (default) - Deep, authoritative male
- **GentleGirl** - Soft, friendly female
- **Alex** - Professional male
- **Sarah** - Clear female
- **Marcus** - Warm male
- **Deep Male** - Very deep male
- **Sophia** - Pleasant female
- **David** - Standard male
- **Isabella** - Elegant female
- **Michael** - Neutral male

### Automatic Mode

Once configured in `CLAUDE.md`, Claude will automatically:
1. **Announce** when you give it a command
2. **Confirm** when it completes the task

No manual intervention needed!

## 🎨 Customizing Voices

### Add Your Own Voices

1. Go to [ElevenLabs Voice Library](https://elevenlabs.io/voice-library)
2. Add voices to your account
3. Get the voice ID from your voice settings
4. Edit both `voice-manager.sh` and `play-tts.sh`:

```bash
# Add to the VOICES array in both files:
declare -A VOICES=(
  ["MyCustomVoice"]="your_voice_id_here"
  # ... existing voices
)
```

## 🔧 Troubleshooting

### No Audio Playing

**Check API key is set:**
```bash
echo $ELEVENLABS_API_KEY
```

**Test directly:**
```bash
~/.claude/hooks/play-tts.sh "test"
```

**Install audio player (Linux):**
```bash
sudo apt-get install mpg123
```

### Voice Not Switching

**Check current voice:**
```bash
~/.claude/hooks/voice-manager.sh get
```

**List available voices:**
```bash
~/.claude/hooks/voice-manager.sh list
```

### "Command not found"

**Make scripts executable:**
```bash
chmod +x ~/.claude/hooks/voice-manager.sh
chmod +x ~/.claude/hooks/play-tts.sh
```

### API Errors

**Check your API key is valid:**
```bash
curl -H "xi-api-key: $ELEVENLABS_API_KEY" \
  https://api.elevenlabs.io/v1/user
```

## 📊 Why Bash Scripts?

The ElevenLabs MCP tool returns the entire audio file (50,000+ tokens per call!). Our bash script approach:
- Calls API directly
- Saves audio to temp file
- Plays it locally
- **Uses only ~100 tokens per call** (500x improvement!)

## 🎯 Best Practices

1. **Keep summaries ultra-concise** - Under 200 characters
2. **Use conversational language** - "I've fixed..." not "The system has been repaired..."
3. **Focus on outcomes** - What was done, not how
4. **Avoid technical jargon** - Unless essential
5. **Don't read file paths** - They sound terrible!

## 💡 Example Workflow

```bash
You: "Fix the authentication bug"

Claude: "I'll fix the authentication bug and run tests."
🔊 [Plays: "I'll fix the authentication bug and run tests"]

[Claude works on the fix]

✅ Fixed JWT validation and all tests pass.
🔊 [Plays: "Fixed JWT validation and all tests pass"]
```

## 🤝 Contributing

Found a bug or have an improvement? Open an issue or PR!

## 📝 License

MIT - Use however you want!

## ⚡ Quick Reference

```bash
# Test TTS
~/.claude/hooks/play-tts.sh "Hello world"

# List voices
~/.claude/hooks/voice-manager.sh list

# Switch voice
~/.claude/hooks/voice-manager.sh switch Sophia

# Get current voice
~/.claude/hooks/voice-manager.sh get

# In Claude Code:
/tts                    # Manual summary
Voice List              # Show voices
Voice Switch Emma       # Change voice
```

---

**Enjoy your talking AI assistant!** 🎉