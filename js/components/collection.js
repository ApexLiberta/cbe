export function loadColl() {
    // Load all the collection items
    console.log('Loading collection items');
}
export function createCollHtml() {
    //return `<div class="collection">${name}</div>`;
    const div = document.createElement("div");
    div.innerHTML = `
        <div class="">
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

    return div;
}
export function createColl(name, options) {
    // Create a new collection with the given name and options
    console.log(`Creating collection: ${name}`);
}


export function collFiltersHtml() {
	const contDiv = document.createElement("div");
	return contDiv;
}
export function collSettingsHtml() {
	const contDiv = document.createElement("div");
	return contDiv;
}