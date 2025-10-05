# Skyluxe Climate Analyzer

Analyze historical weather probabilities and daily climate metrics for any location using NASA POWER data. Built with Vite + React + TypeScript and Tailwind CSS.

## Features

- **Animated splash**: Canvas starfield + logo reveal with Smooch Sans wordmark.
- **Location search (validated)**: Clean input validation and error messages.
- **Climate metrics**: Mean/Min/Max temperature, precipitation, humidity, wind, pressure.
- **Probability cards**: Extreme heat/cold, heavy rain, high wind, uncomfortable humidity.
- **Charts**: Compact temperature range visualization per day.
- **Export**: JSON and CSV export with CSV injection mitigation.
- **Zero Trust on external data**: Sanitization and numeric coercion for geocoding and NASA data.
## Tech Stack

- **Frontend**: React 18, TypeScript 5, Vite 5, Tailwind CSS 3, lucide-react
- **APIs**: NASA POWER (daily point), OpenStreetMap Nominatim (geocoding)

LocationSearch.tsx
ExportPanel.tsx
services/
geocoding.ts              # Nominatim
nasaPowerApi.ts           # NASA POWER daily point
{{ ... }}
sanitize.ts               # safeText, toFiniteNumber, CSV mitigations
validation.ts             # input validation
App.tsx
main.tsx
index.css
index.html
package.json
vite.config.ts
```
## Getting Started

Prerequisites: Node.js 18+

Install and run dev server:
```bash
npm install
npm run dev
# open http://localhost:5173
```
Type-check, build, and preview production:
```bash
npm run typecheck
npm run build
npm run preview
# open http://localhost:4173
```
## Deployment (Netlify)

Fastest path (no config changes):

- Build locally: `npm run build` (outputs to `dist/`)
- Drag-and-drop `dist/` to Netlify (app.netlify.com → Add new site → Deploy manually)

From Git:

- Build command: `npm run build`
- Publish directory: `dist`

Note: This is a single-page app without client-side routing, so no redirect rules are required.

## Security & Data Handling

- All external responses are treated as untrusted.
- Text is sanitized with `safeText()` and numbers coerced with `toFiniteNumber()`.
- CSV export uses basic formula injection mitigations.
- Geocoding/NASA values are clamped to safe ranges.





## Data Sources & Credits

- **NASA POWER API**: https://power.larc.nasa.gov
- **OpenStreetMap Nominatim**: https://nominatim.openstreetmap.org (follow usage policy)
- **Icons**: lucide-react
- **Font**: Smooch Sans via Google Fonts

## Troubleshooting

- If a network reset error appears during fetches (Windows `wsarecv`), retry the request. Consider adding request timeouts/retries when production-hardening.
- Dev vs Preview: `npm run dev` serves live code at http://localhost:5173. `npm run preview` serves the built app at http://localhost:4173.

## License

Add your license here (e.g., MIT).
