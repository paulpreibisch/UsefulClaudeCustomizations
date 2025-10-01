# 🎭 Terminal Session Voice Mapping

Each Terminal Keeper session now has its own unique voice for easy audio identification!

## 🎤 How Dynamic Voice Assignment Works

The hook **automatically reads your `.vscode/sessions.json`** file and assigns voices to sessions dynamically:

1. **Automatic Detection**: Reads current Terminal Keeper sessions from `.vscode/sessions.json`
2. **Dynamic Assignment**: Assigns voices to sessions in order (first session gets first voice, etc.)
3. **Consistent Mapping**: The same session always gets the same voice (as long as session order doesn't change)
4. **Adaptive**: Automatically handles new sessions or session changes

## 🎯 Example Voice Assignment

If your `.vscode/sessions.json` contains these sessions:
```json
{
  "active": "default",
  "sessions": {
    "default": [
      {"name": "SageDev 1", "cwd": "..."},
      {"name": "SageDev 2", "cwd": "..."},
      {"name": "WSL SageDev", "cwd": "..."},
      {"name": "TypeScript", "cwd": "..."},
      {"name": "Frontend", "cwd": "..."}
    ]
  }
}
```

The voices will be assigned automatically:
- **SageDev 1** → Voice 1 (`zYcjlYFOd3taleS0gkk3`)
- **SageDev 2** → Voice 2 (`ruirxsoakN0GWmGNIo04`)
- **WSL SageDev** → Voice 3 (`DGzg6RaUqxGRTHSBjfgF`)
- **TypeScript** → Voice 4 (`vfaqCOvlrKi4Zp7C2IAm`)
- **Frontend** → Voice 5 (`KTPVrSVAEUSJRClDzBw7`)

## ⚠️ Important Note

The example voice IDs provided are custom/personal voices from an ElevenLabs account. They may not be available in the public voice library, which means:

1. **Personal Use**: These voices are likely from a personal ElevenLabs account
2. **Custom Voices**: They might be voice clones or premium voices
3. **Account Specific**: Other users will need to replace these with their own voice IDs

## 🔧 For Other Users

Replace the voice IDs in the `availableVoiceIds` array with your own ElevenLabs voice IDs:

```typescript
availableVoiceIds: [
  'your-voice-id-1',  // Will be assigned to first session
  'your-voice-id-2',  // Will be assigned to second session
  'your-voice-id-3',  // Will be assigned to third session
  // ... add more voice IDs as needed
]
```

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

### Personal Collection Voice IDs
- **Northern Terry**: `wo6udizrrtpIxWGp2qJk` (eccentric & husky character from the North of England)
- **Grandpa Spuds Oxley**: `NOpBlnGInO9m6vDvFkFC` (friendly grandpa storyteller)
- **Ms. Walker**: `DLsHlh26Ugcm6ELvS0qi` (warm & caring Southern mom)
- **Ralf Eisend**: `A9evEp8yGjv4c3WsIKuY` (international audiobook speaker)
- **Amy**: `bhJUNIXWQQ94l8eI2VUf` (young and natural, relaxed and friendly)
- **Michael**: `U1Vk2oyatMdYs096Ety7` (deep and controlled British urban voice)
- **Jessica Anne Bogart**: `flHkNRp1BlvT73UL6gyz` (villain - wickedly eloquent)
- **Aria**: `TC0Zp7WVFzhA8zpTlRqV` (sexy female villain voice)
- **Lutz Laugh**: `9yzdeviXkFddZ4Oz8Mok` (chuckling and giggly character)
- **Dr. Von Fusion**: `yjJ45q8TVCrtMhEKurxY` (energetic, quirky eccentric character)
- **Matthew Schmitz**: `0SpgpJ4D3MpHCiWdyTg3` (elitist, arrogant tyrant)
- **Demon Monster**: `vfaqCOvlrKi4Zp7C2IAm` (deep demon for horror/fantasy)
- **Cowboy Bob**: `KTPVrSVAEUSJRClDzBw7` (rugged warmth, perfect for tales)
- **Drill Sergeant**: `DGzg6RaUqxGRTHSBjfgF` (harsh, commanding authority)

Now you can identify which Claude instance completed a task just by listening! 🎉