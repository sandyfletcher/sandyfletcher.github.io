document.addEventListener("DOMContentLoaded", function() {
    const sidebarPlaceholder = document.getElementById("sidebar-placeholder");
    if (sidebarPlaceholder) { // Calculate the relative path to sidebar.html from the current page's location
        const pagePath = window.location.pathname;
        let relativePathToRoot = ''; // Count directory levels. Example: /folder1/folder2/page.html -> ../../
        const pathSegments = pagePath.substring(1).split('/');
        if (pathSegments[0] !== "") { // Not in root directory
            // if pathSegments has items, and the last is not empty and has no dot, it's a dir
            let levels = pathSegments.length -1;
            if (pagePath.endsWith('/') && pathSegments[pathSegments.length-1] !== "") {
                levels = pathSegments.length;
            } else if (pathSegments.length === 1 && pathSegments[0] === "") { // Root path like "/"
                levels = 0;
            }
            for (let i = 0; i < levels; i++) {
                relativePathToRoot += '../';
            }
        }
        const pathToSidebarHtmlFile = relativePathToRoot + 'sidebar.html';
        fetch(pathToSidebarHtmlFile)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} for ${pathToSidebarHtmlFile}`);
                }
                return response.text();
            })
            .then(html => {
                sidebarPlaceholder.outerHTML = html; // Replace placeholder div itself
            })
            .catch(error => {
                console.error("Could not load sidebar:", error);
                if(sidebarPlaceholder) sidebarPlaceholder.innerHTML = "<p>Error loading sidebar. Check console.</p>";
            });
    }
});