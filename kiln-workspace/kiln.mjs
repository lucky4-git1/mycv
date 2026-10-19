// Generated runtime launcher. Repair paths with kiln-init <workspace> --repair.
import { spawnSync } from 'node:child_process';
import { existsSync, realpathSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
// Run under the Node the MCP server uses, so both surfaces export identical bytes.
const pinned = "C:\\Program Files\\nodejs\\node.exe";
const canonical = (path) => (process.platform === 'win32' ? realpathSync(path).toLowerCase() : realpathSync(path));
if (!process.env.KILN_PINNED_NODE && existsSync(pinned) && canonical(process.execPath) !== canonical(pinned)) {
  const child = spawnSync(pinned, [...process.execArgv, fileURLToPath(import.meta.url), ...process.argv.slice(2)], { stdio: 'inherit', env: { ...process.env, KILN_PINNED_NODE: '1' } });
  if (child.error) console.error('Could not start the workspace Node ' + pinned + ': ' + child.error.message + '. Run kiln-init <workspace> --repair.');
  process.exit(child.status ?? 1);
}
delete process.env.KILN_PINNED_NODE;
process.env.KILN_WORKSPACE = dirname(fileURLToPath(import.meta.url));
process.env.KILN_PROGRAM_STORE = join(process.env.KILN_WORKSPACE, '.kiln', 'programs');
try {
  const { assertWorkspaceCurrent } = await import("file:///D:/npm-cache/_npx/7f9f22fac7043fb7/node_modules/@instruktlabs/kiln/scripts/create-workspace.mjs");
  await assertWorkspaceCurrent(dirname(fileURLToPath(import.meta.url)), "D:\\npm-cache\\_npx\\7f9f22fac7043fb7\\node_modules\\@instruktlabs\\kiln");
  const { main } = await import("file:///D:/npm-cache/_npx/7f9f22fac7043fb7/node_modules/@instruktlabs/kiln/dist/cli.mjs");
  process.exitCode = await main(process.argv.slice(2));
} catch (error) {
  console.error(error.message + '\nIf the installation moved, run kiln-init <workspace> --repair from the current Kiln installation.');
  process.exitCode = 1;
}
