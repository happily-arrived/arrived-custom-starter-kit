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

function pushesMain(segment) {
  const tokens = segment.trim().split(/\s+/).map((t) => t.replace(/^['"]|['"]$/g, ""));
  const pushAt = tokens.indexOf("push");
  if (tokens[0] !== "git" || pushAt === -1) return false;
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
