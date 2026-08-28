# Risks and decisions to confirm

## Technical risks

| ID | Risk | Prevention / exit decision | Lot |
| --- | --- | --- | --- |
| R01 | React-pdf worker incompatible with bundler/export | Spike on actual build; adapt bundling or ADR, no implicit server fallback | L02 |
| R02 | Variable/WOFF2 fonts or missing glyphs | Permitted static fonts, French/English corpus, explicit errors | L02/L04 |
| R03 | Incorrect automatic receipt height | Actual measurement/rendering, bounded size, no character-count estimate | L02/L09 |
| R04 | Incorrect dimensions/print boxes | Independent PDF reader and test sheet; limited claims | L02/L14 |
| R05 | Preview differs from download | Immutable result per revision; copied viewer buffer | L05/L06 |
| R06 | Installed source depends on monorepo | Early outside-workspace consumer, checked graph/aliases | L07 |
| R07 | Remote assets required after installation | Explicit fetcher, licenses/hashes, test without docn-ui domain | L07 |
| R08 | Exponential and slow tests | Exclusive scopes, risk-based sampling, timing measurements | L01/L14 |
| R09 | Frozen UI or growing memory | Bounded render queue, timeout, virtualized pages, cleanup | L06/L13 |
| R10 | Personal data in URLs/logs | Local memory, sanitized messages, network interception | L06/L13 |
| R11 | Unreadable QR after resizing | Module size/quiet zone, decoding from rasterized PDF | L08 |
| R12 | Invoice mistaken for certified accounting software | Explicit calculation rules, disclaimer, no compliance claim | L11/L12 |
| R13 | Attractive but insufficiently distinct catalog | Composition review and structural distinction criterion | L05–L11 |
| R14 | Branch workflow nonblocking or forgeable by PR | Trusted base, actual required check, repository ID, rejection tests | L00G |
| R15 | Lost history or blocked solo workflow | Merge commits; no unavailable reviewer quota or bypass | L00G |
| R16 | Divergent backlog or duplicate issues | Single Status, stable markers/IDs, readback after mutation | L00G, then all |

## Assumptions that do not block local startup

French/English document data; Base UI; static Next.js; three themes; fifteen compositions; no backend. Change these through an ADR before the affected lot, not silently during implementation. English site and project content is a confirmed maintainer requirement.

## External information required before publication

Confirmed public Git destination: `Osiris-Balonga/docn-ui`. GitHub setup is required before L01; lack of access no longer permits skipping it. Author/license, site URL, host, and merge/delivery authorization remain separate. Record them in `status.json.externalDecisions`; do not infer a license from public visibility.

## Recovery

A technical problem does not justify removing a requested template. Isolate the spike result and propose an alternative with its cost and limitations. Unavailable hardware validation becomes an explicit limitation; retain no printing-precision promise without corresponding evidence.
