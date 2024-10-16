const tabUrl = window.location.href;

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
							let data = {};
							for (const [key, value] of Object.entries(source["selectors"])) {
								//extractData(key, value["selector"], value["type"])
								const selector = value["selector"];
								const type = value["type"];
								data[key] = processElements(key, selector, type);
							}
							//console.log(data);
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

function processElements(key, selector, selectorType) {
	const elements = document.querySelectorAll(selector);

	if (elements.length === 0) {
		console.error(`No elements found for selector: ${selector}`);
		return null;
	}

	let data = [];
	console.log(elements.length, elements)
	for (const element of elements) {
		switch (selectorType) {
			case "text":
				//console.log(selectorType, key , element)
				data.push(element.textContent.replace("™", "").trim());
				break;
				case "link":
				//console.log(selectorType, key , element)
				const links = element.querySelectorAll("a");
				links.forEach((link) => data.push(link.textContent.trim()));
				break;
			case "innerTextSplit":
				console.log("inner");
				data.push(element.innerText.split(", "));
				break;
			case "siblingMatch":
				const sibling = element.nextElementSibling;
				if (sibling && sibling.textContent === key) {
					data.push(element.textContent);
				}
				break;
			case "arrayKeyMatch":
				// Implement your array key matching logic here
				break;
			// Add more cases for other selector types as needed
		}
	}

	return data;
}


/*
const steam = {
	name: {
		selector:
			"html.responsive body.v6.app.game_bg.application.responsive_page div.responsive_page_frame.with_header div.responsive_page_content div#responsive_page_template_content.responsive_page_template_content div.game_page_background.game div#tabletGrid.tablet_grid div.page_content_ctn div.page_title_area.game_title_area.page_content div.apphub_HomeHeaderContent div.apphub_HeaderStandardTop div#appHubAppName.apphub_AppName",
		type: "text",
	},
	description: {
		selector:
			"html.responsive body.v6.app.game_bg.application.responsive_page div.responsive_page_frame.with_header div.responsive_page_content div#responsive_page_template_content.responsive_page_template_content div.game_page_background.game div#tabletGrid.tablet_grid div.page_content_ctn div.block.game_media_and_summary_ctn div.game_background_glow div#game_highlights.block_content.page_content div.rightcol div.glance_ctn div.game_description_snippet",
		type: "text",
	},
	releaseDate: {
		selector:
			"html.responsive body.v6.app.game_bg.application.responsive_page div.responsive_page_frame.with_header div.responsive_page_content div#responsive_page_template_content.responsive_page_template_content div.game_page_background.game div#tabletGrid.tablet_grid div.page_content_ctn div.block.game_media_and_summary_ctn div.game_background_glow div#game_highlights.block_content.page_content div.rightcol div.glance_ctn div.glance_ctn_responsive_left div.release_date div.date",
		type: "text",
	},
	developers: {
		selector:
			"html.responsive body.v6.app.game_bg.application.responsive_page div.responsive_page_frame.with_header div.responsive_page_content div#responsive_page_template_content.responsive_page_template_content div.game_page_background.game div#tabletGrid.tablet_grid div.page_content_ctn div.block.game_media_and_summary_ctn div.game_background_glow div#game_highlights.block_content.page_content div.rightcol div.glance_ctn div.glance_ctn_responsive_left div.dev_row div#developers_list.summary.column",
		type: "link",
	},
	publishers: {
		selector:
			"html.responsive body.v6.app.game_bg.application.responsive_page div.responsive_page_frame.with_header div.responsive_page_content div#responsive_page_template_content.responsive_page_template_content div.game_page_background.game div#tabletGrid.tablet_grid div.page_content_ctn div.block.game_media_and_summary_ctn div.game_background_glow div#game_highlights.block_content.page_content div.rightcol div.glance_ctn div.glance_ctn_responsive_left div.dev_row div.summary.column",
		type: "link",
	},
	tags: {
		selector:
			"html.responsive body.v6.app.game_bg.application.responsive_page div.responsive_page_frame.with_header div.responsive_page_content div#responsive_page_template_content.responsive_page_template_content div.game_page_background.game div#tabletGrid.tablet_grid div.page_content_ctn div.block.game_media_and_summary_ctn div.game_background_glow div#game_highlights.block_content.page_content div.rightcol div.glance_ctn div#glanceCtnResponsiveRight.glance_ctn_responsive_right div.glance_tags_ctn.popular_tags_ctn div.glance_tags.popular_tags",
		type: "link",
	},
};

for (const [key, value] of Object.entries(steam)) {
	extractData(key, value["selector"], value["type"]);
}
*/
function extractData(key, selector, selectorType) {
	const elmts = document.querySelectorAll(selector);
	let data;
	if (!elmts) {
		console.error(`Element not found for selector: ${selector}`);
		return null;
	} else if (elmts.length === 1) {
		const elmt = elmts[0];
		console.log(
			elmt.textContent
				.trim()
				.toLowerCase()
				.replace(/^\W+|\W+$/g, "")
		);
		//console.log(key, "elmt", true);
	} else {
		//console.log(key, "elmts", false);
		for (const elmt of elmts) {
			const siblings = Array.from(elmt.parentNode.childNodes).filter(
				(node) => node.nodeType === Node.ELEMENT_NODE && node !== elmt
			);
			siblings.forEach((cld) => {
				const textContent = cld.textContent
					.trim()
					.toLowerCase()
					.replace(/^\W+|\W+$/g, "");
				if (textContent && textContent !== "") {
					if (key.includes(textContent)) {
						console.log(
							textContent,
							key,
							"The words are equal (case-insensitive)."
						);
					} else {
						console.log(
							textContent,
							key,
							"The words are not equal (case-insensitive)."
						);
					}
					console.log(siblings, elmt, elmt.textContent.trim());
				}
			});
		}
	}




	const element = document.querySelector(selector);
	if (!element) {
		console.error(`Element not found for selector: ${selector}`);
		return null;
	}
	let dataObj = null
	switch (selectorType) {
		case "text":
			dataObj = element.textContent.replace("™", "").trim();;
			break;
		case "link":
			// Extract text from all links within the element
			dataObj = []
			allLinks = element.querySelectorAll("a")
			allLinks.forEach((link) => {
				dataObj.push(link.textContent.trim());
			});
			break;
		case "innerTextSplit":
			// Extract inner text and split it by ", "
			dataObj = element.innerText.split(", ");
			break;
		case "siblingMatch":
			// Check if sibling text content matches the key
			const sibling = element.nextElementSibling;
			if (sibling && sibling.textContent === key) {
				dataObj = element.textContent;
			}
			break;
		case "arrayKeyMatch":
			const allElmts = document.querySelectorAll(selector)
			console.log(allElmts)
		// Add more cases for other selector types as needed
	}
	browser.runtime.sendMessage({ action: "print", dataObj });
	//return extractedData;
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



function gameData() {
	return {};
}
