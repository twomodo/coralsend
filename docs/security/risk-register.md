# CoralSend Risk Register

## Objective

Track top platform risks with clear ownership, mitigation, and due dates.

## Risk Table

| ID | Risk | Severity | Owner | Mitigation | Target Date | Status |
| --- | --- | --- | --- | --- | --- | --- |
| R-001 | Unrestricted CORS and WebSocket origin acceptance enables unauthorized cross-origin usage and abuse. | C0 | Engineering | Enforce env-driven origin allowlist for HTTP + WS and reject unknown origins in production. | 2026-02-27 | Planned |
| R-002 | No signaling rate limit can lead to denial-of-service and TURN cost spikes. | C0 | Engineering | Add IP-based rate limit on `/ws` handshake or join path with deterministic rejection. | 2026-02-27 | Planned |
| R-003 | Missing legal baseline (Privacy/Terms/AUP) increases legal and trust risk for public rollout. | C0 | Founder + Legal | Publish legal pages and link from entry points. | 2026-02-27 | Planned |
| R-004 | Missing explicit repo licensing strategy blocks commercial clarity for SaaS and self-host offerings. | C0 | Founder + Legal | Add AGPL license, commercial terms, trademark policy, and plain-language licensing doc. | 2026-02-27 | Planned |
| R-005 | Current security messaging may be interpreted as full E2EE despite MVP limitations. | C1 | Product + Engineering | Keep explicit wording that app-layer E2EE is not yet implemented and align all pages with README. | 2026-03-05 | Planned |
| R-006 | TURN credentials leak can permit relay abuse and cost escalation. | C1 | Ops | Move secrets to managed store, define rotation policy, remove exposure in logs/config samples. | 2026-03-05 | Planned |
| R-007 | Analytics identifiers without clear disclosure can create privacy compliance risk. | C1 | Product + Legal | Document telemetry purpose, identifiers used, retention window, and opt-out path in privacy page. | 2026-03-05 | Planned |

## Mitigation Notes

- C0 risks are blockers for production rollout.
- C1 risks should be scheduled immediately after C0 completion.

## Open Decisions

- Governing law and venue for commercial terms.
- Final retention windows for logs and analytics.
- Production criteria for enabling analytics by default.

## Assumptions and Limits

- Dates are initial targets and may be refined after legal review.
- This register is a lightweight operational tool, not a complete enterprise GRC system.
