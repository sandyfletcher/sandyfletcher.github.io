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
    // project filtering — building page
    const filterControls = document.querySelector('.filter-controls');
    if (filterControls) {
        const projectCards = document.querySelectorAll('.project-card');
        const projectsGrid = document.querySelector('.projects-grid');
        const noResultsMessage = document.querySelector('.no-results-message');

        // --- NEW: Function to generate tags on cards ---
        function generateCardTags() {
            projectCards.forEach(card => {
                const tags = card.dataset.tags.split(' ').filter(tag => tag !== 'all'); // Don't show the 'all' tag
                const tagsContainer = document.createElement('div');
                tagsContainer.className = 'project-tags';
                
                tags.forEach(tagText => {
                    const tagElement = document.createElement('span');
                    tagElement.className = 'tag';
                    tagElement.textContent = tagText;
                    tagsContainer.appendChild(tagElement);
                });

                // Insert the tags container before the project links
                const linksContainer = card.querySelector('.project-links');
                if (linksContainer) {
                    linksContainer.parentNode.insertBefore(tagsContainer, linksContainer);
                }
            });
        }
        // Run the function on page load
        generateCardTags();

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
            // --- NEW: Show or hide the no-results message ---
            if (noResultsMessage) {
                noResultsMessage.style.display = cardsToShow.length === 0 ? 'block' : 'none';
            }
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

    // --- BACKGROUND: FLOATING SYMBOLS WITH EVASION ---
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        
        // Config
        const particleCount = 200; // Total symbols
        const chars = ['0', '1', '{', '}', '<', '>', '/', ';', '*', '+', '?', '!'];
        const mouseRadius = 120; // How close the mouse gets before they flee
        const pushForce = 3; // How fast they run away
        
        // Mouse/Touch State
        let mouse = { x: -1000, y: -1000 }; // Start off-screen

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }
        
        // Listeners for Mouse and Touch
        window.addEventListener('resize', () => { resize(); initParticles(); });
        
        document.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        // Touch support for mobile dragging
        document.addEventListener('touchmove', (e) => {
            if(e.touches.length > 0) {
                mouse.x = e.touches[0].clientX;
                mouse.y = e.touches[0].clientY;
            }
        });

        // Reset mouse when leaving window so symbols stop fleeing from the edge
        document.addEventListener('touchend', () => { mouse.x = -1000; mouse.y = -1000; });
        document.addEventListener('mouseleave', () => { mouse.x = -1000; mouse.y = -1000; });

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                // Very slow natural drift
                this.vx = (Math.random() - 0.5) * 0.5; 
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.floor(Math.random() * 14) + 12; // 12px - 26px
                this.char = chars[Math.floor(Math.random() * chars.length)];
                // Assign a consistent faint opacity per particle
                this.alpha = (Math.random() * 0.3) + 0.1; // Between 0.1 and 0.4
            }

            update() {
                // 1. Calculate Distance to Mouse
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // 2. Repulsion Logic
                if (distance < mouseRadius) {
                    const angle = Math.atan2(dy, dx);
                    // The closer the mouse, the stronger the push
                    const force = (mouseRadius - distance) / mouseRadius; 
                    const pushX = Math.cos(angle) * pushForce * force * 5; 
                    const pushY = Math.sin(angle) * pushForce * force * 5;
                    
                    this.x += pushX;
                    this.y += pushY;
                }

                // 3. Natural Movement
                this.x += this.vx;
                this.y += this.vy;

                // 4. Wrap around screen (Pac-man style) 
                // Using wrap instead of bounce feels more "data stream" like
                if (this.x < 0) this.x = width;
                if (this.x > width) this.x = 0;
                if (this.y < 0) this.y = height;
                if (this.y > height) this.y = 0;
            }

            draw() {
                ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
                ctx.font = `${this.size}px monospace`;
                ctx.fillText(this.char, this.x, this.y);
            }
        }

        function initParticles() {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animate);
        }

        resize();
        initParticles();
        animate();
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