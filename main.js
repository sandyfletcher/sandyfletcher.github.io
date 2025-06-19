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
});