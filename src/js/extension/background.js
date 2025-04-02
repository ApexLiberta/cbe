import {
	openDB, addRecord, getRecord, getAllRecords,
	addOrUpdateCollection, getCollectionOrAll, deleteCollection,
	addOrUpdateSource, getAllSources,
	getAllIndexedDBs, indexedDBPromise
} from "./db/database.js";
import {
	addShelf,
	getShelfs,
	deleteShelf,
	getRecordsTimeline,
} from "./db/database.js";
import { getFromStore } from "./db/database.js";
import { toggleFavorites } from "./db/database.js";
import { toggleSource } from "./db/database.js";
import { doesUrlMatchPattern, sortObjectKeys } from "./modules/helpers.js";

(function () {
	managePageAction();
})();
function getBrowserInfo() {
	const userAgent = navigator.userAgent;
	if (userAgent.includes("Firefox")) {
		return "Firefox";
	} else if (userAgent.includes("Edg")) {
		return "Edge";
	} else if (userAgent.includes("Chrome")) {
		return "Chrome";
	} else if (userAgent.includes("Safari")) {
		return "Safari";
	} else {
		return "Unknown";
	}
}

console.log("Browser detected:", getBrowserInfo());
async function loadSettingsJson() {
	const response = await fetch("/js/json/settings.json");
	return await response.json();
}

//REVIEW - Delete
browser.tabs.create({ url: "/index.html" });

browser.runtime.onInstalled.addListener(() => {
	browser.storage.local
		.get("settings")
		.then((result) => {
			if (!result.settings) {
				loadSettingsJson().then((settings) => {
					browser.storage.local
						.set({ settings })
						.then(() => {
							console.log("Settings created successfully");
						})
						.catch((error) => {
							console.error("Error saving settings:", error);
						});
				});
			}
		})
		.catch((error) => {
			console.error("Error loading settings:", error);
		});
});
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.url) {
		managePageAction(tab);
	}
});
browser.browserAction.onClicked.addListener((tab) => {
	browser.tabs.create({ url: "/index.html" });
});
browser.pageAction.onClicked.addListener((tab) => {
	console.log("Page action clicked:", tab);
	browser.tabs.sendMessage(tab.id, { action: "pageActionClick", tab });
});
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
	switch (request.action) {
		case "checkUrl":
			const result = doesUrlMatchPattern(request.url, request.pattern);
			console.log(result, request.url, request.pattern);
			sendResponse(result);
			return true;
		case "getSettings":
			browser.storage.local
				.get("settings")
				.then((result) => sendResponse(result.settings || {}))
				.catch((error) => {
					console.error("Error getting settings:", error);
					sendResponse({ error: "Error loading settings" });
					return {};
				});
			break;
		case "updateSettings":
			break;
		case "getLibraries":
			getAllIndexedDBs()
				.then((libraries) => {
					sendResponse(libraries);
				})
				.catch((error) => {
					console.error("Error getting libraries:", error);
					sendResponse({ error: "Error loading libraries" });
				});
			return true;
		case "addLibrary":
			console.log("bg.js: Action: addLibrary - processing request:", request);
			indexedDBPromise(request.name, request.version, request.data)
				.then((db) => {
					console.log(`Database "${request.name}" opened successfully.`);
					console.log(db);
					sendResponse({
						success: true,
						message: `Database "${request.name}" opened successfully. ${db.name} - ${db.version}`,
					});
					db.close();
				})
				.catch((error) => {
					console.error("Error opening database:", error);
					sendResponse({
						success: false,
						message: `Failed to open database "${request.name}". Error: ${error.message}`,
					});
				});
			return true;
		case "getLibrary":
			console.log("bg.js: Action: getLibrary - processing request:", request);
			break;
		case "getSources":
			getAllSources()
				.then((sources) => {
					sendResponse(sources);
				})
				.catch((error) => {
					console.error("Error getting sources:", error);
					sendResponse({ error: "Error loading sources" });
				});
			return true;
		case "addSource":
			fetchGistCode(request.gistId).then((result) => {
				if (result) {
					const { fileName, code } = result;
					let parsedCode;
					try {
						parsedCode = JSON.parse(code);
					} catch (error) {
						console.error("Error parsing code:", error);
						return;
					}
					addOrUpdateSource(parsedCode);
					// Check if parsedCode already exists in sources
					browser.storage.local
						.get("sources")
						.then((data) => {
							const sources = data.sources || [];
							const existingCode = sources.find(
								(source) =>
									JSON.stringify(source) === JSON.stringify(parsedCode)
							);
							if (!existingCode) {
								sources.push(parsedCode);
								browser.storage.local
									.set({ sources })
									.then(() => {
										console.log("Code appended to sources array.");
										let extensionPageUrl = browser.runtime.getURL(
											"moz-extension://f127ce6d-079c-4ce8-b770-d382fed89a24/index.html"
										);
										browser.runtime.reload();
										if (extensionPageUrl) {
											browser.tabs.create({ url: extensionPageUrl });
										}
										sendResponse({
											length: sources.length,
											code: parsedCode,
										});
									})
									.catch((error) => {
										console.error(
											"Error storing code in extension storage:",
											error
										);
									});
							} else {
								console.log("Code already exists in sources.");
							}
						})
						.catch((error) =>
							console.error("Error Fetching Saved Sources:", error)
						);
				}
			});
			break;
		case "addOrUpdateCollection":
			addOrUpdateCollection(request.name, request.data)
				.then((returnData) => {
					const mergedObject = {
						...{ success: true },
						...returnData,
					};
					sendResponse(mergedObject);
				})
				.catch((error) => {
					sendResponse({ success: false, error: error.message });
				});
			break;
		case "getCollectionOrAll":
			getCollectionOrAll(request.name)
				.then((collections) => {
					sendResponse({ collections });
				})
				.catch((error) => {
					console.error("Error in getCollectionOrAll:", error);
				});
			break;
		case "getShelfs":
			getShelfs()
				.then((shelfs) => {
					sendResponse({ shelfs });
				})
				.catch((error) => {
					console.error("Error getting shelfs:", error);
					sendResponse({ error: "Error loading shelfs" });
				});
			return true;
		case "addShelf":
			addShelf(request.data)
				.then((shelf) => {
					console.log("Shelf added successfully:", shelf);
					sendResponse({ success: true, shelf });
				})
				.catch((error) => {
					console.error("Error adding shelf:", error);
					sendResponse({ success: false, error: error.message });
				});
			return true;
		case "deleteShelf":
			deleteShelf(request.id)
				.then(() => {
					sendResponse({ success: true });
				})
				.catch((error) => {
					console.error("Error deleting shelf:", error);
					sendResponse({ success: false, error: error.message });
				});
			return true;
		case "fetchTimeLine":
			getRecordsTimeline()
				.then((timeline) => {
					sendResponse({ timeline });
				})
				.catch((error) => {
					console.error("Error fetching timeline:", error);
					sendResponse({ error: "Failed to fetch timeline" });
				});
			return true;
		case "getFilters":
			getFromStore("filters")
				.then((filters) => {
					sendResponse({ filters });
				})
				.catch((error) => {
					console.error("Error getting filters:", error);
					sendResponse({ error: "Error loading filters" });
				});
			return true;
		case "addToFavorites":
			toggleFavorites(request.name)
				.then((favorite) => {
					console.log("Favorite added successfully:", favorite);
					sendResponse({ success: true, favorite });
				})
				.catch((error) => {
					console.error("Error adding favorite:", error);
					sendResponse({ success: false, error: error.message });
				});
			return true;
		case "toggleSource":
			console.log(request);
			toggleSource(request.name)
				.then((updatedSource) => {
					console.log(updatedSource);
					console.log(
						`Source "${request.name}" toggled to ${
							updatedSource.enabled ? "enabled" : "disabled"
						}.`
					);
					browser.runtime.reload();
					sendResponse({ success: true, source: updatedSource });
				})
				.catch((error) => {
					console.error("Error toggling source:", error);
					sendResponse({ success: false, error: error.message });
				});
			return true;
		case "addRecord":
			const gameInfo = request.data;
			// Assuming addRecord is asynchronous (e.g., a promise), we should return true to keep the message channel open.
			addRecord(sortObjectKeys(gameInfo))
				.then((response) => {
					console.log("Game added successfully:", gameInfo);
					sendResponse({ success: true });
				})
				.catch((error) => {
					console.error("Failed to add game:", error);
					sendResponse({ success: false, error: error.message });
				});
			return true;
		case "getRecords":
			getAllRecords()
				.then((games) => {
					console.log("Games retrieved successfully:", games);
					sendResponse({ games });
				})
				.catch((error) => {
					console.error("Error retrieving games:", error);
					sendResponse({ error: "Failed to retrieve games" });
				});
			return true;

		case "getGame":
			getRecord(request.name)
				.then((game) => {
					sendResponse(game);
				})
				.catch((error) => {
					console.error("Error retrieving game:", error);
					sendResponse({ error: "Failed to retrieve game" });
				});
			return true;

		case "deleteCollection":
			deleteCollection(request.name)
				.then(() => {
					sendResponse({ success: true });
				})
				.catch((error) => {
					sendResponse({ success: false, error: error.message });
				});
			console.log("deleteCollection");
			return true;
		default:
			console.log("Unknown action:", request.action);
	}
	if (request.action === "print") {
		console.log(request.data);
		return;
	}
	return true;
});

function managePageAction(tab) {
	getAllSources()
		.then((sources) => {
			if (!sources || sources.error) {
				console.error(
					"Error retrieving sources:",
					sources?.error || "Unknown error"
				);
			}
			const sourcesList = sources || [];
			sourcesList.forEach((source) => {
				if (source.enabled) {
					if (tab) {
						if (doesUrlMatchPattern(tab.url, source["matches"])) {
							showPageAction(tab.id);
						}
					} else {
						browser.tabs.query({}).then((tabs) => {
							tabs.forEach((tab) => {
								if (doesUrlMatchPattern(tab.url, source["matches"])) {
									showPageAction(tab.id);
								}
							});
						});
					}
				}
			});
		})
		.catch((error) => {
			console.error("Error retrieving sources:", error);
		});
}
function showPageAction(tabId) {
	browser.pageAction.show(tabId);
}
async function fetchGistCode(gistId) {
	try {
		const response = await fetch(`https://api.github.com/gists/${gistId}`);
		if (!response.ok) {
			throw new Error(`Failed to fetch Gist code: ${response.status}`);
		}
		const data = await response.json();
		const file = Object.values(data.files)[0]; // Assuming only one file in the Gist
		return { fileName: file.filename, code: file.content };
	} catch (error) {
		console.error(error);
		return null;
	}
}