browser.runtime
	.sendMessage({ action: "getSettings" })
	.then((response) => {
		if (response) {
			Object.entries(response).forEach(([key, value]) => {
				console.info(key, value, value.type);
			});
		}
	})
	.catch((error) => {
		console.error("Error adding source:", error);
	});

function getSettings() {
	return browser.storage.local
		.get("settings")
		.then((result) => result.settings || {})
		.catch((error) => {
			console.error("Error getting settings:", error);
			return {};
		});
}
getSettings().then(pagehtml);
function pagehtml(settings) {
	const mainTag = document.querySelector("main");

	Object.entries(settings).forEach(([key, value]) => {
		const element = document.createElement(
			value.type === "list" ? "ol" : "div"
		);
		element.classList.add("setting"); // Consistent class name for styling

		const label = document.createElement("label");
		label.textContent = key;
		element.appendChild(label);

		switch (value.type) {
			case "toggle":
				const toggle = document.createElement("input");
				toggle.type = "checkbox";
				toggle.checked = value.enabled; // Set initial toggle state
				toggle.addEventListener("change", () => {
					value.enabled = toggle.checked; // Update setting on change
					// Add functionality for saving the updated setting (e.g., localStorage)
				});
				label.appendChild(toggle);
				break;
			case "list":
				switch (key) {
					case "sources":
						value.list.forEach((source) => {
							const listItem = document.createElement("li");
							listItem.textContent = source.name;
							element.appendChild(listItem);
						});
						break;
				}
				break;
			default:
				console.warn(`Unknown setting type: ${value.type}`); // Handle unexpected types
		}

		mainTag.appendChild(element);
	});
}

// Fetch sources from storage and handle errors consistently
function getSources() {
	return browser.storage.local
		.get("sources")
		.then((items) => items.sources || [])
		.catch((error) => {
			console.error("Error getting sources:", error);
			return []; // Return empty array on error
		});
}

// Update source list and title efficiently
function updateSourceList(sources) {
	const sourceList = document.querySelector("#sourceList");
	const h2 = document.querySelector("h2");

	// Clear existing list items
	sourceList.innerHTML = "";

	h2.textContent =
		sources.length > 0 ? `sources (${sources.length})` : "sources";

	sources.reverse().forEach((source) => {
		const listItem = document.createElement("li");
		listItem.textContent = source.name;
		sourceList.appendChild(listItem);
	});
}

// Add a source using background script communication
function addSource(gistId) {
	browser.runtime
		.sendMessage({ action: "addSource", gistId })
		.then((response) => {
			if (response) {
				console.log(response, response.code);
				updateSourceList([response]); // Update list with single new source
				document.querySelector("#addSource").classList.remove("ghost");
			}
		})
		.catch((error) => {
			console.error("Error adding source:", error);
		});
}

// Toggle source addition form visibility and functionality
function toggleAddSourceForm() {
	const addSourceBtn = document.querySelector("#addSource");
	const inputFd = document.querySelector("#inputFd");

	if (addSourceBtn.classList.contains("active")) {
		addSourceBtn.classList.remove("active");
		addSourceBtn.textContent = "Add Source";
		addSourceBtn.classList.toggle("ghost");
		if (inputFd) inputFd.remove(); // Remove existing form if present
	} else {
		addSourceBtn.classList.add("active");
		addSourceBtn.classList.toggle("ghost");

		// Create new form elements only if needed
		if (!inputFd) {
			const inputFd = document.createElement("li");
			inputFd.id = "inputFd";

			const divTag = document.createElement("div");
			const submitBtn = document.createElement("button");
			const cancelBtn = document.createElement("button");

			cancelBtn.textContent = "cancel";
			cancelBtn.classList.add("btn");
			cancelBtn.id = "cancelSource";

			submitBtn.textContent = "Add";
			submitBtn.classList.add("btn");

			const sourceNameInput = document.createElement("input");
			sourceNameInput.placeholder = "Gist ID";
			sourceNameInput.id = "sourceName";

			divTag.prepend(submitBtn, sourceNameInput);
			inputFd.prepend(divTag, cancelBtn);
			sourceList.prepend(inputFd);

			// Add event listeners for form interaction
			submitBtn.addEventListener("click", () => {
				const gistId = document.querySelector("#sourceName").value;
				addSource(gistId);
			});

			cancelBtn.addEventListener("click", toggleAddSourceForm);
		}
	}
}

// Initial retrieval and display of sources
getSources().then(updateSourceList);

// Event listeners for button interactions
document
	.querySelector("#addSource")
	.addEventListener("click", toggleAddSourceForm);
