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

export const shelfTemplate = () => {
	return `
        <div class="shelfs">
            <button class="add-shelf">Add shelf</button>
        </div>
        <div class="game-library">
            <div class="shelf-cont">
                <div class="shelf-header">
                    <div class="select-shelf">
                        <button class="select-shelf-btn">
                            <span class="name">steam</span>
                            <span class="count">( 12 )</span>
                        </button>
                    </div>
                    <div class="sort-cont">
                        <span class="name">sort by</span>
                        <button class="select-sort">
                            alphabetical
                        </button>
                    </div>
                </div>
                <div class="shelf-body">
                    <div class="game-container">
                        <div id="game-list">
                            <div class="game-item">
                                <h3 class="name">Atlas Fallen: Reign Of Sand</h3>
                                <p class="source">steam</p>
                                <button class="edit_lib_entry">Edit</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!--
            <div class="playnite-container">
                <div class="playnite-title">Playnite (13)</div>
                <div class="sort-by-container">
                    <select class="sort-by-dropdown">
                        <option value="alphabetical">Alphabetical</option>
                    </select>
                </div>
            </div>
            -->
        </div>
    `;
};
