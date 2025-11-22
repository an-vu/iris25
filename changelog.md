# Changelog

## November 27

- Moved all SVG files into `src/icons/` for cleaner structure
- Reader page polish:
  - Add Note section
  - Add shy mode
  - Add background toggle (colorful/neutral)
  - Fixed PDF border sizing
- Add Redux and Context
- Add Tests scripts
- Clean up all .css files
- Added reading progress saving (remembers last page)
- Deciding between auto-storing cover image from first PDF page or using a “Grab Cover” feature
- Planned to add service worker for offline access
- Implemented “Add a New Book” with file picker
- Researched Context vs. Redux for managing global app settings (theme, tracking mode, background style, etc.)
- Began lazy-loading chapters (load only when needed)

## November 22

- Release Build 251122.0153: core-working milestone
  WebGazer Iris now works on both the homepage and the reader page for the first time.
- Split Home.jsx into smaller components for cleaner structure.
- Slight accuracy improvement, peak now 86%! Laptop webcam is the limiting factor.

## November 21

- WebGazer fully functional in calibration steps, accuracy calculation is more reliable.
- Tweaked formulas and number handling for better accuracy scoring.
- General accuracy improvement, peak now 78%.

## November 19

- Attempted accuracy improvements using WebGazer top-level API.
- Turned Kalman filter back on for smoothing, accuracy peaked at 76%.
- Avoided repeating the mistakes from the 14th.

## November 18

- Continued splitting files for better organization.
- Worked heavily on WebGazerManager.js, IrisManager.jsx, and useWebGazer.js.
  These three control whether Iris works at all.
- Experimented with Kalman filter settings, accuracy briefly dropped to 38%.
- General UI stable and working well.
- Release Build 251117.0315: ui-working.

## November 16

- Redesigned the entire calibration flow from scratch.
- Re-integrated WebGazer into Iris, accuracy peaked at 64%.

## November 15

- Cleaned up calibration logic.
- Restored several deleted files.
- Added new book Sabai.
- Split larger PDFs into chapter-sized chunks.
- Temporarily removed WebGazer from Iris due to unstable custom settings.

## November 14

- Tried to push accuracy improvements.
- Broke everything instead, accuracy locked at 0% regardless of input...

## November 12-13

- Rebuilt the eye-tracking stack:
  - `useWebGazerEngine` now loads/configures WebGazer (TFFacemesh + weightedRidge + Kalman) and `CalibrationContext` owns lifecycle, statuses, pause/resume, and reader gating.
- Implemented a strict 9-point, click-driven calibration flow (five clicks per point, center last) with camera calibration, instruction modal, per-dot overlay, accuracy prompt, 5-second measurement, scoring tiers, and a reusable accuracy results modal.
- Added shared config/helpers (`calibrationConfig.js`, accuracy tiers, sequence shuffler), separated HUD/UI components, enabled camera-float mounting, and fixed pointer events so the overlay dialogs remain interactive.
- Adjusted calibration dot positioning (edge offsets + CSS centering) so buttons hug the screen borders without clipping, and made the HUD optional to reduce distraction during calibration.

## November 10

- Scrolling with eye tracking works now
- Added eye tracking calibration
- Iris toggle button works now
- turn camera off after iris toggle to off

## November 10

- Started implementing eye-tracking features
- Added zoom in/out
- Moved Previous/Next Chapter buttons to the navbar

## November 4

- PDF rendering now works in Reader page
- Added `ComingSoon.jsx`
- Split large PDFs into chapters
- Fixed bugs in `BookCard.jsx`, `ReaderView.jsx`, and `books.js`
- Cleaned up SVGs and eliminated console errors
- Set up GitHub Pages deployment and fixed BrowserRouter
- Cleaned up project directories

## November 3

- Fixed homepage navbar bug
- Built Reader page structure and layout
- Developed `ReaderContainer` and `ReaderView.jsx`
- Fixed Reader page bugs and CSS issues

## November 2

- Updated Reader page title and navbar

## November 1

- Added **Navbar (Home page)**
- Moved all button styling to **Button.css**
- Improved **book switching** (left/right navigation)
- Team sucks. Create OneDrive folder for documentations and checkpoints.

## October 31

- Split components for cleaner structure
- Added new files:
  - `BookCard.css`
  - `Button.css`
  - `Navbar.css`
  - `NavbarHome.jsx`
  - `NavbarReader.jsx`
- Started working on **Home page navbar**
- Optimized **Home.jsx** and **Reader.jsx**
- Finished **Home page navbar design**

## October 30

- Continued **Home page development**
- Created components:
  - `BookCard.jsx`
  - `Button.jsx`
- Cleaned up HTML/CSS/JS structure
- Finished **Book Card design**

## October 29

- Researched new React workflow (no Flask needed)
- Switched to **React + Vite** setup
- Installed **Node.js, React, Vite**
- Set up dev server
- Migrated HTML/CSS to Vite
- Functional **Home** and **Reader** pages
- Organized and cleaned up file structure

## October 28

- Set up **Discord server** and **GitHub repository**
- Uploaded project files to GitHub
- Began transferring **Toddle/Nordcraft** prototype elements to HTML/CSS

---
