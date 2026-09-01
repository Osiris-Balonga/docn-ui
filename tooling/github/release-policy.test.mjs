import assert from "node:assert/strict";
import test from "node:test";
import { evaluateReleasePolicy } from "./release-policy.mjs";

const sha = "a".repeat(40);
const event = (overrides = {}) => ({
  repository: { id: 1 },
  pull_request: {
    base: { ref: "main", repo: { id: 1 } },
    head: { ref: "dev", repo: { id: 1 }, sha },
    draft: false,
    labels: [{ name: "release-approved" }],
    ...overrides,
  },
});

test("release policy requires the live dev SHA and explicit approval", () => {
  assert.equal(evaluateReleasePolicy(event(), sha).allowed, true);
  assert.equal(
    evaluateReleasePolicy(event({ draft: true }), sha).allowed,
    false,
  );
  assert.equal(
    evaluateReleasePolicy(event({ labels: [] }), sha).allowed,
    false,
  );
  assert.equal(evaluateReleasePolicy(event(), "b".repeat(40)).allowed, false);
  assert.equal(
    evaluateReleasePolicy(
      event({ head: { ref: "release/v1.0.0", repo: { id: 1 }, sha } }),
      sha,
    ).allowed,
    false,
  );
  assert.equal(
    evaluateReleasePolicy(
      event({ head: { ref: "dev", repo: { id: 2 }, sha } }),
      sha,
    ).allowed,
    false,
  );
  assert.equal(evaluateReleasePolicy(undefined, sha).allowed, false);
});
