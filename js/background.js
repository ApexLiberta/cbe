import { addGame, getGame, getAllGames } from "./db/database.js";
import { sortObjectKeys } from "./helpers.js";

browser.browserAction.onClicked.addListener((tab) => {
	chrome.tabs.create({ url: "/pages/library.html" });
});
browser.pageAction.onClicked.addListener((tab) => {
	console.log(tab)
	browser.tabs.sendMessage(tab.id, { action: "click" });
	/*
	// Get the current URL and perform your desired action (optional)
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		const url = tabs[0].url;
		console.log("Clicked on page action for URL:", url);
		// Perform actions based on the URL (e.g., open a new tab, send a message to content script)
	});
	*/
});

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "addGame") {
		const gameInfo = request.gameInfo;

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

	return true; // Keeps the message channel open for asynchronous responses
});

