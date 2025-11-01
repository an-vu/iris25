/* Base Nav Button Reset */
.nav-button,
.nav-button:where(a),
.nav-button:where(button) {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;

    width: auto;
    height: auto;
    border-radius: 50em;
    box-sizing: border-box;

    background: rgba(51, 51, 51, 0.7);
    color: #fff;
    border: none;
    outline: none;
    text-decoration: none;

    padding: 10px 20px;
    line-height: 0;
    margin: 0;

    font: inherit;
    cursor: pointer;

    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    opacity: 0.7;

    transition:
        background-color 0.25s,
        box-shadow 300ms ease-in-out,
        color 300ms ease-in-out,
        background 0.4s,
        transform 0.4s ease,
        opacity 0.4s ease,
        filter 0.4s ease;
}

/* Hover behavior */
.nav-button:hover {
    transform: scale(1.08);
    opacity: 0.85;
    background-color: rgba(51, 51, 51, 0.85);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

/* SVG Button Style */
.nav-button.svg-button {
    width: 40px;
    height: 40px;
    min-width: 40px;
    min-height: 40px;
    border-radius: 50%;
    padding: 0;
    line-height: 0;
    gap: 6px;
    overflow: hidden;
    transform: translateZ(0);
    transition: width 0.3s ease;
}

/* SVG icon inside */
.nav-button.svg-button svg {
    width: 21px;
    height: 21px;
    display: block;
    pointer-events: none;
    transform-origin: center center;
    backface-visibility: hidden;
    transform: translateZ(0);
    opacity: 0.7;
    transition: transform 0.3s ease, opacity 0.3s ease;
}

/* Hover animation */
.nav-button.svg-button:hover {
    width: 120px;
    transform: scale(1.05);
}

.nav-button.svg-button:hover svg {
    transform: scale(1.05);
    opacity: 0.85;
}

/* Hover scaling inside grouped container */
.navbar-button-container.group:hover .nav-button:hover {
    transform: scale(1.08);
}