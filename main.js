document.addEventListener("DOMContentLoaded", function() {
    // --- Part 1: Dynamically Load Sidebar ---
    // This prevents having to copy/paste the sidebar HTML into every page.
    const sidebarPlaceholder = document.getElementById("sidebar-placeholder");
    if (sidebarPlaceholder) {
        // Use a root-relative path to ensure it works from any page depth (e.g., /about/ or /building/articles/).
        const pathToSidebarHtmlFile = '/sidebar.html'; 
        fetch(pathToSidebarHtmlFile)
            .then(response => {
                // Check if the request was successful.
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} for ${pathToSidebarHtmlFile}`);
                }
                return response.text();
            })
            .then(html => {
                // Replace the placeholder div entirely with the fetched sidebar HTML.
                // outerHTML is better than innerHTML here because it removes the placeholder div itself.
                sidebarPlaceholder.outerHTML = html;
            })
            .catch(error => {
                // Gracefully handle errors, like if the file is missing or the network fails.
                console.error("Could not load sidebar:", error);
                if(sidebarPlaceholder) {
                    sidebarPlaceholder.innerHTML = "<p style='color: #ff8a8a; padding: 1rem; text-align: center;'>Error loading sidebar.</p>";
                }
            });
    }
    // --- Part 2: Progressive Bio Reveal on "About" Page ---
    const revealTrigger = document.getElementById('bio-reveal-trigger');
    if (revealTrigger) {
        revealTrigger.addEventListener('click', function() {
            // Find the first bio section that is currently still hidden
            const nextSection = document.querySelector('.bio-section:not(.is-revealed)');

            if (nextSection) {
                // Reveal it by adding the class that triggers the CSS transition
                nextSection.classList.add('is-revealed');
            }

            // After revealing a section, check if there are ANY MORE hidden sections left
            const moreSectionsExist = document.querySelector('.bio-section:not(.is-revealed)');

            // If no more hidden sections are found, it's time to hide the button
            if (!moreSectionsExist) {
                const buttonContainer = this.parentElement;
                buttonContainer.style.transition = 'opacity 0.5s ease';
                buttonContainer.style.opacity = '0';
                buttonContainer.addEventListener('transitionend', () => {
                    buttonContainer.style.display = 'none';
                }, { once: true });
            }
        });
    }
    // --- Part 3: Project Filtering on 'Building' Page (with FLIP Animation) ---
    const filterControls = document.querySelector('.filter-controls');
    if (filterControls) {
        const projectCards = document.querySelectorAll('.project-card');
        filterControls.addEventListener('click', function(e) {
            const button = e.target.closest('.filter-btn');
            if (!button || button.classList.contains('active')) {
                return;
            }
            // Update active button state
            filterControls.querySelector('.filter-btn.active').classList.remove('active');
            button.classList.add('active');
            const filterValue = button.dataset.filter;
            // 1. FIRST: Record the starting position of all cards.
            const initialPositions = new Map();
            projectCards.forEach(card => {
                initialPositions.set(card, card.getBoundingClientRect());
            });
            // 2. LAST: Update the classes. 
            // The CSS change (position: absolute) forces the grid to reflow INSTANTLY.
            // This is the key change that makes the animation work.
            projectCards.forEach(card => {
                const cardTags = card.dataset.tags;
                const shouldBeVisible = filterValue === 'all' || cardTags.includes(filterValue);
                if (shouldBeVisible) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
            // 3. INVERT & PLAY: Animate the cards.
            projectCards.forEach(card => {
                const finalPosition = card.getBoundingClientRect();
                const initialPosition = initialPositions.get(card);
                // We only care about cards that are in the layout.
                if (card.classList.contains('hidden')) return;
                const deltaX = initialPosition.left - finalPosition.left;
                const deltaY = initialPosition.top - finalPosition.top;
                // If the card hasn't moved, we don't need to animate it.
                if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) {
                    return;
                }
                // INVERT: Move the card back to its old position without animation.
                card.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
                // PLAY: Add the transition class and remove the transform to animate it to its new position.
                // We use requestAnimationFrame to ensure the 'invert' transform is applied before we start the transition.
                requestAnimationFrame(() => {
                    card.classList.add('is-moving');
                    card.style.transform = '';
                });
                // Clean up the transition class after the animation is done.
                card.addEventListener('transitionend', () => {
                    card.classList.remove('is-moving');
                }, { once: true });
            });
        });
    }
});