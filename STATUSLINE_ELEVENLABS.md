# Add ElevenLabs Quota to Claude Code Statusline

This feature adds your ElevenLabs character quota to the Claude Code statusline, showing how many characters you have remaining.

## What You'll See

In your statusline (between MCP and Context sections):
```
🎙️ EL: 55.1K chars left  (green when under 75%)
🎙️ EL: 15.2K chars left  (yellow when 75-90%)
🎙️ EL: 3.5K chars left   (red when over 90%)
```

## Requirements

- Existing Claude Code statusline (usually at `~/.claude/statusline-*.py`)
- ElevenLabs API key with `user_read` permission
- Python 3

## Installation

### Step 1: Generate ElevenLabs API Key

1. Go to https://elevenlabs.io/app/settings/api-keys
2. Click "Create API Key"
3. ✅ **Check the `user_read` permission** (required!)
4. Copy the generated key (starts with `sk_`)

### Step 2: Add API Key to Environment

Add to your `~/.zshrc` or `~/.bashrc`:
```bash
export ELEVENLABS_API_KEY="sk_your_key_here"
```

Then reload:
```bash
source ~/.zshrc  # or source ~/.bashrc
```

**⚠️ NEVER commit your API key to git!**

### Step 3: Update Your Statusline Script

You need to modify your global statusline script. The exact file depends on your setup:
- `~/.claude/statusline-memory.py` (common)
- `~/.claude/statusline-enhanced.py` (common)
- `~/.claude/statusline.py` (basic)

**Option A: Use the installer script (recommended)**
```bash
./install-elevenlabs-statusline.sh
```

**Option B: Manual installation**

See `STATUSLINE_ELEVENLABS_MANUAL.md` for manual code changes.

### Step 4: Verify It Works

Test the API key:
```bash
curl -H "xi-api-key: YOUR_API_KEY" \
  https://api.elevenlabs.io/v1/user/subscription
```

You should see JSON with `character_count` and `character_limit`.

## Features

- **Cached API calls**: Queries ElevenLabs every 5 minutes (cached in `/tmp/elevenlabs-quota-cache.json`)
- **Graceful fallback**: If API fails, uses cached data or shows nothing
- **Color coded**:
  - 🟢 Green: Under 75% used
  - 🟡 Yellow: 75-90% used
  - 🔴 Red: Over 90% used

## Security Notes

- ✅ API key stored in environment variables (not in code)
- ✅ API key never committed to git
- ✅ Cache file in `/tmp` (ephemeral)
- ✅ Only needs `user_read` permission (read-only access)

## Troubleshooting

**Quota not showing:**
1. Check API key is exported: `echo $ELEVENLABS_API_KEY`
2. Test API manually (command above)
3. Check cache file: `cat /tmp/elevenlabs-quota-cache.json`
4. Look for errors in statusline output

**401 Unauthorized:**
- API key is invalid or expired
- API key missing `user_read` permission
- Regenerate with correct permissions

**API timeout:**
- Cache prevents this from affecting statusline speed
- Expired cache will retry on next statusline update
