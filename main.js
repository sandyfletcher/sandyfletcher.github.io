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
        const projectsGrid = document.querySelector('.projects-grid'); 

        filterControls.addEventListener('click', function(e) {
            const button = e.target.closest('.filter-btn');
            if (!button || button.classList.contains('active')) {
                return;
            }

            // Update active button state
            filterControls.querySelector('.filter-btn.active').classList.remove('active');
            button.classList.add('active');
            const filterValue = button.dataset.filter;
            
            const gridRect = projectsGrid.getBoundingClientRect();

            // 1. FIRST: Record the starting position and size of all cards.
            const initialPositions = new Map();
            projectCards.forEach(card => {
                initialPositions.set(card, card.getBoundingClientRect());
            });

            // 2. LAST (Revised Logic): Separate cards into 'show' and 'hide' groups
            const cardsToHide = [];
            const cardsToShow = [];
            projectCards.forEach(card => {
                const cardTags = card.dataset.tags.split(' ');
                const shouldBeVisible = filterValue === 'all' || cardTags.includes(filterValue);
                if (shouldBeVisible) {
                    cardsToShow.push(card);
                } else {
                    cardsToHide.push(card);
                }
            });

            cardsToHide.forEach(card => {
                const initialPos = initialPositions.get(card);
                card.style.position = 'absolute';
                card.style.left = `${initialPos.left - gridRect.left}px`;
                card.style.top = `${initialPos.top - gridRect.top}px`;
                card.style.width = `${initialPos.width}px`;
                card.classList.add('hidden');
            });

            cardsToShow.forEach(card => {
                card.classList.remove('hidden');
                card.style.position = '';
                card.style.left = '';
                card.style.top = '';
                card.style.width = '';
            });

            // Defer the animation logic until the browser has painted the layout changes.
            requestAnimationFrame(() => {
                // 3. INVERT & PLAY: Animate the cards that are *remaining*.
                cardsToShow.forEach(card => {
                    const finalPosition = card.getBoundingClientRect();
                    const initialPosition = initialPositions.get(card);

                    const deltaX = initialPosition.left - finalPosition.left;
                    const deltaY = initialPosition.top - finalPosition.top;

                    if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) {
                        return; // Don't animate cards that haven't moved.
                    }

                    // INVERT: Move the card back to its old position without animation.
                    card.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

                    // *** THE FIX IS HERE ***
                    // PLAY: In the *next* animation frame, add the transition class and
                    // remove the transform to animate the card to its new, final position.
                    requestAnimationFrame(() => {
                        card.classList.add('is-moving');
                        card.style.transform = '';
                    });
                    
                    // Clean up the transition class after the animation finishes
                    card.addEventListener('transitionend', () => {
                        card.classList.remove('is-moving');
                    }, { once: true });
                });
            });
        });
    }
});