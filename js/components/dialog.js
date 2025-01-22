export function dialogManager(html) {
	const dialogContainer = document.createElement("div");
	dialogContainer.classList.add("dialog-container"); // Add a class for styling
	dialogContainer.innerHTML = `
        <div class="dialog-backdrop"></div>
        <div class="dialog"></div>
    `;
    if (typeof html === "string") {
        dialogContainer.querySelector(".dialog").innerHTML = html;
    }else if (typeof html === "object") {
		dialogContainer.querySelector(".dialog").appendChild(html);
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
        <div class="dialog-header">
            <h3>New Collection</h3>
            <p>ENTER A NAME FOR THE COLLECTION <span class="warn-text">( REQUIRED )</span></p>
        </div>
        <input type="text" name="" id="" maxlength="32">
        <div class="">
            <p>SELECT A COLLECTION TYPE</p>
            <div class="flex-row equal">
                <div class="">
                    <button>CREATE COLLECTION</button>
                    <p>A collection is a simple way of organizing
                    your library. Drag titles onto the collection or
                    right-click a title to add it to an existing
                    collection.</p>
                </div>
                <div class="">
                    <button>CREATE DYNAMIC COLLECTION</button>
                    <p>Dynamic collections use filters to create
                    collections that update as your library grows.</p>
                </div>
            </div>
        </div>
    `;
};

export const connectSettingsDialog = () => {

};