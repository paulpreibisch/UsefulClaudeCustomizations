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

### Automated Installation (Recommended)

The installer provides detailed explanations for each step and supports both global and project-specific installations.

1. **Get Your ElevenLabs API Key**
   - Sign up for a free account at [ElevenLabs](https://elevenlabs.io)
   - Go to your [API Keys page](https://elevenlabs.io/api-keys)
   - Copy your API key

2. **Set Environment Variable**
   ```bash
   # Add to your shell profile (~/.bashrc, ~/.zshrc, etc.)
   export ELEVENLABS_API_KEY="your-api-key-here"
   ```

3. **Run the Installer**
   ```bash
   # Clone the repo
   git clone https://github.com/PaulKinlan/UsefulClaudeCustomizations.git
   cd UsefulClaudeCustomizations

   # Run the install script
   ./install.sh
   ```

4. **Choose Installation Type**
   - **Global**: Press Enter when prompted - affects all Claude Code sessions
   - **Project-specific**: Enter your project path - only affects that project

   The installer will:
   - Explain what tsx is and why it's needed
   - Show what each step does and why
   - Ask for confirmation before making changes
   - Preserve your existing settings (creates backup)
   - Install hooks in either `~/.claude/` or `<project>/.claude/`

5. **Restart Claude Code**
   - The installer handles everything: hooks, settings, and directory setup
   - Just restart Claude Code and you're ready to go!

### Manual Installation

If you prefer to install manually, follow these steps:

#### 1. Get Your ElevenLabs API Key

1. Sign up for a free account at [ElevenLabs](https://elevenlabs.io)
2. Go to your [API Keys page](https://elevenlabs.io/api-keys)
3. Copy your API key

#### 2. Set Environment Variable

```bash
# Add to your shell profile (~/.bashrc, ~/.zshrc, etc.)
export ELEVENLABS_API_KEY="your-api-key-here"
```

#### 3. Install the Hook

```bash
# Create Claude hooks directory
mkdir -p ~/.claude/hooks

# Copy the ElevenLabs hook
cp hooks/stop-elevenlabs.ts ~/.claude/hooks/

# Make it executable
chmod +x ~/.claude/hooks/stop-elevenlabs.ts
```

#### 4. Configure Claude Settings

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

#### 5. Restart Claude Code

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

#### Character Voices Collection

| Voice Name | Voice ID | Share Link | Description |
|------------|----------|------------|-------------|
| **Northern Terry** | `wo6udizrrtpIxWGp2qJk` | [🔗 Share](https://elevenlabs.io/app/voice-lab/share/3d1fa6a5595e0a31fff8d7c1a2f2794b91ca87ddd200066dfbdfcef662a65a1b/wo6udizrrtpIxWGp2qJk) | Eccentric & husky character from the North of England |
| **Grandpa Spuds Oxley** | `NOpBlnGInO9m6vDvFkFC` | [🔗 Share](https://elevenlabs.io/app/voice-lab/share/ae23ca715ed6b339e4ad22f2d45dd40b36a6449e031b4f8970bfe29524bd1bbc/NOpBlnGInO9m6vDvFkFC) | A friendly grandpa who knows how to enthrall his audience |
| **Ms. Walker** | `DLsHlh26Ugcm6ELvS0qi` | [🔗 Share](https://elevenlabs.io/app/voice-lab/share/68b2b457084a4258a6d22d361b6abcb7631a988b8ddabd6cb7d548530efdd859/DLsHlh26Ugcm6ELvS0qi) | Warm & caring Southern mom |
| **Ralf Eisend** | `A9evEp8yGjv4c3WsIKuY` | [🔗 Share](https://elevenlabs.io/app/voice-lab/share/b3ae87252403036c0ea46703a3f6d1558f19c40b95ce9ac604b3ca8271fe51b3/A9evEp8yGjv4c3WsIKuY) | International audiobook speaker with clear and deep voice |
| **Amy** | `bhJUNIXWQQ94l8eI2VUf` | [🔗 Share](https://elevenlabs.io/app/voice-lab/share/5bef9583ed80e9300f3cb1fbdcad0e849f658837038f9625845d8aaa06c5c8ec/bhJUNIXWQQ94l8eI2VUf) | Young and natural, relaxed and friendly tone |
| **Michael** | `U1Vk2oyatMdYs096Ety7` | [🔗 Share](https://elevenlabs.io/app/voice-lab/share/ad827f2c0300d36094ca79e518b1a5df8c3609eb269353c30dcec3ac8878a437/U1Vk2oyatMdYs096Ety7) | Deep and controlled British urban voice |
| **Jessica Anne Bogart** | `flHkNRp1BlvT73UL6gyz` | [🔗 Share](https://elevenlabs.io/app/voice-lab/share/066125d0c3eac062cd6655ed319d2347c29d07eab96ee22c6ebe7ef1841c3b1a/flHkNRp1BlvT73UL6gyz) | The Villain! Wickedly eloquent, calculating, cruel and calm |
| **Aria** | `TC0Zp7WVFzhA8zpTlRqV` | [🔗 Share](https://elevenlabs.io/app/voice-lab/share/2b0d07a6ce09d07685ec4dabdf136a37762f1764f4de7d3b52d2a108940683c4/TC0Zp7WVFzhA8zpTlRqV) | Sexy female villain voice like dark velvet |
| **Lutz Laugh** | `9yzdeviXkFddZ4Oz8Mok` | [🔗 Share](https://elevenlabs.io/app/voice-lab/share/1c07ef5740387faa0fd1f7e624ce51055c0b270674ab3da0f0e22c2882bce3c4/9yzdeviXkFddZ4Oz8Mok) | Chuckling and giggly character voice |
| **Dr. Von Fusion** | `yjJ45q8TVCrtMhEKurxY` | [🔗 Share](https://elevenlabs.io/app/voice-lab/share/7d685d7536ae3391b6591c42fe9dbc281640b415005069ea019e870008dd535f/yjJ45q8TVCrtMhEKurxY) | Energetic, quirky voice ideal for eccentric characters |
| **Matthew Schmitz** | `0SpgpJ4D3MpHCiWdyTg3` | [🔗 Share](https://elevenlabs.io/app/voice-lab/share/1bdf478ac5e1a81b0b8423faadde277a29cb25195ed2c86adcb0622464c9b930/0SpgpJ4D3MpHCiWdyTg3) | Elitist, arrogant tyrant voiced by professional narrator |
| **Demon Monster** | `vfaqCOvlrKi4Zp7C2IAm` | [🔗 Share](https://elevenlabs.io/app/voice-lab/share/ad827f2c0300d36094ca79e518b1a5df8c3609eb269353c30dcec3ac8878a437/vfaqCOvlrKi4Zp7C2IAm) | Deep demon voice perfect for horror and fantasy |
| **Cowboy Bob** | `KTPVrSVAEUSJRClDzBw7` | [🔗 Share](https://elevenlabs.io/app/voice-lab/share/7d685d7536ae3391b6591c42fe9dbc281640b415005069ea019e870008dd535f/KTPVrSVAEUSJRClDzBw7) | Rich voice with rugged warmth, perfect for tales |
| **Drill Sergeant** | `DGzg6RaUqxGRTHSBjfgF` | [🔗 Share](https://elevenlabs.io/app/voice-lab/share/5bef9583ed80e9300f3cb1fbdcad0e849f658837038f9625845d8aaa06c5c8ec/DGzg6RaUqxGRTHSBjfgF) | Harsh, barking tone with relentless authority |

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
You'll hear: *"Session MyProject: Created test file successfully"* (in Rachel's professional voice)

### 🎭 Voice Mapping
Each session can be mapped to its own unique voice. Here's the recommended professional voice mapping:

- **Session 1**: `yOsUZuYik0dKCynjfgaE` - Your custom voice
- **Session 2**: `EXAVITQu4vr4xnSDxMaL` - Rachel (professional newsreader)
- **Session 3**: `JBFqnCBsd6RMkjVDRZzb` - George (calm narrator)
- **Session 4**: `MF3mGyEYCl7XYWbV9V6O` - Emily (bubbly teenager)
- **Session 5**: `TxGEqnHWrfWFTfGW9XjX` - Josh (energetic young adult)
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

The installer now supports project-specific installations! When you run `./install.sh`, you'll be prompted:

```
Enter project directory path (or press Enter for global installation):
```

**Global Installation** (press Enter):
- Installs to `~/.claude/`
- Affects all Claude Code sessions
- Use when you want voice announcements everywhere

**Project-Specific Installation** (enter path):
- Installs to `<your-project>/.claude/`
- Only affects that specific project
- Use when you want different voices per project
- Perfect for team projects with shared configurations

The installer handles everything automatically:
- Creates `.claude/hooks/` directory in your project
- Copies the voice hook to your project
- Creates/updates `.claude/settings.json` in your project
- Creates `.claude/audio/` for audio files
- Preserves any existing project settings

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