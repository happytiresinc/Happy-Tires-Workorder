# Happy Tires Work Order (iPad-ready)

A responsive, web-based work order system for **Happy Tires Automotive Centre**. Works great on iPad in portrait and landscape. Deploy on GitHub Pages for a simple in-shop web app.

## Features
- Responsive UI (portrait/landscape on iPad)
- Work Order # auto-increments and persists across sessions
- Customer info (name, phone, email, Y/M/M, VIN, plate, odometer)
- Services: add/remove rows, totals, HST (13%)
- Approval: checkbox acknowledgment + signature pad (touch-friendly)
- History: saved in localStorage; toggle show/hide
- Actions: Save (to history), Print, Email (mailto), **Export to PDF** (jsPDF)
- Google Review button

## Deploy on GitHub Pages
1. Create a repo (e.g., `happy-tires-workorder`).
2. Upload `index.html`, `style.css`, `script.js`, and this `README.md`.
3. In **Settings → Pages**, choose the `main` branch and `/root` folder.
4. Open: `https://YOUR-USERNAME.github.io/happy-tires-workorder/`

## Notes
- PDF export uses jsPDF from a CDN.
- Data is stored locally in the browser. Clearing site data will remove history.
- The **Reset Work Order** button clears the form for a new customer but keeps history.
