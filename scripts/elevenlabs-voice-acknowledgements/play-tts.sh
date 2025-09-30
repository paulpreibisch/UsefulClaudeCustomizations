#!/bin/bash
# TTS Player - Play text using ElevenLabs API
# Usage: play-tts.sh "text to speak"

# Get the message to speak
MESSAGE="$1"

if [ -z "$MESSAGE" ]; then
  echo "Error: No message provided"
  echo "Usage: play-tts.sh \"Your message here\""
  exit 1
fi

# Check for API key
if [ -z "$ELEVENLABS_API_KEY" ]; then
  echo "Error: ELEVENLABS_API_KEY environment variable not set"
  echo "Please set it with: export ELEVENLABS_API_KEY=\"your_api_key_here\""
  exit 1
fi

# Get current voice
VOICE_FILE="/tmp/claude-tts-voice-${USER}.txt"
CURRENT_VOICE=$(cat "$VOICE_FILE" 2>/dev/null || echo "Cowboy")

# Voice IDs mapping (must match voice-manager.sh)
declare -A VOICES=(
  ["Cowboy"]="KTPVrSVAEUSJRClDzBw7"
  ["Joanne"]="TC0Zp7WVFzhA8zpTlRqV"
  ["Alex"]="zYcjlYFOd3taleS0gkk3"
  ["Sarah"]="ruirxsoakN0GWmGNIo04"
  ["Marcus"]="DGzg6RaUqxGRTHSBjfgF"
  ["Deep Male"]="vfaqCOvlrKi4Zp7C2IAm"
  ["Sophia"]="flHkNRp1BlvT73UL6gyz"
  ["David"]="9yzdeviXkFddZ4Oz8Mok"
  ["Isabella"]="yjJ45q8TVCrtMhEKurxY"
  ["Michael"]="0SpgpJ4D3MpHCiWdyTg3"
)

VOICE_ID="${VOICES[$CURRENT_VOICE]}"

if [ -z "$VOICE_ID" ]; then
  echo "Warning: Unknown voice '$CURRENT_VOICE', using default"
  VOICE_ID="KTPVrSVAEUSJRClDzBw7"  # Cowboy default
fi

# Call ElevenLabs API and save audio
curl -s -X POST \
  "https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}" \
  -H "xi-api-key: ${ELEVENLABS_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"${MESSAGE}\",\"model_id\":\"eleven_monolingual_v1\"}" \
  --output /tmp/tts-output.mp3

# Check if the audio file was created successfully
if [ ! -f /tmp/tts-output.mp3 ] || [ ! -s /tmp/tts-output.mp3 ]; then
  echo "Error: Failed to generate audio from ElevenLabs API"
  exit 1
fi

# Play the audio (adjust for your system)
if command -v afplay &> /dev/null; then
  # macOS
  afplay /tmp/tts-output.mp3
elif command -v mpg123 &> /dev/null; then
  # Linux with mpg123
  mpg123 -q /tmp/tts-output.mp3
elif command -v ffplay &> /dev/null; then
  # Linux with ffmpeg
  ffplay -nodisp -autoexit -loglevel quiet /tmp/tts-output.mp3
else
  echo "Warning: No audio player found. Install mpg123 or ffplay to play audio."
  echo "Audio saved to: /tmp/tts-output.mp3"
fi

# Cleanup
rm -f /tmp/tts-output.mp3