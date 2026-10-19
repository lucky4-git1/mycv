# Start making assets

```bash
cd D:\mycv-new-fullstack\kiln-workspace
node agy.mjs
```

The launcher supplies the absolute project directory. For headless runs, use node agy.mjs --model MODEL --print="Read AGENTS.md and the project skills. Use only kiln_workspace MCP tools. YOUR TASK.". The attached `--print=TEXT` spelling is required; a separated value is parsed incorrectly. Print mode disables automatic slash-command/skill expansion to avoid automatic expansion of a global skill. Use absolute task-file paths in headless prompts and verify that tool calls use kiln_workspace; global configuration and authentication remain unchanged. Accept the project/MCP trust prompts. Ask the agent to read AGENTS.md and create an asset. Kiln needs no separate model key.

Core author/refine/QA skills are installed and registered for this harness. Optional compose/batch skills are selected at setup with --skills compose,batch.

These are shared CLI/MCP skills for your chosen harness. The optional built-in Strands agent adds its workflow internally; do not copy its prompt or native workflow into this workspace.

Long-running and headless sessions may compact context automatically. AGENTS.md describes the harness-neutral KILN_PROGRESS.md handoff that preserves the current programRef and next action across compaction. Harness-specific thresholds are documented in Kiln's docs/harnesses.md; leave native automatic compaction enabled when the active model's context size is unknown.

Keep assets here and engine source outside. This separates task context, not operating-system permissions. User instructions and authentication can still apply.

Run repair after anything that invalidates the generated absolute paths: moving this workspace, moving or reinstalling the runtime, or removing the Node executable that setup recorded. The manifest pins the exact interpreter the preflight check validated. Invoking the CLI with another supported Node does not require repair while the recorded executable remains available.

```bash
node D:\npm-cache\_npx\7f9f22fac7043fb7\node_modules\@instruktlabs\kiln\scripts\create-workspace.mjs D:\mycv-new-fullstack\kiln-workspace --repair
```

That path is where the installation was at setup. If the installation itself moved, run the same command from its current location; `runtime` in .kiln/workspace.json records where this workspace last expected it.

Repair updates generated runtime paths only and refuses edited configuration. For a runtime or skill update, stop the harness/MCP session, run kiln-init on this directory with --check and then --upgrade, and restart the session. Upgrade refreshes unchanged managed configuration, instructions and all skill copies; conflicting edits stop it before writing. Preserve and resolve the named files explicitly. Assets and saved revisions remain in place.
