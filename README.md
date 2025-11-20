# Iris Reader '25


- Modern digital bookshelf with eye-tracking control. Iris Reader '25 lets users read and navigate books using only their eyes.
- [Original prototype](https://presentation-textbook_prototype.toddle.site)
- [Deployment](https://an-vu.github.io/iris25/)
- [Wiki](https://github.com/an-vu/iris25/wiki)

---

## Features

- **Eye-Tracking Navigation** – Scroll and control pages using gaze input.
- **PDF & EPUB Support** – Render books with `pdf.js`.
- **Distraction-Free UI** – Minimal, typography-focused design.
- **Offline & Private** – All processing runs locally in the browser.

---

## Tech Stack

- **Frontend:** [React](https://github.com/facebook/react) + [Vite](https://github.com/vitejs/vite)
- **Styling:** Custom [CSS Modules](https://github.com/css-modules/css-modules)
- **Routing:** [React Router DOM](https://github.com/remix-run/react-router)
- **Eye Tracking:** [WebGazer.js](https://github.com/brownhci/WebGazer)
- **Rendering:** [PDF.js](https://github.com/mozilla/pdf.js)

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
