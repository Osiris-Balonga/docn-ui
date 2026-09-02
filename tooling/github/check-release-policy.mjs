import { readFileSync } from "node:fs";
import { request } from "node:https";
import { evaluateReleasePolicy } from "./release-policy.mjs";

function readLiveDevSha(event) {
  const repository = event?.repository?.full_name;
  const token = process.env.GITHUB_TOKEN;
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository) || !token)
    throw new Error("Missing repository identity or GitHub token.");

  return new Promise((resolve, reject) => {
    const call = request(
      `https://api.github.com/repos/${repository}/git/ref/heads/dev`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
          "User-Agent": "docn-ui-release-policy",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
      (response) => {
        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => (body += chunk));
        response.on("end", () => {
          if (response.statusCode !== 200)
            return reject(
              new Error(
                `GitHub returned ${response.statusCode ?? "no status"}.`,
              ),
            );
          try {
            const payload = JSON.parse(body);
            if (typeof payload?.object?.sha !== "string")
              throw new Error("The dev reference response has no SHA.");
            resolve(payload.object.sha);
          } catch (error) {
            reject(error);
          }
        });
      },
    );
    call.on("error", reject);
    call.end();
  });
}

try {
  if (process.env.GITHUB_EVENT_NAME !== "pull_request_target")
    throw new Error(
      "The release policy must run from the trusted target context.",
    );
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"));
  const result = evaluateReleasePolicy(event, await readLiveDevSha(event));
  console.log(result.reason);
  process.exitCode = result.allowed ? 0 : 1;
} catch {
  console.error("Unable to verify the release candidate and authorization.");
  process.exitCode = 1;
}
