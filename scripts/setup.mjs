// Runs on `npm install` (the `prepare` script). Cross-platform: npm runs scripts through cmd.exe
// on Windows, so this stays in Node rather than shell.
import { execFileSync } from "node:child_process";
import { lstatSync } from "node:fs";

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
}

// Not a git checkout (e.g. downloaded as a zip): nothing to wire up.
try {
  git("rev-parse", "--git-dir");
} catch {
  process.exit(0);
}

// Enable the committed git hooks (.githooks/pre-push blocks pushes to main).
git("config", "core.hooksPath", ".githooks");

// .claude/skills is a symlink to .agents/skills. Git on Windows checks symlinks out as plain text
// files unless symlink support is enabled, and Claude Code then silently finds no skills.
let isSymlink = false;
try {
  isSymlink = lstatSync(".claude/skills").isSymbolicLink();
} catch {
  // Missing entirely; warn below.
}

if (!isSymlink) {
  console.warn(`
[setup] .claude/skills is not a symlink, so Claude Code won't load this repo's skills.
[setup] This usually means git checked the symlink out as a plain file (common on Windows).
[setup] To fix:
[setup]   1. Enable Windows Developer Mode (Settings > System > For developers).
[setup]   2. git config core.symlinks true
[setup]   3. Delete .claude/skills, then run: git checkout -- .claude/skills
[setup] Codex and other agents read .agents/skills directly and are unaffected.
`);
}
