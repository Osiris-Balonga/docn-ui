import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateBranchPolicy } from './branch-policy.mjs';

const event = (base, head, headRepository = 1) => ({
  repository: { id: 1 },
  pull_request: { base: { ref: base, repo: { id: 1 } }, head: { ref: head, repo: { id: headRepository } } },
});

test('branch policy enforces target and repository provenance, failing closed', () => {
  const cases = [
    [event('main', 'dev'), true],
    [event('main', 'dev', 2), false],
    [event('main', 'hotfix/security'), false],
    [event('main', 'release/v1.0.0'), false],
    [event('main', 'feat/cards'), false],
    [event('dev', 'feat/cards', 2), true],
    [event('dev', 'main'), true],
    [event('dev', 'main', 2), false],
    [event('dev', 'dev'), false],
    [event('dev', 'chore/'), false],
    [event('dev', 'chore/work\ninvalid'), false],
    [event('unknown', 'feat/cards'), false],
    [event('main', 'dev', null), false],
    [undefined, false],
    [{ ...event('main', 'dev'), repository: { id: 3 } }, false],
  ];
  for (const [payload, expected] of cases) {
    assert.equal(evaluateBranchPolicy(payload).allowed, expected, JSON.stringify(payload));
  }
  for (const prefix of ['feat', 'fix', 'chore', 'docs', 'test', 'ci', 'build', 'refactor', 'release']) {
    assert.equal(evaluateBranchPolicy(event('dev', `${prefix}/work`)).allowed, true, prefix);
  }
});
