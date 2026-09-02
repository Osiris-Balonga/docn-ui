/** Evaluate PR metadata only. Never execute or interpolate proposed code. */
export function evaluateBranchPolicy(event) {
  const pr = event?.pull_request;
  const repositoryId = event?.repository?.id;
  const base = pr?.base;
  const head = pr?.head;

  if (
    !Number.isSafeInteger(repositoryId) ||
    repositoryId <= 0 ||
    base?.repo?.id !== repositoryId ||
    !Number.isSafeInteger(head?.repo?.id) ||
    head.repo.id <= 0 ||
    typeof head.ref !== "string"
  ) {
    return {
      allowed: false,
      reason: "Missing or inconsistent pull request metadata.",
    };
  }

  const sameRepository = head.repo.id === repositoryId;
  if (base.ref === "main") {
    return sameRepository && head.ref === "dev"
      ? { allowed: true, reason: "Promotion from this repository dev branch." }
      : {
          allowed: false,
          reason: "Only dev from this repository may target main.",
        };
  }

  if (base.ref === "dev") {
    const workingBranch =
      /^(feat|fix|chore|docs|test|ci|build|refactor|release)\/[^\s]+$/.test(
        head.ref,
      );
    return workingBranch || (sameRepository && head.ref === "main")
      ? {
          allowed: true,
          reason: "Work branch or same-repository main synchronization.",
        }
      : {
          allowed: false,
          reason: "Use a documented working branch to target dev.",
        };
  }

  return { allowed: false, reason: "Unsupported target branch." };
}
