# V2ADV Website

This is the local static marketing site for V2ADV (Vision to Advance),
the current presumptive master brand, formerly Vision to Reality (V2R).
See `docs/capabilities/entelora-xtci-p2adv-rebranding-living-record.md`
in `v2r-enterprise-knowledge` for the full naming history. The repository
and folder are still named `v2r-website`; renaming them is a separate,
not-yet-made decision.

It is intentionally plain HTML and CSS with no build step, no framework,
and no package manager.

The site uses repository-root GitHub Pages structure: `index.html`,
`styles.css`, and `assets/` live at the root. This is the simplest path
for a small public landing page because GitHub Pages can serve the root
directly without generated files or a separate `docs/` publishing folder.

## Content Source

Copy is adapted from the approved public-facing company documents:

- `docs/company/complete-company-overview.md`
- `docs/company/identity.md`

No internal-only or governance documents were used for page copy.

## Local Preview

Open `index.html` directly in a browser, or run:

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Publishing Status

**Live, 2026-09-05.** `v2adv.com` is the primary domain, served through
Cloudflare in front of GitHub Pages (DNS, SSL/TLS, Email Routing for
`contact@v2adv.com`, and 301 redirects from `v2adv.ai`,
`visiontoadvance.com`, and `visiontoadvance.ai` all configured and
verified live the same day). GitHub Pages' own HTTPS enforcement was
still pending certificate provisioning as of this update; Cloudflare's
edge certificate secures visitors in the meantime. Full naming history:
`docs/capabilities/entelora-xtci-p2adv-rebranding-living-record.md` in
`v2r-enterprise-knowledge`.

**Site structure and design rationale**: `docs/capabilities/
client-intake-and-discovery-workflow.md` in `v2r-enterprise-knowledge`
(EPIC-004 Story 31) documents why the homepage looks the way it does:
the interactive objective-clarity exercise, the gated client-profile
workflow (2026-09-06 redesign, replacing an earlier static three-card
"Get Started" layout), the value-based pricing copy's basis in
`financial-philosophy.md`, and the neon network-globe hero's tie to the
robotics/automation-hardware sourcing capability added the same session.
Not duplicated here; that document is the source of truth for the "why."

**Get Started, 2026-09-06 redesign.** A persistent floating entry point
(`assets/entry-widget.js`, fixed trigger + expandable panel, modeled on
`howtoplaypickleball-seo`'s real, live floating chat widget's interaction
shape, restyled to V2ADV's own palette) replaces the old static
three-card section. It is purely static in this repository — no
`fetch()`, no Cloudflare Turnstile here. Its panel currently links to
`mailto:contact@v2adv.com`, an honest interim channel, the same
convention this site already used for other not-yet-self-service paths:
a first version briefly linked to `https://app.v2adv.com`, a domain that
was never deployed anywhere and does not resolve (confirmed NXDOMAIN),
which this repository's GitHub Pages/CNAME setup put live in front of
real visitors for a short window before being caught and fixed the same
day (see `v2r-platform`'s `DECISIONS.md`, 2026-09-06, for the full
record). The actual profile creation, login, discovery-path selection,
online questionnaire, call-booking page, and client dashboard are built
and merged in `v2r-platform`, same-origin Jinja2 pages — see that
repository's own `PROJECT_STATUS.md` and `DECISIONS.md` (2026-09-06
entries) for real build status — but that platform has no deployment
anywhere yet, so this widget cannot link to it for real until it does.
The ten-minute call-cancellation policy lives only on that platform's
(not-yet-reachable) booking page now, not on this homepage.

**The AI Discovery Interview** ("Talk It Through," one of the three
paths reachable after logging in) is under active build in the separate
`v2r-platform` repository, not this one — see that repository's own
`PROJECT_STATUS.md` and `DECISIONS.md` for real build status. Its
frontend now exists (`app/templates/interview/session.html`), driven by
the stub dialogue provider only; no real model, voice, or public
deployment exists yet.

## Legal Pages

`privacy.html`, `terms.html`, and `cookies.html` are complete policies
as of 2026-09-05, at founder direction, matching the pattern documented
in `docs/capabilities/legal-pages-capability.md` in
`v2r-enterprise-knowledge`. **These remain AI-drafted, not
attorney-reviewed**; the founder made an informed decision to remove
the prior "draft, not yet attorney-reviewed" banner rather than delay
for actual counsel review, after being told plainly what that means.
See `v2r-enterprise-knowledge`'s `DECISIONS.md` (2026-09-05) for the
full decision record. Terms of Service names Colorado as governing law,
per the founder's direct confirmation. Linked from both the homepage
footer and each other's footer, so none are orphaned pages.
