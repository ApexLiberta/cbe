//"128": "/assets/icons/connect-128.png"

const tabUrl = window.location.href;
/*
console.log(browser);
browser.runtime.sendMessage({ action: "pageAction", tabUrl }, (response) => {
	console.log(response)
});
console.log(
	new RegExp("(https?://)([\\w.]+).(steampowered.com/app/)"),
	new RegExp("*://*.steampowered.com/app/*")
);
*/

if(tabUrl){
	const getSrcs = browser.storage.local.get("sources")
	getSrcs.then((sources) => {
		const sourcesVar = sources["sources"]
		if(sourcesVar){
			sourcesVar.forEach((source) => {
				browser.runtime.sendMessage(
					{ action: "checkUrl", url: tabUrl, pattern: source["matches"] },
					(response) => {
						if (response) {
							for (const [key, value] of Object.entries(source["selectors"])) {
								console.log(`${key}:`, value);
							}
						} else {
							console.log(
								"The current URL does not match any of the provided URLs."
							);
						}
					}
				);
			});
		}
	})
}




browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "click") {
		var url = window.location.href;
		let gameInfo;

		if (url.includes("steampowered.com")) {
			gameInfo = steam();
		} else if (url.includes("epicgames.com")) {
			gameInfo = epic();
		}

		// Ensure gameInfo is valid before sending a message
		if (gameInfo) {
			browser.runtime.sendMessage({ action: "addGame", gameInfo });
		} else {
			console.warn("Failed to retrieve game information.");
		}
	}
});


function parseDate(dateString) {
	// Handle different date formats
	let parsedDate;

	if (dateString.match(/\d{2}\/\d{2}\/\d{2}/)) {
		// Format: MM/DD/YY
		parsedDate = new Date(dateString.replace(/\//g, "-"));
	} else if (dateString.match(/\d{1,2} \w+, \d{4}/)) {
		// Format: D MMM, YYYY
		const [day, month, year] = dateString.split(" ");
		const monthIndex = [
			"Jan",
			"Feb",
			"Mar",
			"Apr",
			"May",
			"Jun",
			"Jul",
			"Aug",
			"Sep",
			"Oct",
			"Nov",
			"Dec",
		].indexOf(month);
		parsedDate = new Date(year, monthIndex, day);
	} else {
		// Handle other formats or throw an error
		throw new Error("Invalid date format");
	}

	// Convert to C# format
	const csharpFormat = parsedDate.toISOString().slice(0, 10); // YYYY-MM-DD

	return csharpFormat;
}

function gameData() {
	return {};
}
