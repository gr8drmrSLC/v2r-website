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
the interactive objective-clarity exercise, the three "Get Started"
paths (written intake, the AI Discovery Interview, and a scheduled
call) and each one's individual purpose, the value-based pricing
copy's basis in `financial-philosophy.md`, and the neon network-globe
hero's tie to the robotics/automation-hardware sourcing capability
added the same session. Not duplicated here; that document is the
source of truth for the "why."

**Forms.** The written-intake and scheduled-call paths currently route
to `contact@v2adv.com` as an honest interim channel rather than a
half-built form. When a real self-service form is built, the proven,
portfolio-wide pattern is a dedicated Cloudflare Worker backed by a KV
namespace, Cloudflare Turnstile for bot protection, and Resend for email
delivery into the same Cloudflare Email Routing inbox, documented in
full in `docs/capabilities/cloudflare-and-twilio-infrastructure-notes.md`
("Cloudflare Workers: the Contact Form Pattern") in `v2r-enterprise-knowledge`.
Not a new design; the same mechanism already proven across every WordPress
site in the portfolio.

**The AI Discovery Interview** ("Talk It Through") is under active build
in the separate `v2r-platform` repository, not this one — see that
repository's own `PROJECT_STATUS.md` and `DECISIONS.md` for real build
status. The homepage currently describes this path as in development
rather than linking to it, since no real model, voice, or public
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
