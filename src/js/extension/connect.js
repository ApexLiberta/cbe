browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "pageActionClick") {
		const getSrcs = browser.storage.local.get("sources");
		getSrcs.then((sources) => {
			const sourcesVar = sources["sources"];
			if (sourcesVar) {
				sourcesVar.forEach((source) => {
					browser.runtime.sendMessage(
						{
							action: "checkUrl",
							url: request.tab.url,
							pattern: source["matches"],
						},
						(response) => {
							if (response) {
								let data = {};
								for (const [key, value] of Object.entries(
									source["selectors"]
								)) {
									//extractData(key, value["selector"], value["type"])
									const selector = value["selector"];
									const type = value["type"];
									data[key] = processElements(key, selector, type);
								}
								data["link"] = {
									[source.name]: request.tab.url,
								};
								browser.runtime.sendMessage({
									action: "print",
									data,
								});
								// Ensure gameInfo is valid before sending a message
								if (data) {
									data["source"] = source.name;
									console.log(data);
									browser.runtime.sendMessage({ action: "addRecord", data });
								} else {
									console.warn("Failed to retrieve game information.");
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
		});
	}
	if (request.action === "openInPlaynite") {
		const anchor = document.createElement("a");
		anchor.href = request.url;
		anchor.click();
	}
});

function processElements(key, selector, selectorType) {
	const elements = document.querySelectorAll(selector);

	if (elements.length === 0) {
		console.error(`No elements found for selector: ${selector}`);
		return null;
	}

	const results = [];
	for (const element of elements) {
		const siblings = Array.from(element.parentNode.childNodes).filter(
			(node) => node.nodeType === Node.ELEMENT_NODE && node !== element
		);
		switch (selectorType) {
			case "extTxt":
				results.push(
					element.textContent
						.replace("™", "")
						.trim()
						.toLowerCase()
						.replace(/^\W+|\W+$/g, "")
				);
				break;
			case "extLnksTxt":
				const links = element.querySelectorAll("a");
				links.forEach((link) => {
					results.push(
						link.textContent
							.trim()
							.toLowerCase()
							.replace(/^\W+|\W+$/g, "")
					);
				});
				break;
			case "innerTextSplit":
				element.innerText.split(", ").forEach((item) => {
					results.push(
						item
							.trim()
							.toLowerCase()
							.replace(/^\W+|\W+$/g, "")
					);
				});
				break;
			case "extTxtArrBySiblMch":
				siblings.forEach((cld) => {
					const textContent = cld.textContent
						.trim()
						.toLowerCase()
						.replace(/^\W+|\W+$/g, "");
					if (textContent && textContent !== "") {
						if (key.includes(textContent)) {
							element.textContent.split(",").forEach((item) => {
								results.push(
									item
										.trim()
										.toLowerCase()
										.replace(/^\W+|\W+$/g, "")
								);
							});
						}
					}
				});
				break;
			case "extLnksArrBySiblMch":
				siblings.forEach((cld) => {
					const textContent = cld.textContent
						.trim()
						.toLowerCase()
						.replace(/^\W+|\W+$/g, "");
					if (textContent && textContent !== "") {
						if (key.includes(textContent)) {
							const links = element.querySelectorAll("a");
							links.forEach((link) =>
								results.push(
									link.textContent
										.trim()
										.toLowerCase()
										.replace(/^\W+|\W+$/g, "")
								)
							);
						}
					}
				});
				break;
			case "arrayKeyMatch":
				// Implement your logic for extracting links from sibling elements based on a matching key
				// ...
				break;
			default:
				console.warn(`Unknown selector type: ${selectorType}`);
				break;
		}
	}
	return selectorType === "extLnksTxt" ||
		selectorType === "extTxtArrBySiblMch" ||
		selectorType === "extLnksArrBySiblMch" ||
		selectorType === "innerTextSplit"
		? results
		: results[0];
}

console.clear()
function extractGameDataFromInnerText(htmlString) {
	const text = htmlString.innerText;
	const lines = text.split("\n");
	const gameData = {};


	lines.forEach((line) => {
		const parts = line.split(":");
		if (parts.length >= 2) {
			const label =
				parts[0].trim().charAt(0).toUpperCase() +
				parts[0].trim().slice(1).toLowerCase();
			const value = parts.slice(1).join(":").trim();
			console.log(label, value);
			if (
				label.toLowerCase() === "genre" ||
				label.toLowerCase() === "developer" ||
				label.toLowerCase() === "publisher"
			) {
				gameData[label] = value.split(",").map((g) => g.trim());
			} else {
				gameData[label] = value;
			}
		}
	});

	return gameData;
}

// Example Usage:
const htmlSnippet = document.querySelector("#genresAndManufacturer");

const gameDataObject = extractGameDataFromInnerText(htmlSnippet);
console.log(gameDataObject);
