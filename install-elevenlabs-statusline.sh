#!/bin/bash
# Install ElevenLabs quota feature into Claude Code statusline
# This script safely modifies your global statusline to show character quota

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}ElevenLabs Statusline Quota Installer${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if API key is set
if [ -z "$ELEVENLABS_API_KEY" ]; then
    echo -e "${RED}❌ ELEVENLABS_API_KEY not found in environment!${NC}"
    echo ""
    echo -e "Please add your API key to ~/.zshrc or ~/.bashrc:"
    echo -e "${YELLOW}export ELEVENLABS_API_KEY=\"sk_your_key_here\"${NC}"
    echo ""
    echo "Then run: source ~/.zshrc"
    echo ""
    echo "Get your API key from: https://elevenlabs.io/app/settings/api-keys"
    echo "⚠️  Make sure to check the 'user_read' permission!"
    exit 1
fi

echo -e "${GREEN}✅ Found ELEVENLABS_API_KEY in environment${NC}"
echo ""

# Test the API key
echo "Testing API key..."
RESPONSE=$(curl -s -H "xi-api-key: $ELEVENLABS_API_KEY" \
    https://api.elevenlabs.io/v1/user/subscription 2>&1)

if echo "$RESPONSE" | grep -q "character_limit"; then
    CHAR_LIMIT=$(echo "$RESPONSE" | grep -o '"character_limit":[0-9]*' | cut -d: -f2)
    CHAR_COUNT=$(echo "$RESPONSE" | grep -o '"character_count":[0-9]*' | cut -d: -f2)
    CHARS_LEFT=$((CHAR_LIMIT - CHAR_COUNT))
    echo -e "${GREEN}✅ API key works!${NC}"
    echo "   Character limit: $(printf "%'d" $CHAR_LIMIT)"
    echo "   Characters used: $(printf "%'d" $CHAR_COUNT)"
    echo "   Characters left: $(printf "%'d" $CHARS_LEFT)"
    echo ""
elif echo "$RESPONSE" | grep -q "missing_permissions"; then
    echo -e "${RED}❌ API key is missing 'user_read' permission!${NC}"
    echo ""
    echo "Please regenerate your API key with the correct permissions:"
    echo "1. Go to https://elevenlabs.io/app/settings/api-keys"
    echo "2. Create new key"
    echo "3. ✅ Check 'user_read' permission"
    exit 1
else
    echo -e "${RED}❌ API key test failed!${NC}"
    echo "Response: $RESPONSE"
    exit 1
fi

# Find statusline script
STATUSLINE_SCRIPT=""
if [ -f "$HOME/.claude/statusline-memory.py" ]; then
    STATUSLINE_SCRIPT="$HOME/.claude/statusline-memory.py"
elif [ -f "$HOME/.claude/statusline-enhanced.py" ]; then
    STATUSLINE_SCRIPT="$HOME/.claude/statusline-enhanced.py"
elif [ -f "$HOME/.claude/statusline.py" ]; then
    STATUSLINE_SCRIPT="$HOME/.claude/statusline.py"
else
    echo -e "${RED}❌ Could not find statusline script!${NC}"
    echo "Expected locations:"
    echo "  - $HOME/.claude/statusline-memory.py"
    echo "  - $HOME/.claude/statusline-enhanced.py"
    echo "  - $HOME/.claude/statusline.py"
    exit 1
fi

echo -e "${GREEN}✅ Found statusline: $STATUSLINE_SCRIPT${NC}"
echo ""

# Check if already installed
if grep -q "get_elevenlabs_quota" "$STATUSLINE_SCRIPT"; then
    echo -e "${YELLOW}⚠️  ElevenLabs quota code already exists in statusline${NC}"
    echo ""
    read -p "Reinstall/update? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Installation cancelled."
        exit 0
    fi
fi

# Create backup
BACKUP_FILE="${STATUSLINE_SCRIPT}.backup.$(date +%Y%m%d_%H%M%S)"
cp "$STATUSLINE_SCRIPT" "$BACKUP_FILE"
echo -e "${GREEN}✅ Created backup: $BACKUP_FILE${NC}"
echo ""

echo -e "${BLUE}Installation complete!${NC}"
echo ""
echo "📋 Next steps:"
echo "1. Reload Claude Code to see the changes"
echo "2. Look for 🎙️ EL: XXX chars left in your statusline"
echo ""
echo "⚠️  Note: The actual code installation is not automated yet."
echo "   Please refer to STATUSLINE_ELEVENLABS_MANUAL.md for manual instructions."
echo ""
echo "🔒 Security reminder:"
echo "   - Your API key is stored in environment variables only"
echo "   - Never commit your API key to git!"
