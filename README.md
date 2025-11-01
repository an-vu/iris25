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

Here’s an updated, clean, and accurate `README.md` that fits your **current React + Vite** setup and drops all outdated info:

---

# Iris Reader '25

**Iris Reader** is a minimalist digital bookshelf built with React and Vite.
The project focuses on a clean reading experience, adaptive UI design, and future integration of eye-tracking for hands-free navigation.

---

## Features

* **Modern UI** – Smooth transitions and adaptive background colors per book.
* **Component-Based Structure** – Clean separation for scalability (`BookCard`, `Navbar`, etc.).
* **Keyboard Navigation** – Use arrow keys to switch between books.
* **Modular Styling** – CSS separated by component (`BookCard.css`, `Button.css`, `Navbar.css`).
* **Future Goals:** Eye-tracking, PDF/EPUB integration, and local progress saving.

---

## Tech Stack

* **Frontend:** React + Vite
* **Styling:** CSS Modules (custom, no frameworks)
* **Routing:** React Router DOM
* **Future Integration:** WebGazer.js (eye tracking), PDF.js (rendering)

---

## Project Structure

```
/iris25
  /src
    /components
      BookCard.jsx
      NavbarHome.jsx
      NavbarReader.jsx
    /pages
      Home.jsx
      Reader.jsx
    /styles
      BookCard.css
      Button.css
      Navbar.css
      Home.css
    main.jsx
  index.html
  package.json
  vite.config.js
  README.md
```

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
