document.addEventListener("DOMContentLoaded", function() {
    const sidebarPlaceholder = document.getElementById("sidebar-placeholder");
    if (sidebarPlaceholder) { // calculate relative path to sidebar.html from current page
        const pagePath = window.location.pathname;
        let relativePathToRoot = ''; // count directory levels: /folder1/folder2/page.html -> ../../
        const pathSegments = pagePath.substring(1).split('/');
        if (pathSegments[0] !== "") { // not root directory
            let levels = pathSegments.length -1; // is a dir if pathSegments has items and last is not empty / no dot
            if (pagePath.endsWith('/') && pathSegments[pathSegments.length-1] !== "") {
                levels = pathSegments.length;
            } else if (pathSegments.length === 1 && pathSegments[0] === "") { // root path
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
                sidebarPlaceholder.outerHTML = html; // replace placeholder div
            })
            .catch(error => {
                console.error("Could not load sidebar:", error);
                if(sidebarPlaceholder) sidebarPlaceholder.innerHTML = "<p>Error loading sidebar. Check console.</p>";
            });
    }
});