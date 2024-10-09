//"128": "/assets/icons/connect-128.png"
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


async function getDataFromTab() {
	try {
		const steam = {
			name: await getElement("#appHubAppName"),
			description: await getElement(".glance_ctn .game_description_snippet"),
			releaseDate: await getElement(".glance_ctn .release_date .date"),
		};

		for (const key in steam) {
			console.log(key, steam[key]);
		}
	} catch (error) {
		console.error("Error:", error);
	}
}

function getElement(selector) {
	return new Promise((resolve, reject) => {
		const element = document.querySelector(selector);
		if (element) {
			resolve(element.textContent);
		} else {
			reject(`Element with selector "${selector}" not found`);
		}
	});
}

getDataFromTab();

function steam() {
	const titleElement = document.querySelector("#appHubAppName");
	const descriptionElement = document.querySelector(
		".glance_ctn .game_description_snippet"
	);
	const releaseDateElement = document.querySelector(
		".glance_ctn .release_date .date"
	);
	const glanceCtn = document.querySelector(".glance_ctn");
	const devRowElements = glanceCtn.querySelectorAll(".dev_row");
	const tagsArray = Array.from(
		glanceCtn.querySelectorAll(".glance_tags.popular_tags a.app_tag")
	).map((tag) => tag.innerText.trim());

	const info = {
		name: titleElement?.textContent || "Title not found",
		description: descriptionElement?.innerText || "Description not found",
		releaseDate:
			parseDate(releaseDateElement?.textContent) || "Release Date not found",
		developers: [],
		publishers: [],
		tags: tagsArray,
		links: [window.location.href],
		source: "steam",
	};

	for (const devRow of devRowElements) {
		const devRowType = devRow
			.querySelector(".subtitle.column")
			.textContent.trim();
		const contentElements = devRow.querySelectorAll(".summary.column a");
		const content = Array.from(contentElements).map((el) => el.textContent);

		if (devRowType === "Developer:") {
			info.developers = content; // No nested arrays
		} else if (devRowType === "Publisher:") {
			info.publishers = content; // No nested arrays
		} else {
			console.warn("Unexpected content type found in dev_row:", devRowType);
		}
	}
	return info;
}

function epic() {
	const titleElement = document.querySelector("h1");
	const ele = document.querySelectorAll(".css-8f0505");
	const descriptionElement = document.querySelector(".css-1myreog");

	const info = {
		name: titleElement?.textContent || "Title not found",
		description: descriptionElement?.innerText || "Description not found",
		genres: [],
		features: [],
		developers: [],
		publishers: [],
		releaseDate: "",
		links: [window.location.href],
		source: "epic",
	};

	for (const sec of ele) {
		const contentElements = sec.querySelectorAll("a");
		const content = Array.from(contentElements).map((el) => el.textContent);

		if (sec.querySelector("p").innerText == "Genres") {
			info.genres = content; // Assign genres
		} else {
			info.features = content; // Assign features
		}
	}

	const dataArray = Array.from(
		document.querySelectorAll(".css-1ofqig9 .css-s97i32")
	);
	const categories = ["Developer", "Publisher", "Release Date"];

	dataArray.forEach((element) => {
		const span = element.querySelector(
			".eds_1ypbntd0.eds_1ypbntdc.eds_1ypbntdk.css-1247nep"
		);
		if (span) {
			const category = span.textContent.trim();
			const value = element.querySelector(".css-btns76")?.textContent.trim();

			if (value) {
				switch (category) {
					case "Developer":
						info.developers.push(value); // Collect developers
						break;
					case "Publisher":
						info.publishers.push(value); // Collect publishers
						break;
					case "Release Date":
						info.releaseDate = parseDate(value); // Collect release date
						break;
				}
			}
		}
	});

	return info;
}

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
