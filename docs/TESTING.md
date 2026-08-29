# Testing — separate scopes and useful coverage

**Explicit maintainer instruction: do not multiply unnecessary tests.** Reference: final `paint-3d`, `docs/TESTING.md`, `package.json`, `vitest.config.ts`, and `playwright.config.ts`, read at commit `8e370cd5e6802be762bf14a192a3e68cbb52fa54`.

## 1. Question before every new test

Which concrete bug would this test detect that existing tests would miss? If the answer is "the component exists", "the configuration repeats a value", or "another color", do not add it. Extend an existing suite/fixture before creating a file.

Do not retest shadcn, React, Zod, the QR encoder, or PDF.js themselves. Test our compositions, contracts, and boundary integrations. Do not repeat all unit-test permutations in E2E. Retain real edge cases and regressions even when a case table groups them: reducing file count is not the objective.

No target test count or global coverage threshold that encourages filler. Coverage diagnoses untested application paths; critical risks need explicit assertions. No complete DOM snapshots or PDF JSX snapshots.

## 2. Exclusive file assignment

| Scope | Files | Environment and responsibility |
| --- | --- | --- |
| `unit` | `*.test.ts`, excluding suffixes below | Node; geometry, money, schemas, pure transitions, registry graph |
| `components` | `*.test.tsx`, excluding specialized suffixes | jsdom; interactions and semantics of application UI compositions |
| `integration` | `*.integration.test.{ts,tsx}` | Real combined modules; explicitly simulated heavy boundary effects |
| `pdf` | `*.pdf.test.{ts,tsx}` | Node; actual PDF engine, content, pages, geometry, QR decoding |
| `consumers` | `tests/consumers/**/*.consumer.test.ts` | Node/process; real CLI in external projects, assets, rendering |
| `e2e` | `tests/e2e/**/*.spec.ts` | Chromium; built site, real workers and exports |
| `visual` | Explicit list `tests/visual/cases.*` | Selected PDF rasterizations and approved comparisons |

Unit/components globs exclude integration/pdf/consumer. Each file belongs to exactly one project. Vitest does not collect browser tests. UI tests do not import the real PDF engine; PDF tests do not mount the site.

## 3. Command contracts

### Activation status through L02-S01

`unit`, `components`, and `integration` are configured with exclusive globs. Only `components` currently contains a real suite: one project-link composition check covering the observed link-role regression, keyboard focus, and tooltip wiring. No pure document logic or module coordination exists yet, so unit/integration are **not verified suites**. Their standalone commands fail with "No test files found" until real tests are added; `passWithNoTests` remains false. The shared lightweight command selects all three projects and collects the one existing suite once.

The `pdf` scope is active with one real feasibility suite covering renderer output, dimensions, text, sides, page boxes, and pagination. Its three cases represent distinct engine risks and share the same fixtures and readers. The `integration` scope is active with one queue suite covering latest-revision replacement, a worker error, and destruction; it injects a small worker port and does not duplicate PDF geometry. Consumers, E2E, visual, and asset/registry/bundle verification commands are not implemented yet. Their file conventions are reserved and excluded from the lightweight projects. Do not add empty successful placeholder scripts.

Available now: `test`, the three lightweight scoped commands, `test:watch`, `test:coverage`, `test:all`, `quality`, `validate`, and `validate:full`. `test:all --list` prints activation without executing tests. The sequential orchestrator reads the actual package scripts; adding a heavy command activates it automatically. `validate:full` prepares one build and runs each activated scope once. Build fingerprinting/artifact handoff will be implemented with the first E2E suite in L06; no reusable E2E artifact is claimed today.

`quality` runs code/config formatting, lint, and types without tests or builds. `format` / `format:check` target TS/TSX/MJS/JSON/YAML/CSS, respect `.prettierignore`, and leave historical Markdown formatting and the generated lockfile intact. Markdown remains subject to link/content review. Tests use at most two workers and no retries; no coverage percentage gate is imposed.

Implement these scripts in L01, then activate each scope with its first real suite. An unimplemented scope is unavailable, not replaced by a script returning success.

| Command | Exclusive execution |
| --- | --- |
| `pnpm test:unit` | `vitest run --project unit` |
| `pnpm test:components` | `vitest run --project components` |
| `pnpm test:integration` | `vitest run --project integration` |
| `pnpm test` | These three lightweight projects, once each, then exit |
| `pnpm test:watch` | The same three projects in watch mode; documented filtering with `--project` |
| `pnpm test:coverage` | The same three projects, one run with a combined report |
| `pnpm test:pdf` | `vitest run --project pdf`, actual PDFs only |
| `pnpm test:consumers` | Isolated consumers project, installations and external processes |
| `pnpm test:e2e` | Playwright Chromium, site journeys only |
| `pnpm test:visual` | Selected PDF references, not E2E journeys |
| `pnpm test:all` | Sequential orchestrator: test, pdf, consumers, e2e, visual; no duplicate collection |
| `pnpm validate` | Formatting, lint, types, and `pnpm test`; fast daily check |
| `pnpm validate:full` | Formatting, lint, types, and `test:all`; build prepared/reused once |
| `pnpm build` | Asset/registry verification, then static build; no hidden tests |
| `pnpm verify:registry` | Schema/graph/paths/imports of the generated registry; no installation |
| `pnpm verify:assets` | Presence, licenses, checksums; no browser tests |
| `pnpm verify:bundle` | File sizes from the existing build |

The difference from DrawMotion is intentional: `validate` is lightweight here; `validate:full` is the complete gate check. Do not use `validate` alone as release evidence. `test:all` must include every activated scope, not a hidden selection. L01 documents the available commands; later lots add their scopes to the aggregator when activated.

Native filters: `pnpm test:unit geometry`, `pnpm test:pdf invoice`, `pnpm test:e2e catalog.spec.ts`. No aliases per scenario, theme, or template. For isolated watch mode, also document `pnpm exec vitest --project unit` to avoid accumulating project flags from the global script.

## 4. What to run and when

| Change | Sufficient verification during the lot |
| --- | --- |
| Documentation only | Links and ID/command consistency; no application suite without a reason |
| GitHub governance | Targeted branch policy, API reads, controlled PRs/probes; no PDF/UI suite |
| Pure function | Targeted unit tests and affected types/lint |
| Application form | Targeted component tests; integration if coordination changes |
| PDF layout | Family PDF suite; review the changed rendering |
| Worker/export pipeline | Targeted integration and one real E2E journey |
| Distribution/imports/assets | verify:registry/assets and targeted consumers |
| Styling/navigation | Affected journey and targeted responsive visual check |
| End of gate G1/G2/G3 | Gate-specific checks and validate |
| G4/G5 and release | validate:full on a clean checkout; reuse CI evidence for the same SHA |

No full suite after every text edit. Do not run coverage and repeat lightweight tests in the same CI job: coverage replaces the run without coverage rather than adding to it.

## 5. Proportionate PDF coverage

One shared suite per family generates the three nominal examples and verifies useful invariants: readable file, dimensions, essential text, expected pages/sides, no final blank page. Expected values must not be computed by the function under test.

Then add distinct risks: overflowing card, impossible QR, receipt at the height limit, sheet starting cell, multipage invoice. Common image/data/money limits are tested at the shared level, not repeated for fifteen compositions.

Inspect PDFs with a reader independent of the layout. A `%PDF` signature or `Blob.size > 0` does not prove content. Decode QR from a rasterization of the final PDF, not merely from the string sent to the encoder.

Visual snapshots start with one representative example per family. Add a reference only for a distinct structure or visual regression. No automatic 15 × formats × themes × languages × browsers matrix. A contact sheet of all fifteen examples helps human review without fifteen browser suites.

File tests verify what unit tests cannot: the engine, pagination, fonts, and placement. Calibrate pixel-diff thresholds on a fixed Linux runner with pinned rasterizer/fonts; do not treat Windows and Linux as bit-identical. Fix temporal metadata in fixtures; do not require arbitrary binary equality between renders.

## 6. E2E and external installation

Keep a small set of journeys covering distinct risks: discovery/filtering; edited card with export and back side; invalid data and recovery; rapid template/revision changes; rejected image import; one multipage invoice; keyboard/search and privacy. Group assertions from one journey instead of making one test per button.

Use real data/engine/worker in the nominal journey. Inject worker or permission failures only in scenarios requiring them. No production test hooks that mutate React state.

Consumers: two environments, not one installation per variant. Static validation covers all items; installations cover distinct dependency closures. A theme change does not justify repeated npm downloads.

## 7. Cost, isolation, and artifacts

Vitest defaults to at most two workers; PDF/consumers and Playwright use one worker, retries 0. Never reuse a user's server. Use controlled loopback ports, temporary profiles, and fail on occupied ports. Explicit dates/locales/time zones. Ignore artifacts under `.artifacts/`; only fixtures and selected references go into Git.

The validation orchestrator prepares the build once, records SHA/input hashes, and passes it to E2E (`E2E_USE_BUILD=1`). Standalone E2E builds when no validated artifact is supplied. Never reuse a stale build. Visual checks may use already generated PDFs with matching fingerprints; otherwise generate inputs without rerunning every PDF assertion.

CI: one lightweight Vitest job, one PDF job, one consumer job, one build job, and browser/visual jobs according to cost; do not rerun `validate:full` in every job. Dependent jobs reuse the build artifact. Conditional jobs explicitly report `not-applicable`, never an invented result; release runs every scope.

## 8. Evidence and limitations

L00G precedes pnpm: `node --test tooling/github/branch-policy.test.mjs` covers one governance case table using Node's native runner. This tooling scope stays explicit and separate from the seven application scopes; no Vitest collection of `.test.mjs` and no additional E2E matrix. `branch-policy` runs on every PR; its test table runs when policy changes. GitHub setup reads/probes never rerun through `pnpm test` or `validate:full`.

Every `docs/qa/Lxx.md` records the actual command, SHA, environment, result, inspected files, and limitations. Distinguish simulated tests, real PDFs, real browsers, and physical printing. File dimensions do not prove a printer's scale setting; automated QR decoding does not fully replace a hardware trial.

At the final gate: check keyboard and screen-reader use, 200% zoom, contrast, downloading in target browsers, and printing a card/sheet at 100%. Lack of a printer does not block development; record it and do not promise universal physical calibration.
