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

### Milestone 1, Foundation and Design

- Defined project scope and core goals.
- Produced initial UI sketches for homepage, bookshelf, and reader layouts.
- Set up the React plus Vite project, routing, and base component structure.
- Created global CSS theme, background animation system, and early card layouts.

### Milestone 2, Core Features and Navigation

- Implemented homepage, bookshelf, and reader pages.
- Added reusable book and chapter card components.
- Set up navigation using React Router.
- Established window-like UI structure and early responsive behavior.

### Milestone 3, Eye Tracking and Calibration System

- Integrated WebGazer for real time gaze tracking.
- Built the calibration workflow, accuracy scoring, and smoothing logic.
- Added the iris toggle and first-time calibration trigger.
- Refactored key tracking files (`webgazerManager.js`, `irisManager.jsx`, `useWebGazer.js`).
- Improved accuracy through tuning parameters and merging calibration data.

### Milestone 4, Final Integration, Polish, and Demo Build

- Restructured components for maintainability, split large files, removed unused parts.
- Improved UI interactions, hover states, scaling, and layout polish.
- Added progress bar designs, shy mode prototype, and cleaner chapter card behavior.
- Refined background persistence across pages.
- Prepared the final demo build and GitHub Pages deployment.
- Added documentation, installation steps, and milestone summary.

---
