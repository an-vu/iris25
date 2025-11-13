# Changelog

## November 18

- Moved all SVG files into `src/icons/` for cleaner structure
- Reader page polish:
  - Added shy mode
  - Added background toggle (colorful/neutral)
  - Fixed PDF border sizing
- Add Redux and Context

## November 16

- Added reading progress saving (remembers last page)
- Added notes/highlights sidebar
- Researched Context vs. Redux for managing global app settings (theme, tracking mode, background style, etc.)
- Planned to add service worker for offline access

## November 14

- Implemented “Add a New Book” with file picker
- Deciding between auto-storing cover image from first PDF page or using a “Grab Cover” feature
- Began lazy-loading chapters (load only when needed)

## November 12

- Split calibration into a separate window (accessible from Home and Reader pages)
- Rewrote calibration tutorial for better clarity
- Improved tracking accuracy (mouse-click alignment helps calibration)

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
