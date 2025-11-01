/* Navbar Button Container Setup */

.navbar-button-container {
  display: flex;
  justify-content: center;
  gap: 15px;
  z-index: 2;
  flex-direction: row;
  flex-wrap: wrap;

  transition:
    all 4s ease;
}

.navbar-button-container.big-gap {
  gap: 15px;
}

.navbar-button-container.group {
  border-radius: 50em;
  padding: 10px 15px;
  border: none;
}

.dark {
  background-color: rgba(51, 51, 51, 0.2);
  gap: 12px;

  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition:
    background-color 0.25s,
    box-shadow 300ms ease-in-out,
    color 300ms ease-in-out,
    background 0.4s,
    transform 0.4s ease;
    opacity 0.4s ease,
    filter 0.4s ease;
}

.dark:hover {
  background-color: rgba(51, 51, 51, 0.35);

  opacity: 0.9;
}

.navbar-button-container.group:hover {
  transform: scale(1.02);
}

/* Nav Button Setup */

.nav-button {
  padding: 10px 20px;
  border-radius: 50em;
  background-color: rgba(51, 51, 51, 0.7);
  color: #fff;
  opacity: 0.7;
  border: none;
  align-self: center;
  height: auto;

  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition:
    background-color 0.25s,
    box-shadow 300ms ease-in-out,
    color 300ms ease-in-out,
    background 0.4s,
    transform 0.4s ease;
    opacity 0.4s ease,
    filter 0.4s ease;
}

.nav-button:hover {
  transform: scale(1.08);
  opacity: 0.85;
  background-color: rgba(51, 51, 51, 0.85);
  color: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.navbar-button-container.group:hover .nav-button:hover {
  transform: scale(1.08);
}

/* SVG Nav Button Setup */

.nav-button.svg-button {
  width: 40px;
  height: 40px;
  min-width: 40px;
  min-height: 40px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-direction: row;
  transition: width 0.3s ease;
  overflow: hidden;
  
  transform: translateZ(0);

  gap: 6px;
}

.nav-button.svg-button svg {
  width: 21px;
  height: 21px;
  display: block;
  pointer-events: none;

  transform-origin: center center;
  backface-visibility: hidden;
  transform: translateZ(0);
  transition: transform 0.3s ease;

  opacity: 0.7;
}

.nav-button.svg-button:hover {
  width: 120px; 
  transform: scale(1.05);
}

.nav-button.svg-button:hover svg {
  transform: scale(1.05);
  opacity: 0.85;
}

/* SVG Nav Button Label Setup */

.svg-label {
  display: none;
  opacity: 0.7;
  transition: all 0.3 ease;
}

.nav-button.svg-button:hover .svg-label {
  display: inline;
  opacity: 0.85;
}

div (.big-gap.navbar-button-container)
    div (.group.navbar-button-container)
        a (.nav-button.svg-button)
    div (.dark.group.navbar-button-container)
        a (.nav-button.svg-button)
        button (.nav-button)
        button (.nav-button)
        button (.nav-button)
    div(.group.navbar-button-container)
        button (.nav-button.svg-button)
        button (.nav-button.svg-button)
        button (.nav-button.svg-button)
