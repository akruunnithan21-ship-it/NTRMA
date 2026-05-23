# Neo Tokyo · Service / RMA Tracker

A free, installable mobile app (PWA) for tracking RMA tickets at **Neo Tokyo**, Kochi.

> Pure black + Raspberry Red `#E70146` + Electric Pink `#E70077`.
> Glassmorphism cyberpunk UI, designed mobile-first, runs offline.

---

## What it does

- **Sections** (top nav):
  - **Service** — placeholder for in-shop diagnostics (future build).
  - **RMA** — fully working. The reason this app exists.
  - **Warranty Check** — placeholder for serial-based warranty lookup (future build).

- **Slide menu** (top-left ☰), inside RMA:
  - **New Entry** — clean form with picker dropdowns and an internet-search button for component descriptions.
  - **Entry Log** — searchable, filterable list of every ticket.
  - **Rack** — physical inventory: items *In Hand* with the tech vs *At Rack*.
  - **Settings** — manage vendors, RMA partners, component types, rack locations. Excel export and manual JSON backup live here.

- **Editable forever** — every ticket is editable from the moment it's saved, and tapping any row in Entry Log opens the same editable form.

- **One mother sheet** — Excel export emits a single sheet `NeoTokyo_RMA` with all 16 columns the workbook needs.

- **Offline-first** — tickets, rack and settings are stored locally in IndexedDB. Service worker caches the shell so it works without a network.

---

## Fields captured

| Field | Notes |
|---|---|
| RMA Number | Auto-generated `NTYY-####` (editable) |
| Customer Name | Free text |
| Submission Date / Delivery Date | Date pickers |
| Component Type | Picker: RAM, CPU, Motherboard, PSU, Cooler, Monitor, GPU, SSD, HDD, Cabinet, Keyboard, Mouse, Headset (extendable) |
| Vendor / Brand | Picker: ASUS, Nvidia, Gigabyte, Deepcool, Corsair, GSkill, Adata, AMD, Intel, MSI, Cooler Master (extendable) |
| Component Description | Free text + 🔎 internet search button |
| Serial Number IN | Component received from customer |
| Serial Number OUT | Replacement, if any |
| RMA Submitted To | Picker: ACRO, Gigabyte, F1, Hizen (extendable) |
| Defect | Free text |
| Status | Pending / Open / Closed / Ready for pick up / Picked up / Pending install/delivery / Nil |
| Rack / Location | Optional, picker (extendable) |
| Remarks | Free text |

---

## Status flow & Rack

After a ticket reaches `Picked up`, `Pending install/delivery` or `Closed`, a **Move to Rack / In-Hand Inventory** action appears on the ticket. It creates a rack entry (linked to the RMA number) marked either **IN HAND** (with a tech) or **AT RACK** (in storage).

The Rack page lists everything in stock with quick filters and free manual entries.

---

## Brand / look

- **Colors** — pure black base, Raspberry Red `#E70146` and Electric Pink `#E70077` used as gradients throughout — badges, buttons, active states, glow effects.
- **Font** — **Rajdhani** loaded as the closest match to TRT Fluke Demo's geometric, techy style. When you have the actual `TRTFlukeDemo.woff2`, drop it into `assets/fonts/` and uncomment the `@font-face` block in `css/styles.css` — `--font-brand` already points at it.
- **Glassmorphism** — every card and panel is a frosted glass slab with `backdrop-filter: blur()`, subtle borders, and gradient glow accents.

---

## How to run / install

This is a static PWA — no build step.

### Local quick test
Open `index.html` directly in a modern browser (Chrome / Edge / Safari). Service worker only registers over `http(s)://`, so for full offline behaviour use any tiny static server, e.g.

```
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

### Deploy free (recommended)
Drop the folder onto any free static host:

- **GitHub Pages** — push to `main`, enable Pages.
- **Netlify** — drag the `NTRMA/` folder onto netlify.com/drop.
- **Cloudflare Pages** / **Vercel** — connect repo, no build command needed.

### Install on your phone
1. Open the deployed URL in Chrome (Android) or Safari (iOS).
2. Use **Add to Home Screen**.
3. The app runs full-screen with the Neo Tokyo icon, just like a native app.

---

## Data: backup / restore / export

In **Settings** you can:

- **Export to Excel (.xlsx)** — single mother sheet, ready to share.
- **Backup Now** — downloads a complete `.json` snapshot (tickets + rack + settings).
- **Restore** — load that `.json` on this or another device.

---

## Roadmap (planned pipelines)

- Service section: walk-in tickets, diagnostic checklists, invoices.
- Warranty Check: serial → vendor warranty lookup.
- Customer-facing read-only view.
- Cloud sync (Firebase / Supabase free tier) when multi-user is needed.
- Photo attachments per ticket (component pics, invoice scans).
- Print-ready ticket PDFs.

---

## Tech (all free)

- Vanilla HTML / CSS / JS (no framework, no build step).
- IndexedDB for storage.
- [SheetJS](https://sheetjs.com) (community edition, MIT) via CDN for `.xlsx` export.
- Web App Manifest + Service Worker for installability and offline use.
