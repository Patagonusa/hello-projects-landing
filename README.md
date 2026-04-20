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
- **Tracking scripts:** `tracking.js`, `whatsapp-widget.js`, `luna-chat.js`

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
