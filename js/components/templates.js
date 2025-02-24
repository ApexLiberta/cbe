export const configPropertyHtml = (type) => {
    const wrapper = document.createElement("div");

    switch (type) {
        case "toggle":
            const toggle = document.createElement("input");
            toggle.type = "checkbox";
            wrapper.appendChild(toggle);
            break;
        case "list":
            const list = document.createElement("ol");
            wrapper.appendChild(list);
            break;
        case "link":
            const group = document.createElement("div");
            group.classList.add("setting-group");
            wrapper.appendChild(group);
            break;
        default:
            console.warn(`Unknown setting type: ${type}`);
    }

};


export const asideTemplate = () => {
    const aside = document.createElement("aside");
    aside.classList.add("library-sidebar");

    const asideHeader = document.createElement("div");
    asideHeader.classList.add("aside-header", "sidebar-header");
    asideHeader.innerHTML = `
        <button id="library-home-btn" class="page-mgr-btn" data-page='library'>Home</button>
        <button class="page-mgr-btn library-collection-icon-btn"  data-page='collections'>
            <i class="fa-solid fa-object-group"></i>
        </button>
    `;

    const searchTag = document.createElement("input");
    searchTag.type = "text";
    searchTag.classList.add("search-input");
    searchTag.placeholder = "Search by Name";

    const searchIconBtn = document.createElement("button")
    searchIconBtn.classList.add("search-icon");
    searchIconBtn.innerHTML = `<i class="fas fa-search"></i>`;

    const cancleSearchBtn = document.createElement("button");
    cancleSearchBtn.classList.add("cancel-search-btn");
    cancleSearchBtn.innerHTML = `<i class="fas fa-times"></i>`;

    const searchSettingsBtn = document.createElement("button");
    searchSettingsBtn.classList.add("search-settings-btn");
    searchSettingsBtn.innerHTML = `<i class="fa-solid fa-wand-sparkles"></i>`;
    //searchSettingsBtn.innerHTML = `<i class="fas fa-cog"></i>`;

    const searchbar = document.createElement("div");
    searchbar.classList.add("search-bar");
    searchbar.append(searchIconBtn, searchTag, cancleSearchBtn);

    const searchCont = document.createElement("div");
    searchCont.classList.add("search-cont", "flex-row");
    searchCont.append(searchbar, searchSettingsBtn);

    const collectionCont = document.createElement("div");
    collectionCont.classList.add("collections-cont");

    aside.append(asideHeader, searchCont, collectionCont);
    return aside
}
