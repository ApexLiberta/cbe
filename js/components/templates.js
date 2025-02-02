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
        <button id="library-home-btn" class="page-mgr-btn" data-page='home'>Home</button>
        <button class="page-mgr-btn library-collection-icon-btn"  data-page='collections'>
            <img src="./../assets/collections.png" alt="" srcset="">
        </button>
    `;

    const collectionCont = document.createElement("div");
    collectionCont.classList.add("collections-cont");

    aside.append(asideHeader, collectionCont);
    return aside
}
