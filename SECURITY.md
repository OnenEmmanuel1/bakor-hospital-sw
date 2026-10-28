# Security notes

## Intended data and threat model

This prototype concerns sensitive health, identity, account and billing data. Threats include unauthorized account use, cross-role access, cross-patient disclosure, session theft, SQL injection, CSRF, exposed backups, insider misuse, dependency vulnerabilities and accidental publication of secrets. It is not suitable for production clinical data.

## Controls present and limits

- MySQL queries use `mysql2` parameter placeholders in the included application paths.
- Passwords are bcrypt hashes at cost 12; repeated failures trigger a 15-minute lockout. Sessions are stored in MySQL and have HTTP-only, SameSite=Lax cookies and a 30-minute idle limit. Secure cookies are enabled in production.
- Helmet supplies security headers and a restrictive CSP. A session-bound synchronizer token protects state-changing requests; login is rate limited.
- Role middleware protects each role area on the server. The initial prototype does not yet implement all requested ownership and clinical relationship checks because the detailed patient record workflows are not implemented.
- AES-256-GCM helpers use a random 12-byte IV and authentication tag per value. The server refuses invalid/missing encryption keys. Encryption helpers are not yet wired to clinical workflows; `_enc` columns must not be treated as encrypted until that work is complete.
- An audit log schema and write helper are present; complete read-level audit coverage is not implemented.
- Notifications can be simulated or routed to SMTP/Twilio. Avoid live delivery with real data.

## Vulnerability assessment procedure

Before any external deployment, install dependencies and inspect advisories with `npm audit`; resolve or document every production dependency finding. Review authentication, authorization, CSRF, session expiry, SQL parameterization, secret handling, encryption, backups, logging, and dependency update procedures. Verify that no real health data or secrets are present in the repository. A qualified security reviewer should assess the deployed configuration before use. This repository does not claim a completed penetration test or compliance assessment.
