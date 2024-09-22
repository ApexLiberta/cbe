browser.pageAction.onClicked.addListener(handleClick);
function handleClick(tab) {
	console.log("Page action button clicked on tab:", tab);

	const url = tab.url;
	let gameInfo;

	const steamPattern =
		/^(https?:\/\/)?(www\.)?store\.steampowered\.com\/app\/\d+$/;
	const epicPattern = /^(https?:\/\/)?(www\.)?epicgames\.com\/en-US\/p\/\w+$/;
	if (url.includes("steampowered.com")) {
		gameInfo = steam();
	} else if (url.includes("epicgames.com")) {
		gameInfo = epic();
	} else {
		console.warn("Unsupported website. Game info not extracted.");
		return;
	}
	console.log(gameInfo);
	browser.tabs.sendMessage(tab.id, {
		action: "openNewTab",
		url: "playnite://addgame/" + JSON.stringify(gameInfo),
	});
}
