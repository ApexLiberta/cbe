import { addGame, getGame, getAllGames } from "./db/database.js";
import { doesUrlMatchPattern, sortObjectKeys } from "./helpers.js";

browser.browserAction.onClicked.addListener((tab) => {
	browser.tabs.create({ url: "/library.html" });
});
browser.pageAction.onClicked.addListener((tab) => {
	console.log(tab);
	browser.tabs.sendMessage(tab.id, { action: "click" });
	/*
	// Get the current URL and perform your desired action (optional)
	browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		const url = tabs[0].url;
		console.log("Clicked on page action for URL:", url);
		// Perform actions based on the URL (e.g., open a new tab, send a message to content script)
	});
	*/
});

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "checkUrl") {
		const result = doesUrlMatchPattern(request.url, request.pattern);
		console.log(result, request.url)
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

	if (request.action === "addStore") {
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
				// Check if parsedCode already exists in sources
				browser.storage.local
					.get("sources")
					.then((data) => {
						const sources = data.sources || [];
						const existingCode = sources.find(
							(source) => JSON.stringify(source) === JSON.stringify(parsedCode)
						);
						if (!existingCode) {
							// Code doesn't exist, append it to sources
							sources.push(parsedCode);
							browser.storage.local
								.set({ sources })
								.then(() => console.log("Code appended to sources array.", sendResponse(true)))
								.catch((error) =>
									console.error(
										"Error storing code in extension storage:",
										error
									)
								);
						} else {
							console.log("Code already exists in sources.");
						}
					})
					.catch((error) =>
						console.error(
							"Error retrieving sources from extension storage:",
							error
						)
					);
			}
		});
	}

	return true;
});

const request = indexedDB.open("myDatabase");

request.onupgradeneeded = (event) => {
	const db = event.target.result;
	const databases = indexedDB.databases();

	console.log(databases);
};

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
