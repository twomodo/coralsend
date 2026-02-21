# Legal and Security Standards Mapping

This document maps current legal/security deliverables to common standards using a right-sized MVP scope.

## Control Mapping

| Deliverable | Standard Reference | How CoralSend Covers It |
| --- | --- | --- |
| Asset inventory | ISO/IEC 27001 Annex A (asset management), NIST CSF ID.AM | `docs/security/asset-inventory.md` defines key assets, owners, and sensitivity labels. |
| Data flow and trust boundaries | NIST CSF ID.AM + PR.DS, OWASP ASVS architecture guidance | `docs/security/data-flow.md` documents data classes, boundaries, and retention notes. |
| Risk register | ISO risk treatment concepts, NIST CSF ID.RA | `docs/security/risk-register.md` tracks risks with owner, severity, mitigation, and due date. |
| CORS and WebSocket origin controls | OWASP ASVS V14 (config), API security hardening | Server enforces origin allowlist from environment configuration. |
| Rate limiting for abuse control | OWASP API Top 10 (resource management/abuse), ASVS operational controls | Signaling endpoint applies IP-based request throttling. |
| Privacy transparency | GDPR/CCPA transparency principles | `/privacy` page explains data classes and current MVP limitations. |
| Terms and acceptable use | SaaS legal baseline best practice | `/terms` and `/acceptable-use` define service and abuse boundaries. |
| Licensing split | SPDX + OSS/commercial policy practice | `LICENSE`, `COMMERCIAL_LICENSE.md`, `TRADEMARKS.md`, and `docs/legal/licensing.md`. |

## Scope Limits

- This is not a certification statement (not SOC 2 / ISO 27001 certification).
- Controls are operational guardrails for MVP production readiness.
- Additional controls (identity, entitlement checks, advanced monitoring) are planned for later iterations.
