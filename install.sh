#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo "🎤 ElevenLabs Voice Hook Installer for Claude Code"
echo "=================================================="
echo ""

# Check if ELEVENLABS_API_KEY is set
echo -e "${CYAN}📋 What is ELEVENLABS_API_KEY?${NC}"
echo "This is your personal API key from ElevenLabs that allows the hook to"
echo "convert text to speech using their AI voice generation service."
echo ""

if [ -z "$ELEVENLABS_API_KEY" ]; then
    echo -e "${RED}❌ ERROR: ELEVENLABS_API_KEY environment variable is not set!${NC}"
    echo ""
    echo "Please set your ElevenLabs API key first:"
    echo "  export ELEVENLABS_API_KEY=\"your-api-key-here\""
    echo ""
    echo "Add this to your shell profile (~/.bashrc, ~/.zshrc, etc.) to make it permanent."
    exit 1
fi

echo -e "${GREEN}✅ ElevenLabs API key found${NC}"
echo ""

# Ask for project directory
echo -e "${CYAN}📁 Project Directory Selection${NC}"
echo "Claude Code supports project-specific configurations in a .claude folder."
echo "This allows different projects to have different voice settings and hooks."
echo ""
echo "You can either:"
echo "  - Install globally (~/.claude/) - affects all Claude Code sessions"
echo "  - Install in a project folder - only affects that specific project"
echo ""

read -p "Enter project directory path (or press Enter for global installation): " PROJECT_DIR

if [ -z "$PROJECT_DIR" ]; then
    # Global installation
    INSTALL_DIR=~/.claude
    INSTALL_TYPE="global"
    echo ""
    echo -e "${BLUE}Installing globally to: ${INSTALL_DIR}${NC}"
else
    # Project-specific installation
    # Expand ~ if present
    PROJECT_DIR="${PROJECT_DIR/#\~/$HOME}"

    # Check if directory exists
    if [ ! -d "$PROJECT_DIR" ]; then
        echo -e "${RED}❌ ERROR: Directory does not exist: $PROJECT_DIR${NC}"
        exit 1
    fi

    INSTALL_DIR="$PROJECT_DIR/.claude"
    INSTALL_TYPE="project-specific"
    echo ""
    echo -e "${BLUE}Installing to project: ${PROJECT_DIR}${NC}"
fi

echo ""

# Show what will be installed with detailed explanations
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Installation Plan - What and Why${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${CYAN}Step 1: Install tsx globally${NC}"
echo "WHY: tsx is a TypeScript execution engine that runs .ts files directly"
echo "     without requiring manual compilation. The ElevenLabs hook is written"
echo "     in TypeScript for type safety and better code organization."
echo "     Installing it globally means any project can use TypeScript hooks."
echo ""

echo -e "${CYAN}Step 2: Create hooks directory (${INSTALL_DIR}/hooks)${NC}"
echo "WHY: Claude Code looks for custom automation scripts in this directory."
echo "     Hooks are shell commands that run automatically when certain events"
echo "     occur (like when a task stops/completes). This is where we'll place"
echo "     the voice announcement script."
echo ""

echo -e "${CYAN}Step 3: Copy stop-elevenlabs.ts${NC}"
echo "WHY: This TypeScript file contains the logic that:"
echo "     - Receives Claude's completion message"
echo "     - Extracts a concise summary of what was done"
echo "     - Sends it to ElevenLabs API for text-to-speech conversion"
echo "     - Plays the generated audio through your speakers"
echo ""

echo -e "${CYAN}Step 4: Configure settings.json (${INSTALL_DIR}/settings.json)${NC}"
echo "WHY: This file tells Claude Code which hooks to run and when."
echo "     We'll add a 'Stop' hook that triggers when any task completes."
echo "     Your existing settings (if any) will be preserved - we only add"
echo "     the voice announcement hook."
echo ""

echo -e "${CYAN}Step 5: Create audio directory (${INSTALL_DIR}/audio)${NC}"
echo "WHY: All generated voice files are saved here for:"
echo "     - Replaying announcements if you missed them"
echo "     - Debugging if audio doesn't play"
echo "     - Archiving task completion history"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if settings.json exists and show what will be merged
SETTINGS_FILE="$INSTALL_DIR/settings.json"
if [ -f "$SETTINGS_FILE" ]; then
    echo -e "${YELLOW}⚠️  Existing settings.json detected${NC}"
    echo "Your current settings will be preserved. Only the Stop hook will be added."
    echo "A backup will be created at: ${SETTINGS_FILE}.backup"
    echo ""
fi

# Ask for confirmation
read -p "Do you want to proceed with ${INSTALL_TYPE} installation? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Installation cancelled."
    exit 0
fi

echo ""
echo "Starting installation..."
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Step 1: Check/install tsx
echo -e "${CYAN}Step 1/5: Checking tsx installation...${NC}"
if ! command -v tsx &> /dev/null; then
    echo -e "${YELLOW}⚠️  tsx is not installed globally${NC}"
    echo "Installing tsx globally with: npm install -g tsx"
    echo ""
    npm install -g tsx
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install tsx${NC}"
        echo "You may need to run with sudo: sudo npm install -g tsx"
        exit 1
    fi
    echo -e "${GREEN}✅ tsx installed successfully${NC}"
else
    echo -e "${GREEN}✅ tsx is already installed${NC}"
fi
echo ""

# Step 2: Create hooks directory
echo -e "${CYAN}Step 2/5: Creating hooks directory...${NC}"
mkdir -p "$INSTALL_DIR/hooks"
echo -e "${GREEN}✅ Created ${INSTALL_DIR}/hooks${NC}"
echo "   Claude will now check this directory for automation scripts."
echo ""

# Step 3: Copy the hook file
echo -e "${CYAN}Step 3/5: Installing ElevenLabs voice hook...${NC}"
cp hooks/stop-elevenlabs.ts "$INSTALL_DIR/hooks/"
chmod +x "$INSTALL_DIR/hooks/stop-elevenlabs.ts"
echo -e "${GREEN}✅ Installed stop-elevenlabs.ts${NC}"
echo "   This script will run every time a Claude task completes."
echo ""

# Step 4: Configure settings.json
echo -e "${CYAN}Step 4/5: Configuring Claude settings...${NC}"

# Get the absolute path to the hook
HOOK_PATH="$INSTALL_DIR/hooks/stop-elevenlabs.ts"

if [ -f "$SETTINGS_FILE" ]; then
    echo "Merging Stop hook into existing settings..."

    # Backup existing settings
    cp "$SETTINGS_FILE" "$SETTINGS_FILE.backup"
    echo "Backed up existing settings to: ${SETTINGS_FILE}.backup"

    # Use Node.js to merge the Stop hook into existing settings
    node -e "
    const fs = require('fs');
    const settingsPath = '$SETTINGS_FILE';
    const hookPath = '$HOOK_PATH';
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

    // Initialize hooks if it doesn't exist
    if (!settings.hooks) {
      settings.hooks = {};
    }

    // Add Stop hook
    settings.hooks.Stop = [
      {
        hooks: [
          {
            type: 'command',
            command: 'ELEVENLABS_API_KEY=\${ELEVENLABS_API_KEY} npx tsx ' + hookPath
          }
        ]
      }
    ];

    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    "

    echo -e "${GREEN}✅ Merged Stop hook into existing settings${NC}"
else
    # Create new settings.json with proper hook configuration
    cat > "$SETTINGS_FILE" << EOF
{
  "\$schema": "https://json.schemastore.org/claude-code-settings.json",
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "ELEVENLABS_API_KEY=\${ELEVENLABS_API_KEY} npx tsx $HOOK_PATH"
          }
        ]
      }
    ]
  }
}
EOF
    echo -e "${GREEN}✅ Created new settings.json${NC}"
fi
echo "   Claude will now announce task completions with voice."
echo ""

# Step 5: Create audio directory
echo -e "${CYAN}Step 5/5: Creating audio output directory...${NC}"
mkdir -p "$INSTALL_DIR/audio"
echo -e "${GREEN}✅ Created ${INSTALL_DIR}/audio${NC}"
echo "   All voice announcements will be saved here."
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Installation Complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ "$INSTALL_TYPE" = "global" ]; then
    echo "✅ Global installation successful"
    echo "   All Claude Code sessions will now have voice announcements."
else
    echo "✅ Project-specific installation successful"
    echo "   Voice announcements will only work in: $PROJECT_DIR"
    echo ""
    echo "   To use voice announcements in this project:"
    echo "   1. cd $PROJECT_DIR"
    echo "   2. Start Claude Code from this directory"
fi

echo ""
echo -e "${CYAN}Next Steps:${NC}"
echo "1. ${YELLOW}Restart Claude Code${NC} for the hooks to take effect"
echo "2. Run any Claude command (e.g., 'fix this bug')"
echo "3. Listen for the voice announcement when the task completes!"
echo ""

echo -e "${CYAN}Customization:${NC}"
echo "• Change voice: Edit ${INSTALL_DIR}/hooks/stop-elevenlabs.ts"
echo "  - Find the 'voiceId' in the CONFIG section"
echo "  - Browse voices at: https://elevenlabs.io/voice-library"
echo ""
echo "• Audio files: ${INSTALL_DIR}/audio/"
echo "  - Replay any announcement: paplay <filename>"
echo "  - Clear old files: rm ${INSTALL_DIR}/audio/*"
echo ""

echo -e "${CYAN}Troubleshooting:${NC}"
echo "• No audio? Check your speakers and ElevenLabs API credits"
echo "• Wrong voice? Update voiceId in stop-elevenlabs.ts"
echo "• Settings issues? Restore from: ${SETTINGS_FILE}.backup"
echo ""

echo "Documentation: https://github.com/PaulKinlan/UsefulClaudeCustomizations"
echo ""
