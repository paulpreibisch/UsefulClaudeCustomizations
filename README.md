# 🎯 Useful Claude Customizations

A collection of powerful hooks and customizations for [Claude Code](https://claude.ai/claude-code) to enhance your AI-assisted development workflow.

## ✨ Features

### 🔊 ElevenLabs Voice Summaries
Automatically hear natural voice summaries of completed tasks using ElevenLabs' text-to-speech API.

- **Smart Summarization**: Intelligently extracts key actions from Claude's responses
- **Session Detection**: Automatically detects and announces which terminal session completed the task
- **Voice Mapping**: Each Terminal Keeper session gets its own unique voice for instant identification
- **Natural Voice**: High-quality voice synthesis with 9 different voice options
- **Cross-Platform**: Works on macOS, Windows, and Linux/WSL
- **Audio Archive**: Saves all generated summaries for later playback

## 📋 Prerequisites

- [Claude Code](https://claude.ai/claude-code) installed and configured
- Node.js 18+ and npm
- `tsx` installed globally: `npm install -g tsx`
- ElevenLabs account (free tier available)

## 🚀 Quick Start

### 1. Get Your ElevenLabs API Key

1. Sign up for a free account at [ElevenLabs](https://elevenlabs.io)
2. Go to your [API Keys page](https://elevenlabs.io/api-keys)
3. Copy your API key

### 2. Set Environment Variable

```bash
# Add to your shell profile (~/.bashrc, ~/.zshrc, etc.)
export ELEVENLABS_API_KEY="your-api-key-here"
```

### 3. Install the Hook

```bash
# Create Claude hooks directory
mkdir -p ~/.claude/hooks

# Copy the ElevenLabs hook
cp hooks/stop-elevenlabs.ts ~/.claude/hooks/

# Make it executable
chmod +x ~/.claude/hooks/stop-elevenlabs.ts
```

### 4. Configure Claude Settings

Create or update `~/.claude/settings.json`:

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "ELEVENLABS_API_KEY=${ELEVENLABS_API_KEY} npx tsx ~/.claude/hooks/stop-elevenlabs.ts"
          }
        ]
      }
    ]
  }
}
```

### 5. Restart Claude Code

**Important**: Restart Claude Code for the hooks to take effect.

## 🎭 Customization

### Change Voice

Edit the `voiceId` in the hook file. You can use either the default professional voices or video game character voices:

#### Professional Voices (Original)
```typescript
const CONFIG = {
  voiceId: 'EXAVITQu4vr4xnSDxMaL', // Rachel - Professional newsreader (default)
  // voiceId: 'MF3mGyEYCl7XYWbV9V6O', // Emily - Bubbly teenager
  // voiceId: 'TxGEqnHWrfWFTfGW9XjX', // Josh - Energetic young adult (male)
  // voiceId: 'JBFqnCBsd6RMkjVDRZzb', // George - Calm narrator (male)
  // voiceId: 'onwK4e9ZLuTAKqWW03F9', // Daniel - British accent (male)
  // voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam - Friendly guy next door (male)
  // voiceId: 'ErXwobaYiN019PkySvjV', // Antoni - Well-rounded (male)
  // voiceId: 'oWAxZDx7w5VEj9dCyTzz', // Grace - Soft spoken (female)
  // voiceId: 'flq6f7yk4E4fJM5XTYuZ', // Michael (male)
};
```

#### Video Game Character Voices
Access the full collection at: https://elevenlabs.io/app/voice-library/collections/HXn5AetPOJgAHd2D60mP

To get any voice ID from this collection:
1. Visit the collection link above
2. Click the three dots (...) menu on any voice
3. Select "Copy voice ID"
4. Use it in your configuration

Available characters include:
- **Drill Sergeant** - Commanding military voice
- **Demon Monster** - Deep horror/fantasy voice
- **Flicker** - Cheerful fairy voice
- **Cowboy Bob VF** - Old West storyteller
- **Jessica Anne Bogart** - Villain voice (wickedly eloquent)
- **Lutz Laugh** - Cheerful and giggly
- **Emma** - Adorable animation voice
- **Dr. Von Fusion VF** - Quirky mad scientist
- **Matthew Schmitz** - Arrogant tyrant
- **Mordred** - Evil villain (German)
- **Myrddin** - Wizard/narrator (800+ year old wizard)
- **Cocky Male Villain** - Theatrical antagonist
- **Marshal** - German professor
- **John Morgan** - Southern cowboy
- **Parasyte** - Gollum-like creature
- **Aria** - Sexy female villain
- **Bjorn The Viking** - Nordic warrior
- **Pirate Marshal** - Sea dog with Cornwall accent

Browse more voices at [ElevenLabs Voice Library](https://elevenlabs.io/voice-library).

### Adjust Voice Settings

```typescript
voiceSettings: {
  stability: 0.5,        // 0-1: Higher = more consistent
  similarity_boost: 0.75, // 0-1: Higher = more expressive
  style: 0.0,            // 0-1: Higher = more emotional
  use_speaker_boost: true // Enhance voice quality
}
```

### Summary Length

```typescript
maxSummaryLength: 150  // Adjust character limit
```

## 🖥️ Terminal Session Detection

The hook automatically detects which terminal session is completing tasks, perfect for multi-session workflows:

### Automatic Detection
- **VS Code Terminal Keeper**: Reads `.vscode/sessions.json` to identify the current session
- **Multiple Methods**: Uses CWD matching, environment variables, and smart fallbacks
- **Session Announcements**: Voice says "Session [Name]: [Summary]"

### Manual Session Override
Set the session name manually:

```bash
export CLAUDE_SESSION_NAME="My Custom Session"
```

### Example Output
Instead of: *"Created test file successfully"*
You'll hear: *"Session SageDev 2: Created test file successfully"* (in Rachel's professional voice)

### 🎭 Voice Mapping
Each session can be mapped to its own unique voice. Here's the recommended professional voice mapping:

- **SageDev 1**: `yOsUZuYik0dKCynjfgaE` - Your custom voice
- **SageDev 2**: `EXAVITQu4vr4xnSDxMaL` - Rachel (professional newsreader)
- **WSL SageDev**: `JBFqnCBsd6RMkjVDRZzb` - George (calm narrator)
- **WSL SageDev 2**: `MF3mGyEYCl7XYWbV9V6O` - Emily (bubbly teenager)
- **WSL SageDev 3**: `TxGEqnHWrfWFTfGW9XjX` - Josh (energetic young adult)
- **TypeScript**: `onwK4e9ZLuTAKqWW03F9` - Daniel (British accent)
- **Frontend**: `pNInz6obpgDQGcFmaJgB` - Adam (friendly guy next door)
- **Backend**: `ErXwobaYiN019PkySvjV` - Antoni (well-rounded)
- **Testing**: `oWAxZDx7w5VEj9dCyTzz` - Grace (soft-spoken)

See [Voice Mapping Guide](docs/VOICE_MAPPING.md) for complete details.

This helps you instantly identify which Claude instance completed the task just by the voice!

## 💰 Pricing & Usage

### Free Tier
- **10,000 characters/month**
- ~130-200 task summaries
- Perfect for testing

### Paid Plans
- **Starter ($5/month)**: 30,000 characters (~400-600 summaries)
- **Creator ($11/month)**: 100,000 characters (~1,300-2,000 summaries)
- **Pro ($82.50/month)**: 500,000 characters (~6,500-10,000 summaries)

## 🔧 Project-Specific Setup

For project-specific voices (instead of global), create `.claude/settings.json` in your project:

```bash
# In your project directory
mkdir -p .claude/hooks
cp /path/to/hooks/stop-elevenlabs.ts .claude/hooks/
```

Then create `.claude/settings.json` with the hook configuration.

## 📁 File Structure

```
UsefulClaudeCustomizations/
├── hooks/
│   └── stop-elevenlabs.ts    # Main ElevenLabs voice hook
├── examples/
│   ├── settings.json          # Example Claude settings
│   └── .mcp.json             # Example MCP configuration
├── docs/
│   └── SETUP.md              # Detailed setup guide
└── README.md                 # This file
```

## 🧪 Testing

Test the hook directly:

```bash
echo '{"response":"Created test file successfully"}' | \
  ELEVENLABS_API_KEY=your-key npx tsx ~/.claude/hooks/stop-elevenlabs.ts
```

You should hear "Created test file successfully" spoken aloud.

## 🔍 Troubleshooting

### No Audio Playing

1. **Check API Key**: Ensure `ELEVENLABS_API_KEY` is set
2. **Verify Credits**: Check remaining credits at [ElevenLabs Dashboard](https://elevenlabs.io)
3. **Test Speakers**:
   ```bash
   # Linux/WSL
   paplay /usr/share/sounds/ubuntu/stereo/bell.ogg

   # macOS
   afplay /System/Library/Sounds/Glass.aiff
   ```

### View Generated Audio

```bash
ls -la ~/.claude/audio/
```

### Check Logs

The hook outputs status messages in Claude Code's console:
- ✅ Success messages
- ❌ Error messages
- 📝 Task summaries
- 🔍 Extracted summaries

## 🚫 Disable Temporarily

To disable without removing:

1. Comment out the Stop hook in `settings.json`
2. Restart Claude Code

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Add new hooks
- Improve summarization logic
- Add support for other TTS services
- Share your customizations

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

## 🙏 Credits

- [ElevenLabs](https://elevenlabs.io) for the amazing TTS API
- [Claude Code](https://claude.ai/claude-code) team for the hooks system
- Community contributors

## 🔗 Resources

- [Claude Code Documentation](https://docs.claude.ai/claude-code)
- [ElevenLabs Documentation](https://elevenlabs.io/docs)
- [MCP Protocol Specification](https://modelcontextprotocol.io)

---

Made with ❤️ for the Claude Code community