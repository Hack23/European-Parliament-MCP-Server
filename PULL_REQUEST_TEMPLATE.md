By submitting a request, you represent that you have the right to license
your contribution to the community, and agree that your contributions are
licensed under the [The Apache Software License, Version 2.0](LICENSE.md).

---

## Checklist

- [ ] Tests pass locally (`npm run test:unit`, `npm run test:integration`).
- [ ] No new lint or knip errors (`npm run lint`, `npm run knip`).
- [ ] Documentation updated (README, INTEGRATION_TESTING.md, CONTRIBUTING.md, JSDoc) where behaviour changed.

### OSINT changes only

Tick **both** boxes when any file under `tests/integration/osint/__snapshots__/` or `tests/fixtures/osint/` is modified by this PR:

- [ ] **OSINT snapshot refresh acknowledged.** I have reviewed every diff under `tests/integration/osint/__snapshots__/`, confirmed the methodology change is intentional, and regenerated the snapshots with `npm run test:osint:snapshots -- -u`.
- [ ] **Methodology change documented.** The justification for the scoring/classification/attribution change is described in this PR's body and (where appropriate) in `INTEGRATION_TESTING.md` § "OSINT QA Harness — Golden Snapshots".

See `CONTRIBUTING.md` § "Refreshing OSINT golden snapshots" for the full procedure and reviewer guidance.
