
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

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "pageActionClick") {
		const getSrcs = browser.storage.local.get("sources");
		getSrcs.then((sources) => {
			const sourcesVar = sources["sources"];
			if (sourcesVar) {
				sourcesVar.forEach((source) => {
					browser.runtime.sendMessage(
						{ action: "checkUrl", url: request.tab.url, pattern: source["matches"] },
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
								browser.runtime.sendMessage({
									action: "print",
									data,
								});
								// Ensure gameInfo is valid before sending a message
								if (data) {
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
	const elmts = document.querySelectorAll(selector);
	if (elmts.length === 0) {
		console.error(`No elements found for selector: ${selector}`);
		return null;
	}
	let data;
	//console.log(elmts.length, elmts);
	for (const elmt of elmts) {
		switch (selectorType) {
			case "extTxt":
				data = elmt.textContent
					.replace("™", "")
					.trim()
					.toLowerCase()
					.replace(/^\W+|\W+$/g, "");
				break;
			case "extLnksTxt":
				data = [];
				const links = elmt.querySelectorAll("a");
				links.forEach((link) =>
					data.push(
						link.textContent
							.trim()
							.toLowerCase()
							.replace(/^\W+|\W+$/g, "")
					)
				);
				break;
			case "innerTextSplit":
				console.log("inner");
				data.push(elmt.innerText.split(", "));
				break;
			case "extTxtArrBySiblMch":
				data = [];
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
							const links = elmt.querySelectorAll("a");
							links.forEach((link) =>
								data.push(
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
				// Implement your array key matching logic here
				break;
			// Add more cases for other selector types as needed
		}
	}
	return data;
}