import { getWhatsNew, getShelfHtml, getShelfContainerHtml, getAddShelfHtml } from "./modules/shelfsHtml.js";
import { testGames } from "./tmp/game_details.js";
import { collFiltersHtml, collSettingsHtml } from "./modules/collection.js";
import {
	dialogManager,
	createCollectionDialog,
	connectSettingsDialog,
} from "./components/dialog.js";
import { asideTemplate } from "./components/templates.js";


// Constants for page names
const PAGE_COLLECTIONS = "collections";
const PAGE_HOME = "home";
const PAGE_COLLECTION = "collection";
const PAGE_GAME = "game";

// Constants for action names
const ACTION_GET_ALL_COLLECTIONS = "getAllCollections";
const ACTION_ADD_OR_UPDATE_COLLECTION = "addOrUpdateCollection";
const ACTION_GET_ALL_GAMES = "getAllGames";

// Constants for class names
const CLASS_LIBRARY_COLLECTIONS = "library-collections";
const CLASS_COLLECTIONS_HEADER = "collections-header";
const CLASS_CONTAINER = "container";
const CLASS_CREATE_COLLECTION_BTN = "create-collection-btn";
const CLASS_COLLECTION = "collection";
const CLASS_DIALOG = "dialog";
const CLASS_ACTIVE = "active";
const CLASS_NEW_COLLECTION_DIALOG = "new-collection-dialog";
const CLASS_GAME_DETAILS_DIALOG = "game-details-dialog";
const CLASS_GAME_DETAILS_POPUP = "game-details";
const CLASS_POPUP_CONTENT = "popup-content";
const CLASS_GAME_ITEM = "game-item";
const CLASS_GAME_LIST = "game-list";
const CLASS_DROPDOWN_BTN = "dropdown-btn";
const CLASS_DROPDOWN_CTX = "dropdown-ctx";
const CLASS_DROPDOWN_OPTION = "dropdown-option";
const CLASS_HIDDEN = "hidden";
const CLASS_FLEX_ROW = "flex-row";
const CLASS_COLLECTION_HEADER_PAGE = "collection-header";
const CLASS_COLLECTION_PAGE = "collection-page";
const CLASS_COLLECTION_SETTINGS = "collection-settings";
const CLASS_COLLECTION_SETTINGS_CONT = "collection-settings-cont";
const CLASS_RENAME_BTN = "rename-btn";
const CLASS_FILTER_BTN = "filter-btn";


const browser = window.browser || window.chrome;
function isBrowserEnvironment() {
	try {
		return !!(typeof window !== "undefined" && window.browser);
	} catch (error) {
		return false;
	}
}
const libraryCollections = document.querySelector(".library-collections");
const homeButton = document.querySelector("#library-home-btn");

const collectionButton = document.querySelector(".library-collection-icon-btn");

/*
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
*/
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



function libraryMgr(page, data) {
	if (page === "collections") {
		if (!libraryCollections) {
			console.error("Element with class 'library-collections' not found.");
			return; // Exit the function if the element doesn't exist
		}

		const collectionDiv = document.createElement("div");
		collectionDiv.classList.add("collections-header");
		collectionDiv.innerHTML = `<h3>Your Collections</h3> <button>?</button>`;

		const collectionContainer = document.createElement("div");
		collectionContainer.classList.add("container");
		const createCollectionDiv = document.createElement("button");
		createCollectionDiv.classList.add(
			"create-collection-btn",
			"collection"
		);
		createCollectionDiv.innerHTML = `
			<span class="icon"><i class="fa-solid fa-plus"></i></span>
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
				const newDialog = createCollectionDialog(); // Get the created dialog
				const dialogManagerVar = dialogManager(newDialog);

				const titleInput = document.getElementById("collection-title");
				const titleDisplay = document.getElementById(
					"collection-title-display"
				);
				titleInput.addEventListener("input", () => {
					titleDisplay.textContent = titleInput.value;
				});

				dialogManagerVar.classList.add("new-collection-dialog");
				//document.body.appendChild(newDialog);
				createCollectionDiv.classList.add("active");

				const form = document.getElementById("create-collection-form");

				form.addEventListener("submit", (event) => {
					event.preventDefault(); // Prevent default form submission

					browser.runtime.sendMessage(
						{
							action: "addOrUpdateCollection",
							name: document.getElementById("collection-title").value.toLowerCase(),
							data: {
								isDynamic: event.submitter.value === "dynamic",
								isHidden: document.getElementById("hidden").checked,
								inSidebar: document.getElementById("show-in-sidebar").checked,
								isPrivate: document.getElementById("private").checked,
							},
						},
						(response) => {
							console.table(response)
							if (response && response.success) {
								dialogManagerVar.remove();
								loadAsideCollections()
								console.log("Collection operation completed successfully.");
							} else {
								console.error(
									"Collection operation failed:",
									response ? response.error : "Unknown error"
								);
							}
						}
					);

				});

			}
		});

		browser.runtime.sendMessage({ action: "getAllCollections" }, (response) => {
			if (response.error) {
				console.error("Error:", response.error);
			} else {
				console.log("Received collections:", response.collections);
				response.collections.forEach((collection) => {});
			}
		});
		/*
		try {
			const storedLibrary = localStorage.getItem("myLibrary");

			if (storedLibrary) {
				const libraryData = JSON.parse(storedLibrary);

				if (Array.isArray(libraryData)) {
					// Check if it's an array (representing the library)


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
					//libraryCollections.innerHTML = "<p>No library data available or data is in incorrect format.</p>";
				}
			} else {
				console.log("No library data found in local storage.");
				//libraryCollections.innerHTML = "<p>No library data available.</p>";
			}
		} catch (error) {
			console.error("Error loading library from local storage:", error);
			libraryCollections.innerHTML = "<p>Error loading library data.</p>";
			// Handle potential JSON parsing errors or other exceptions.
			localStorage.removeItem("myLibrary"); // Clear potentially corrupted data
		}
		*/
		console.info("Collections Page loaded"); // Add specific message
	} else if (page === "home") {
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
									const dialogVar = dialogManagerVar.querySelector(".dialog");
									console.log(dialogVar);
									dialogVar.classList.add("game-details", "popup-content");
									for (const fd in gameInfo) {
										if (fd !== "id") {
											if (
												fd === "genres" ||
												fd === "features" ||
												fd === "tags"
											) {
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
												createAndAppendSpan(
													dialogVar,
													gameInfo[fd],
													`fd-${fd}`
												);
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

		console.info("Home Page loaded");
		//console.info("Unknown Page loaded"); // Handle other pages
	} else if (page === "collection") {
		const collectionFiltersArr = [
			{
				name: "sort by",
				options: [
					"Best Match",
					"Latest Upload",
					"Oldest Upload",
					"Title Ascending",
					"Title Descending",
					"Highest Rating",
					"Lowest Rating",
					"Most Follows",
					"Fewest Follows",
					"Recently Added",
					"Oldest Added",
					"Year Ascending",
					"Year Descending",
				],
				default: "none",
			},
			{
				name: "filter tags",
				options: [],
				default: "include any",
			},
			{
				name: "content rating",
				options: ["safe", "suggestive", "erotica", "pornographic"],
				default: "any",
			},
			{
				name: "delete",
				options: [],
				default: "delete",
				icon: '<i class="fa-solid fa-trash"></i>',
			},
		];
		libraryCollections.innerHTML = ``
		libraryCollections.classList.add("collection-page");

		const pageHeader = document.createElement("div")
		pageHeader.classList.add("collection-header", "flex-row")

		const nameTag = document.createElement("h2")
		nameTag.textContent = data.name

		const renameBtn = document.createElement("button")
		renameBtn.classList.add("rename-btn")
		renameBtn.innerHTML = `<i class="fa-solid fa-pen"></i>`;

		const filterBtn = document.createElement("button")
		filterBtn.classList.add("filter-btn")
		filterBtn.innerHTML = `<i class="fa-solid fa-filter"></i>`;

		const lengthSpan = document.createElement("span")
		//lengthSpan.textContent = data.gameIds.length;

		const settingBtn = document.createElement("button")
		settingBtn.innerHTML = `
			<span class="icon"><i class="fa-solid fa-bolt"></i></span>
			<h3 class="txt">DYNAMIC COLLECTION</h3>
            <span class="icon"><i class="fa-solid fa-gear"></i></span>
		`;
		settingBtn.classList.add("collection-settings")
		const settingCont = document.createElement("div")
		settingCont.classList.add("collection-settings-cont")


		collectionFiltersArr.forEach((filterObj) => {
			const div = document.createElement("div")
			div.classList.add("btn-ctx-dropdown");
			const label = document.createElement("label")
			label.textContent = filterObj.name;
			const btn = document.createElement("button")
			btn.classList.add("dropdown-btn");
			//btn.dataset.filtergroup = filterObj.name;

			btn.innerHTML = `
				<span class="txt">
					${filterObj.default}
				</span>
				<span class="icon">
					<i class="fa-solid fa-up-down"></i>
				</span>
			`;
			const optionDiv = document.createElement("div");
			optionDiv.classList.add("dropdown-ctx", "hidden");
			//optionDiv.classList.add(`filter-options-${filterObj.name.toLowerCase()}`);
			console.log(filterObj, filterObj.name.toLowerCase());

			if (filterObj.options.length > 0) {
				filterObj.options.forEach((filter)=> {
					const filterBtn = document.createElement("button");
					filterBtn.textContent = filter
					filterBtn.classList.add("dropdown-option")
					optionDiv.appendChild(filterBtn)
					filterBtn.addEventListener("click", (event) => {
						console.log(event.target);
					});
				})
			}

			btn.addEventListener('click', (event) => {
				const check = event.target.classList.contains("active")
				const allDropdowns = settingCont.querySelectorAll(".btn-ctx-dropdown");
				allDropdowns.forEach(dropdown => {
					dropdown.querySelector(".dropdown-btn").classList.remove("active");
					dropdown.querySelector(".dropdown-ctx").classList.add("hidden");
				})
				if(!check){
					btn.classList.toggle('active');
					optionDiv.classList.toggle('hidden');
				}
			});

			div.append(label, btn, optionDiv);
			settingCont.appendChild(div);
		});

		settingBtn.addEventListener("click", (event) => {
			settingBtn.classList.toggle("active")
			settingCont.classList.toggle("active")
		})

		const itemsDiv = document.createElement("div")
		itemsDiv.id = "game-list";
		itemsDiv.innerHTML = `
		//data.gameIds.forEach(item => {
		//	const cont =  document.createElement("div")
		//	cont.classList.add("game-item");
		//	cont.textContent = item
		//	itemsDiv.append(cont)
		//});
		`;

		pageHeader.append(nameTag, renameBtn, lengthSpan, filterBtn, settingBtn);
		libraryCollections.prepend(pageHeader, settingCont, itemsDiv);
		console.log("load Collection")
	} else if (page === "game") {

	}
}

/*
const homeButton = document.getElementById("homeButton"); // Use getElementById for efficiency
const collectionButton = document.getElementById("collectionButton");

if (homeButton) {
	homeButton.addEventListener("click", () => libraryMgr("home")); // Use an arrow function
} else {
	console.error("Home button not found!");
}

if (collectionButton) {
	collectionButton.addEventListener("click", () => libraryMgr("collections")); // Use an arrow function
} else {
	console.error("Collection button not found!");
}
*/

const aside = asideTemplate();
aside.querySelectorAll(".page-mgr-btn").forEach((btn) => {
	btn.addEventListener("click", () => {
		libraryMgr(btn.dataset.page);
	})
})
isBrowserEnvironment() ? loadAsideCollections(): false;
function loadAsideCollections() {
	browser.runtime.sendMessage({ action: "getAllCollections" }, (response) => {
		if (response.error) {
			console.error("Error:", response.error);
		} else {
			console.log("Received collections:", response.collections);
			aside.querySelector(".collections-cont").innerHTML = ``
			response.collections.forEach((collection) => {
				if (collection.inSidebar && collection.games){
					const collectionElement = document.createElement("div");
					collectionElement.className = "collection";

					const groupHeader = document.createElement("div");
					groupHeader.classList.add("group-header");

					const groupExpandToggle = document.createElement("button");
					groupExpandToggle.classList.add("expand-toggle");
					groupExpandToggle.addEventListener("click", (event) => {
						event.target.classList.toggle("expanded");
					})

					const loadGroupBtn = document.createElement("button");
					loadGroupBtn.classList.add("load-group-btn");
					loadGroupBtn.dataset.page = collection.name;
					loadGroupBtn.innerHTML = `
					<span class=""txt>${collection.name || "Untitled Collection"}</span>
					`;
					if (collection.games || collection.games !== undefined) {
						const gamesLength = document.createElement("span");
						gamesLength.classList.add("text");
						gamesLength.textContent = `(${collection.games.length})`
					}
					if (collection.isDynamic) {
						const iconSpan = document.createElement("span");
						iconSpan.classList.add("icon");
						const iconElement = document.createElement("i");
						iconElement.classList.add("fa-solid", "fa-bolt");
						iconSpan.appendChild(iconElement);
						loadGroupBtn.appendChild(iconSpan);
					}
					loadGroupBtn.addEventListener("click", (event) => {
						libraryMgr("collection", collection);
					})

					const groupPin = document.createElement("button");
					groupPin.classList.add("group-pin");
					groupPin.innerHTML = `<i class="fa-solid fa-thumbtack"></i>`;

					groupHeader.append(groupExpandToggle, loadGroupBtn, groupPin);
					collectionElement.appendChild(groupHeader);
					aside.querySelector(".collections-cont").appendChild(collectionElement);
				}
				console.table(collection)
			})
		}
	});
}
document.querySelector(".library-container").prepend(aside);



const settingsButton = document.querySelector("#settings-trigger");

settingsButton.addEventListener("click", () => {
	const dialogMgr = dialogManager(connectSettingsDialog());
	dialogMgr.classList.add("settings-dialog");

	const dialog = dialogMgr.querySelector(".dialog");
	const dialogSidebarLabels = dialog.querySelector(".settings-group");
	const dialogContent = dialog.querySelector(".settings-content");

	browser.runtime
		.sendMessage({ action: "getSettings" })
		.then((response) => {
			if (response) {
				Object.entries(response).forEach(([key, value]) => {
					const asideListItem = document.createElement("li");
					const btnTag = document.createElement("button");
					btnTag.textContent = key;
					btnTag.classList.add("aside-btn", "trigger");
					asideListItem.appendChild(btnTag);

					btnTag.addEventListener("click", (event) => {
						// More efficient active class management
						dialogSidebarLabels.querySelectorAll("button").forEach((btn) => {
							btn.classList.toggle("active", btn === btnTag); // Toggle active
						});

						dialogContent.innerHTML = "";
						const list = document.createElement("ol");
						Object.entries(value.config).forEach(([configKey, configValue]) => {
							const listItem = document.createElement("li");
							listItem.textContent = configKey;
							listItem.title = configValue.description;
							list.appendChild(listItem);
						});
						dialogContent.appendChild(list);

						dialog.classList.toggle(key);

						if (event.target.textContent == 'overview'){
							const btnsCont = document.createElement("div")
							btnsCont.classList.add("flex-row", "equal")
							const btnArray = [
								{
									title: "Daily Kickstart",
									desc: "Start the day by reviewing yourgoals and setting your intentions",
								},
								{
									title: "Daily Review",
									desc: "End the day by reviewing your actions and stay accountable",
								},
								{
									title: "History",
									desc: "Review your journey",
								},
							]
							btnArray.forEach((element) => {
								const btnTag = document.createElement("button");
								const btnTitle = document.createElement("h4");
								btnTitle.textContent = element.title;
								const btnDec = document.createElement("p");
								btnDec.textContent = element.desc;
								btnTag.append(btnTitle, btnDec);
								btnsCont.appendChild(btnTag);
							});
							dialogContent.prepend(btnsCont);
						}
					});

					dialogSidebarLabels.appendChild(asideListItem);

					switch (value.type) {
						case "list":
							const list = document.createElement("ol");
							list.classList.add("setting");
							console.log(value.config);
							Object.entries(value.config).forEach(
								([configKey, configValue]) => {
									const listItem = document.createElement("li");
									listItem.textContent = configKey;
									listItem.title = configValue.description;
									list.appendChild(listItem);
								}
							);
							dialogContent.appendChild(list);
							break;
						case "group":
							const groupList = document.createElement("ol");
							groupList.classList.add("sub-group");
							Object.entries(value.config).forEach(
								([groupKey, groupValue]) => {
									const groupListItem = document.createElement("li");
									const subBtnTag = document.createElement("button");
									subBtnTag.textContent = groupKey;
									subBtnTag.title = groupValue.description;
									groupListItem.appendChild(subBtnTag);
									groupList.appendChild(groupListItem);
								}
							);
							asideListItem.appendChild(groupList);
							break;
						// Add other cases as needed
					}

					console.info(key, value, value.type);
				});
			}
		})
		.catch((error) => {
			console.error("Error getting settings:", error); // More descriptive error message
		});
});
// Call the function to load the library when the page loads
//document.addEventListener("DOMContentLoaded", libraryMgr);
window.addEventListener("load", libraryMgr("home"));

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