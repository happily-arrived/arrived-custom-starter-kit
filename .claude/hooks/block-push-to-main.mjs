#!/usr/bin/env node
// PreToolUse hook (Bash): deny `git push` commands that would update main.
// Mirrors .githooks/pre-push, but stops the command before it runs.
import { execFileSync } from "node:child_process";

const input = JSON.parse(await new Response(process.stdin).text());
const command = input.tool_input?.command ?? "";
const cwd = input.cwd || process.cwd();

const isMain = (ref) => /^(refs\/heads\/)?main$/.test(ref.replace(/^\+/, ""));

function currentBranch() {
  try {
    return execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd, encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

// Git global options that consume the following token as their value.
const OPTS_WITH_VALUE = new Set(["-C", "-c", "--git-dir", "--work-tree", "--namespace", "--exec-path"]);

// Index of git's subcommand, skipping global options (`git -C dir -c k=v push ...`).
function subcommandIndex(tokens) {
  let i = 1;
  while (i < tokens.length && tokens[i].startsWith("-")) {
    i += OPTS_WITH_VALUE.has(tokens[i]) ? 2 : 1;
  }
  return i;
}

function pushesMain(segment) {
  const tokens = segment.trim().split(/\s+/).map((t) => t.replace(/^['"]|['"]$/g, ""));
  if (tokens[0] !== "git") return false;
  const pushAt = subcommandIndex(tokens);
  if (tokens[pushAt] !== "push") return false;
  const args = tokens.slice(pushAt + 1);
  if (args.some((a) => a === "--all" || a === "--mirror")) return true;
  const refspecs = args.filter((a) => !a.startsWith("-")).slice(1);
  if (refspecs.length === 0) return currentBranch() === "main";
  return refspecs.some((spec) => {
    const [src, dst] = spec.includes(":") ? spec.split(":") : [spec, spec];
    return isMain(dst) || (src === "HEAD" && dst === "HEAD" && currentBranch() === "main");
  });
}

if (command.split(/&&|\|\||[;|\n]/).some(pushesMain)) {
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason:
          "Direct pushes to main are blocked in this repo. Push a feature branch and open a pull request instead.",
      },
    }),
  );
}
