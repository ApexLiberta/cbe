browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "openNewTab") {
		const anchor = document.createElement("a");
		anchor.href = request.url;
		anchor.click();
	}
});

console.log('scp')


function steam() {
	console.log("steam Linked");
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
		title: titleElement?.textContent || "Title not found",
		description: descriptionElement?.innerText || "Description not found",
		"release date": releaseDateElement?.textContent || "Release Date not found",
		developers: [],
		publishers: [],
		tags: tagsArray,
	};

	for (const devRow of devRowElements) {
		const devRowType = devRow
			.querySelector(".subtitle.column")
			.textContent.trim();
		const contentElements = devRow.querySelectorAll(".summary.column a");
		const content = Array.from(contentElements).map((el) => el.textContent);

		if (devRowType === "Developer:") {
			info.developers.push(content);
		} else if (devRowType === "Publisher:") {
			info.publishers.push(content);
		} else {
			console.warn("Unexpected content type found in dev_row:", devRowType);
		}
	}

	return info;
}

function epic() {
	console.log("Epic Linked", details);
	const titleElement = document.querySelector("h1");
	const ele = document.querySelectorAll(".css-8f0505");
	const info = {
		title: titleElement?.textContent || "Title not found",
		genres: [],
		features: [],
		developer: "",
		publisher: "",
		releaseDate: "",
	};
	for (const sec of ele) {
		const contentElements = sec.querySelectorAll("a");
		const content = Array.from(contentElements).map((el) => el.textContent);
		if (sec.querySelector("p").innerText == "Genres") {
			info.genres.push(content);
		} else {
			info.features.push(content);
		}
	}
	const dataArray = Array.from(
		document.querySelectorAll(".css-1ofqig9 .css-s97i32")
	);
	const categories = ["Developer", "Publisher", "Release Date"];

	categories.forEach((category) => {
		const hasSpan = dataArray.some((element) => {
			const span = element.querySelector(
				".eds_1ypbntd0.eds_1ypbntdc.eds_1ypbntdk.css-1247nep"
			);
			if (span.textContent.trim() === category) {
				const value = element.querySelector(".css-btns76").textContent.trim();
				switch (category) {
					case "Developer":
						info.developer = value;
						break;
					case "Publisher":
						info.publisher = value;
						break;
					case "Release Date":
						info.releaseDate = value;
						break;
				}
			}
		});
	});
	return info;
}

