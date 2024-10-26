(function () {
	getAllSrc()
	.then((sources) => {
			const ul_et = document.querySelector("#sourceList");
			if (sources.length > 0) {
				document.querySelector("h2").textContent = (`sources (${sources.length})`);
				sources.reverse().forEach(src => {
					const et = document.createElement('li')
					et.textContent = src.name;
					ul_et.appendChild(et)
				});
			} else {
				document.querySelector("h2").textContent = (`sources`);
				document.querySelector("#addSource").classList.add("ghost");
				addSrcBtnHtml();
			}
		})
		.catch((error) => {
			console.error("Error getting sources:", error);
		});
}) ();

function getAllSrc() {
	return browser.storage.local
		.get("sources")
		.then((items) => {
			if (items.hasOwnProperty("sources")) {
				return items.sources;
			} else {
				console.error("Key 'sources' not found in storage");
				return []; // Return empty array if not found
			}
		})
		.catch((error) => {
			console.error("Error getting from local storage:", error);
			return []; // Return empty array on error
		});
}

const sourceUrlInput = document.querySelector("#sourceUrl");
const addSourceBtn = document.querySelector("#addSource");

const sourceListElement = document.querySelector("#sourceList");

addSourceBtn.addEventListener("click", addSrcBtnHtml);

function addSrcBtnHtml() {
	document.querySelector("#addSource").classList.add("ghost");
	// Create elements
	const divTag = document.createElement("div");
	const liTag = document.createElement("li");
	const inputTag = document.createElement("input");
	const submitBtn = document.createElement("button");
	const cancelBtn = document.createElement("button");

	cancelBtn.textContent = ("cancel")
	cancelBtn.classList.add("btn");
	cancelBtn.id = "cancelSource";
	// Set button attributes
	submitBtn.textContent = "Add";
	submitBtn.classList.add("btn");

	// Set input attributes
	inputTag.placeholder = "Gist ID";
	inputTag.id = "sourceName";
	liTag.classList.add("addSourceLi");
	// Toggle functionality
	if (addSourceBtn.classList.contains("active")) {
		addSourceBtn.classList.remove("active");
		addSourceBtn.textContent = "Add Source";
		document.querySelector("#inputFd").remove();
	} else {
		// No need for separate gistid creation
		liTag.id = "inputFd";
		divTag.prepend(submitBtn, inputTag);
		liTag.prepend(divTag, cancelBtn);
		sourceListElement.prepend(liTag);
		addSourceBtn.classList.add("active");
		submitBtn.addEventListener("click", () => {
			const element = document.querySelector("#sourceName");
			browser.runtime.sendMessage(
				{ action: "addSource", gistId: element.value },
				(response) => {
					if(response){
						document.querySelector(
							"h2"
						).textContent = `sources (${response.length})`;
						const litag = document.createElement("li")
						litag.textContent = response.code["name"]
						document.querySelector("#sourceList").prepend(litag)
						document.querySelector("#addSource").classList.remove("ghost");
					}
				}
			);
			addSrcBtnHtml();
		});
		cancelBtn.addEventListener("click", () => {
			liTag.remove()
			addSourceBtn.classList.remove("active");
			document.querySelector("#addSource").classList.remove("ghost");
		})
	}

}

function updateHtml(){

}
browser.runtime.sendMessage(
	{ action: "getSettings" },
	(response) => {
		if(response){
			Object.keys(response).forEach((key) => {
				console.log(key);
			});
		}
	}
);

/*
	const sourceUrl = sourceUrlInput.value;
	// Save the source URL to local storage
	browser.storage.sync.set({ sourceUrl }, () => {
		// Add the source URL to the list
		liTag.textContent = sourceUrl;
		sourceList.appendChild(liTag);
	});
	*/

/*
browser.storage.local.get("indexedDBNames", (result) => {
	if (result.indexedDBNames) {
		const indexedDBNames = result.indexedDBNames;
		indexedDBNames.forEach((dbName) => {
			const liTag = document.createElement("li");
			liTag.innerText = dbName;
			sourceList.append(liTag);
		})
	}
	console.log(indexedDBNames)
});
console.log('hi')
*/
