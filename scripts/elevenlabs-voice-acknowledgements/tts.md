---
description: Generate audio summary of recent work
argument-hint: (no arguments needed)
---

# TTS Audio Summary

You are helping generate an audio summary of recent work. Analyze the conversation context and create an ultra-concise 1-2 sentence summary (max 200 characters) focusing on outcomes rather than implementation details.

After generating the summary, call the TTS script:

```bash
~/.claude/hooks/play-tts.sh "Your concise summary here"
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