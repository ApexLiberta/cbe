import {
	openDB, addGame, getGame, getAllGames,
	addOrUpdateCollection, getCollectionOrAll, deleteCollection,
	addOrUpdateSource, getAllSources
} from "../db/database.js";
import { doesUrlMatchPattern, sortObjectKeys } from "./modules/helpers.js";

(function () {
	managePageAction();
})();
const settings = {
	overview: {
		type: "group",
		label: "overview",
		description: "General settings for the application.",
		config: {
			addToPlayniteOnGameAdd: {
				type: "toggle",
				label: "Add to Playnite on Game Add",
				description:
					"Automatically adds new games to Playnite when they are detected.",
				default: true, // Added default value for clarity and potential form handling
			},
			optionsPage: {
				type: "link",
				label: "Options Page",
				description: "Show the options page in the extension popup.",
				href: "/pages/extension/options.html",
			},
			tmpPage: {
				type: "link",
				label: "tmp Page",
				description: "Show the options page in the extension popup.",
				href: "/@tmp/main.html",
			},
		},
	},
	libraries: {
		type: "group",
		label: "Libraries",
		description: "Manage your game libraries and sources.",
		config: {
			addLibrary: {
				type: "button",
				label: "Add Library",
				description: "Add a new library to organize games.",
				action: "addLibrary",
			},
			sources: {
				type: "list",
				label: "Sources",
				description: "List of sources to check for game information.",
				listItemType: "group", // Added listItemType to describe the type of items in the list
				addable: true,
				removable: true,
				list: [
					{
						type: "group",
						label: "Steam",
						config: {
							name: { type: "static", label: "Name", value: "steam" },
							gistId: {
								type: "text",
								label: "Gist ID",
								value: "your_gist_id",
								placeholder: "Enter your Gist ID",
								description: "Your personal Gist ID for Steam integration.",
							},
							version: { type: "number", label: "Version", value: 0.1 },
							enabled: { type: "toggle", label: "Enabled", default: true },
							matches: {
								type: "static",
								label: "Matches",
								value: "*://*.steampowered.com/app/*",
							},
						},
					},
				],
			},
			filters: {
				type: "list",
				label: "Filters",
				description: "List of filters to apply to game information.",
				listItemType: "group",
				addable: true,
				removable: true,
				list: [],
			},
			tags: {
				type: "list",
				label: "Tags",
				description: "List of tags to apply to games.",
				listItemType: "text", // Assuming tags are simple text inputs
				addable: true,
				removable: true,
				list: [],
			},
			features: {
				type: "list",
				label: "Features",
				description: "List of features to apply to games.",
				listItemType: "text", // Assuming features are simple text inputs
				addable: true,
				removable: true,
				list: [],
			},
			collections: {
				type: "list",
				label: "Collections",
				description: "List of collections to organize games.",
				listItemType: "text", // Assuming collections are simple text inputs
				addable: true,
				removable: true,
				list: [],
			},
		},
	},
	appearance: {
		type: "group",
		label: "Appearance", // Added label for better UI context
		description: "Customize the look and feel of the application.", // More descriptive
		config: {
			theme: {
				type: "dropdown",
				label: "Theme",
				description: "Select the application theme.",
				options: [
					{ value: "light", label: "Light" },
					{ value: "dark", label: "Dark" },
					{ value: "system", label: "System Default" },
				], // More structured options for dropdown
				default: "system",
			},
			listMode: {
				type: "dropdown",
				label: "List Mode",
				description: "Choose how games are displayed in lists.",
				options: [
					{ value: "grid", label: "Grid" },
					{ value: "list", label: "List" },
					{ value: "detailed", label: "Detailed List" },
				],
				default: "grid",
			},
			language: {
				type: "dropdown",
				label: "Language",
				description: "Application language.",
				options: [
					{ value: "en", label: "English" },
					{ value: "es", label: "Spanish" },
					{ value: "fr", label: "French" },
					// ... more languages
				],
				default: "en",
			},
		},
	},
	about: {
		type: "group",
		label: "About", // Added label for better UI context
		description: "Information about this application.", // More descriptive
		config: {
			version: {
				type: "static",
				label: "Version",
				value: "7.7.10",
				description: "Current application version.",
			},
			// Could add more static info here like copyright, author, etc.
		},
	},
};
console.clear();
console.log(settings)
browser.runtime.onInstalled.addListener(() => {
	browser.storage.local
		.get("settings")
		.then((result) => {
			if (!result.settings) {
				// Settings don't exist, create them with defaults
				browser.storage.local
					.set({ settings })
					.then(() => {
						console.log("Settings created successfully");
					})
					.catch((error) => {
						console.error("Error saving settings:", error);
					});
			} else {
				console.log("Settings already exist");
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
	/*
	switch (operation) {
		case "mgr_collection":
			return;
		default:
			throw new Error(
				`Invalid operation: ${operation}. Must be 'addOrUpdate', 'get', 'getAll', or 'delete'.`
			);
	}
	*/
	if (request.action === "getSettings") {
		// Get settings from storage
		browser.storage.local
			.get("settings")
			.then((result) => sendResponse(result.settings || {}))
			.catch((error) => {
				console.error("Error getting settings:", error);
				sendResponse({ error: "Error loading settings" });
				return {};
			});
	}

	if (request.action === "checkUrl") {
		const result = doesUrlMatchPattern(request.url, request.pattern);
		console.log(request.url, request.pattern);
		sendResponse(result);
	}
	if (request.action === "pageAction") {
		const urlRegex = new RegExp(
			"(https?://)([\\w.]+).(steampowered.com/app/|epicgames.com/en-US/p/)"
		);

		if (urlRegex.test(request.tabUrl)) {
			console.log("The current URL matches one of the provided URLs.");
		} else {
			console.log("The current URL does not match any of the provided URLs.");
		}
	}

	if (request.action === "addGame") {
		const gameInfo = request.data;

		// Assuming addGame is asynchronous (e.g., a promise), we should return true to keep the message channel open.
		addGame(sortObjectKeys(gameInfo))
			.then(() => {
				console.log("Game added successfully:", gameInfo);
				sendResponse({ success: true });
			})
			.catch((error) => {
				console.error("Failed to add game:", error);
				sendResponse({ success: false, error: error.message });
			});
	}

	if (request.action === "getAllGames") {
		getAllGames()
			.then((games) => {
				sendResponse({ games });
			})
			.catch((error) => {
				console.error("Error retrieving games:", error);
				sendResponse({ error: "Failed to retrieve games" });
			});
	}

	if (request.action === "getGame") {
		getGame(request.name)
			.then((game) => {
				sendResponse(game);
			})
			.catch((error) => {
				console.error("Error retrieving game:", error);
				sendResponse({ error: "Failed to retrieve game" });
			});
	}

	if (request.action === "addSource") {
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
							(source) => JSON.stringify(source) === JSON.stringify(parsedCode)
						);
						if (!existingCode) {
							sources.push(parsedCode);
							browser.storage.local
								.set({ sources })
								.then(() => {
									console.log("Code appended to sources array.");
									browser.runtime.reload();
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
	}

	if (request.action === "addOrUpdateCollection") {
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
	}
	if (request.action === "getAllCollections") {
		getCollectionOrAll()
			.then((collections) => {
				sendResponse({ collections });
			})
			.catch((error) => {
				console.error("Error in getAllCollections:", error);
			});
	}
	if (request.action === "deleteCollection") {
		deleteCollection(request.name)
			.then(() => {
				sendResponse({ success: true });
			})
			.catch((error) => {
				sendResponse({ success: false, error: error.message });
			});
		console.log("deleteCollection");
	}

	if (request.action === "print") {
		console.log(request.data);
		return;
	}

	return true;
});

function managePageAction(tab) {
	// Retrieve stored sources asynchronously
	browser.storage.local.get("sources", (sources) => {
		if (browser.runtime.lastError) {
			console.error("Error retrieving sources:", browser.runtime.lastError);
			return; // Handle storage access errors gracefully
		}
		const sourcesList = sources.sources || [];
		sourcesList.forEach((source) => {
			if (tab) {
				if (doesUrlMatchPattern(tab.url, source["matches"])) {
					showPageAction(tab.id);
				}
				console.log("tab");
			} else {
				console.log("all");
				browser.tabs.query({}).then((tabs) => {
					tabs.forEach((tab) => {
						if (doesUrlMatchPattern(tab.url, source["matches"])) {
							showPageAction(tab.id);
						}
					});
				});
			}
		});
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


console.log(openDB());