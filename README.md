# Iris Reader '25


Minimalist digital bookshelf with eye-tracking control. Iris 25 lets users read and navigate books using only their eyes.
Original prototype: https://presentation-textbook_prototype.toddle.site

---

## Features

- **Eye-Tracking Navigation** – Scroll and control pages using gaze input.
- **PDF & EPUB Support** – Render books with `pdf.js` and `epub.js`.
- **Distraction-Free UI** – Minimal, typography-focused design.
- **Offline & Private** – All processing runs locally in the browser.

---

## Tech Stack

- **Frontend:** React + Vite
- **Styling:** CSS Modules (custom, no framework)
- **Routing:** React Router DOM
- **Eye Tracking:** WebGazer.js
- **Rendering:** PDF.js, epub.js

---

## Development

**Run locally**

```bash
npm install
npm run dev
```

Then open the URL shown in terminal (e.g., `http://localhost:5173`).

**Access on same Wi-Fi (optional)**

```bash
npm run dev -- --host
```

Then open your local IP + port (e.g., `http://192.168.1.104:5173`).

---
