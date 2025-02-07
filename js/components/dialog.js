export function dialogManager(html) {
    console.log(typeof html);
	const dialogContainer = document.createElement("div");
	dialogContainer.classList.add("dialog-container"); // Add a class for styling
	dialogContainer.innerHTML = `
        <div class="dialog-backdrop"></div>
        <div class="dialog"></div>
    `;
    if (typeof html === "string") {
        dialogContainer.querySelector(".dialog").innerHTML = html;
    }else if (typeof html === "object") {
        if (Array.isArray(html)) {
            html.forEach((element) => {
                dialogContainer.querySelector(".dialog").appendChild(element);
            });
        }else{
            dialogContainer.querySelector(".dialog").appendChild(html);
        }
	}
	// Add close functionality inside the dialog itself
	const closeButton = dialogContainer.querySelector(".close-dialog"); // Or correct selector
	if (closeButton) {
		closeButton.addEventListener("click", () => {
			dialogContainer.remove();
		});
	}

	// Close on backdrop click (optional)
	const backdrop = dialogContainer.querySelector(".dialog-backdrop");
	if (backdrop) {
		backdrop.addEventListener("click", () => dialogContainer.remove());
	}

    // Append the dialog to the body
	const targetElement = document.querySelector("footer");
	targetElement.after(dialogContainer);
	return dialogContainer;
}

export const gameDetailsDialog = () => {};
export const createCollectionDialog = () => {
	return `
        <form id="create-collection-form">
            <div class="dialog-header">
                <div class="flex-row">
                    <h3 style="margin-right: auto">
                        <label for="collection-title">
                            New Collection: <span id="collection-title-display"></span>
                        </label>
                    </h3>
                    <div class="checkbox-container" title="show in sidebar">
                        <label for="show-in-sidebar">Show in sidebar</label>
                        <input type="checkbox" name="show-in-sidebar" id="show-in-sidebar">
                    </div>
                    <div class="checkbox-container" title="private">
                        <label for="private">
                            <i class="fa-solid fa-lock"></i>
                        </label>
                        <input type="checkbox" name="private" id="private">
                    </div>
                    <div class="checkbox-container" title="hidden">
                        <label for="hidden">
                            <i class="fa-regular fa-eye-slash"></i>
                        </label>
                        <input type="checkbox" name="hidden" id="hidden">
                    </div>
                </div>
                <p><label for="collection-title">Collection Title: <span class="warn-text">(REQUIRED)</span></label></p>
            </div>
            <div class="input-container" style="margin: 12px 0;">
                <input type="text" name="collection-title" id="collection-title" maxlength="32" required aria-describedby="title-help">
                <div id="title-help">Enter a name for the collection.</div>
            </div>
            <div class="collection-type-selection">
                <h4>SELECT A COLLECTION TYPE</h4>
                <div class="flex-row equal">
                    <div class="collection-type-option">
                        <button type="submit" id="create-regular" value="static">Create Collection</button>
                        <p>A collection is a simple way of organizing your library. Drag titles onto the collection or right-click a title to add it to an existing collection.</p>
                    </div>
                    <div class="collection-type-option">
                        <button type="submit" id="create-dynamic" value="dynamic">Create Dynamic Collection</button>
                        <p>Dynamic collections use filters to create collections that update as your library grows.</p>
                    </div>
                </div>
            </div>
        </form>
    `;
};
export const connectSettingsDialog = () => {
    const sidebar = document.createElement("aside");
    const content = document.createElement("div");
    const title = document.createElement("div");
    sidebar.innerHTML = `
        <ul class="settings-group">
        </ul>
    `;
    content.classList.add("settings-content");
    title.classList.add("active-bg");
    return [sidebar, content, title];
};