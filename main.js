document.addEventListener("DOMContentLoaded", function() {
    // --- START: SMOOTH PAGE TRANSITIONS ---
    function handlePageTransition(event) {
        const link = event.target.closest('a');
        
        // Ensure it's a valid, internal link we want to animate
        if (!link || link.target === '_blank' || link.getAttribute('href').startsWith('#') || link.href.includes('mailto:')) {
            return;
        }

        // Check if the link is internal to the site
        const url = new URL(link.href);
        if (url.hostname !== window.location.hostname) {
            return; // It's an external link, let it behave normally
        }

        event.preventDefault(); // Stop the browser's default navigation

        const destination = link.href;
        const content = document.querySelector('.content') || document.querySelector('.landing-content');

        // Add a class to trigger the fade-out animation
        if (content) {
            content.classList.add('is-leaving');
        } else {
            document.body.classList.add('is-leaving');
        }

        // Wait for the animation to finish, then navigate
        setTimeout(() => {
            window.location.href = destination;
        }, 300); // This duration MUST match the CSS transition time
    }

    // Add the listener to the whole document
    document.addEventListener('click', handlePageTransition);
    // --- END: SMOOTH PAGE TRANSITIONS ---


    const sidebarPlaceholder = document.getElementById("sidebar-placeholder");
    if (sidebarPlaceholder) {
        // --- MODIFIED: Robust path calculation for sidebar ---
        // Calculate the depth of the current page relative to the root.
        const path = window.location.pathname;
        const depth = path.endsWith('/') ? path.split('/').length - 2 : path.split('/').length - 1;

        // Create the correct relative path prefix (e.g., './', '../', '../../')
        const prefix = '../'.repeat(Math.max(0, depth - 1)) || './';
        const pathToSidebarHtmlFile = `${prefix}sidebar.html`;

        fetch(pathToSidebarHtmlFile)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} for ${pathToSidebarHtmlFile}`);
                }
                return response.text();
            })
            .then(html => {
                sidebarPlaceholder.outerHTML = html; // replace placeholder div
            })
            .catch(error => {
                console.error("Could not load sidebar:", error);
                if(sidebarPlaceholder) sidebarPlaceholder.innerHTML = "<p>Error loading sidebar. Check console.</p>";
            });
    }

    // --- Interactive "About" page bio ---
    const bioChoicesContainer = document.querySelector('.bio-choices');
    if (bioChoicesContainer) {
        const bioOutput = document.getElementById('bio-output');

        const bioContent = {
            minimalist: `<p>I recently got into making websites.</p><p>Click the little icons over there →</p>`,
            elevator: `<p>I'm skilled at conveying complex information in a digestable manner, which means I'm able to pass anything I know along with ease to any captive audience.  This is a widely-applicable skill that's beneficial in both professional and personal circumstances.  If you'd like to collaborate, I've streamlined the process <a href="/contact/">HERE</a>.</p>`,
            campfire: `<p>Oh boy, buckle up.  The truth is I'm still figuring myself out, but you might be able to glean something from <a href="/building/articles/the-long-road.html">an article</a> I wrote about my experience with therapy and addiction counselling.  Circumstance has changed my perspective from something resembling a desire for meritocracy towards a greater understanding of the unappreciated value of perseverence — how will frequently outperforms talent and how coasting is a disservice to oneself.</p>`
        };

        bioChoicesContainer.addEventListener('click', function(e) {
            const button = e.target.closest('.bio-choice');
            // Exit if the click wasn't on a button, or if it's already active, or if it's currently animating.
            if (!button || button.classList.contains('active') || bioOutput.classList.contains('is-changing')) {
                return;
            }

            const choice = button.dataset.bio;
            
            // Update active button state
            bioChoicesContainer.querySelectorAll('.bio-choice').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Add a class to trigger the fade-out
            bioOutput.classList.add('is-changing');

            // Wait for the fade-out transition (150ms) to complete
            setTimeout(() => {
                // Now that it's invisible, swap the content
                if (bioContent[choice]) {
                    bioOutput.innerHTML = bioContent[choice]; 
                } else {
                    bioOutput.innerHTML = '';
                }
                
                // Remove the class to trigger the fade-in
                bioOutput.classList.remove('is-changing');
            }, 150); // This duration MUST match the CSS transition time
        });
    }
    
    // --- START: "BUILDING" PAGE PROJECT FILTER ---
    const filterContainer = document.querySelector('.filter-controls');
    if (filterContainer) {
        const projectCards = document.querySelectorAll('.project-card');

        filterContainer.addEventListener('click', (e) => {
            const filterButton = e.target.closest('.filter-btn');
            if (!filterButton) return;

            // Update active button state
            filterContainer.querySelector('.active').classList.remove('active');
            filterButton.classList.add('active');

            const filter = filterButton.dataset.filter;

            projectCards.forEach(card => {
                const tags = card.dataset.tags;
                const matchesFilter = tags.includes(filter) || filter === 'all';
                
                // Add/remove 'hidden' class to trigger CSS transition
                if (matchesFilter) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    }
    // --- END: "BUILDING" PAGE PROJECT FILTER ---
});