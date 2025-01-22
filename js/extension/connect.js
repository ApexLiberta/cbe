
/*
let processedData = {};
for (const [key, value] of Object.entries(testData)) {
	let result = processElements(key, value["selector"], value["type"]);
	//console.log(result)
	processedData[key] = result;
}
*/

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
									console.log(data)
									browser.runtime.sendMessage({ action: "addGame", data });
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
