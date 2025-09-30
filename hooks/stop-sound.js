#!/usr/bin/env node

// Global stop hook that suppresses PulseAudio errors and uses local sound files
const { exec } = require('child_process');
const { existsSync } = require('fs');
const { join } = require('path');
const { platform } = require('os');

// Read input from stdin
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('readable', () => {
  let chunk;
  while ((chunk = process.stdin.read()) !== null) {
    input += chunk;
  }
});

process.stdin.on('end', async () => {
  try {
    const data = JSON.parse(input);
    const os_platform = platform();

    // Try to find sound file in multiple locations
    const possiblePaths = [
      join(process.cwd(), 'sounds-local', 'production-crow.wav'),
      join(process.cwd(), '.claude', 'sounds', 'production-crow.wav'),
      join(process.env.HOME, '.claude', 'sounds', 'production-crow.wav')
    ];

    let soundFile = null;
    for (const path of possiblePaths) {
      if (existsSync(path)) {
        soundFile = path;
        break;
      }
    }

    if (!soundFile) {
      // No sound file found, exit silently
      process.exit(0);
      return;
    }

    if (os_platform === 'darwin') {
      // macOS: use afplay
      exec(`afplay "${soundFile}" 2>/dev/null`, { timeout: 5000 }, () => {
        process.exit(0);
      });
    } else if (os_platform === 'win32') {
      // Windows: use PowerShell
      exec(`powershell -c "(New-Object Media.SoundPlayer '${soundFile}').PlaySync()" 2>/dev/null`, { timeout: 5000 }, () => {
        process.exit(0);
      });
    } else {
      // Linux/WSL: Try audio players silently, suppressing ALL output and errors
      const tryAudioPlayer = (commands, index) => {
        if (index >= commands.length) {
          // All players failed, exit silently
          process.exit(0);
          return;
        }

        const command = commands[index];
        // Add 2>&1 to redirect stderr to stdout, then redirect all to /dev/null
        const silentCommand = `${command} >/dev/null 2>&1`;

        exec(silentCommand, { timeout: 3000 }, (err) => {
          if (err) {
            // Try next player silently
            tryAudioPlayer(commands, index + 1);
          } else {
            // Success, exit
            process.exit(0);
          }
        });
      };

      // List of commands to try (without 2>/dev/null since we add it above)
      const audioCommands = [
        `ffplay -nodisp -autoexit -loglevel quiet "${soundFile}"`,
        `aplay -q "${soundFile}"`,
        `sox -q "${soundFile}" -d`,
        `play -q "${soundFile}"`
        // Removed paplay entirely to avoid the connection errors
      ];

      tryAudioPlayer(audioCommands, 0);
    }
  } catch (error) {
    // Exit silently on any error
    process.exit(0);
  }
});