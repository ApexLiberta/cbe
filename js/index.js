import { getWhatsNew, getShelfHtml, getShelfContainerHtml, getAddShelfHtml } from "./modules/shelfsHtml.js";
import { getSettingsHtml } from "./page/settings.js";
import { testGames } from "./tmp/game_details.js";
import { createCollectionHtml, loadCollection } from "./modules/collection.js";
import { dialogManager, createCollectionDialog  } from "./components/dialog.js";
const browser = window.browser || window.chrome;
function isBrowserEnvironment() {
	try {
		return !!(typeof window !== "undefined" && window.browser);
	} catch (error) {
		return false;
	}
}
console.log(isBrowserEnvironment());
const libraryCollections = document.querySelector(".library-collections");
const homeButton = document.querySelector("#library-home-btn");
const collectionButton = document.querySelector(".library-collection-icon-btn");
function initializeEvents() {
	document.querySelectorAll(".event").forEach((eventElement) => {
		if (eventElement.classList.contains("clickEvent")) {
			// Remove existing listeners to avoid duplicates
			eventElement.removeEventListener("click", eventElement.clickListener);

			eventElement.clickListener = function (event) {
				// Store the listener function
				eventElement.classList.toggle("active");
				document
					.querySelector("#" + eventElement.dataset.target)
					.classList.toggle("active");
			};

			eventElement.addEventListener("click", eventElement.clickListener);
		}
	});
}



document.querySelectorAll(".event").forEach((eventElement) => {
	if (eventElement.classList.contains("clickEvent")) {
		eventElement.addEventListener("click", function (event) {
			eventElement.classList.toggle("active");
			document
				.querySelector("#" + eventElement.dataset.target)
				.classList.toggle("active");
		});
	}
});

function loadLibrary(page) {
	if (page === "collections") {
		if (!libraryCollections) {
			console.error("Element with class 'library-collections' not found.");
			return; // Exit the function if the element doesn't exist
		}

		const collectionDiv = document.createElement("div");
		collectionDiv.classList.add("collections-header");
		collectionDiv.innerHTML = `<h3>Your Collections</h3> <button>?</button>`;

		try {
			const storedLibrary = localStorage.getItem("myLibrary");

			if (storedLibrary) {
				const libraryData = JSON.parse(storedLibrary);

				if (Array.isArray(libraryData)) {
					// Check if it's an array (representing the library)
					const collectionContainer = document.createElement("div");
					collectionContainer.classList.add("container");
					const createCollectionDiv = document.createElement("button");
					createCollectionDiv.classList.add(
						"create-collection-btn",
						"collection"
					);
					createCollectionDiv.innerHTML = `
						<span class="icon">plus</span>
						<h3 class="txt">create a new collection</h3>
					`;
					collectionContainer.prepend(createCollectionDiv);

					libraryCollections.innerHTML = ""; // Clear existing content
					libraryCollections.append(collectionDiv, collectionContainer);

					createCollectionDiv.addEventListener("click", () => {
						const dialog = document.querySelector(".create-collection.dialog");

						if (dialog) {
							dialog.remove();
							createCollectionDiv.classList.remove("active");
						} else {
							// Dialog doesn't exist, so create and append it, and add the active class
							const newDialog = createCollectionDialog (); // Get the created dialog
							const dialogManagerVar = dialogManager(newDialog);
							dialogManagerVar.classList.add("new-collection-dialog");
							console.log("test", dialogManagerVar, newDialog);
							//document.body.appendChild(newDialog);
							createCollectionDiv.classList.add("active");

						}
					});

					libraryData.forEach((collectionData) => {
						const collectionElement = document.createElement("button");
						collectionElement.className = "collection";
						collectionElement.innerHTML = `
							<h3>${collectionData.title || "Untitled Collection"}</h3>
							<p>( ${collectionData.games.length || "0"} )</p>
						`;
						collectionContainer.appendChild(collectionElement);
					});
				} else {
					console.warn("Stored library data is not an array.");
					// Handle the case where the stored data is not in the expected format.
					libraryCollections.innerHTML =
						"<p>No library data available or data is in incorrect format.</p>";
				}
			} else {
				console.log("No library data found in local storage.");
				libraryCollections.innerHTML = "<p>No library data available.</p>";
			}
		} catch (error) {
			console.error("Error loading library from local storage:", error);
			libraryCollections.innerHTML = "<p>Error loading library data.</p>";
			// Handle potential JSON parsing errors or other exceptions.
			localStorage.removeItem("myLibrary"); // Clear potentially corrupted data
		}
		// Consider adding visual feedback or other updates here if needed
		console.info("Collections Page loaded"); // Add specific message
	} else if (page === "library") {
		homeButton.classList.toggle("active");
		libraryCollections.innerHTML = `

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
				</div>`;
		//libraryCollections.prepend(getShelfHtml({ name: "col1", count: 3 }));
		libraryCollections.prepend(getHomePageHtml());

		document
		.querySelector(".add-shelf")
		.addEventListener("click", function (event) {
				console.log(
					event.target,
					document.querySelector(".choose-collection").classList.toggle("active")
				);
			});
		document.querySelector(".shelfs").appendChild(getAddShelfHtml())

		console.info("Home Page loaded");
		//console.info("Unknown Page loaded"); // Handle other pages
	} else if (page === "settings") {
		libraryCollections.innerHTML = getSettingsHtml();
		console.info("Settings Page loaded");
	} else if (page === "home") {

	}
}

//const homeButton = document.getElementById("homeButton"); // Use getElementById for efficiency
//const collectionButton = document.getElementById("collectionButton");

if (homeButton) {
	homeButton.addEventListener("click", () => loadLibrary("library")); // Use an arrow function
} else {
	console.error("Home button not found!");
}

if (collectionButton) {
	collectionButton.addEventListener("click", () => loadLibrary("collections")); // Use an arrow function
} else {
	console.error("Collection button not found!");
}

// Call the function to load the library when the page loads

//document.addEventListener("DOMContentLoaded", loadLibrary);
window.addEventListener("load", loadLibrary("library"));

// Example of how to save data to local storage (you would call this elsewhere in your code)
function saveLibraryToLocalStorage(libraryData) {
	try {
		localStorage.setItem("myLibrary", JSON.stringify(libraryData));
	} catch (error) {
		console.error("Error saving library to local storage:", error);
	}
}

//Example usage of saveLibraryToLocalStorage
const myLibraryData = [
	{ title: "Collection 1", games: [1, 2] },
	{ title: "Collection 2", games: [] },
	{ title: "Collection 3", games: [] },
];

saveLibraryToLocalStorage(myLibraryData);

//Example of clearing localstorage
//localStorage.clear();

const gamePopup = document.getElementById("gamePopup");
const closeButton = document.querySelector(".close-button");

const tstLnk = document.querySelector(".sync-btn-cont");
const gameData = {
	name: "virtues and vices",
	developers: ["karna"],
	tags: ["Destruction", "Free to Play", "Shooter", "Multiplayer", "FPS", "Team-Based", "Competitive", "PvP", "Action", "First-Person", "Tactical", "Arena Shooter", "Online Co-Op", "Co-op", "Combat", "Character Customization", "Class-Based", "Atmospheric", "Loot", "Battle Royale",],
	features: ["Online Co-Op", "Online PvP", "Steam Achievements", "Steam Cloud"]
};
const tstAnchor = document.createElement("a");
tstAnchor.href = `playnite://addgame/${JSON.stringify(gameData)}`;
tstAnchor.innerText = "sync";
tstLnk.prepend(tstAnchor);

const sortByDropdown = document.querySelector(".sort-by-dropdown");

if (sortByDropdown) {
	sortByDropdown.addEventListener("change", () => {
		const selectedValue = sortByDropdown.value;
		// Implement sorting logic based on the selected value
		console.log("Selected value:", selectedValue);
	});
}
if (browser !== undefined) {
	browser.runtime.sendMessage({ action: "getAllGames" }, (response) => {
		if (typeof response === "undefined") {
			console.error("Error: No response received from background script.");
			return;
		}
		if (response.error) {
			console.error("Error:", response.error);
		} else {
			console.log("Received games:", response);
			const gameList = document.getElementById("game-list");
			if (gameList) {
				gameList.innerHTML = ""; // Clear existing games
				response.games.forEach((game) => {
					const gameItem = document.createElement("div");
					gameItem.classList.add("game-item");
					gameItem.innerHTML = `
						<h3 class='name'>${game.name}</h3>
						<p class='source'>${game.source}</p>
						<button class="edit_lib_entry">Edit</button>
					`;
					gameList.appendChild(gameItem);
				});
			}

			const gameItems = document.querySelectorAll(".game-item");
			gameItems.forEach((item) => {
				item.addEventListener("click", async () => {
					try {
						const gameName = item.querySelector("h3").innerText;
						fetchGameData(gameName)
							.then((gameInfo) => {
								//console.log("Received game:", gameInfo);
								//gamePopup.style.display = "block";
								const dialogManagerVar = dialogManager();
								dialogManagerVar.classList.add("game-details-dialog");
								const dialogVar = dialogManagerVar.querySelector(".dialog")
								console.log(dialogVar);
								dialogVar.classList.add("game-details", "popup-content");
								for (const fd in gameInfo) {
									if (fd !== "id") {
										if (fd === "genres" || fd === "features" || fd === "tags") {
											const fdd = document.createElement("div");
											fdd.classList.add(`fd-${fd}`);
											gameInfo[fd].forEach((element) => {
												createAndAppendSpan(fdd, element);
											});
											dialogVar.append(fdd);
										} else if (fd === "link") {
											for (const key in gameInfo[fd]) {
												const link = document.createElement("a");
												link.href = gameInfo[fd][key] || "#";
												link.innerText = key || "Link";
												link.target = "_blank";
												dialogVar.append(link);
											}
										} else {
											createAndAppendSpan(dialogVar, gameInfo[fd], `fd-${fd}`);
										}
									}
								}

								console.log(dialogManagerVar);
							})
							.catch((error) => {
								console.error("Error fetching game data:", error);
							});
					} catch (error) {
						console.error("Error fetching game data:", error);
					}
				});
			});
		}
	});
}
function createAndAppendSpan(parent, text, className) {
	const span = document.createElement("span");
	span.innerText = text;
	if (className) {
		span.classList.add(className);
	}
	parent.append(span);
}

function fetchGameData(game) {
	return new Promise((resolve, reject) => {
		// Create a Promise
		browser.runtime.sendMessage(
			{ action: "getGame", name: game.toLowerCase() },
			(response) => {
				console.log(game, response);
				if (response.error) {
					reject(response.error);
				} else {
					resolve(response);
				}
			}
		);
	});
}


function getHomePageHtml() {
	const htmlBlock = document.createElement("div");
	htmlBlock.classList.add("home-page");
	htmlBlock.prepend(getWhatsNew());
	return htmlBlock;
}





const testlet = document.querySelector(".filters-icon-btn");
console.log(testlet)
testlet.addEventListener("click", () => {
	browser.runtime.sendMessage({ action: "createCollection" }, (response) => {
		console.log("Collection created:", response);
	});
})


initializeEvents();

function refreshEvents() {
	initializeEvents();
}

//setTimeout(refreshEvents, 5000);
/*
function triggerEvent(selector) {
	const elements = document.querySelectorAll(selector);
	elements.forEach(element => {
		element.click(); // Simple way
		//Or more robust way
		//element.dispatchEvent(new Event('click'));
	});
}

// Example usage:
triggerEvent('.clickEvent.active'); // Triggers click on all elements with both classes
*/

/*

if (closeButton) {
	closeButton.addEventListener("click", () => {
		gamePopup.style.display = "none";
	});
}

window.addEventListener("click", (event) => {
	if (event.target === gamePopup) {
		gamePopup.style.display = "none";
	}
});
*/