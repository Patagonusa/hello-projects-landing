# Hello Projects Pro — Landing Site

**URL:** https://helloprojectspro.com  
**Stack:** Static HTML, Custom CSS, Vanilla JS  
**Hosting:** Render (static site)  
**Repo:** Patagonusa/hello-projects-landing (origin) + Patagonusa/patagon-landing (render deploy)  
**CRM Webhook:** https://patagon-crm.onrender.com/api/webhooks/lead  
**License:** CSLB #1135440

---

## Pages

### Main Pages
| Page | EN | ES |
|---|---|---|
| Homepage | `index.html` | `es.html` |
| Get Free Quote | `quote.html` | `quote-es.html` |
| Pre-Qualification | `qualify.html` | `qualify-es.html` |
| Product Catalog | `catalog.html` | `catalog-es.html` |
| HVAC Catalog + BTU Calculator | `hvac.html` | `hvac-es.html` |
| Roofing Offer | `roofing-offer.html` | `roofing-offer-es.html` |
| Privacy Policy | `privacy.html` | — |
| Terms & Conditions | `terms.html` | — |

### Service Pages (`/services/`)
| Page | EN | ES |
|---|---|---|
| Kitchen Remodeling | `kitchen-remodeling.html` | `kitchen-remodeling-es.html` |
| Bathroom Remodeling | `bathroom-remodeling.html` | `bathroom-remodeling-es.html` |
| Roofing | `roofing.html` | `roofing-es.html` |
| General Remodeling | `general-remodeling.html` | `general-remodeling-es.html` |
| Electrical Services | `electrical-services.html` | `electrical-services-es.html` |
| Landscaping | `landscaping.html` | `landscaping-es.html` |

### Lead Magnet Calculators (Added Apr 2026)
| Page | EN | ES | Purpose |
|---|---|---|---|
| Roof Cost Calculator | `roof-calculator.html` | `roof-calculator-es.html` | Interactive roof replacement cost estimator |
| Home Renovation Estimator | `estimator.html` | `estimator-es.html` | Multi-project cost estimator (9 project types) |

---

## Lead Magnets — How They Work

### Roof Cost Calculator
Interactive 3-step flow:
1. **Calculate** — Roof size (slider 500-5000 sqft), material type, stories, condition, zip code
2. **Instant Estimate** — Shows price range with materials/labor/permits breakdown (no info required)
3. **Get Report** — Contact form captures lead, submits to CRM webhook

**Pricing (based on actual HPP quotes):**
| Material | $/sqft | Formula |
|---|---|---|
| 25-Year Architectural Shingle | $7.00 - $8.00 | Sub $500/sq × 1.40-1.60 markup |
| 50-Year Premium Shingle | $8.00 - $9.50 | Sub $500/sq × 1.60-1.80 markup |
| Torch Down (Flat Roof) | $7.00 - $8.00 | Same as 25yr shingle |
| Metal Roofing | $10.50 - $12.00 | 25yr price × 1.50 |

**Add-ons tracked in notes:** 2+ stories (+20%), 3-layer tear-off (+$5K), extra plywood ($85/sheet)

**Hero background:** Completed roof job photo (407 S Hilda project)

### Home Renovation Estimator
Interactive 4-step wizard:
1. **Select Projects** — 9 cards with real project photos (kitchen, bathroom, roofing, HVAC, windows, flooring, electrical, landscaping, general remodeling)
2. **Size & Scope** — Per-project sliders/tiers/dropdowns to customize scope
3. **Total Estimate** — Breakdown table with per-project line items
4. **Contact Form** — Captures lead with all project details in notes

**Project photos used:**
- Kitchen: `kitchen.jpeg`
- Bathroom: `bathroom.jpeg`
- Roofing: `roofing-work.jpeg` (job site photo)
- HVAC: `hvac/central-ac-system.jpg`
- Windows: `windows-work.jpeg` (job site photo)
- Flooring: `flooring-work.jpeg` (job site photo)
- Electrical: `electrical.jpeg`
- Landscaping: `landscaping.jpeg`
- General: `general-remodeling.jpeg`

---

## CRM Integration

All forms submit to the CRM webhook with:
```json
{
  "first_name": "...",
  "last_name": "...",
  "phone": "...",
  "email": "...",
  "address": "...",
  "zip": "...",
  "source": "Roof Calculator | Home Estimator | Landing Page",
  "form_name": "HPP Roof Cost Calculator | HPP Home Renovation Estimator",
  "campaign": "HPP Roof Calculator | HPP Estimator | HPP Landing Page",
  "project_type": "Roofing | Kitchen Remodel, Roofing",
  "notes": "Calculator details with estimate breakdown",
  "is_homeowner": "Yes"
}
```

---

## Analytics

- **GA4:** G-KE7XWYKQ9F
- **Meta Pixel:** 1782159502364871
- **Events fired:** `roof_estimate_calculated`, `generate_lead`, `Lead` (Meta), `CompleteRegistration` (Meta)
- **Tracking scripts:** `tracking.js`, `luna-chat.js`

---

## Assets

| Folder | Contents |
|---|---|
| `/catalog/` | 370+ product images (flooring, tile, materials) |
| `/hvac/` | 14 HVAC product images |
| `/services/` | Service-specific landing pages |
| Root | Hero images, team photos, project work photos |

---

## Deploy

Push to both remotes:
```bash
git push origin main    # GitHub
git push render main    # Render deploy
```
Auto-deploys on push to `render` remote. Static site, no build process.


---

## Session 2026-08-08 / 08-09 — Phone unification, galleries, multilanguage, promo video

**Phone + WhatsApp**
- Unified every phone number across the whole site (EN + ES) to the official **(888) 480-4286** (`tel:` links, display, `+1` forms). This is the Patagon Group main line (see PCRM IVR).
- **Removed the WhatsApp widget entirely**: deleted `whatsapp-widget.js`, stripped its `<script>` from all 28 pages, and re-pointed the Luna-chat greetings + the sticky mobile call-bar (`pixel-enhancements.js` `PHONE_E164`) to the phone number.

**Real Jobs Gallery** (`services/*-real-jobs.html`, EN + ES for all 6 trades)
- Kitchen uses real customer photos in `images/real-jobs/`; the other 5 trades (bathroom, roofing, general, electrical, landscaping) use `images/services/*` as **placeholders — swap in real job photos** in that folder.
- Each service page has a red banner linking to its gallery. Lightbox + SEO (canonical, hreflang, `ImageGallery` JSON-LD) + sitemap.

**Multi-language (Filipino + Chinese, in progress by batches)**
- Home: `index.html` (EN) · `es.html` (ES) · **`tl.html`** (Filipino/Tagalog) · **`zh.html`** (Chinese/Mandarin). Kitchen service page also done: `kitchen-remodeling-{tl,zh}.html`.
- 4-language switcher (EN / ES / TL / 中文) that **omits the current language**; `hreflang` on all; CJK font stack on `zh`.
- **Encoding gotcha:** `es.html` and the `-es` service pages are **cp1252** (not UTF-8) and use HTML entities for accents; ALWAYS read/decode with a cp1252 fallback and **pre-encode before writing** (a raw emoji/CJK char in a cp1252 write once truncated a page).
- **Pending:** remaining service pages (bathroom/roofing/general/electrical/landscaping) in TL+ZH; galleries in TL+ZH; inner pages (quote/catalog/estimator/etc.). Filipino + Chinese chosen first.

**Labor Day promo video popup** (all 4 home pages)
- `videos/labor-day-roof-promo.mp4` shows ~1.2s after load, **plays 2 loops then auto-closes**, closable via the X or click-outside, shown **once per session** (`sessionStorage`). Tries to play with sound; if the browser blocks unmuted autoplay it falls back to muted + a **"Tap for sound"** button.

**Known bug (TODO):** the website Luna **chat** wrongly rejects jobs ("we don't do plumbing/paving") — its system prompt must be broadened to capture the lead, never reject.
