browser.pageAction.onClicked.addListener(handleClick);

function handleClick(tab) {
	console.log("Page action button clicked on tab:", tab);

	browser.tabs.sendMessage(tab.id, {
		action: "openNewTab",
		url: "playnite://playnite/installaddon/Steam_Tags_Importer_01b67948-33a1-42d5-bd39-e4e8a226d215",
	});
}

