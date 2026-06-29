---
name: feedback-no-dynamic-workflow
description: User does not want the Workflow tool (dynamic multi-agent orchestration) used for generate-tests or similar tasks
metadata:
  type: feedback
---

Do not use the `Workflow` tool for spec generation or similar tasks in this project.

**Why:** User rejected Workflow tool invocation during `/generate-tests` execution. They prefer the skill (markdown command) to do everything directly in the main conversation — MCP exploration, file writes, manifest updates — without delegating to subagents via the Workflow tool.

**How to apply:** Keep `.claude/commands/generate-tests.md` as a direct-execution skill. The `.claude/workflows/generate-tests.js` file exists but should not be invoked. All MCP browser tool calls and Write operations happen in the main context, not in isolated subagents.
