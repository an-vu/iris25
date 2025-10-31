document.addEventListener("DOMContentLoaded", function () {
    const cards = document.querySelectorAll(".book-card");
    const background = document.querySelector(".background");
    let selectedIndex = 0;

    function updateCardClasses() {
        // Update card positions
        cards.forEach((card, index) => {
            card.classList.remove("left", "centered", "right", "hidden");

            if (index === selectedIndex) {
                card.classList.add("centered");
            } else if (index === selectedIndex - 1) {
                card.classList.add("left");
            } else if (index === selectedIndex + 1) {
                card.classList.add("right");
            } else {
                card.classList.add("hidden");
            }
        });

        // Update background gradient class
        background.classList.remove('bg-book-1', 'bg-book-2', 'bg-book-3');
        if (selectedIndex === 0) background.classList.add('bg-book-1');
        if (selectedIndex === 1) background.classList.add('bg-book-2');
        if (selectedIndex === 2) background.classList.add('bg-book-3');
    }

    // Initial load
    updateCardClasses();

    // Keyboard navigation
    document.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") {
            selectedIndex = Math.max(0, selectedIndex - 1);
            updateCardClasses();
        } else if (e.key === "ArrowRight") {
            selectedIndex = Math.min(cards.length - 1, selectedIndex + 1);
            updateCardClasses();
        }
    });
});
