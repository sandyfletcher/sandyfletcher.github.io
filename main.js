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
    // --- Part 2: Interactive "About" Page Bio ---
    // This script only runs if the bio choice container exists on the current page.
    const bioChoicesContainer = document.querySelector('.bio-choices');
    if (bioChoicesContainer) {
        const bioOutput = document.getElementById('bio-output');
        // Store the different bio texts in an object for easy lookup.
        const bioContent = {
            minimalist: `<p>I recently got into making websites.</p><p>Click the little icons over there →</p>`,
            elevator: `<p>I'm skilled at conveying complex information in a digestable manner, which means I'm able to pass anything I know along with ease to any captive audience.  This is a widely-applicable skill that's beneficial in both professional and personal circumstances.  If you'd like to collaborate, I've streamlined the process <a href="/contact/">HERE</a>.</p>`,
            campfire: `<p>Oh boy, buckle up.  The truth is I'm still figuring myself out, but you might be able to glean something from <a href="/building/articles/the-long-road.html">an article</a> I wrote about my experience with therapy and addiction counselling.  Circumstance has changed my perspective from something resembling a desire for meritocracy towards a greater understanding of the unappreciated value of perseverence — how will frequently outperforms talent and how coasting is a disservice to oneself.</p>`
        };
        // Use event delegation for efficiency: one listener on the container instead of one per button.
        bioChoicesContainer.addEventListener('click', function(e) {
            const button = e.target.closest('.bio-choice');
            // Guard clauses: exit early if the click is invalid.
            // 1. Click wasn't on a button.
            // 2. The button clicked is already the active one.
            // 3. The bio text is already in the middle of a fade transition.
            if (!button || button.classList.contains('active') || bioOutput.classList.contains('is-changing')) {
                return;
            }
            const choice = button.dataset.bio;
            // Update the visual state of the buttons.
            bioChoicesContainer.querySelectorAll('.bio-choice').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            // --- Fade Transition Logic ---
            // 1. Add a class to trigger the CSS fade-out transition.
            bioOutput.classList.add('is-changing');
            // 2. Wait for the fade-out animation to finish before changing the content.
            setTimeout(() => {
                // 3. Now that the element is invisible, swap the content.
                bioOutput.innerHTML = bioContent[choice] || ''; // Default to empty string if no content found.
                // 4. Remove the class, which triggers the CSS fade-in transition.
                bioOutput.classList.remove('is-changing');
            }, 150);
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