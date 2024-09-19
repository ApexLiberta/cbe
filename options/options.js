const sourceUrlInput = document.getElementById("sourceUrl");
const addSourceButton = document.getElementById("addSource");
const sourceList = document.getElementById("sourceList");

addSourceButton.addEventListener("click", () => {
	const sourceUrl = sourceUrlInput.value;
	// Save the source URL to local storage
	chrome.storage.sync.set({ sourceUrl }, () => {
		// Add the source URL to the list
		const listItem = document.createElement("li");
		listItem.textContent = sourceUrl;
		sourceList.appendChild(listItem);
	});
});
