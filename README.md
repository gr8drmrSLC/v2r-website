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

This repository has a real GitHub remote (`gr8drmrSLC/v2r-website`, private)
and is pushed, but GitHub Pages is not yet enabled (confirmed via the
GitHub API, 2026-08-24) and no domain is connected. GitHub Pages generally
requires a public repo on the free tier; repo visibility needs a decision
before Pages can be enabled.

**Domain updated 2026-09-05.** `v2r.com` was never actually available to
register (confirmed taken during the 2026-08-24 domain search) and is now
moot regardless: the company rebrand moved first through ENTELORA/XTCI/P2ADV
and then to **V2ADV** ("Vision to Advance"), the current presumptive master
brand. The founder has already personally secured `v2adv.com` (primary),
`v2adv.ai` (defensive/future-use), and `visiontoadvance.com`
(full-expression/defensive) as pre-formation assets. Full naming history:
`docs/capabilities/entelora-xtci-p2adv-rebranding-living-record.md` in
`v2r-enterprise-knowledge`.

Cloudflare in front of GitHub Pages for DNS, CDN, and WAF remains the
recommendation. Full rollout sequence, using `v2adv.com` in place of the
retired `v2r.com` reference: decide repo visibility, enable GitHub Pages,
move `v2adv.com`'s nameservers to Cloudflare, point Cloudflare at GitHub
Pages, enable Cloudflare Email Routing for `contact@v2adv.com`. None of
this has been executed yet; the domain is bought, not yet pointed at
anything. See `docs/future/future-interfaces-register.md` in
`v2r-enterprise-knowledge` for the tracked open item this resolves.

**Forms, not yet built here.** This site has no contact or objective-intake
form yet (see "Legal Pages" below). When one is added, the proven,
portfolio-wide pattern is a dedicated Cloudflare Worker backed by a KV
namespace, Cloudflare Turnstile for bot protection, and Resend for email
delivery into the same Cloudflare Email Routing inbox described above,
documented in full in
`docs/capabilities/cloudflare-and-twilio-infrastructure-notes.md`
("Cloudflare Workers: the Contact Form Pattern") in `v2r-enterprise-knowledge`.
Not a new design; the same mechanism already proven across every WordPress
site in the portfolio.

## Legal Pages

`privacy.html`, `terms.html`, and `cookies.html` are drafted (2026-08-24),
matching the pattern documented in `docs/capabilities/legal-pages-capability.md`
in `v2r-enterprise-knowledge`. All three are explicitly marked as drafts,
not yet attorney-reviewed, and describe this site's real current state (a
static page, no data collection yet) rather than a not-yet-built intake
process. Linked from both the homepage footer and each other's footer, so
none are orphaned pages. Revise before the site's contact/objective-intake
process actually collects any visitor data, not after.
