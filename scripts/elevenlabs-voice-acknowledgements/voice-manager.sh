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
  ["Deep Male"]="vfaqCOvlrKi4Zp7C2IAm"
  ["Sophia"]="flHkNRp1BlvT73UL6gyz"
  ["David"]="9yzdeviXkFddZ4Oz8Mok"
  ["Isabella"]="yjJ45q8TVCrtMhEKurxY"
  ["Michael"]="0SpgpJ4D3MpHCiWdyTg3"
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
      echo "Usage: Voice Switch <name>"
      echo "Example: Voice Switch GentleGirl"
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
    echo ""
    echo "Commands:"
    echo "  list                    - List all available voices"
    echo "  switch <voice_name>     - Switch to a different voice"
    echo "  get                     - Get current voice name"
    exit 1
    ;;
esac