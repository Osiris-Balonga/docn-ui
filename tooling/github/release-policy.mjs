/** Evaluate release metadata only. Never execute or interpolate proposed code. */
export function evaluateReleasePolicy(event, liveDevSha) {
  const pr = event?.pull_request;
  const repositoryId = event?.repository?.id;
  const base = pr?.base;
  const head = pr?.head;
  const labels = Array.isArray(pr?.labels)
    ? pr.labels.map((label) => label?.name)
    : [];

  if (
    !Number.isSafeInteger(repositoryId) ||
    repositoryId <= 0 ||
    base?.repo?.id !== repositoryId ||
    head?.repo?.id !== repositoryId ||
    base?.ref !== "main" ||
    head?.ref !== "dev" ||
    typeof head?.sha !== "string" ||
    typeof liveDevSha !== "string"
  ) {
    return {
      allowed: false,
      reason: "Release metadata is missing or does not describe dev to main.",
    };
  }
  if (pr.draft) {
    return { allowed: false, reason: "A draft cannot be promoted." };
  }
  if (head.sha !== liveDevSha) {
    return {
      allowed: false,
      reason: "The promotion candidate is not the current dev commit.",
    };
  }
  if (!labels.includes("release-approved")) {
    return {
      allowed: false,
      reason: "The promotion lacks the explicit release-approved label.",
    };
  }
  return {
    allowed: true,
    reason: "Current dev candidate has explicit release approval.",
  };
}
