# 🎭 Terminal Session Voice Mapping

Each Terminal Keeper session now has its own unique voice for easy audio identification!

## 🎤 Voice Assignments

| Session Name | Voice | Description | Voice ID |
|--------------|-------|-------------|----------|
| **SageDev 1** | Custom | Your selected voice | `yOsUZuYik0dKCynjfgaE` |
| **SageDev 2** | Rachel | Professional newsreader (female) | `EXAVITQu4vr4xnSDxMaL` |
| **WSL SageDev** | George | Calm narrator (male) | `JBFqnCBsd6RMkjVDRZzb` |
| **WSL SageDev 2** | Emily | Bubbly teenager (female) | `MF3mGyEYCl7XYWbV9V6O` |
| **WSL SageDev 3** | Josh | Energetic young adult (male) | `TxGEqnHWrfWFTfGW9XjX` |
| **TypeScript** | Daniel | British accent (male) | `onwK4e9ZLuTAKqWW03F9` |
| **Frontend** | Adam | Friendly guy next door (male) | `pNInz6obpgDQGcFmaJgB` |
| **Backend** | Antoni | Well-rounded (male) | `ErXwobaYiN019PkySvjV` |
| **Testing** | Grace | Soft spoken (female) | `oWAxZDx7w5VEj9dCyTzz` |

## 🔊 How It Works

1. **Automatic Detection**: Hook reads `.vscode/sessions.json` to identify your current session
2. **Voice Mapping**: Each session gets its unique voice that stays consistent
3. **Audio Identification**: You'll instantly know which session completed a task by the voice

## 🎯 Example Outputs

- **SageDev 1**: Your custom voice says *"Session SageDev 1: Created test file successfully"*
- **SageDev 2**: Rachel says *"Session SageDev 2: Updated configuration settings"*
- **WSL SageDev**: George says *"Session WSL SageDev: Fixed authentication bug"*

## ⚙️ Customization

### Add New Sessions
Edit the `sessionVoices` mapping in `hooks/stop-elevenlabs.ts`:

```typescript
sessionVoices: {
  'Your New Session': 'voice-id-here',  // Add your session
  // ... existing mappings
}
```

### Change Voice for Existing Session
Simply update the voice ID in the mapping and restart Claude Code.

### Manual Override
```bash
export CLAUDE_SESSION_NAME="TypeScript"
# Now all tasks will use Daniel's British accent
```

## 🎭 Voice Characteristics

- **Custom (SageDev 1)**: Your personal selection
- **Rachel**: Clear, professional, perfect for serious tasks
- **George**: Calm and reassuring, great for complex operations
- **Emily**: Energetic and friendly, good for quick tasks
- **Josh**: Enthusiastic, perfect for development work
- **Daniel**: Distinguished British accent, ideal for TypeScript work
- **Adam**: Warm and approachable, great for frontend tasks
- **Antoni**: Balanced and versatile, perfect for backend operations
- **Grace**: Gentle and precise, excellent for testing feedback

## 🔧 Advanced Configuration

### Finding New Voice IDs
1. Go to [ElevenLabs Voice Library](https://elevenlabs.io/voice-library)
2. Preview voices and find ones you like
3. Copy the voice ID from the URL or API
4. Add to your `sessionVoices` mapping

### Popular Alternative Voice IDs
- **Bella**: `EXAVITQu4vr4xnSDxMaL` (alternative female)
- **Charlie**: `IKne3meq5aSn9XLyUdCD` (cheerful male)
- **Dorothy**: `ThT5KcBeYPX3keUQqHPh` (pleasant female)
- **Freya**: `jsCqWAovK2LkecY7zXl4` (confident female)

Now you can identify which Claude instance completed a task just by listening! 🎉