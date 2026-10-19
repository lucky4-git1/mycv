# Kiln asset workspace

Author and refine assets here. The engine is installed elsewhere; do not read its source or examples to solve an asset task.

Two surfaces drive one engine and share .kiln/programs: the kiln_workspace MCP server returns each render as an image in your context; the node kiln.mjs CLI writes renders to disk, so read the PNG back before judging anything visual. A server named kiln is another installation: do not use it, report it. If node is not on PATH, use the executable recorded as node in .kiln/workspace.json in its place (PowerShell: & "ABSOLUTE_NODE_PATH" kiln.mjs ...). A server that reports a runtime or skill mismatch in its first result needs kiln-init --check and --upgrade on this directory from the desired installation, then a new session; never overwrite local edits to clear a diagnostic.

Read the skill for your task from skills/ here: kiln-author-asset, kiln-refine-asset, kiln-qa-asset, and the optional compose and batch skills when installed. Start with kiln_discover({}) for the overview and the starting signatures; search in modeling language with kiln_discover({ query: "curved hollow tube" }), naming parts and materials rather than the object; fetch contracts with { ids: [...] }, up to six. A harness's own search cannot see this catalog. CLI: node kiln.mjs discover --query TEXT or --id NAME --json.

## The loop

1. Draft: send code once to kiln_render or kiln_validate (CLI: node kiln.mjs source asset.kiln.js). Keep the returned programRef exactly, even after a failed build; never construct one or resend the program.
2. Render: kiln_render, or node kiln.mjs render PROGRAM_REF --views sheet.png.
3. Review the image. Read viewFidelity first: materialFaithful false means a CPU view, evidence about silhouette, proportion and contact, not about colour, metalness or roughness. Animation: kiln_screenshot_animation, or node kiln.mjs animation PROGRAM_REF --clip NAME --phases 0,0.25,0.5,0.75,1 --views motion.png --json; sample the clip rather than baking poses into source.
4. Edit: kiln_source with a literal query for exact anchors, then kiln_edit with programRef and edits. Each edit returns a new programRef; use it from then on.
5. Save: kiln_save, or node kiln.mjs save, to the destination the user names (kiln_assets { action: "collections" } lists them; project is the fallback). Refinements are child revisions. kiln_present shows a saved revision when the host can; node kiln.mjs view is an optional local viewer for a person who is present, not a step of an unattended run.

Export any time: node kiln.mjs source PROGRAM_REF --out revised.kiln.js and node kiln.mjs render PROGRAM_REF --out asset.glb --views sheet.png. Source and ZIP exports never overwrite; render replaces a GLB or PNG only after a complete write.

## Projects and materials

Standalone work needs no project. Omitted project selection stays standalone unless KILN_PROJECT is configured (kiln_discover capabilities shows it); --no-project or projectId: null overrides it. A project holds a shared brief, inventory, design profile and material pins; select it per call with --project or projectId. Read skills/kiln-author-asset/references/projects-and-materials.md before creating or updating one. The save collection named project is a destination, not membership.

## Material-faithful views

Render mode is auto: scenes with textures or metalness use a compatible GPU render service (render-service/ in the Kiln installation), started on demand when its dependencies are installed; flat scenes use CPU geometry views, which is not a failure. node kiln.mjs service status reports readiness; after repairing dependencies call kiln_renderer { action: "reprobe" } (CLI: node kiln.mjs service reprobe). For a renderer on another device, configure KILN_RENDER_PORT_URL and, when required, KILN_RENDER_TOKEN on the server, or pass --render-port URL to the CLI. When a task is about appearance and only CPU views exist, say so.

## Context compaction

Long sessions compact. Keep a short KILN_PROGRESS.md with the goal, the current programRef, what changed and the exact next action; after compaction read it and continue, copying the programRef from it or from the latest result, never from memory.

Skills and MCP servers from user-level configuration still load here; report anything registered that is unrelated to this task. Keep .kiln/programs while working: references resolve only in the store that holds their source.
