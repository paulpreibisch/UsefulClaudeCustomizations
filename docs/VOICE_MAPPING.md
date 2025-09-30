# 🎭 ElevenLabs Voice Library for Claude Code

Find the perfect voice for your Claude Code TTS announcements!

## 🎤 Finding Voices

The [ElevenLabs Voice Library](https://elevenlabs.io/voice-library) offers hundreds of AI voices with different:
- **Accents**: American, British, Australian, and more
- **Ages**: Young, middle-aged, elderly
- **Styles**: Professional, casual, energetic, calm
- **Genders**: Male, female, neutral

### How to Browse Voices

1. Visit the [Voice Library](https://elevenlabs.io/voice-library)
2. Use filters to narrow by:
   - Language
   - Accent
   - Age
   - Gender
   - Use case (narration, conversational, etc.)
3. Click **Preview** to hear samples
4. Click **Add to Lab** to use the voice
5. Copy the **Voice ID** from your account

## 📋 Pre-Configured Voice IDs

Here are the voice IDs already configured in the scripts:

| Voice Name | Voice ID | Description |
|------------|----------|-------------|
| **Tiffany** | `flHkNRp1BlvT73UL6gyz` | Soft female Voice |
| **Cowboy** | `KTPVrSVAEUSJRClDzBw7` | Deep, authoritative male |
| **JoAnne** | `TC0Zp7WVFzhA8zpTlRqV` | Soft, friendly female |
| **Alex** | `zYcjlYFOd3taleS0gkk3` | Professional male |
| **Sarah** | `ruirxsoakN0GWmGNIo04` | Clear female |
| **Marcus** | `DGzg6RaUqxGRTHSBjfgF` | Warm male |
| **Deep Male** | `vfaqCOvlrKi4Zp7C2IAm` | Very deep male |
| **David** | `9yzdeviXkFddZ4Oz8Mok` | Standard male |
| **Isabella** | `yjJ45q8TVCrtMhEKurxY` | Elegant female |
| **Michael** | `0SpgpJ4D3MpHCiWdyTg3` | Neutral male |

## 🔧 Adding Your Own Voices

### Step 1: Find a Voice You Like

1. Browse the [Voice Library](https://elevenlabs.io/voice-library)
2. Add the voice to your account
3. Get the Voice ID (11-character alphanumeric string)

### Step 2: Update the Scripts

Edit both `voice-manager.sh` and `play-tts.sh` to add your voice:

```bash
# In both files, add to the VOICES array:
declare -A VOICES=(
  ["MyCustomVoice"]="abc123XYZ456"  # Your voice ID here
  # ... existing voices
)
```

### Step 3: Test Your New Voice

```bash
# Switch to your new voice
~/.claude/hooks/voice-manager.sh switch MyCustomVoice

# Test it
~/.claude/hooks/play-tts.sh "Testing my new voice"
```

## 🎯 Voice Selection Tips

### For Professional Work
- Choose clear, neutral voices
- Avoid overly dramatic or character voices
- Consider accent preferences for your region

### For Long Sessions
- Pick voices that aren't fatiguing to hear
- Softer voices work better for extended listening
- Avoid extremely high or low pitches

### For Multiple Users/Projects
- Use different voices for different projects
- Easy to identify which project completed tasks
- Helps maintain context when multitasking

## 📊 Popular Voice Categories

### Professional/Business
- Clear diction
- Neutral accent
- Medium tempo
- Examples: Alex, Sarah, David

### Friendly/Casual
- Warm tone
- Conversational style
- Approachable feeling
- Examples: Joanne, Sophia, Marcus

### Authoritative/Serious
- Deep voice
- Commanding presence
- Formal delivery
- Examples: Cowboy, Deep Male, Michael

### Energetic/Upbeat
- Higher energy
- Fast-paced
- Enthusiastic
- Examples: Isabella

## 🔍 Finding Voice IDs

### Method 1: From the Voice Lab
1. Go to [ElevenLabs](https://elevenlabs.io)
2. Click on **Voice Lab**
3. Select any voice you've added
4. The Voice ID appears in the URL or voice settings

### Method 2: From the API
```bash
# List all your voices
curl -H "xi-api-key: $ELEVENLABS_API_KEY" \
  https://api.elevenlabs.io/v1/voices
```

The response includes all voice IDs and names.

## 🎨 Voice Customization

### Clone Your Own Voice
1. Go to **Voice Lab** in ElevenLabs
2. Click **Instant Voice Cloning**
3. Upload 1-2 minute audio sample of your voice
4. Get the Voice ID for your cloned voice
5. Add it to the scripts

### Adjust Voice Settings
While not configurable in the basic scripts, the ElevenLabs API supports:
- **Stability**: How consistent the voice sounds (0.0-1.0)
- **Similarity Boost**: How similar to the original voice (0.0-1.0)
- **Style**: Additional expression control

You can modify `play-tts.sh` to add these parameters to the API call.

## 🌟 Popular ElevenLabs Voices

Here are some highly-rated voices from the community:

### Narrator/Storytelling
- **Daniel** (British, refined)
- **George** (Calm, reassuring)

### Professional/Corporate
- **Rachel** (Clear newsreader)
- **Adam** (Friendly professional)

### Casual/Conversational
- **Emily** (Young, energetic)
- **Antoni** (Well-rounded)

### Character/Unique
- **Charlie** (Cheerful)
- **Grace** (Soft-spoken)

## 💡 Pro Tips

1. **Test before committing** - Always preview voices before adding them
2. **Keep it simple** - Stick with 3-5 voices you actually use
3. **Match the task** - Use calm voices for debugging, energetic ones for successes
4. **Regional preferences** - Choose accents your team is comfortable with
5. **Backup voices** - Keep at least 2 voices configured in case one becomes unavailable

## 🔗 Useful Links

- [ElevenLabs Voice Library](https://elevenlabs.io/voice-library)
- [Voice Lab (for cloning)](https://elevenlabs.io/voice-lab)
- [ElevenLabs API Documentation](https://docs.elevenlabs.io/)
- [Pricing & Plans](https://elevenlabs.io/pricing)

---

**Happy voice hunting!** 🎉 Find voices that make your Claude Code experience more enjoyable!
