import { readFileSync } from "node:fs";
import { evaluateBranchPolicy } from "./branch-policy.mjs";

try {
  if (process.env.GITHUB_EVENT_NAME !== "pull_request_target") {
    throw new Error(
      "The branch policy must run from the trusted target context.",
    );
  }
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"));
  const result = evaluateBranchPolicy(event);
  console.log(result.reason);
  process.exitCode = result.allowed ? 0 : 1;
} catch {
  console.error(
    "Unable to verify pull request metadata from the trusted target context.",
  );
  process.exitCode = 1;
}
