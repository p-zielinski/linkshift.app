# Security Policy

## Supported versions

Security fixes are accepted against the default branch (`main`) while the project is actively maintained.

The hosted service at [linkshift.app](https://linkshift.app) is planned through **February 2027** (or longer if it reaches **≥ $500 MRR**). Self-hosted deployments are the operator’s responsibility.

## Reporting a vulnerability

Please report security issues **privately**. Do not open a public GitHub issue or pull request that discloses an exploit.

Email: **[security@linkshift.app](mailto:security@linkshift.app)**  
(If that address is unavailable, use **[support@linkshift.app](mailto:support@linkshift.app)** with subject `Security report`.)

Include:

- Affected component (`backend`, `frontend`, `backend-tools`, redirect path, auth, etc.)
- Description and impact
- Steps to reproduce or a minimal proof of concept
- Whether you are testing against hosted or a local/self-hosted instance

We will acknowledge receipt when possible and work on a fix before any public disclosure.

## Scope

**In scope (examples):** authentication/authorization bypass, tenant isolation breaks, SSRF in public tools, injection, secret exposure in the public repo, privilege escalation.

**Out of scope (examples):** denial of service from volume alone, issues requiring physical access or already-compromised admin credentials, reports against third-party services (Paddle, Cloudflare, etc.) without a LinkShift-specific vulnerability, and social engineering.

## Safe harbor

We welcome good-faith research. Avoid privacy violations, data destruction, and disruption of the hosted production service beyond what is needed to demonstrate a bug.
