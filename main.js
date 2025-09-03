document.addEventListener("DOMContentLoaded", function() {
    // dynamically load sidebar instead of having to copy/paste HTML repeatedly
    const sidebarPlaceholder = document.getElementById("sidebar-placeholder");
    if (sidebarPlaceholder) {
        // use a root-relative path to ensure it works from any page depth
        const pathToSidebarHtmlFile = '/sidebar.html'; 
        fetch(pathToSidebarHtmlFile)
            .then(response => {
                // check if the request was successful.
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} for ${pathToSidebarHtmlFile}`);
                }
                return response.text();
            })
            .then(html => {// replace placeholder div with fetched sidebar HTML 
                sidebarPlaceholder.outerHTML = html;
            })
            .catch(error => {
                // gracefully handle errors like file missing or network failure
                console.error("Could not load sidebar:", error);
                if(sidebarPlaceholder) {
                    sidebarPlaceholder.innerHTML = "<p style='color: #ff8a8a; padding: 1rem; text-align: center;'>Error loading sidebar.</p>";
                }
            });
    }
    // progressive bio reveal — about page
    const revealTrigger = document.getElementById('bio-reveal-trigger');
    if (revealTrigger) {
        revealTrigger.addEventListener('click', function() {
            // find first bio section that is currently still hidden
            const nextSection = document.querySelector('.bio-section:not(.is-revealed)');
            if (nextSection) {
                nextSection.classList.add('is-revealed'); // reveal it by adding class that triggers CSS transition
            } // after revealing a section, check if there are any hidden sections remaining
            const moreSectionsExist = document.querySelector('.bio-section:not(.is-revealed)'); 
            if (!moreSectionsExist) { // if no more hidden sections found, hide button
                const buttonContainer = this.parentElement;
                buttonContainer.style.transition = 'opacity 0.5s ease';
                buttonContainer.style.opacity = '0';
                buttonContainer.addEventListener('transitionend', () => {
                    buttonContainer.style.display = 'none';
                }, { once: true });
            }
        });
    }
    // project filtering — building page
    const filterControls = document.querySelector('.filter-controls');
    if (filterControls) {
        const projectCards = document.querySelectorAll('.project-card');
        const projectsGrid = document.querySelector('.projects-grid'); 
        filterControls.addEventListener('click', function(e) {
            const button = e.target.closest('.btn-filter');
            if (!button || button.classList.contains('active')) {
                return;
            } // update active button state
            filterControls.querySelector('.btn-filter.active').classList.remove('active');
            button.classList.add('active');
            const filterValue = button.dataset.filter;
            const gridRect = projectsGrid.getBoundingClientRect();
            // FIRST: record starting position and size of all cards
            const initialPositions = new Map();
            projectCards.forEach(card => {
                initialPositions.set(card, card.getBoundingClientRect());
            });
            // LAST: separate cards into 'show' and 'hide' groups
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
            requestAnimationFrame(() => { // defer animation logic until browser has painted layout changes
                // INVERT & PLAY: animate cards that are remaining
                cardsToShow.forEach(card => {
                    const finalPosition = card.getBoundingClientRect();
                    const initialPosition = initialPositions.get(card);
                    const deltaX = initialPosition.left - finalPosition.left;
                    const deltaY = initialPosition.top - finalPosition.top;
                    if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) {
                        return; // don't animate cards that haven't moved
                    }
                    // INVERT: move card back to its old position without animation
                    card.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
                    // PLAY: in next animation frame, add transition class and remove transform to animate card to its final position
                    requestAnimationFrame(() => {
                        card.classList.add('is-moving');
                        card.style.transform = '';
                    });
                    // clean up transition class after animation finishes
                    card.addEventListener('transitionend', () => {
                        card.classList.remove('is-moving');
                    }, { once: true });
                });
            });
        });
    }

    // Image Gallery Logic - for the /gallery/ page
    const galleryContainer = document.querySelector('.gallery-container');
    if (galleryContainer) {
        // --- DEFINE YOUR IMAGES AND CAPTIONS HERE ---
        // Create a folder like /assets/gallery/ to store these images
        const galleryItems = [
            {
                src: '/assets/gallery/image1.jpg',
                caption: 'The journey begins with a single step into the unknown.'
            },
            {
                src: '/assets/gallery/image2.jpg',
                caption: 'There are patterns in the chaos if you look closely enough.'
            },
            {
                src: 'https://picsum.photos/seed/gallery3/1920/1080',
                caption: 'And sometimes, the path leads to unexpected places. (This is a placeholder image)'
            }
            // Add more image objects here
        ];

        const galleryImage = document.getElementById('gallery-image');
        const galleryCaption = document.getElementById('gallery-caption');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        let currentIndex = 0;

        function updateGallery(index) {
            const item = galleryItems[index];
            
            // Fade out the old image
            galleryImage.classList.remove('is-loaded');

            // Wait for fade-out to finish before changing the source
            setTimeout(() => {
                galleryImage.src = item.src;
                galleryCaption.textContent = item.caption;

                // Preload the next and previous images for a smoother experience
                preloadAdjacentImages(index);

                // Once the new image is loaded into the browser cache, fade it in
                galleryImage.onload = () => {
                    galleryImage.classList.add('is-loaded');
                };
            }, 300); // Half the transition duration
        }
        
        function preloadAdjacentImages(index) {
            const prevIndex = (index - 1 + galleryItems.length) % galleryItems.length;
            const nextIndex = (index + 1) % galleryItems.length;

            const prevImage = new Image();
            prevImage.src = galleryItems[prevIndex].src;

            const nextImage = new Image();
            nextImage.src = galleryItems[nextIndex].src;
        }

        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % galleryItems.length; // Wraps to the beginning
            updateGallery(currentIndex);
        });

        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length; // Wraps to the end
            updateGallery(currentIndex);
        });

        // Initial load
        updateGallery(currentIndex);
    }
});