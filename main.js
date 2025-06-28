document.addEventListener("DOMContentLoaded", function() {
    const sidebarPlaceholder = document.getElementById("sidebar-placeholder");
    if (sidebarPlaceholder) {
        const pathToSidebarHtmlFile = '/sidebar.html'; // fetch sidebar.html from root folder
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

    // --- UPDATED: Interactive "About" page bio ---
    const bioChoicesContainer = document.querySelector('.bio-choices');
    if (bioChoicesContainer) {
        const bioOutput = document.getElementById('bio-output');

        const bioContent = {
            minimalist: `<p>I'm a quick learner and good at explaining things.  I enjoy building anything with any material..</p>`,
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
                    // We don't need the content-wrapper div anymore, but it's harmless to keep.
                    bioOutput.innerHTML = bioContent[choice]; 
                } else {
                    bioOutput.innerHTML = '';
                }
                
                // Remove the class to trigger the fade-in
                bioOutput.classList.remove('is-changing');
            }, 150); // This duration MUST match the CSS transition time
        });
    }
});