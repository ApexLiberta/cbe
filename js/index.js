import { getWhatsNew, getShelfHtml, getShelfContainerHtml, getAddShelfHtml } from "./components/shelfsHtml.js";
import { testGames } from "./tmp/game_details.js";
import { collFiltersHtml, collSettingsHtml } from "./components/collection.js";
import {
	dialogManager,
	createCollectionDialog,
	connectSettingsDialog,
	confirmationDialog,
} from "./components/dialog.js";
import { createSettingElement } from "./components/settings.js";
import { asideTemplate } from "./components/templates.js";


// REVIEW Constants for page names
const PAGE_HOME = "home";
const PAGE_LIBRARY = "library";
const PAGE_COLLECTIONS = "collections";
const PAGE_COLLECTION = "collection";
const PAGE_GAME = "game";
const PAGE_SETTINGS = "settings";

// Constants for action names
const ACTION_GET_ALL_COLLECTIONS = "getAllCollections";
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


const browser = window.browser || window.chrome;
function isBrowserEnvironment() {
	try {
		return !!(typeof window !== "undefined" && window.browser);
	} catch (error) {
		return false;
	}
}
const isBrowser = isBrowserEnvironment();

function extensionPageManger(){

}

const heroHeader = document.querySelector("header");
const heroNav = heroHeader.querySelector(".hero-nav");
const toggleLibrary = heroNav.querySelector("#toggleLibrary");
toggleLibrary.addEventListener("click", () => {
	heroNav.querySelectorAll("h2").forEach((h2) => {
		h2.classList.toggle("active");
	});
	const activeText = heroNav.querySelector(".active").textContent;
	activeText == "connect" ? libraryMgr(PAGE_HOME) : libraryMgr(PAGE_LIBRARY);
})


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
	action: "getAllCollections",
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


const aside = asideTemplate();

function loadAsideCollections() {
	aside.querySelectorAll(".page-mgr-btn").forEach((btn) => {
		btn.addEventListener("click", () => {
			libraryMgr(btn.dataset.page);
		});
	});
	browser.runtime.sendMessage({ action: "getAllCollections" }, (response) => {
		if (response.error) {
			console.error("Error:", response.error);
		} else {
			console.log("Received collections:", response.collections);
			aside.querySelector(".collections-cont").innerHTML = ``;
			response.collections.forEach((collection) => {
				//if (collection.inSidebar && collection.games){
				if (collection.inSidebar) {
					const collectionElement = document.createElement("div");
					collectionElement.className = "collection";

					const groupHeader = document.createElement("div");
					groupHeader.classList.add("group-header");

					const groupExpandToggle = document.createElement("button");
					groupExpandToggle.classList.add("expand-toggle");
					groupExpandToggle.addEventListener("click", (event) => {
						event.target.classList.toggle("expanded");
					});

					const loadGroupBtn = document.createElement("button");
					loadGroupBtn.classList.add("load-group-btn");
					loadGroupBtn.dataset.page = collection.name;
					loadGroupBtn.innerHTML = `
					<span class=""txt>${collection.name || "Untitled Collection"}</span>
					`;
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
					groupPin.innerHTML = `<i class="fa-solid fa-thumbtack"></i>`;

					groupHeader.append(groupExpandToggle, loadGroupBtn, groupPin);
					collectionElement.appendChild(groupHeader);
					aside
						.querySelector(".collections-cont")
						.appendChild(collectionElement);
				}
			});
		}
	});
}

let libraryContent;

function libraryMgr(page, data) {
	let newUrl;
	if(page !== PAGE_HOME){
		console.log(page !== PAGE_HOME, page, PAGE_HOME);
		isBrowserEnvironment() ? loadAsideCollections() : false;
		document.querySelector(".library-container").prepend(aside);
		const mainSection = document.createElement("section")
		mainSection.classList.add("library-content");
		document.querySelector(".library-container").appendChild(mainSection);
		libraryContent = document.querySelector(".library-content");

	}
	switch (page) {
		case PAGE_HOME:
			//document.querySelector(".library-content").innerHTML = ``;
			document.querySelector(".library-container").innerHTML = ``;
			console.info(`${PAGE_HOME} page loaded`);
			break;
		case PAGE_LIBRARY:
			newUrl = "/";
			homeButton.classList.toggle("active");
			libraryContent.innerHTML = `

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
			//libraryContent.prepend(getShelfHtml({ name: "coll", count: 3 }));
			libraryContent.prepend(getHomePageHtml());

			document
				.querySelector(".add-shelf")
				.addEventListener("click", function (event) {
					console.log(
						event.target,
						document
							.querySelector(".choose-collection")
							.classList.toggle("active")
					);
				});
			document.querySelector(".shelfs").appendChild(getAddShelfHtml());

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
					//NOTE - async Click
					gameItems.forEach((item) => {
						item.addEventListener("click", async () => {
							libraryMgr(PAGE_GAME, item.querySelector("h3").innerText);
						});
					});
				}
			});
			console.info(`${PAGE_LIBRARY} page loaded`);
			break;
		case PAGE_COLLECTIONS:
			newUrl = "/collections";
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
								action: "addOrUpdateCollection",
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

			browser.runtime.sendMessage(
				{ action: "getAllCollections" },
				(response) => {
					if (response.error) {
						console.error("Error:", response.error);
					} else {
						console.log("Received collections:", response.collections);
						response.collections.forEach((collection) => {
							const collDataBtn = document.createElement("button");
							collDataBtn.className = "collection";
							collDataBtn.dataset.collection = collection.name;
							collDataBtn.innerHTML = `
								<h3>${collection.name || "Untitled Collection"}</h3>
								<p>( ${collection.games ? collection.games.length : 0} )</p>
							`;
							collectionContainer.appendChild(collDataBtn);
							collDataBtn.addEventListener("click", (event) => {
								libraryMgr("collection", collection);
							});
						});
					}
				}
			);
			console.info(`${PAGE_COLLECTIONS} page loaded`);
			break;
		case PAGE_COLLECTION:
			if (data && data.name) {
				newUrl = `/collection/${data.name}`;
			} else {
				console.warn("collectionId is missing for PAGE_COLLECTION");
				return; // Or handle error as needed
			}
			const collectionSettings = [
				{
					name: "private",
					options: [],
					default: "private",
					icon: '<i class="fa-solid fa-trash"></i>',
					type: "button",
				},
				{
					name: "delete",
					options: [],
					default: "delete",
					icon: '<i class="fa-solid fa-trash"></i>',
					type: "button",
				},
			];
			const collectionFiltersArrReview = [
				{
					name: "sort by",
					options: [
						{
							label: "Best Match",
							order: true,
						},
						{
							label: "Latest Upload",
							order: true,
						},
						{
							label: "Title",
							order: true,
						},
						{
							label: "Rating",
							order: true,
						},
						{
							label: "Follows",
							order: true,
						},
						{
							label: "Recently Added",
							order: true,
						},
						{
							label: "Year",
							order: true,
						},
					],
					default: "none",
					order: true,
				},
				{
					name: "filter tags",
					options: [],
					default: "include any",
				},
				{
					name: "content rating",
					options: [
						{
							label: "safe",
						},
						{
							label: "suggestive",
						},
						{
							label: "erotica",
						},
						{
							label: "pornographic",
						},
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
					options: [],
					default: "features",
					icon: '<i class="fa-solid fa-trash"></i>',
				},
				{
					name: "genres",
					options: [],
					default: "genres",
					icon: '<i class="fa-solid fa-trash"></i>',
				},
				{
					name: "tags",
					options: [],
					default: "tags",
					icon: '<i class="fa-solid fa-trash"></i>',
				},
			];
			const collectionSettingsArr = [];
			libraryContent.innerHTML = ``;
			libraryContent.classList.add("collection-page");

			const pageHeader = document.createElement("div");
			pageHeader.classList.add("collection-header", "flex-row");

			const collLabelCont = document.createElement("div");
			collLabelCont.classList.add("coll-label-cont", "flex-row");
			const nameTag = document.createElement("h2");
			const labelTag = document.createElement("label");
			labelTag.textContent = data.name;
			labelTag.htmlFor = "collection-rename-btn";
			nameTag.appendChild(labelTag);

			const renameBtn = document.createElement("button");
			renameBtn.id = "collection-rename-btn";
			renameBtn.classList.add("rename-btn");
			renameBtn.innerHTML = `<i class="fa-solid fa-pen"></i>`;
			renameBtn.innerHTML = `<i class="fa-regular fa-pen-to-square"></i>`;
			renameBtn.innerHTML = `<i class="fa-solid fa-pen-to-square"></i>`;

			renameBtn.addEventListener("click", (event) => {
				console.log(event.target);
			});

			const lengthSpan = document.createElement("span");
			lengthSpan.textContent = "( 0 )";

			//data.games ? lengthSpan.textContent = `( ${data.games.length} )` : lengthSpan.textContent = `( 0 )`;
			data.games
				? (lengthSpan.textContent = `( ${data.games.length} )`)
				: (lengthSpan.textContent = ``);
			collLabelCont.append(nameTag, renameBtn, lengthSpan);

			const filterBtn = document.createElement("button");
			filterBtn.classList.add("filter-btn");
			filterBtn.innerHTML = `<i class="fa-solid fa-filter"></i>`;

			const settingBtn = document.createElement("button");
			settingBtn.innerHTML = `
				<span class="icon"><i class="fa-solid fa-bolt"></i></span>
				<h3 class="txt">DYNAMIC COLLECTION</h3>
				<span class="icon"><i class="fa-solid fa-gear"></i></span>
			`;
			settingBtn.classList.add("collection-settings", "active");

			const settingCont = document.createElement("div");
			settingCont.classList.add("collection-settings-cont", "active");

			collectionSettings.forEach((filterObj) => {
				const div = document.createElement("div");
				div.classList.add("btn-ctx-dropdown");
				const label = document.createElement("label");
				label.textContent = filterObj.name;

				const btnsDiv = document.createElement("div");
				btnsDiv.classList.add("btn-cont", "flex-row");
				const btn = document.createElement("button");
				btn.classList.add("dropdown-btn");
				btn.innerHTML = `<span class="txt">${filterObj.default}</span>`;

				const orderBtn = document.createElement("button");
				orderBtn.classList.add("order-btn");
				orderBtn.innerHTML = `
					<i class="fa-solid fa-sort"></i>
				`;

				filterObj.order ? btnsDiv.append(btn, orderBtn) : btnsDiv.append(btn);

				//btn.dataset.filtergroup = filterObj.name;
				/*
				btn.innerHTML = `
					<span class="txt">
						${filterObj.default}
					</span>
					<span class="icon">
						<i class="fa-solid fa-up-down"></i>
					</span>
				`;
				*/

				const optionDiv = document.createElement("div");
				optionDiv.classList.add("dropdown-ctx", "hidden");
				//optionDiv.classList.add(`filter-options-${filterObj.name.toLowerCase()}`);
				console.log(filterObj.name.toLowerCase(), filterObj);

				if (filterObj.options.length > 0) {
					filterObj.options.forEach((filter) => {
						const filterBtn = document.createElement("button");
						filterBtn.textContent = filter.label;
						filterBtn.classList.add("dropdown-option");
						optionDiv.appendChild(filterBtn);
						filterBtn.addEventListener("click", (event) => {
							btn.dataset.active = filter.label;
							btn.textContent = filter.label;
							btn.classList.toggle("active");
							optionDiv.classList.toggle("hidden");
						});
					});
				}

				btn.addEventListener("click", (event) => {
					const check = event.target.classList.contains("active");
					const allDropdowns =
						settingCont.querySelectorAll(".btn-ctx-dropdown");

					if (filterObj.type !== "button") {
						allDropdowns.forEach((dropdown) => {
							dropdown
								.querySelector(".dropdown-btn")
								.classList.remove("active");
							dropdown.querySelector(".dropdown-ctx").classList.add("hidden");
						});
						if (!check) {
							btn.classList.toggle("active");
							optionDiv.classList.toggle("hidden");
						}
					}

					switch (filterObj.name) {
						case "delete":
							const dialogManagerVar = dialogManager(
								confirmationDialog({
									header: "Confirmation Dialog",
									headerDesc:
										"Are you sure you want to delete this collection?",
								})
							);
							dialogManagerVar.classList.add("delete-collection-dialog");
							const dialogVar = dialogManagerVar.querySelector(".dialog");

							const confirmationInput = dialogVar.querySelector(
								"#confirmationCheckbox"
							);
							confirmationInput.addEventListener("change", () => {
								confirmButton.disabled = !confirmationInput.checked; // Disable if input is empty or checkbox is checked and input is empty
							});

							const confirmButton = dialogVar.querySelector("#confirmButton");
							confirmButton.addEventListener("click", () => {
								if (confirmationInput.checked) {
									browser.runtime.sendMessage(
										{ action: "deleteCollection", name: data.name },
										(response) => {
											if (response.error) {
												console.error("Error:", response.error);
											} else {
												dialogManagerVar.remove();
												btn.classList.toggle("active");
												libraryMgr(PAGE_COLLECTIONS);
												loadAsideCollections();
											}
										}
									);
									console.log("Extra confirmation checked! Input value:");
								} else {
									console.log("Regular confirmation! Input value:");
								}
							});
							const cancelButton = dialogVar.querySelector("#cancelButton");
							cancelButton.addEventListener("click", () => {
								dialogManagerVar.remove();
								btn.classList.toggle("active");
							});
							break;

						default:
							break;
					}
				});

				filterObj.type !== "button"
					? div.append(label, btnsDiv, optionDiv)
					: div.append(label, btnsDiv);
				settingCont.appendChild(div);
			});

			settingBtn.addEventListener("click", (event) => {
				settingBtn.classList.toggle("active");
				settingCont.classList.toggle("active");
			});

			const itemsDiv = document.createElement("div");
			itemsDiv.id = "game-list";
			itemsDiv.innerHTML = `
				//data.gameIds.forEach(item => {
				//	const cont =  document.createElement("div")
				//	cont.classList.add("game-item");
				//	cont.textContent = item
				//	itemsDiv.append(cont)
				//});
			`;

			pageHeader.append(collLabelCont, filterBtn, settingBtn);
			libraryContent.prepend(pageHeader, settingCont, itemsDiv);
			console.info(
				`${data.name.toUpperCase() + " " + PAGE_COLLECTION} page loaded`
			);
			break;
		case PAGE_GAME:
			try {
				fetchGameData(data)
					.then((gameInfo) => {
						//console.log("Received game:", gameInfo);
						//gamePopup.style.display = "block";
						libraryContent.innerHTML = ``;
						libraryContent.dataset.page = PAGE_GAME;

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
						addToFavoritesButton.addEventListener("click", () => {
							addToFavoritesButton.classList.toggle("active");
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
						gameHeading.textContent = data;
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

						scoresDiv.append(
							criticScoresDiv,
							communityScoresDiv,
							userScoresDiv
						);

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
						console.error("Error fetching game data:", error);
					});
			} catch (error) {
				console.error("Error fetching game data:", error);
			}
			console.info(`${PAGE_GAME} page loaded`, data);
			break;
		case PAGE_SETTINGS:
			document.querySelector(".library-container").innerHTML = ``;
			const asideTag = document.createElement("aside")
			asideTag.classList.add("library-sidebar");
			const contentSection = document.createElement("section")
			document
				.querySelector(".library-container")
				.append(asideTag, contentSection);
			console.log(PAGE_SETTINGS);
			break;
		default:
			break;
	}
	if (newUrl) {
		// Change the URL without reloading the page using history.pushState
		/////window.history.pushState({ page: page, data: data }, "", "/index.html" + newUrl);

		// If you need to actually navigate to the new URL (full page reload) instead, use:
		// window.location.href = newUrl;

		/////console.log("URL changed to:", newUrl, "for page:", page);
	}
}



const settingsButton = document.querySelector("#settings-trigger");
settingsButton.addEventListener("click", () => {
	settingsButton.classList.toggle("active")
	libraryMgr(PAGE_SETTINGS)
	return
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
				logSettings(settings)
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
								for (const settingKey in (section.options)) {
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
								dialogContent.querySelectorAll(".settings-section").forEach((section) => {
									console.log("section", section);
								})
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
											const librariesDropdownBtn = document.createElement("button");
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
											const librariesDropdownCtx = document.createElement("div");
											librariesDropdownCtx.classList.add("dropdown-ctx", "hidden");
											librariesDropdown.append(librariesDropdownBtn, librariesDropdownCtx);
											sectionHeader.nextSibling ? sectionHeader.after(librariesDropdown) : sectionHeader.after(librariesDropdown);

											librariesDropdownBtn.addEventListener("click", (event) => {
												librariesDropdownCtx.classList.toggle("hidden");
											})
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
													browser.runtime.sendMessage({action: "addLibrary", name: db.name, version: db.version, data: {opperation: "open"}}).then((response) => {
														console.log(response)
														if(response){
															librariesDropdownCtx.classList.toggle("hidden");
															librariesDropdownBtn.querySelector(".txt").textContent = db.name;
															console.log("db", db, btn, btn.dataset.db_name, btn.dataset.db_version);
														}else[
															console.log("Error opening library")
														]
													})
												})
												section.options.libraries.list.push(db);
											})
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
												librariesDropdownBtn.remove()
												const addLibraryFormDiv = document.createElement("div");
												addLibraryFormDiv.innerHTML = `
													<form id="add-library-form">
														<input type="text" id="library-name" placeholder="Library Name" name="library-name">
														<button type="submit">Add Library</button>
														<button type="button" id="cancel-library">Cancel</button>
													</form>
												`;
												librariesDropdown.prepend(addLibraryFormDiv);
												const addLibraryForm = document.getElementById("add-library-form");
												const cancelLibrary = document.getElementById("cancel-library");
												cancelLibrary.addEventListener("click", (event) => {
													addLibraryForm.remove();
													librariesDropdown.prepend(librariesDropdownBtn);
												})
												addLibraryForm.addEventListener("submit", (event) => {
													event.preventDefault();
													const libraryName = addLibraryForm.querySelector("#library-name").value;
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
															if(response && response.success){
																librariesDropdownBtn.querySelector(".txt").textContent = libraryName;
															}
															console.log("response", response);
														});
												})
											})
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
								browser.runtime.sendMessage({ action: "getSources" }).then((sources) => {
									if (sources) {
										sources.forEach((source) => {
											const sourceLi = document.createElement("li");

											const listHeader = document.createElement("div");
											listHeader.classList.add("list-header");

											const listHeading = document.createElement("h4");
											listHeading.textContent = source.name;


											const toggleDiv = document.createElement("div");
											const label = document.createElement("label");
											label.setAttribute("for", `${sectionKey}-${source.name}`); // Associate label with input
											label.textContent = "Enable?"
											const input = document.createElement("input");
											input.type = "checkbox";
											input.id = `${sectionKey}-${source.name}`;
											input.classList.add("toggle-switch");
											input.checked = source.default === true;
											toggleDiv.append(label, input);
											listHeader.append(listHeading, toggleDiv);

											const matchesDiv = document.createElement("div");
											matchesDiv.classList.add("matches-container", "flex-row");
											const matchesHeader = document.createElement("h4");
											matchesHeader.textContent = "Matches";
											const matchesList = document.createElement("div");
											matchesList.classList.add("matches-list");
											matchesList.textContent = source.matches;
											matchesDiv.append(matchesHeader, matchesList);



											const selectorsContainer = document.createElement("div");
											selectorsContainer.classList.add("selectors-container");
											const selectorsHeader = document.createElement("h4");
											selectorsHeader.textContent = "Selectors";
											const selectorsList = document.createElement("div");
											selectorsList.classList.add(
												"selectors-list",
												"tags-cont"
											);
											Object.entries(source.selectors).forEach(([key, value]) => {
												const selectorSpan = document.createElement("span");
												selectorSpan.classList.add("selector");
												selectorSpan.textContent = key;
												selectorsList.appendChild(selectorSpan);
											});
											selectorsContainer.append(selectorsHeader, selectorsList);
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
										})
									}
								})
							}

							dialogSidebarLabels.querySelectorAll("button").forEach((btn) => {
								btn.classList.toggle("active", btn === btnTag);
							});
							dialogContent.innerHTML = "";
							dialogContent.appendChild(sectionHeader);
							dialogContent.appendChild(sectionDiv);
							activeBg.dataset.active = sectionKey;
							activeBg.setAttribute("data-content", sectionKey);
						}else{
							console.log("Already active")
						}
					});
					dialogSidebarLabels.appendChild(asideListItem);
					if(sectionKey === "overview"){
						btnTag.click();
					}
				}
			}
		})
		.catch((error) => {
			console.error("Error getting settings:", error); // More descriptive error message
		});
});

function logSettings(data){
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
