const sourceUrlInput = document.getElementById("sourceUrl");
const addSourceButton = document.getElementById("addSource");
const sourceList = document.getElementById("sourceList");

const addFeildsObj = {
	name: "",
	name: "",
	name: "",
}

addSourceButton.addEventListener("click", () => {
	const liTag = document.createElement("li");
	const inputTag = document.createElement('input')
	inputTag.id = "sourceName";

	if(addSourceButton.classList.contains("active")){
		addSourceButton.classList.remove('active')
		addSourceButton.innerText = "add source";
		document.querySelector("#inputFd").remove();

	}else{
		const sourceName = document.querySelector("#sourceTag")
		liTag.id = 'inputFd'
		liTag.prepend(inputTag);
		sourceList.prepend(liTag);
		addSourceButton.classList.add('active')
		addSourceButton.innerText = "cancel"
		const gistid = document.createElement("input");
		//sourceList.append(liTag);
	}
	/*
	const sourceUrl = sourceUrlInput.value;
	// Save the source URL to local storage
	chrome.storage.sync.set({ sourceUrl }, () => {
		// Add the source URL to the list
		liTag.textContent = sourceUrl;
		sourceList.appendChild(liTag);
	});
	*/
});

browser.storage.local.get("indexedDBNames", (result) => {
	if (result.indexedDBNames) {
		const indexedDBNames = result.indexedDBNames;
		indexedDBNames.forEach((dbName) => {
			const liTag = document.createElement("li");
			liTag.innerText = dbName;
			sourceList.append(liTag);
		})
	}
});
