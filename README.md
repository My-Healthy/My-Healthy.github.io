# My Health — Personal & Family Health PWA

Medicines with alarms, health tracking, family caregiving and emergency details.
English · සිංහල · தமிழ்

- Nutrition guidance: **Gayathri Dissanayaka**, Registered Dietitian & Nutritionist (SLMC Reg No. 148 & 375)
- Designed & developed by **Ashen Wijesingha**

## Deploy to GitHub Pages

1. This repository (`My-Healthy/My-Healthy.github.io`) is the GitHub Pages site.
2. Upload **everything in this folder** (keep the `icons/` and `vendor/` folders and the `.nojekyll` file).
3. Repository → Settings → Pages → Source: *Deploy from a branch* → `main` / root → Save.
4. Open `https://my-healthy.github.io/` on your phone.
5. Install it:
   - **iPhone (Safari):** Share → *Add to Home Screen*, then open it from the Home Screen.
   - **Android (Chrome):** menu ⋮ → *Install app*.

## One-time Supabase settings (dashboard)

The backend (project `my-health-pwa`, Mumbai) is already set up: database, security rules,
reminder engine and the every-minute scheduler. Two settings can only be changed in the dashboard:

1. **Authentication → URL Configuration → Site URL**: set it to your GitHub Pages address
   (e.g. `https://my-healthy.github.io/`) and add the same URL under *Redirect URLs*.
   This makes email-confirmation and password-reset links open the app.
2. **Authentication → Sign In / Providers → Email → Confirm email**:
   Supabase's built-in email sender only allows a few emails per hour. For a family app,
   either turn *Confirm email* **off** (accounts work instantly), or connect your own SMTP
   (Authentication → Emails → SMTP settings).

## How alarms work

| Situation | What happens |
|---|---|
| App open | Full-screen alarm with sound and vibration at each dose time |
| App closed, signed in, alarms turned on | Push notification from the server at each dose time, with **Taken ✓** and **Snooze 10 min** buttons (Android) |
| Dose not marked within the chosen time (default 30 min) | Family members who chose *Tell me if a dose is missed* get an alert |
| Medicine running low | Refill reminder at 9:00 am |
| Appointment | Reminder 1 day and 1 hour before |
| No internet / no account | *Add to phone calendar* creates repeating calendar alarms |

iPhone needs iOS 16.4 or newer and the app must be installed to the Home Screen for push alarms.

## Files

- `index.html` – app shell and styles
- `app.js` – the app
- `i18n.js` – Sinhala and Tamil translations
- `config.js` – Supabase URL, publishable key and push public key (safe to publish)
- `sw.js` – service worker (offline, push alarms, notification buttons)
- `manifest.webmanifest`, `icons/` – install metadata
- `vendor/supabase.js` – Supabase client library
