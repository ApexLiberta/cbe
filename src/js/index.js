import { testGames } from "./tmp/game_details.js";
import { collFiltersHtml, collSettingsHtml } from "./components/collection.js";
import {
	dialogManager,
	createCollectionDialog,
	connectSettingsDialog,
	confirmationDialog,
} from "./components/dialog.js";
import { createSettingElement } from "./components/settings.js";
import {
	getAppHeaderHtml,
	getAppFooterHtml,
	asideTemplate,
	shelfTemplate,
	getWhatsNew,
	getShelfHtml,
	getDropdownHtml,
	getLabeledDropdownHtml
} from "./components/templates.js";
import {
	fetchCollections,
	fetchCollection,
	fetchShelves,
	fetchRecord,
	fetchRecords,
	fetchFilters,
} from "./extension/helpers/fetch.js";
import { createToggleElement } from "./../js/extension/modules/helpers.js"

// REVIEW Constants for page names
const PAGE_HOME = "home";
const PAGE_LIBRARY = "library";
const PAGE_COLLECTIONS = "collections";
const PAGE_COLLECTION = "collection";
const PAGE_RECORD = "record";
const PAGE_SETTINGS = "settings";

// Constants for action names
const ACTION_GET_ALL_COLLECTIONS = "getCollectionOrAll";
const ACTION_ADD_OR_UPDATE_COLLECTION = "addOrUpdateCollection";
const ACTION_GET_ALL_GAMES = "getAllGames";

// Constants for class names
const CLASS_LIBRARY_COLLECTIONS = "library-content";
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

const STORE_RECORDS = "records";
const STORE_COLLECTIONS = "collections";
const STORE_SOURCES = "sources";
const STORE_SHELFS = "shelfs";
const STORE_FILTERS = "filters";

const browser = window.browser || window.chrome;
function isBrowserEnvironment() {
	try {
		return !!(typeof window !== "undefined" && window.browser);
	} catch (error) {
		return false;
	}
}
console.log("browser", browser)
const isBrowser = isBrowserEnvironment();

function extensionPageManger() {}

document.querySelector("body").prepend(getAppHeaderHtml())
const appFooter = getAppFooterHtml();
document.querySelector("body").append(appFooter);

const heroHeader = document.querySelector("header");
const heroNav = heroHeader.querySelector(".hero-nav");
const toggleLibrary = heroNav.querySelector("#toggleLibrary");
toggleLibrary.addEventListener("click", () => {
	heroNav.querySelectorAll("h2").forEach((h2) => {
		h2.classList.toggle("active");
	});
	const activeText = heroNav.querySelector(".active").textContent;
	document.querySelector("#settings-trigger").classList.remove("active");
	activeText == "connect" ? libraryMgr(PAGE_HOME) : libraryMgr(PAGE_LIBRARY);
	activeText == "connect"
		? (heroNav.dataset.active = PAGE_HOME)
		: (heroNav.dataset.active = PAGE_LIBRARY);
});
const rmCont = document.createElement("a")
rmCont.classList.add("road-map-link")
rmCont.textContent = "Road Map"
rmCont.href = "./../pages/roadmap.html"
console.log(rmCont)

/*
const getSettingsJson = browser.runtime.sendMessage({ action: "getSettings" })
getSettingsJson.then((response) => {
	console.log(response);
});

const getSettingsJson = async () => {
	// Define as an async function
	try {
		const response = await browser.runtime.sendMessage({
			action: "getSettings",
		}); // Await the Promise
		if (response) {
			console.log("Received settings:", response);
			return response; // Return the response (Promise resolves with this value)
		}
		// You might want to handle cases where response is null/undefined explicitly
		// For example, throw an error or return a default value
		return null; // Or throw new Error("No settings received");
	} catch (error) {
		console.error("Error getting settings:", error);
		// Handle the error appropriately, maybe return a default value or re-throw
		return null; // Or throw error;
	}
};

getSettingsJson().then((response) => {
	// Call the async function and use .then
	console.log(response);
});

const getCollections = browser.runtime.sendMessage({
	action: ACTION_GET_ALL_COLLECTIONS,
});
getCollections.then((response) => {
	console.log(response);
});
*/

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

function loadAsideCollections() {
	const aside = asideTemplate();
	aside.querySelectorAll(".page-mgr-btn").forEach((btn) => {
		btn.addEventListener("click", () => {
			libraryMgr(btn.dataset.page);
		});
	});
	browser.runtime.sendMessage(
		{ action: ACTION_GET_ALL_COLLECTIONS },
		(response) => {
			if (response.error) {
				console.error("Error:", response.error);
			} else {
				console.warn(
					response.collections.length != 0
						? ("Received collections:", response.collections)
						: "There are no collections in the database"
				);
				aside.querySelector(".collections-cont").innerHTML = ``;
				response.collections.forEach((collection) => {
					//if (collection.inSidebar) {
					if (collection.inSidebar && collection.records) {
						const collectionElement = document.createElement("div");
						collectionElement.className = "collection";

						const groupHeader = document.createElement("div");
						groupHeader.classList.add("group-header");

						const groupExpandToggle = document.createElement("button");
						groupExpandToggle.classList.add("expand-toggle");

						const loadGroupBtn = document.createElement("button");
						loadGroupBtn.classList.add("load-group-btn");
						loadGroupBtn.dataset.page = collection.name;
						loadGroupBtn.innerHTML = `
						<span class=""txt>${collection.name || "Untitled Collection"}</span>
						`;
						console.log(collection)
						if (collection.isExpanded){
							groupExpandToggle.classList.toggle("expanded");
						}
						groupExpandToggle.addEventListener("click", (event) => {
							event.target.classList.toggle("expanded");
							browser.runtime.sendMessage(
								{
									action: "toggleCollectionExpand",
									collection: collection.name,
								},
								(response) => {
									console.log(response);
								}
							);
						});
						if (collection.games || collection.games !== undefined) {
							const gamesLength = document.createElement("span");
							gamesLength.classList.add("text");
							gamesLength.textContent = `(${collection.games.length})`;
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
						});

						const groupPin = document.createElement("button");
						groupPin.classList.add("group-pin");
						if (collection.isPinned) {
							groupPin.classList.add("pinned");
						}
						groupPin.innerHTML = `<i class="fa-solid fa-thumbtack"></i>`;

						groupPin.addEventListener("click", () => {
							browser.runtime.sendMessage({
								action: "toggleCollectionPinned",
								collection: collection.name
							}, (response) => {
								console.log(response)
							});
						})

						groupHeader.append(groupExpandToggle, loadGroupBtn, groupPin);
						collectionElement.appendChild(groupHeader);
						aside
							.querySelector(".collections-cont")
							.appendChild(collectionElement);
					}
				});
			}
		}
	);
	return aside;
}

let libraryContent;
async function libraryMgr(page, data) {
	if (page !== PAGE_HOME) {
		console.log(page !== PAGE_HOME, page, PAGE_HOME);
		const mainTag = document.querySelector(".library-container");
		mainTag.innerHTML = ``;
		const mainSection = document.createElement("section");
		mainSection.classList.add("library-content");
		const aside = loadAsideCollections();
		mainTag.append(aside, mainSection);
		libraryContent = document.querySelector(".library-content");
	}
	const activePage = document.querySelector(".hero-nav").dataset.active;
	switch (page) {
		case PAGE_HOME:
			//document.querySelector(".library-content").innerHTML = ``;
			document.querySelector(".library-container").innerHTML = ``;
			console.info(`${PAGE_HOME} page loaded`);
			break;
		case PAGE_LIBRARY:
			homeButton.classList.toggle("active");
			document.querySelector(".library-container").dataset.activePage =
				PAGE_LIBRARY;

			loadShelves().then(() => {
				//loadGames();
			});
			//loadCollections();

			console.info(`${PAGE_LIBRARY} page loaded`);
			break;
		case PAGE_SETTINGS:
			document.querySelector(".library-container").innerHTML = ``;
			const asideTag = document.createElement("aside");
			asideTag.classList.add("library-sidebar");
			const contentSection = document.createElement("section");
			document
				.querySelector(".library-container")
				.append(asideTag, contentSection);
			if (activePage === PAGE_HOME) {
				browser.runtime
					.sendMessage({ action: "getSettings" })
					.then((settings) => {
						if (settings) {
							logSettings(settings);
							const settingsOl = document.createElement("ol");
							for (const setting in settings) {
								const listItem = document.createElement("li");
								const settingBtn = document.createElement("button");
								settingBtn.textContent = setting;
								listItem.append(settingBtn);
								settingsOl.appendChild(listItem);
							}
							asideTag.appendChild(settingsOl);
						}
					});
			} else {
				const btnsObj = {
					overview: [],
					library: [],
					sources: [],
					genres: [],
					features: [],
					tags: [],
				};
				document.querySelector(".library-container").dataset.activePage =
					PAGE_SETTINGS;
				document
					.querySelector(".library-container")
					.classList.add("menu-panel");
				const settingsOl = document.createElement("ol");
				Object.entries(btnsObj).forEach(([key, value]) => {
					const listItem = document.createElement("li");
					const settingBtn = document.createElement("button");
					settingBtn.textContent = key;
					listItem.append(settingBtn);
					settingsOl.appendChild(listItem);
				});
				asideTag.innerHTML = `
					<h2 class="sidebar-title">SETTINGS</h2>
					<div class="menu-item active" data-content="status-effects">library</div>
					<div class="menu-item" data-content="character-info">sources</div>
					<div class="menu-item" data-content="general-info">shelfs</div>
					<div class="menu-item" data-content="general-info">collections</div>
					<div class="menu-item" data-content="exploration-info">filters</div>
				`;
				asideTag.classList.add("sidebar");
				asideTag
					.querySelectorAll(".menu-item")
					.forEach((btn) => {
						btn.addEventListener("click", () => {
							document.querySelectorAll(".menu-item").forEach((element) => {
								element.classList.remove("active");
							});
							btn.classList.add("active");
							contentSection.innerHTML = `
								<h2 class="content-title">${btn.textContent}</h2>
							`;
							switch (btn.textContent) {
								case "sources":
									const addSourceButton = document.createElement("button");
									addSourceButton.textContent = "Add Source";
									addSourceButton.classList.add(
										"add-source-btn",
										"settings-add-btn"
									);

									addSourceButton.addEventListener("click", () => {
										// Create a container div for the dialog
										addSourceButton.disabled = true;
										const dialogContainer = document.createElement("div");
										dialogContainer.classList.add("add-source-dialog");

										const dialogVar = document.createElement("div");
										dialogVar.classList.add("dialog");
										dialogContainer.appendChild(dialogVar);

										const form = document.createElement("form");
										form.id = "add-source-form";

										// Single input for Source Gist ID
										const gistIdInput = document.createElement("input");
										gistIdInput.type = "text";
										gistIdInput.placeholder = "Source Gist ID";
										gistIdInput.name = "source-gist-id";
										gistIdInput.required = true;

										const submitButton = document.createElement("button");
										submitButton.type = "submit";
										submitButton.textContent = "Add";

										const cancelButton = document.createElement("button");
										cancelButton.type = "button";
										cancelButton.textContent = "Cancel";

										form.append(gistIdInput, submitButton, cancelButton);
										dialogVar.appendChild(form);

										// Append the dialog container below the button
										addSourceButton.parentNode.insertBefore(dialogContainer, addSourceButton.nextSibling);

										cancelButton.addEventListener("click", () => {
											addSourceButton.disabled = false;
											dialogContainer.remove();
										});

										form.addEventListener("submit", (event) => {
											addSourceButton.disabled = false;
											event.preventDefault();
											const gistId = gistIdInput.value;
											console.log(gistId)

											browser.runtime.sendMessage({ action: "addSource", gistId },
												(response) => {
													if (response.error) {
														console.error("Error adding source:", response.error);
													} else {
														console.log("Source added successfully:", response);
														dialogContainer.remove();
													}
												}
											);
										});
									});

									contentSection.appendChild(addSourceButton);

									(async () => {
										try {
											const sources = await browser.runtime.sendMessage({
												action: "getSources",
											});
											if (sources && sources.length > 0) {
												console.log("Sources retrieved successfully:", sources);
												const sourcesList = document.createElement("ul");
												sources.forEach((source) => {
													const sourceItem = document.createElement("li");

													// Header with name and toggle button
													const listHeader = document.createElement("div");
													listHeader.classList.add("list-header");
													listHeader.textContent = source.name;

													const toggleButton = document.createElement("button");
													toggleButton.textContent = "Toggle";
													toggleButton.classList.add("toggle-btn");
													const toggleElement = createToggleElement(
														source.name,
														source.name,
														"settings"
													);
													listHeader.appendChild(toggleElement);

													const toggleInput =
														toggleElement.querySelector("input");
													toggleInput.checked = source.enabled;
													toggleInput.addEventListener("change", (event) => {
														const toggleSource = async (
															sourceName,
															isEnabled
														) => {
															try {
																const response =
																	await browser.runtime.sendMessage({
																		action: "toggleSource",
																		name: sourceName,
																		enabled: isEnabled,
																	});
																if (response.error) {
																	console.error(
																		`Error toggling source ${sourceName}:`,
																		response.error
																	);
																} else {
																	console.log(
																		`Source ${sourceName} toggled successfully:`,
																		response
																	);
																}
															} catch (error) {
																console.error(
																	`Error toggling source ${sourceName}:`,
																	error
																);
															}
														};
														toggleSource(source.name, !toggleInput.checked);
														console.log(
															`Toggle for ${source.name} changed to:`,
															event.target.checked
														);
													});

													// Content with matches and selectors
													const listContent = document.createElement("div");
													listContent.classList.add("list-content");

													// Add matches
													if (source.matches) {
														const matchesDiv = document.createElement("div");
														matchesDiv.classList.add("matches");
														matchesDiv.textContent = `Matches: ${source.matches}`;
														listContent.appendChild(matchesDiv);
													}

													// Add selectors
													if (source.selectors) {
														const selectorsDiv = document.createElement("div");
														selectorsDiv.classList.add("selectors");
														selectorsDiv.textContent = "Selectors:";
														Object.keys(source.selectors).forEach((key) => {
															const selectorSpan =
																document.createElement("span");
															selectorSpan.textContent = key;
															selectorsDiv.appendChild(selectorSpan);
														});
														listContent.appendChild(selectorsDiv);
													}

													// Append header and content to the list item
													sourceItem.append(listHeader, listContent);
													sourcesList.appendChild(sourceItem);

													// Add click event to the toggle button
													toggleButton.addEventListener("click", () => {
														listContent.classList.toggle("hidden");
													});
												});
												contentSection.appendChild(sourcesList);
											} else {
												console.warn("No sources found.");
											}
										} catch (error) {
											console.error("Error retrieving sources:", error);
										}
									})();
									break;
								case "filters":
									const filterButton = document.createElement("button");
									filterButton.textContent = "Add Filter";
									filterButton.classList.add("add-filter-btn", "settings-add-btn");
									filterButton.addEventListener("click", () => {
										const dialogManagerVar = dialogManager(
											confirmationDialog({
												header: "Add New Filter",
												headerDesc: "Enter the details for the new filter.",
											})
										);
										dialogManagerVar.classList.add("add-filter-dialog");

										const dialogVar = dialogManagerVar.querySelector(".dialog");
										const form = document.createElement("form");
										form.id = "add-filter-form";

										const nameInput = document.createElement("input");
										nameInput.type = "text";
										nameInput.placeholder = "Filter Name";
										nameInput.name = "filter-name";
										nameInput.required = true;

										const typeInput = document.createElement("input");
										typeInput.type = "text";
										typeInput.placeholder = "Filter Type";
										typeInput.name = "filter-type";
										typeInput.required = true;

										const submitButton = document.createElement("button");
										submitButton.type = "submit";
										submitButton.textContent = "Add";

										const cancelButton = document.createElement("button");
										cancelButton.type = "button";
										cancelButton.textContent = "Cancel";

										form.append(nameInput, typeInput, submitButton, cancelButton);
										dialogVar.appendChild(form);

										cancelButton.addEventListener("click", () => {
											dialogManagerVar.remove();
										});

										form.addEventListener("submit", (event) => {
											event.preventDefault();
											const filterName = nameInput.value;
											const filterType = typeInput.value;

											browser.runtime.sendMessage(
												{
													action: "addFilter",
													data: { name: filterName, type: filterType },
												},
												(response) => {
													if (response.error) {
														console.error("Error adding filter:", response.error);
													} else {
														console.log("Filter added successfully:", response);
														dialogManagerVar.remove();
													}
												}
											);
										});
									});
									contentSection.appendChild(filterButton);
									const filterArr = [
										"genre",
										"feature",
										"tag",
									]
									(async () => {
										try {
											const filters = await fetchFilters();
											if (filters && filters.length > 0) {
												console.log("Filters retrieved successfully:", filters);
												// Group filters by type
												const groupedFilters = filters.reduce((acc, filter) => {
													if (!acc[filter.type]) {
														acc[filter.type] = [];
													}
													acc[filter.type].push(filter.name);
													return acc;
												}, {});
												// Create a list for each type
												Object.entries(groupedFilters).forEach(([type, names]) => {
													const filterGroupDiv = document.createElement("div");
													filterGroupDiv.classList.add("filter-group"); // Add filter-group class

													const typeHeader = document.createElement("h3");
													typeHeader.textContent = type;
													filterGroupDiv.appendChild(typeHeader);

													const filtersList = document.createElement("ul");
													filtersList.classList.add("filter-list"); // Add filter-list class
													names.forEach((name) => {
														const filterItem = document.createElement("li");
														filterItem.textContent = name;
														filtersList.appendChild(filterItem);
													});
													const addButton = document.createElement("button");
													addButton.classList.add("add-btn");
													addButton.innerHTML = `
														<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
															<path d="M12 5v14m7-7H5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
														</svg>
													`;
													filterGroupDiv.append(filtersList, addButton);

													contentSection.appendChild(filterGroupDiv);
												});
											} else {
												console.warn("No filters found.");
											}
										} catch (error) {
											console.error("Error retrieving filters:", error);
										}
									})();
									break
								default:
									console.log("loading default")
									break;
							}
						});
					});
				contentSection.classList.add("content-area");
			}
			console.log(PAGE_SETTINGS);
			break;
		case PAGE_COLLECTIONS:
			if (!libraryContent) {
				console.error("Element with class 'library-content' not found.");
				return; // Exit the function if the element doesn't exist
			}

			const collectionDiv = document.createElement("div");
			collectionDiv.classList.add("collections-header");
			collectionDiv.innerHTML = `<h3>Your Collections</h3> <button>?</button>`;

			const collectionContainer = document.createElement("div");
			collectionContainer.classList.add("container");
			const createCollectionDiv = document.createElement("button");
			createCollectionDiv.classList.add("create-collection-btn", "collection");
			createCollectionDiv.innerHTML = `
				<span class="icon"><i class="fa-solid fa-plus"></i></span>
				<h3 class="txt">create a new collection</h3>
			`;
			collectionContainer.prepend(createCollectionDiv);

			libraryContent.innerHTML = ""; // Clear existing content
			libraryContent.append(collectionDiv, collectionContainer);

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
								action: ACTION_ADD_OR_UPDATE_COLLECTION,
								name: document
									.getElementById("collection-title")
									.value.toLowerCase(),
								data: {
									isDynamic: event.submitter.value === "dynamic",
									isHidden: document.getElementById("hidden").checked,
									inSidebar: document.getElementById("show-in-sidebar").checked,
									isPrivate: document.getElementById("private").checked,
								},
							},
							(response) => {
								console.table(response);
								if (response && response.success) {
									dialogManagerVar.remove();
									loadAsideCollections();
									libraryMgr(PAGE_COLLECTIONS);
									console.log(
										"Collection operation completed successfully.",
										response
									);
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

			try {
				const collections = await fetchCollections();
				console.log("Received collections:", collections);
				collections.forEach((collection) => {
					const collDataBtn = document.createElement("button");
					collDataBtn.className = "collection";
					collDataBtn.dataset.collection = collection.name;
					collDataBtn.innerHTML = `
						<h3>${collection.name || "Untitled Collection"}</h3>
						<p>( ${collection.records ? collection.records.length : 0} )</p>
					`;
					collectionContainer.appendChild(collDataBtn);
					collDataBtn.addEventListener("click", (event) => {
						libraryMgr("collection", collection);
					});
				});
			} catch (error) {
				console.error("Error getting collections:", error);
			}
			console.info(`${PAGE_COLLECTIONS} page loaded`);
			break;
		case PAGE_COLLECTION:
			console.log(data);
			if (!data && !data.name) {
				console.warn("collectionId is missing for PAGE_COLLECTION");
				return;
			}
			loadCollection(data);
			console.info(
				`${
					data.name ? data.name.toUpperCase() : "" + " " + PAGE_COLLECTION
				} page loaded`
			);
			break;
		case PAGE_RECORD:
			loadRecordPage(data);
			break;
		default:
			break;
	}
}

async function loadShelves() {
	try {
		const shelfs = await fetchShelves();
		const collections = await fetchCollections();
		const records = await fetchRecords();
		const timelineData = await browser.runtime.sendMessage({
			action: "fetchTimeLine",
		});
		console.log("records", records);

		const shelfTemplateHtml = shelfTemplate({ variation: "add" }, collections);
		libraryContent.innerHTML = shelfTemplateHtml;
		const addShelfButton = document.querySelector("#addShelfBtn");
		addShelfButton.addEventListener("click", (event) => {
			event.target.disabled = true;
			document.querySelector(".shelf-banner").classList.toggle("active");
		});
		libraryContent.querySelectorAll(".option-btn").forEach((btn) => {
			btn.addEventListener("click", () => {
				console.log("Option button clicked", btn.textContent);
				libraryContent
					.querySelector(".shelf-options")
					.classList.toggle("active");
				const selectedOption = btn.textContent;
				if (
					selectedOption === "uncategorized" ||
					selectedOption === "all" ||
					selectedOption === "recently added" ||
					selectedOption === "collections view" ||
					collections.map((obj) => obj.name).includes(selectedOption)
				) {
					const messageData = {
						name: selectedOption,
						category: "default",
					};
					if (selectedOption === "collections view") {
						messageData.type = "collections";
					} else if (selectedOption === "recently added") {
						messageData.type = "timeline";
					} else if (
						selectedOption === "all" ||
						selectedOption === "uncategorized" ||
						collections.map((obj) => obj.name).includes(selectedOption)
					) {
						messageData.type = "collection";
					}
					browser.runtime.sendMessage(
						{
							action: "addShelf",
							data: messageData,
						},
						(response) => {
							if (response && response.success) {
								//loadShelves();
								addShelfButton.disabled = false;
								document
									.querySelector(".shelf-banner")
									.classList.toggle("active");
								console.log("shelf added", response);
								const addedShelf = response.shelf;
								console.log("addedShelf", addedShelf);
								const addedShelfHtml = getShelfHtml(addedShelf, collections);
								//libraryContent.querySelector(".shelfs-cont").replaceWith(addedShelfHtml);
								libraryContent
									.querySelector(".shelfs-cont")
									.prepend(addedShelfHtml);
								//const shelfHtml = getShelfHtml(addedShelf, collections);
								//document.querySelector(".shelfs-cont").appendChild(shelfHtml);
								if (btn.textContent === "all") {
									records.forEach((record) => {
										const recordDiv = document.createElement("div");
										recordDiv.classList.add("shelf-item-record");
										recordDiv.textContent = record.name;
										//const recordString = JSON.stringify(record);
										//recordDiv.textContent = recordString;
										addedShelfHtml
											.querySelector(".shelf-content")
											.appendChild(recordDiv);
										recordDiv.addEventListener("click", () => {
											libraryMgr(PAGE_RECORD, record.name);
										});
									});
								}
							}
						}
					);
				} else if (selectedOption === "delete this shelf") {
					document.querySelector(".add-shelf").disabled = false;
					//document.querySelector(".shelf-panel").classList.toggle("active");
					document.querySelector(".shelf-banner").classList.toggle("active");
				}
			});
		});
		libraryContent
			.querySelector(".select-shelf-btn")
			.addEventListener("click", () => {
				libraryContent
					.querySelector(".shelf-options")
					.classList.toggle("active");
			});
		//libraryContent.prepend(getHomePageHtml());

		if (shelfs && shelfs.length !== 0) {
			console.warn("Received collections:", collections);
			shelfs.reverse().forEach((shelf) => {
				const shelfHtml = getShelfHtml(shelf, collections);
				const shelfsContainer = document.querySelector(".shelfs-cont");
				shelfsContainer.appendChild(shelfHtml);
				const shelfContent = document.createElement("div");
				shelfContent.classList.add("shelf-content");
				shelfHtml.appendChild(shelfContent);

				if (shelf.type === "collections") {
					shelfContent.classList.add("shelf-collections");
					collections.forEach((collection) => {
						const shelfCollection = document.createElement("div");
						shelfCollection.classList.add("shelf-item-collection");
						shelfCollection.textContent = collection.name;
						shelfContent.appendChild(shelfCollection);
						shelfCollection.addEventListener("click", () => {
							libraryMgr("collection", collection);
						});
					});
				} else if (shelf.type === "timeline") {
					shelfContent.classList.add("shelf-timeline");
					const timelineObj = timelineData.timeline;
					console.log("timelineData", timelineObj);
					if (timelineObj) {
						Object.entries(timelineObj).forEach(([key, value]) => {
							const timelineGroup = document.createElement("div");
							timelineGroup.classList.add("timeline-group");
							timelineGroup.dataset.timeline = key;
							const timelineHeaderBtn = document.createElement("button");
							timelineHeaderBtn.textContent = key;
							timelineGroup.appendChild(timelineHeaderBtn);
							const recordsDiv = document.createElement("div");
							recordsDiv.classList.add("records");
							timelineGroup.appendChild(recordsDiv);
							const records = value;
							records.forEach((record) => {
								const recordDiv = document.createElement("div");
								recordDiv.classList.add("shelf-item-record");
								recordDiv.textContent = record.name;
								recordsDiv.appendChild(recordDiv);
							});
							shelfContent.appendChild(timelineGroup);
						});
					}
				} else if (shelf.type === "collection") {
					shelfContent.classList.add("shelf-collection");
					const selectOptionBtnCount = shelfHtml.querySelector(
						".select-shelf-btn .count"
					);
					if (shelf.name === "all") {
						if (selectOptionBtnCount) {
							selectOptionBtnCount.textContent = records.length
								? `( ${records.length} )`
								: `( 0 )`;
						}
						records.forEach((record) => {
							const recordDiv = document.createElement("div");
							recordDiv.classList.add("shelf-item-record");
							recordDiv.textContent = record.name;
							//const recordString = JSON.stringify(record);
							//recordDiv.textContent = recordString;
							shelfContent.appendChild(recordDiv);
							recordDiv.addEventListener("click", () => {
								libraryMgr(PAGE_RECORD, record.name);
							});
						});
					} else {
						const collectionDiv = document.createElement("div");
						collectionDiv.classList.add("collection");
						fetchCollection(shelf.name).then((response) => {
							console.log("Received collection:", response);
							if (typeof response.collections !== "undefined") {
								const collection = response.collections;
								if (selectOptionBtnCount) {
									selectOptionBtnCount.textContent = collection.records
										? `( ${collection.records.length} )`
										: `( 0 )`;
								}
								console.log(collection);
								if (collection.records) {
									collection.records.forEach((record) => {
										const recordDiv = document.createElement("div");
										recordDiv.classList.add("shelf-item-record");
										recordDiv.textContent = record;
										shelfContent.appendChild(recordDiv);
										recordDiv.addEventListener("click", () => {
											libraryMgr(PAGE_RECORD, record);
										});
									});
								}
							}
						});
						shelfContent.appendChild;
					}
				}
			});
		}
		console.log(document.querySelectorAll(".select-shelf-btn"));
		//const addShelfHtml = getShelfHtml({ variation: "add" }, collections);
		//console.log(addShelfHtml);
		//document.querySelector(".shelf-top").appendChild(addShelfHtml);
	} catch (error) {
		console.error("Error loading shelves and collections:", error);
	}
}

async function loadCollections() {
	try {
		const collections = await fetchCollections();
		if (collections && collections.length !== 0) {
			console.log("Received collections:", response.collections);
			const collOptsGrp = document.querySelector("#collOptsGrp");
			collections.forEach((collection) => {
				const btn = document.createElement("button");
				btn.classList.add("option-btn");
				const textSpan = document.createElement("span");
				textSpan.classList.add("name");
				textSpan.textContent = collection.name;
				btn.appendChild(textSpan);
				collOptsGrp.appendChild(btn);
			});
		} else {
		}
	} catch (error) {
		console.error("Error loading collections:", error);
	}
}

async function loadCollection(collection) {
	try {
		console.warn(collection);
		const filters = await fetchFilters();
		const genres = filters.filter((filter) => filter.type === "genre");
		const tags = filters.filter((filter) => filter.type === "tag");
		const features = filters.filter((filter) => filter.type === "feature");
		const sources = await browser.runtime.sendMessage({ action: "getSources" });

		console.group("loadCollection");
		console.log("retrieved filters:", filters);
		console.log("retrieved genres:", genres);
		console.log("retrieved tags:", tags);
		console.log("retrieved features:", features);
		console.groupEnd();

		const collectionSettingsConfig = [
			{
				name: "sources",
				options: sources.map((source) => source.name),
				default: "steam", // Changed default to match an option
				icon: '<i class="fa-solid fa-cloud"></i>', // More relevant icon
				type: "dropdown",
			},
			{
				name: "genres",
				icon: '<i class="fa-solid fa-list"></i>', // More relevant icon
				type: "dropdown",
			},
			{
				name: "tags",
				icon: '<i class="fa-solid fa-tag"></i>', // More relevant icon
				type: "dropdown",
			},
			{
				name: "features",
				icon: '<i class="fa-solid fa-star"></i>', // More relevant icon
				type: "dropdown",
			},
			{
				name: "delete",
				icon: '<i class="fa-solid fa-trash"></i>',
				type: "button",
			},
		];

		const collectionFiltersArrReview = [
			{
				name: "sort by",
				options: [
					{ label: "Best Match", order: true },
					{ label: "Latest Upload", order: true },
					{ label: "Title", order: true },
					{ label: "Rating", order: true },
					{ label: "Follows", order: true },
					{ label: "Recently Added", order: true },
					{ label: "Year", order: true },
				],
				default: "none",
				order: true,
			},
			{ name: "filter tags", options: [], default: "include any" },
			{
				name: "content rating",
				options: [
					{ label: "safe" },
					{ label: "suggestive" },
					{ label: "erotica" },
					{ label: "pornographic" },
				],
				default: "any",
			},
			{
				name: "delete",
				options: [],
				default: "delete",
				icon: '<i class="fa-solid fa-trash"></i>',
			},
			{
				name: "features",
				options: features.map((feature) => feature.name),
				default: "features",
				icon: '<i class="fa-solid fa-trash"></i>',
			},
			{
				name: "genres",
				options: genres.map((genre) => genre.name),
				default: "genres",
				icon: '<i class="fa-solid fa-trash"></i>',
			},
			{
				name: "tags",
				options: tags.map((tag) => tag.name),
				default: "tags",
				icon: '<i class="fa-solid fa-trash"></i>',
			},
		];

		//const libraryContent = document.getElementById("libraryContent");
		const libraryContent = document.querySelector(".library-content");
		if (!libraryContent) {
			console.error("libraryContent element not found.");
			return;
		}
		libraryContent.innerHTML = ``;
		libraryContent.classList.add("collection-page");

		const pageHeader = document.createElement("div");
		pageHeader.classList.add("collection-header", "flex-row");

		const collLabelCont = document.createElement("div");
		collLabelCont.classList.add("coll-label-cont", "flex-row");

		const nameTag = document.createElement("h2");
		const labelTag = document.createElement("label");
		labelTag.textContent = collection.name;
		labelTag.htmlFor = "collection-rename-btn";
		nameTag.appendChild(labelTag);

		const renameBtn = document.createElement("button");
		renameBtn.id = "collection-rename-btn";
		renameBtn.classList.add("rename-btn");
		renameBtn.innerHTML = `<i class="fa-solid fa-pen-to-square"></i>`;
		renameBtn.addEventListener("click", (event) => {
			console.log("Rename button clicked", event.target);
			// Implement rename functionality here
		});

		const lengthSpan = document.createElement("span");
		lengthSpan.textContent = collection.records ? `( ${collection.records.length} )` : `( 0 )`;
		collLabelCont.append(nameTag, renameBtn, lengthSpan);

		const filterBtn = document.createElement("button");
		filterBtn.classList.add("filter-btn");
		filterBtn.innerHTML = `<i class="fa-solid fa-filter"></i>`;
		// Implement filter functionality here

		const settingBtn = document.createElement("button");
		if (collection.isDynamic) {
			settingBtn.innerHTML = `
				<span class="icon"><i class="fa-solid fa-bolt"></i></span>
				<h3 class="txt">COLLECTION SETTINGS</h3>
			`;
			settingBtn.classList.add("collection-settings");

			settingBtn.addEventListener("click", () => {
				settingBtn.classList.toggle("active");
				settingCont.classList.toggle("hidden");
			});
		}
		const settingCont = document.createElement("div");
		settingCont.classList.add("collection-settings-cont", "hidden"); // Initially hidden

		// Function to create a dropdown element
		const createDropdown = (filterObj, options) => {
			const div = document.createElement("div");
			div.classList.add("btn-ctx-dropdown");

			const label = document.createElement("label");
			label.textContent = filterObj.name;

			const btnsDiv = document.createElement("div");
			btnsDiv.classList.add("btn-cont", "flex-row");

			const btn = document.createElement("button");
			btn.classList.add("dropdown-btn");
			btn.innerHTML = `<span class="txt">${filterObj.default || "Select"}</span>`;

			const orderBtn = document.createElement("button");
			orderBtn.classList.add("order-btn");
			orderBtn.innerHTML = `<i class="fa-solid fa-sort"></i>`;
			if (filterObj.order) {
				btnsDiv.append(btn, orderBtn);
			} else {
				btnsDiv.append(btn);
			}

			const optionDiv = document.createElement("div");
			optionDiv.classList.add("dropdown-ctx", "hidden");

			options.forEach((option) => {
				const optionBtn = document.createElement("button");
				optionBtn.textContent = option;
				optionBtn.classList.add("dropdown-option");
				optionDiv.appendChild(optionBtn);
				optionBtn.addEventListener("click", () => {
					btn.querySelector(".txt").textContent = option;
					btn.classList.remove("active");
					optionDiv.classList.add("hidden");
					// Implement filtering logic based on selected option
					console.log(`${filterObj.name} selected:`, option);
					const messageObject = {
						action: ACTION_ADD_OR_UPDATE_COLLECTION,
						name: collection.name,
						data: {
							[filterObj.name]: option,
						},
					};
					browser.runtime.sendMessage(messageObject, (response) => {
						if (response.error) {
							console.error(
								"Error updating collection filters:",
								response.error
							);
						} else {
							console.log("Collection filters updated successfully:", response);
						}
					});
				});
			});

			btn.addEventListener("click", (event) => {
				const isActive = event.currentTarget.classList.contains("active");
				// Hide all other open dropdowns
				settingCont.querySelectorAll(".btn-ctx-dropdown .dropdown-btn.active").forEach(otherBtn => {
					console.log("otherBtn", otherBtn);
					if (otherBtn !== event.currentTarget) {
						otherBtn.classList.remove("active");
						otherBtn.parentElement.nextElementSibling.classList.add("hidden");
					}
				});
				btn.classList.toggle("active");
				optionDiv.classList.toggle("hidden");
			});

			div.append(label, btnsDiv, optionDiv);
			return div;
		};

		// Function to create a button element
		const createButton = (filterObj) => {
			const div = document.createElement("div");
			div.classList.add("btn-ctx-button");

			const label = document.createElement("label");
			label.textContent = filterObj.name;

			const btnsDiv = document.createElement("div");
			btnsDiv.classList.add("btn-cont", "flex-row");

			const btn = document.createElement("button");
			btn.classList.add("action-button");
			btn.innerHTML = `<span class="txt">${filterObj.name}</span> ${filterObj.icon || ""}`;

			btn.addEventListener("click", () => {
				console.log(`${filterObj.name} button clicked`);
				switch (filterObj.name) {
					case "delete":
						const dialogManagerVar = dialogManager(
							confirmationDialog({
								header: "Confirmation Dialog",
								headerDesc: "Are you sure you want to delete this collection?",
							})
						);
						dialogManagerVar.classList.add("delete-collection-dialog");
						const dialogVar = dialogManagerVar.querySelector(".dialog");
						const confirmationInput = dialogVar.querySelector("#confirmationCheckbox");
						const confirmButton = dialogVar.querySelector("#confirmButton");
						const cancelButton = dialogVar.querySelector("#cancelButton");

						confirmButton.disabled = !confirmationInput.checked;
						confirmationInput.addEventListener("change", () => {
							confirmButton.disabled = !confirmationInput.checked;
						});
						confirmButton.addEventListener("click", () => {
							if (confirmationInput.checked) {
								browser.runtime.sendMessage(
									{ action: "deleteCollection", name: collection.name },
									(response) => {
										if (response.error) {
											console.error("Error:", response.error);
										} else {
											dialogManagerVar.remove();
											libraryMgr(PAGE_COLLECTIONS);
											loadAsideCollections();
										}
									}
								);
								console.log("Delete confirmed!");
							}
						});
						cancelButton.addEventListener("click", () => {
							dialogManagerVar.remove();
						});
						break;
					case "private":
						// Implement private toggle logic
						console.log("Private button clicked");
						break;
					default:
						break;
				}
			});

			btnsDiv.append(btn);
			div.append(label, btnsDiv);
			return div;
		};

		// Populate collection settings dynamically
		collectionSettingsConfig.forEach((filterConfig) => {
			switch (filterConfig.name) {
				case "genres":
					settingCont.appendChild(createDropdown(filterConfig, genres.map(g => g.name)));
					break;
				case "tags":
					settingCont.appendChild(createDropdown(filterConfig, tags.map(t => t.name)));
					break;
				case "features":
					settingCont.appendChild(createDropdown(filterConfig, features.map(f => f.name)));
					break;
				case "sources":
					settingCont.appendChild(createDropdown(filterConfig, filterConfig.options));
					break;
				case "delete":
					settingCont.appendChild(createButton(filterConfig));
					break;
				default:
					console.warn(`Unknown filter type: ${filterConfig.name}`);
			}
		});


		const itemsDiv = document.createElement("div");
		itemsDiv.id = "game-list";
		if (collection.records) {
			collection.records.forEach((item) => {
				const cont = document.createElement("div");
				cont.classList.add("game-item");
				cont.textContent = item;
				itemsDiv.append(cont);
				cont.addEventListener("click", () => {
					libraryMgr(PAGE_RECORD, item);
				})
			});
		}

		collection.isDynamic ? pageHeader.append(collLabelCont, filterBtn, settingBtn) : pageHeader.append(collLabelCont, filterBtn);

		libraryContent.prepend(pageHeader, settingCont, itemsDiv);

		// Initial setup of dropdown values based on collection data if available
		//if (collection.filters) {
		//	Object.keys(collection.filters).forEach(filterName => {
		//		const value = collection.filters[filterName];
		//		const dropdownBtn = settingCont.querySelector(`.btn-ctx-dropdown label:contains("${filterName}") + .btn-cont .dropdown-btn .txt`);
		//		if (dropdownBtn) {
		//			dropdownBtn.textContent = value;
		//		}
		//	});
		//}

		console.log("Loaded collection:", collection);
	} catch (error) {
		console.error("Error loading collection:", error);
	}
}

async function loadGames() {
	try {
		const response = await browser.runtime.sendMessage({
			action: "getRecords",
		});
		if (typeof response === "undefined") {
			console.error("Error: No response received from background script.");
			return;
		}
		if (response.error) {
			console.error("Error:", response.error);
		} else {
			console.log("Received games:", response);
			const gameList = document.createElement("div");
			gameList.id = "game-list";
			if (gameList && response.games) {
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
					libraryMgr(PAGE_RECORD, item.querySelector("h3").innerText);
				});
			});
			console.log(document.querySelector(".library-content"), gameList);
			document.querySelector(".library-content").appendChild(gameList);
		}
	} catch (error) {
		console.error("Error loading games:", error);
	}
}

function loadHomePage() {}
function loadLibraryPage() {}
function loadSettingsPage() {}

function loadCollectionsPage() {}
function loadCollectionPage() {}

function loadRecordPage(record) {
	console.log("Item clicked:", record);

	try {
		fetchRecord(record)
			.then((gameInfo) => {
				//console.log("Received game:", gameInfo);
				//gamePopup.style.display = "block";
				libraryContent.innerHTML = ``;
				libraryContent.dataset.page = PAGE_RECORD;

				const bannerDiv = document.createElement("div");
				bannerDiv.classList.add("banner");
				bannerDiv.innerHTML = `<img src="https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1716740/extras/TellYourStory_v3.gif?t=1724184715" style="height: inherit;">`;
				const actionNav = document.createElement("nav");
				actionNav.classList.add("action-nav");
				const tabsDiv = document.createElement("div");
				tabsDiv.classList.add("tabs");
				const statusButton = document.createElement("button");
				statusButton.textContent = "Install";
				statusButton.classList.add("status-button");
				const sourceLink = document.createElement("a");
				const itemInfoDiv = document.createElement("div");
				itemInfoDiv.classList.add("item-info");
				const addToFavoritesButton = document.createElement("button");
				addToFavoritesButton.innerHTML = `<i class="fa-solid fa-heart"></i>`;
				addToFavoritesButton.classList.add("favorite-button");
				if ((gameInfo.collections).includes("favorites")) {
					addToFavoritesButton.classList.add("active");
				}
				addToFavoritesButton.addEventListener("click", () => {
					addToFavoritesButton.classList.toggle("active");
					(async () => {
						const action = "addToFavorites";
						const message = { action, name: gameInfo.name };
						try {
							const response = await browser.runtime.sendMessage(message);
							console.log("Favorite added successfully:", response);
						} catch (error) {
							addToFavoritesButton.classList.toggle("active");
							console.error("Error adding favorite:", error);
						}
					})();
				});
				const moreInfoButton = document.createElement("button");
				moreInfoButton.innerHTML = `<i class="fa-solid fa-circle-info"></i>`;
				moreInfoButton.classList.add("more-info-button");
				moreInfoButton.addEventListener("click", () => {
					document
						.querySelector(".entry-info-dropdown")
						.classList.toggle("active");
					moreInfoButton.classList.toggle("active");
				});
				const settingsButton = document.createElement("button");
				settingsButton.innerHTML = `<i class="fa-solid fa-gear"></i>`;
				settingsButton.classList.add("settings-button");
				const editEntryButton = document.createElement("button");
				editEntryButton.innerHTML = `<i class="fa-regular fa-pen-to-square"></i>`;
				editEntryButton.classList.add("edit-entry-button");
				const groupedButtonsDiv = document.createElement("div");
				groupedButtonsDiv.classList.add("grouped-buttons");
				groupedButtonsDiv.append(
					addToFavoritesButton,
					moreInfoButton,
					editEntryButton,
					settingsButton
				);
				actionNav.append(statusButton, groupedButtonsDiv);

				const infoSectionDropdown = document.createElement("div");
				infoSectionDropdown.classList.add("entry-info-dropdown");
				const capsuleImgDiv = document.createElement("div");
				capsuleImgDiv.classList.add("entry-capsule-cont");
				infoSectionDropdown.append(capsuleImgDiv);

				const linksList = document.createElement("ol");
				linksList.classList.add("links-ol");
				const linksArray = [
					"whats new",
					"store page",
					"dlc",
					"community hub",
					"point shop",
					"discussions",
					"guides",
					"workshop",
					"market",
					"support",
				];
				linksArray.forEach((link) => {
					const linkLi = document.createElement("li");
					linkLi.textContent = link;
					linksList.appendChild(linkLi);
				});
				const entryPagePanel = document.createElement("div");
				entryPagePanel.classList.add("entry-panel");
				const entryPageAside = document.createElement("aside");
				entryPageAside.classList.add("entry-aside");
				const entryPageContent = document.createElement("div");
				entryPageContent.classList.add("entry-content");
				entryPageContent.innerHTML = `
					<!--<h2 class="entry-title">${gameInfo.name}</h2>-->
					<p>
						<div id="game_area_description" class="game_area_description">
							<h2>About This Game</h2>
							<img class="bb_img" src="https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2144740/extras/GR-2-Logo.gif?t=1739398668"><br><br>Blood will run in the highly anticipated hardcore FPP slasher set one year after the events of Ghostrunner. Adventure through a post-apocalyptic cyberpunk future that takes place after the fall of the Keymaster, a tyrant who ruled over Dharma Tower, the last refuge of mankind. Jack is back to take on the violent AI cult that has assembled outside Dharma Tower and shape the future of humanity.<br><br>Featuring incredible katana combat mechanics, a deeper exploration of the world beyond Dharma Tower, nonlinear levels with complex motorbike sections, exciting new modes, and all the action you loved about Ghostrunner. Plus, boss fights are more interactive, giving players freedom to choose how to survive battles against the toughest opponents.<br><br><img class="bb_img" src="https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2144740/extras/GR2_Katana-02-Crop.gif?t=1739398668"><br><br><strong>Become The Ultimate Cyber Ninja</strong><br>Ghostrunner 2 introduces new skills, allowing players to be more creative and take on even the most demanding encounters with greater accessibility. However, enemies in Ghostrunner 2 behave uniquely dependent on the skills used against them, providing a fresh challenge with each encounter. The player progression system has been completely redone, providing opportunities to experiment and customize gameplay.<br><br><img class="bb_img" src="https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2144740/extras/GR2_Motorbike-02-Crop.gif?t=1739398668"><br><br><strong>Immersive, Mind-Bending Features</strong><br>Master the Cybervoid if you hope to survive. Take on challenging, new enemies as you traverse interactive environments including exploding barrels, destructible walls, helpful neutral entities, and countless improvements that keep combat exciting and fresh. Can’t get enough? Dive even deeper into the lore and plot with the new dialogue system.<br><br><img class="bb_img" src="https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2144740/extras/GR2_Shuriken-02-Crop.gif?t=1739398668"><br><br><strong>Sounds of the Cybervoid</strong><br>Save humanity in style as you decimate your opponents while listening to the captivating synthwave soundtrack featuring new music from Daniel Deluxe, We Are Magonia, Gost, Dan Terminus, and Arek Reikowski.						</div>
					</p>
				`;
				entryPagePanel.append(entryPageContent, entryPageAside);

				libraryContent.append(
					bannerDiv,
					actionNav,
					infoSectionDropdown,
					tabsDiv,
					linksList,
					entryPagePanel
				);
				const gameHeading = document.createElement("h2");
				gameHeading.textContent = record;
				entryPageAside.prepend(gameHeading);
				for (const fd in gameInfo) {
					if ((fd !== "id") & (fd !== "name")) {
						const infoDiv = document.createElement("div");
						if (fd !== "description") {
							const contheading = document.createElement("h3");
							contheading.textContent = fd;
							infoDiv.appendChild(contheading);
						}
						if (fd === "genres" || fd === "features" || fd === "tags") {
							const fdd = document.createElement("div");
							fdd.classList.add(`fd-${fd}`);
							gameInfo[fd].forEach((element) => {
								createAndAppendSpan(fdd, element);
							});
							console.log(fdd);
							infoDiv.append(fdd);
						} else if (fd === "link") {
							for (const key in gameInfo[fd]) {
								if (key === gameInfo.source) {
									sourceLink.href = gameInfo[fd][key] || "#";
									sourceLink.innerText = key || "Link";
									sourceLink.target = "_blank";
									statusButton.after(sourceLink);
								}
								const link = document.createElement("a");
								link.href = gameInfo[fd][key] || "#";
								link.innerText = key || "Link";
								link.target = "_blank";
								infoDiv.append(link);
							}
						} else {
							createAndAppendSpan(infoDiv, gameInfo[fd], `fd-${fd}`);
						}

						entryPageAside.appendChild(infoDiv);
					}
				}

				const scoresDiv = document.createElement("div");
				scoresDiv.classList.add("scores");

				const criticScoresDiv = document.createElement("div");
				criticScoresDiv.classList.add("critic-scores");

				const criticScoreLabel = document.createElement("p");
				criticScoreLabel.textContent = "Critic:";
				const criticScoreValue = document.createElement("p");
				criticScoreValue.textContent = "85";

				criticScoresDiv.append(criticScoreLabel, criticScoreValue);

				const communityScoresDiv = document.createElement("div");
				communityScoresDiv.classList.add("community-scores");

				const communityScoreLabel = document.createElement("p");
				communityScoreLabel.textContent = "Community:";
				const communityScoreValue = document.createElement("p");
				communityScoreValue.textContent = "92";

				communityScoresDiv.append(communityScoreLabel, communityScoreValue);

				const userScoresDiv = document.createElement("div");
				userScoresDiv.classList.add("user-scores");

				const userScoreLabel = document.createElement("p");
				userScoreLabel.textContent = "User:";
				const userScoreValue = document.createElement("p");
				userScoreValue.textContent = "90";

				userScoresDiv.append(userScoreLabel, userScoreValue);

				scoresDiv.append(criticScoresDiv, communityScoresDiv, userScoresDiv);

				entryPageAside.append(scoresDiv);

				if (false) {
					const dialogManagerVar = dialogManager();
					dialogManagerVar.classList.add("game-details-dialog");
					const dialogVar = dialogManagerVar.querySelector(".dialog");
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
				}
			})
			.catch((error) => {
				console.error("Error fetching record data:", error);
			});
	} catch (error) {
		console.error("Error fetching record data:", error);
	}
	console.info(`${PAGE_RECORD} page loaded`, record);
}

const settingsButton = document.querySelector("#settings-trigger");
settingsButton.addEventListener("click", () => {
	settingsButton.classList.toggle("active");
	libraryMgr(PAGE_SETTINGS);
	return;
	/*
	const dialogMgr = dialogManager(connectSettingsDialog());
	dialogMgr.classList.add("settings-dialog");
	const dialog = dialogMgr.querySelector(".dialog");
	const dialogSidebarLabels = dialog.querySelector(".settings-group");
	const dialogContent = dialog.querySelector(".settings-content");
	const activeBg = dialog.querySelector(".active-bg");
	browser.runtime
		.sendMessage({ action: "getSettings" })
		.then((settings) => {
			if (settings) {
				logSettings(settings);
				for (const sectionKey in settings) {
					const asideListItem = document.createElement("li");
					const btnTag = document.createElement("button");
					btnTag.textContent = sectionKey;
					btnTag.classList.add("aside-btn");
					asideListItem.appendChild(btnTag);
					const section = settings[sectionKey];
					btnTag.addEventListener("click", (event) => {
						// More efficient active class management
						if (!event.target.classList.contains("active")) {
							const sectionDiv = document.createElement("div");
							sectionDiv.classList.add("settings-section");
							const sectionHeader = document.createElement("h2");
							sectionHeader.textContent = section.label || sectionKey;
							if (section.description) {
								const sectionDescription = document.createElement("p");
								sectionDescription.classList.add("section-description");
								sectionDescription.textContent = section.description;
							}
							if (section.options && false) {
								const configContainer = document.createElement("div");
								configContainer.classList.add("settings-config");
								for (const settingKey in section.options) {
									const setting = section.options[settingKey];
									const settingElement = createSettingElement(
										setting,
										settingKey,
										sectionKey
									);
									configContainer.appendChild(settingElement);
								}
								sectionDiv.appendChild(configContainer);
							}
							if (sectionKey === "overview") {
								console.log("overview");
								const btnsCont = document.createElement("div");
								btnsCont.classList.add("flex-row", "equal");
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
								];
								btnArray.forEach((element) => {
									const btnTag = document.createElement("button");
									const btnTitle = document.createElement("h4");
									btnTitle.textContent = element.title;
									const btnDec = document.createElement("p");
									btnDec.textContent = element.desc;
									btnTag.append(btnTitle, btnDec);
									btnsCont.appendChild(btnTag);
								});
								sectionDiv.prepend(btnsCont);
							}
							if (sectionKey === "libraries") {
								dialogContent
									.querySelectorAll(".settings-section")
									.forEach((section) => {
										console.log("section", section);
									});
								browser.runtime
									.sendMessage({ action: "getLibraries" })
									.then((dbs) => {
										if (dbs) {
											const librariesDropdown = document.createElement("div");
											librariesDropdown.classList.add(
												"settings-section",
												"btn-ctx-dropdown",
												"libraries-dropdown"
											);
											const librariesDropdownBtn =
												document.createElement("button");
											librariesDropdownBtn.classList.add("dropdown-btn");
											librariesDropdownBtn.innerHTML = `
												<span class="icon">
													<i class="fa-solid fa-database"></i>
												</span>
												<span class="txt">Libraries</span>
												<span class="icon margin-left">
													<i class="fa-solid fa-chevron-down"></i>
												</span>
											`;
											const librariesDropdownCtx =
												document.createElement("div");
											librariesDropdownCtx.classList.add(
												"dropdown-ctx",
												"hidden"
											);
											librariesDropdown.append(
												librariesDropdownBtn,
												librariesDropdownCtx
											);
											sectionHeader.nextSibling ? sectionHeader.after(librariesDropdown) : sectionHeader.after(librariesDropdown);
											librariesDropdownBtn.addEventListener(
												"click",
												(event) => {
													librariesDropdownCtx.classList.toggle("hidden");
												}
											);
											const librariesUl = document.createElement("ul");
											dbs.forEach((db) => {
												const li = document.createElement("li");
												const btn = document.createElement("button");
												btn.innerHTML = `
													<span class="icon">
														<i class="fa-solid fa-database"></i>
													</span>
													<span class="txt">${db.name}</span>
													<span class="txt">${db.version}</span>
												`;
												btn.dataset.db_name = db.name;
												btn.dataset.db_version = db.version;
												li.appendChild(btn);
												librariesUl.appendChild(li);
												btn.addEventListener("click", (event) => {
													browser.runtime
														.sendMessage({
															action: "addLibrary",
															name: db.name,
															version: db.version,
															data: { opperation: "open" },
														})
														.then((response) => {
															console.log(response);
															if (response) {
																librariesDropdownCtx.classList.toggle("hidden");
																librariesDropdownBtn.querySelector(
																	".txt"
																).textContent = db.name;
																console.log(
																	"db",
																	db,
																	btn,
																	btn.dataset.db_name,
																	btn.dataset.db_version
																);
															} else [console.log("Error opening library")];
														});
												});
												section.options.libraries.list.push(db);
											});
											const addLi = document.createElement("li");
											const addBtn = document.createElement("button");
											addBtn.innerHTML = `
												<span class="icon">
													<i class="fa-solid fa-plus"></i>
												</span>
												<span class="txt">Add Library</span>
											`;
											addLi.appendChild(addBtn);
											addBtn.addEventListener("click", (event) => {
												librariesDropdownCtx.classList.toggle("hidden");
												librariesDropdownBtn.remove();
												const addLibraryFormDiv = document.createElement("div");
												addLibraryFormDiv.innerHTML = `
													<form id="add-library-form">
														<input type="text" id="library-name" placeholder="Library Name" name="library-name">
														<button type="submit">Add Library</button>
														<button type="button" id="cancel-library">Cancel</button>
													</form>
												`;
												librariesDropdown.prepend(addLibraryFormDiv);
												const addLibraryForm =
													document.getElementById("add-library-form");
												const cancelLibrary =
													document.getElementById("cancel-library");
												cancelLibrary.addEventListener("click", (event) => {
													addLibraryForm.remove();
													librariesDropdown.prepend(librariesDropdownBtn);
												});
												addLibraryForm.addEventListener("submit", (event) => {
													event.preventDefault();
													const libraryName =
														addLibraryForm.querySelector("#library-name").value;
													if (libraryName) {
														console.log("name", libraryName);
													}
													browser.runtime
														.sendMessage({
															action: "addLibrary",
															name: libraryName,
															data: { opperation: "open" },
														})
														.then((response) => {
															if (response && response.success) {
																librariesDropdownBtn.querySelector(
																	".txt"
																).textContent = libraryName;
															}
															console.log("response", response);
														});
												});
											});
											librariesUl.appendChild(addLi);
											librariesDropdownCtx.appendChild(librariesUl);
											console.group("Libraries", dbs);
											console.log("Libraries", section.options.libraries);
											//console.info("index", dbs, dialogContent);
											console.groupEnd();
										}
									})
									.catch((error) => {
										console.error("Error getting database:", error); // More descriptive error message
									});
								const sourcesListDiv = document.createElement("div");
								const sourcesList = document.createElement("ul");
								sourcesList.classList.add("sources-list");
								const sourcesListHeader = document.createElement("h3");
								sourcesListHeader.textContent = "Sources";
								sourcesListDiv.appendChild(sourcesListHeader);
								sourcesListDiv.appendChild(sourcesList);
								sectionDiv.appendChild(sourcesListDiv);
								browser.runtime
									.sendMessage({ action: "getSources" })
									.then((sources) => {
										if (sources) {
											sources.forEach((source) => {
												const sourceLi = document.createElement("li");
												const listHeader = document.createElement("div");
												listHeader.classList.add("list-header");
												const listHeading = document.createElement("h4");
												listHeading.textContent = source.name;
												const toggleDiv = document.createElement("div");
												const label = document.createElement("label");
												label.setAttribute(
													"for",
													`${sectionKey}-${source.name}`
												); // Associate label with input
												label.textContent = "Enable?";
												const input = document.createElement("input");
												input.type = "checkbox";
												input.id = `${sectionKey}-${source.name}`;
												input.classList.add("toggle-switch");
												input.checked = source.default === true;
												toggleDiv.append(label, input);
												listHeader.append(listHeading, toggleDiv);
												const matchesDiv = document.createElement("div");
												matchesDiv.classList.add(
													"matches-container",
													"flex-row"
												);
												const matchesHeader = document.createElement("h4");
												matchesHeader.textContent = "Matches";
												const matchesList = document.createElement("div");
												matchesList.classList.add("matches-list");
												matchesList.textContent = source.matches;
												matchesDiv.append(matchesHeader, matchesList);
												const selectorsContainer =
													document.createElement("div");
												selectorsContainer.classList.add("selectors-container");
												const selectorsHeader = document.createElement("h4");
												selectorsHeader.textContent = "Selectors";
												const selectorsList = document.createElement("div");
												selectorsList.classList.add(
													"selectors-list",
													"tags-cont"
												);
												Object.entries(source.selectors).forEach(
													([key, value]) => {
														const selectorSpan = document.createElement("span");
														selectorSpan.classList.add("selector");
														selectorSpan.textContent = key;
														selectorsList.appendChild(selectorSpan);
													}
												);
												selectorsContainer.append(
													selectorsHeader,
													selectorsList
												);
												sourceLi.append(
													listHeader,
													matchesDiv,
													selectorsContainer
												);
												sourcesList.appendChild(sourceLi);
												input.addEventListener("click", (event) => {
													console.log("source", source);
													//browser.runtime.sendMessage({ action: "addSource", name: source.name, data: { opperation: "open" } }).then((response) => {
													//	console.log("response", response);
													//})
												});
											});
										}
									});
							}
							dialogSidebarLabels.querySelectorAll("button").forEach((btn) => {
								btn.classList.toggle("active", btn === btnTag);
							});
							dialogContent.innerHTML = "";
							dialogContent.appendChild(sectionHeader);
							dialogContent.appendChild(sectionDiv);
							activeBg.dataset.active = sectionKey;
							activeBg.setAttribute("data-content", sectionKey);
						} else {
							console.log("Already active");
						}
					});
					dialogSidebarLabels.appendChild(asideListItem);
					if (sectionKey === "overview") {
						btnTag.click();
					}
				}
			}
		})
		.catch((error) => {
			console.error("Error getting settings:", error); // More descriptive error message
		});
	*/
});

function logSettings(data) {
	console.log("logSettings", data);
}
// TODO Delete
//  Call the function to load the library when the page loads
//document.addEventListener("DOMContentLoaded", libraryMgr);
window.addEventListener("load", libraryMgr(PAGE_LIBRARY));

const gamePopup = document.getElementById("gamePopup");
const closeButton = document.querySelector(".close-button");

const tstLnk = document.querySelector(".sync-btn-cont");
const gameData = {
	name: "virtues and vices",
	developers: ["karna"],
	tags: [
		"Destruction",
		"Free to Play",
		"Shooter",
		"Multiplayer",
		"FPS",
		"Team-Based",
		"Competitive",
		"PvP",
		"Action",
		"First-Person",
		"Tactical",
		"Arena Shooter",
		"Online Co-Op",
		"Co-op",
		"Combat",
		"Character Customization",
		"Class-Based",
		"Atmospheric",
		"Loot",
		"Battle Royale",
	],
	features: ["Online Co-Op", "Online PvP", "Steam Achievements", "Steam Cloud"],
};
const tstAnchor = document.createElement("a");
tstAnchor.href = `playnite://addgame/${JSON.stringify(gameData)}`;
tstAnchor.innerText = "sync";
tstLnk.prepend(tstAnchor);

function createAndAppendSpan(parent, text, className) {
	const span = document.createElement("span");
	span.innerText = text;
	if (className) {
		span.classList.add(className);
	}
	parent.append(span);
}

function getHomePageHtml() {
	const htmlBlock = document.createElement("div");
	htmlBlock.classList.add("home-page");
	//htmlBlock.prepend(getWhatsNew());
	return htmlBlock;
}

initializeEvents();

function refreshEvents() {
	initializeEvents();
}

export function hideAllDropdowns() {
	const allDropdowns = document.querySelectorAll(".dropdown-menu.active");
	allDropdowns.forEach((dd) => {
		dd.classList.remove("show");
		dd.classList.remove("active");
	});
	console.log("All dropdowns hidden");
}

document.addEventListener("click", (event) => {
	if (!event.target.closest(".dropdown")) {
		hideAllDropdowns();
	}
});
