# V2R Website

This is the local static marketing site for Vision to Reality (V2R).
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

Cloudflare in front of GitHub Pages for DNS, CDN, and WAF remains the
recommendation. Full rollout sequence, once `v2r.com` is registered:
decide repo visibility, enable GitHub Pages, move `v2r.com`'s nameservers
to Cloudflare, point Cloudflare at GitHub Pages, enable Cloudflare Email
Routing for `contact@v2r.com`. See `docs/future/future-interfaces-register.md`
in `v2r-enterprise-knowledge` for the tracked open item this resolves.

## Legal Pages

`privacy.html`, `terms.html`, and `cookies.html` are drafted (2026-08-24),
matching the pattern documented in `docs/capabilities/legal-pages-capability.md`
in `v2r-enterprise-knowledge`. All three are explicitly marked as drafts,
not yet attorney-reviewed, and describe this site's real current state (a
static page, no data collection yet) rather than a not-yet-built intake
process. Linked from both the homepage footer and each other's footer, so
none are orphaned pages. Revise before the site's contact/objective-intake
process actually collects any visitor data, not after.
