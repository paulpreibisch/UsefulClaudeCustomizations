# Audio Summary on Task Completion

Automatically generate a brief audio summary when significant tasks are completed.

## When to Generate Audio

Generate audio summaries ONLY when:
- A significant task has been completed (implemented feature, fixed bug, deployed code)
- Multiple related actions have finished (series of file edits, test runs, migrations)
- A user-requested operation is done

## When NOT to Generate Audio

Do NOT generate audio for:
- Simple file reads or information lookups
- Answering questions without taking action
- Intermediate steps in a larger task
- Error messages or failures
- Acknowledgments or confirmations

## Audio Generation Process

At the END of your response, when a task is complete:

1. **Determine if audio is warranted**: Did I complete a significant task?
2. **Create ultra-concise summary**: 1-2 sentences maximum
3. **Generate audio**: Use `mcp__elevenlabs__text_to_speech`
4. **Play it**: The audio will play automatically

## Summary Format

**Guidelines:**
- Ultra-concise: 1-2 sentences maximum
- Conversational: Direct address ("You've...", "I've...")
- Focus on outcomes: What was achieved, not how
- User benefits: Why this matters

**Example Summaries:**
- "I've implemented the new job cancellation system with 183x faster performance."
- "Your database migration is complete - all indexes are now in place."
- "The frontend now displays real-time job progress with proper SSE connections."

**Bad Examples:**
- Long explanations of how something was done
- Technical implementation details
- Step-by-step recaps

## Implementation

```typescript
// At the end of your response, if task is complete:
const audioResult = await mcp__elevenlabs__text_to_speech({
  voice: "DGzg6RaUqxGRTHSBjfgF", // Default voice from config
  text: "Your ultra-concise summary here"
});
```

## Configuration

Voice settings are in `.claude/config/elevenlabs-session.json`:
- Default voice ID
- Voice overrides per session
- Voice settings (stability, similarity, style)

## Examples of When to Use

**YES - Generate Audio:**
- "I've fixed the database connection timeout issue and restarted the backend."
- "Created 3 new components and integrated them into the jobs table."
- "Migration complete - all job_sentences now have persona mappings."

**NO - Don't Generate Audio:**
- "The file contains 150 lines of TypeScript code." (just information)
- "I found 3 potential issues in the codebase." (just listing)
- "Let me check the database schema first..." (intermediate step)