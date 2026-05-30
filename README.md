# Layla Hassan — Digital Business Card

> **Layla Hassan · Product Designer — elegant digital card from Cairo. Call, WhatsApp, vCard, QR, studio reel & installable PWA. EN/AR + dark mode.**

A production-ready, mobile-first digital business card built with vanilla HTML, CSS, and JavaScript. Installable as a PWA on Android, iOS, and desktop — optimized for smartphones and deployed on **Vercel**.

---

## Live Demo

| | |
|---|---|
| **Production URL** | `https://YOUR-PROJECT.vercel.app` |
| **Owner** | Layla Hassan — Product Designer |
| **Location** | Cairo, Egypt |

> Replace `YOUR-PROJECT.vercel.app` after your first Vercel deploy, then set `shareUrl` in `data/card.json`.

---

## Features

| Feature | Description |
|---------|-------------|
| **Mobile-first UI** | Safe-area insets, 44px tap targets, `100dvh`, touch-optimized |
| **PWA install** | Native Chrome install dialog · iOS Add to Home Screen · offline fallback |
| **Bilingual** | English / Arabic with full RTL support |
| **Dark mode** | Light · Dark · Auto (system) |
| **Contact actions** | Call, WhatsApp, email, website, maps, copy |
| **Utilities** | QR modal, vCard download, native share |
| **Showcase video** | Owner reel modal (YouTube embed or local file) |
| **Accessibility** | Skip link, ARIA, focus trap, reduced motion |
| **SEO & sharing** | Open Graph, Twitter cards, canonical URLs, sitemap |

---

## Tech Stack

- **HTML5** — semantic markup
- **CSS3** — custom properties, mobile-first responsive
- **Vanilla JS (ES6 modules)** — no framework, no build step
- **PWA** — Service Worker, Web Manifest, install banner
- **Deploy** — Vercel (static, HTTPS, `cleanUrls`)

---

## Project Structure

```
├── index.html                 # Main page
├── offline.html               # PWA offline fallback
├── manifest.webmanifest       # PWA manifest
├── sw.js                      # Service worker (bump CACHE_VERSION on deploy)
├── vercel.json                # Vercel headers & routing
├── robots.txt / sitemap.xml   # SEO
├── js/
│   ├── pwa.js                 # Head bootstrap: prompt capture + SW register
│   └── components/
│       └── InstallBanner.js   # Install banner UI
├── scripts/                   # App modules (ES6)
├── styles/                    # Modular CSS
├── data/
│   ├── card.json              # Owner config & contact data
│   └── labels.json            # EN / AR UI strings
└── assets/
    ├── owner.webp             # Profile photo
    ├── MYQR.png               # QR code
    └── icons/favicon/png/     # PWA icons (192 & 512)
```

---

## Deploy to GitHub + Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Layla Hassan digital business card"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

**Do not commit** `node_modules/` — it is gitignored. PWA icons under `assets/icons/` **are committed** (required for installability).

### 2. Connect Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. Framework Preset: **Other**
4. Build Command: leave **empty**
5. Output Directory: **`.`** (project root)
6. Click **Deploy**

Vercel reads `vercel.json` automatically for headers (`sw.js`, manifest, cache rules).

### 3. Post-deploy checklist

- [ ] Open live URL in **Chrome on your phone** (direct browser, not WhatsApp in-app)
- [ ] Wait ~2s on first visit (one-time SW bootstrap reload may occur)
- [ ] Tap **Install** → native “Install app” dialog appears
- [ ] Test QR, Save vCard, Share, video modal, language toggle
- [ ] Update `data/card.json` → `"shareUrl": "https://your-live-url.vercel.app/"`
- [ ] Update `sitemap.xml` → replace `YOUR-VERCEL-URL`
- [ ] Bump `CACHE_VERSION` in `sw.js` after any HTML/CSS/JS change

### 4. Clear stale cache (if needed)

Chrome → Site settings → **Clear & reset** → revisit the live URL.

---

## Local Development

```bash
# Serve locally (HTTPS not required on localhost for PWA testing)
npx serve . -p 3000

# Open
http://localhost:3000
```

### Regenerate PWA icons (optional)

Only needed if you change `assets/favicon.svg`:

```bash
npm install
npm run generate:pwa-icons
```

Commit the generated PNGs in `assets/icons/favicon/png/`.

---

## Configuration

### Owner & contact — `data/card.json`

```json
{
  "fullName": "Layla Hassan",
  "title": "Product Designer",
  "email": "la.hassan@gmail.com",
  "phone": "+201234567890",
  "shareUrl": "https://your-live-url.vercel.app/",
  "showcaseVideo": {
    "enabled": true,
    "type": "embed",
    "embedUrl": "https://www.youtube.com/embed/VIDEO_ID"
  }
}
```

### Labels (EN / AR) — `data/labels.json`

All UI strings including PWA install copy, QR modal, and showcase video.

---

## Mobile & PWA Testing

| Platform | Expected behavior |
|----------|-------------------|
| **Android Chrome** | Install banner when prompt ready → native install dialog |
| **iOS Safari** | Banner after ~1.2s → Share sheet or inline guide |
| **Desktop Chrome/Edge** | Same native install flow as Android |
| **Installed app** | Banner hidden · standalone display |
| **Offline** | `offline.html` fallback for navigation |

---

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome / Edge | 88+ |
| Safari (iOS) | 14+ |
| Firefox | 85+ |
| Samsung Internet | Latest |

---

## Deploy Version Bumps

After every production change to HTML, CSS, or JS:

1. Increment `CACHE_VERSION` in `sw.js`
2. Increment `?v=N` on `InstallBanner.js` in `index.html` (if banner logic changed)
3. Push to GitHub → Vercel auto-deploys

---

## Credits

| | |
|---|---|
| **Card owner** | Layla Hassan |
| **Developer** | Eng. Eslam Osama Saad |
| **Brand** | [EOPeak](https://eopeak.com) |

---

## License

Proprietary — developed for EOPeak client delivery.

---

**Last updated:** May 2026
