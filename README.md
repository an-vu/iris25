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

## Functions You Can Use With Eye Tracking

(when Iris is enabled)

### Home page
- Look at the left or right arrow to scroll through book cards.
- Look at a book’s Read button to navigate directly to the reader page.
### Reader page
- Look at the scroll up button to move the page up.
- Look at the scroll down button to move the page down.

---

## Milestone Summary

### Milestone 1. Foundation and Design

- Defined project scope, goals, and interaction model.
- Produced early wireframes for homepage, bookshelf, and reader layouts.
- Set up React plus Vite project, routing, and component scaffolding.
- Built global CSS theme, background animation, and first card layouts.
- Migrated prototype assets into Vite, organized initial file structure.
- Added BookCard, Button, and Navbar components, early homepage and reader pages

### Milestone 2. Core Features and Navigation

- Implemented homepage, bookshelf, and reader pages with basic navigation.
- Split large components for cleaner structure, added reusable card and UI pieces.
- Added Navbar designs for both Home and Reader pages.
- Introduced chapter splitting for large PDFs, fixed early rendering bugs.
- Set up GitHub Pages deployment and BrowserRouter fixes.
- Began adding zoom, chapter switching, and scroll UI.

### Milestone 3. Eye Tracking and Calibration System

- Integrated WebGazer, added toggle, camera control, and eye-based scrolling.
- Built 9-point calibration system with scoring tiers, modals, accuracy workflow.
- Developed CalibrationContext, useWebGazerEngine, and shared config utilities.
- Iteratively improved accuracy: 38 percent to 86 percent across builds.
- Rebuilt calibration flow multiple times, stabilized lifecycle of iris tracking.
- Major refactors of WebGazerManager.js, IrisManager.jsx, and useWebGazer.js.
- Significant cycle of debugging accuracy drops, smoothing, tuning.

### Milestone 4. Final Integration, Polish, and Demo Build

- Heavy restructuring for maintainability, removed unused code, split files.
- Cleaned up SVGs, moved assets into src/icons, cleaned all CSS files.
- Added Shy Mode, progress bar designs, refined chapter cards, hover states, scaling.
- Improved background persistence, reader scroll buttons, and overall layout polish.
- Added new book data, cleaned logic, restored missing files, fixed major UI bugs.
- Final accuracy tuning, stable iris interaction across homepage and reader.
- Prepared demo builds 251122.0153
- Completed documentation, installation steps, and milestone summary for submission.

---
