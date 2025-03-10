export const configPropertyHtml = (type) => {
	const wrapper = document.createElement("div");

	switch (type) {
		case "toggle":
			const toggle = document.createElement("input");
			toggle.type = "checkbox";
			wrapper.appendChild(toggle);
			break;
		case "list":
			const list = document.createElement("ol");
			wrapper.appendChild(list);
			break;
		case "link":
			const group = document.createElement("div");
			group.classList.add("setting-group");
			wrapper.appendChild(group);
			break;
		default:
			console.warn(`Unknown setting type: ${type}`);
	}
};

export const asideTemplate = () => {
	const aside = document.createElement("aside");
	aside.classList.add("library-sidebar");

	const asideHeader = document.createElement("div");
	asideHeader.classList.add("aside-header", "sidebar-header");
	asideHeader.innerHTML = `
        <button id="library-home-btn" class="page-mgr-btn" data-page='library'>Home</button>
        <button class="page-mgr-btn library-collection-icon-btn"  data-page='collections'>
            <i class="fa-solid fa-object-group"></i>
        </button>
    `;

	const searchTag = document.createElement("input");
	searchTag.type = "text";
	searchTag.classList.add("search-input");
	searchTag.placeholder = "Search by Name";

	const searchIconBtn = document.createElement("button");
	searchIconBtn.classList.add("search-icon");
	searchIconBtn.innerHTML = `<i class="fas fa-search"></i>`;

	const cancleSearchBtn = document.createElement("button");
	cancleSearchBtn.classList.add("cancel-search-btn");
	cancleSearchBtn.innerHTML = `<i class="fas fa-times"></i>`;

	const searchSettingsBtn = document.createElement("button");
	searchSettingsBtn.classList.add("search-settings-btn");
	searchSettingsBtn.innerHTML = `<i class="fa-solid fa-wand-sparkles"></i>`;
	//searchSettingsBtn.innerHTML = `<i class="fas fa-cog"></i>`;

	const searchbar = document.createElement("div");
	searchbar.classList.add("search-bar");
	searchbar.append(searchIconBtn, searchTag, cancleSearchBtn);

	const searchCont = document.createElement("div");
	searchCont.classList.add("search-cont", "flex-row");
	searchCont.append(searchbar, searchSettingsBtn);

	const collectionCont = document.createElement("div");
	collectionCont.classList.add("collections-cont");

	aside.append(asideHeader, searchCont, collectionCont);
	return aside;
};

export function getWhatsNew() {
	const contDiv = document.createElement("div");
	contDiv.classList.add("new-feed");
	const headerTemplate = `
		<div class="feed-header">
			<h3>what's new <span>&#9881;</span></h3>
		</div>
		<div class="feed-carausel">
			<div class="card-cont">
				<div class="cont-header">
					<span class="icon"></span>
					<span class="name">warframe</span>
					<span class="date">this week</span>
				</div>
				<div class="card"></div>
				<div class="title">Transcend the Otherworld in the Astral Anomaly Event</div>
			</div>
			<div class="card-cont">
				<div class="cont-header">
					<span class="icon"></span>
					<span class="name">finals</span>
					<span class="date">this week</span>
				</div>
				<div class="card"></div>
				<div class="title">world Tour ISEUL-T cup strike A Pose!</div>
			</div>
		</div>
	`;
	contDiv.innerHTML = headerTemplate;
	return contDiv;
}

export const shelfTemplate = (shelf, collections) => {
	return `
        <div class="shelfs-header">
            <button id="addShelfBtn" class="add-shelf">Add shelf</button>
            <div class="shelf-banner">
				${getShelHeaderfHtml(shelf, collections).outerHTML}
				<div class="shelf-panel">
					<div class="shelf-arrow"></div>
					<p class="shelf-text">
						Choose what to display on this shelf. You can change or delete the shelf from here too!
					</p>
				</div>
			</div>
        </div>
        <div class="shelfs-cont">
        </div>
    `;
};

function getShelHeaderfHtml(shelf, collections) {
	const wrapper = document.createElement("div");
	wrapper.classList.add("shelf-top");
	wrapper.innerHTML = `
        <div class="select-shelf">
            <div class="shelf-options">
                <div id="collOptsGrp" class="options-group"></div>
                <div id="default-options" class="options-group"></div>
                <div class="options-group">
                    <button id="deleteShelfBtn" class="option-btn"><span class="name">delete this shelf</span></button>
                </div>
            </div>
        </div>
    `;
	const selectShelfDiv = wrapper.querySelector(".select-shelf");
	if (shelf.variation === "add") {
		selectShelfDiv.insertAdjacentHTML(
			"afterbegin",
			`
				<button class="select-shelf-btn">
					<span class="name">choose a shelf</span>
					<span class="icon"><i class="fa-solid fa-chevron-down"></i></span>
				</button>
			`
		);
	} else {
		selectShelfDiv.insertAdjacentHTML(
			"afterbegin",
			`
				<button class="select-shelf-btn">
					<span class="name">${shelf.name}</span>
					<span class="count">( ${shelf.count} )</span>
				</button>
			`
		);
	}
	if (shelf.type === "collection") {
		wrapper.innerHTML += `
            <div class="sort-cont">
				<span class="name">sort by</span>
			</div>
			<div class="select-sort">
				<button class="sort-by-dropdown">
					<span class="name">Alphabetical</span>
				</button>
				<div class="sort-options"></div>
			</div>
        `;
		const sortOptions = wrapper.querySelector(".sort-options");
		const sortArr = [
			"Alphabetical",
			"Release Date",
			"Date Added to Library",
			"Metacritic Score",
		];
		sortArr.forEach((sort) => {
			const optionBtn = document.createElement("button");
			optionBtn.classList.add("option-btn");
			const btnSpan = document.createElement("span");
			btnSpan.classList.add("name");
			btnSpan.textContent = sort;
			optionBtn.appendChild(btnSpan);
			sortOptions.appendChild(optionBtn);
		});
	}
	const collOptsGrp = wrapper.querySelector("#collOptsGrp");

	collections.forEach((collection) => {
		if (
			collection.name !== "uncategorized" &&
			collection.name !== "favorites"
		) {
			const optionBtn = document.createElement("button");
			optionBtn.classList.add("option-btn");
			const btnSpan = document.createElement("span");
			btnSpan.classList.add("name");
			btnSpan.textContent = collection.name;
			optionBtn.appendChild(btnSpan);
			collOptsGrp.appendChild(optionBtn);
		}
	});
	const defaultOptions = wrapper.querySelector("#default-options");
	const defaultShelfOptions = [
		"uncategorized",
		"all",
		"recently added",
		"collections view",
	];
	defaultShelfOptions.forEach((option) => {
		const optionBtn = document.createElement("button");
		optionBtn.classList.add("option-btn");
		const btnSpan = document.createElement("span");
		btnSpan.classList.add("name");
		btnSpan.textContent = option;
		optionBtn.appendChild(btnSpan);
		defaultOptions.appendChild(optionBtn);
	});
	return wrapper;
}

export function getShelfHtml(shelf, collections) {
	console.log("shelf", shelf);
	const shelfDiv = document.createElement("div");
	if (shelf.variation === "add") {
		shelfDiv.prepend(getShelHeaderfHtml({ variation: "add", type: "add" }, collections));
	} else {
		shelfDiv.classList.add("shelf-cont", "shelf");
		shelf.variation = "shelf";
		shelfDiv.append(getShelHeaderfHtml(shelf, collections));
	}
	const options = shelfDiv.querySelector(".shelf-options");
	const shelfsOptions = shelfDiv.querySelector(".shelf-options");
	const optionsGroupBtns = shelfDiv.querySelectorAll("button.option-btn");
	shelfDiv.querySelector(".select-shelf-btn").addEventListener("click", () => {
		options.classList.toggle("active");
		hideAllDropdowns();
	});
	const sortOptions = shelfDiv.querySelector(".sort-options");
	optionsGroupBtns.forEach((element) => {
		element.addEventListener("click", () => {
			hideAllDropdowns();
			options.classList.toggle("active");
			const selectedOption = element.textContent.toLowerCase();
			if (
				selectedOption === "uncategorized" ||
				selectedOption === "all" ||
				selectedOption === "recently added" ||
				selectedOption === "collections view"
			) {
				const messageData = {
					name: selectedOption,
					category: "default",
				};
				if (selectedOption === "collections view") {
					messageData.type = "collections";
				} else if (selectedOption === "recently added") {
					messageData.type = "timeline";
				} else if (
					selectedOption === "all" ||
					selectedOption === "uncategorized"
				) {
					messageData.type = "collection";
				}
				browser.runtime.sendMessage(
					{
						action: "addShelf",
						data: messageData,
					},
					(response) => {
						if (response && response.success) {
							//loadShelves();
							console.log("shelf added", response);
							const addedShelf = response.shelf;
							const addedShelfHtml = getShelfHtml(addedShelf, collections);
							shelfDiv.replaceWith(addedShelfHtml);
						}
					}
				);
			} else if (selectedOption === "delete this shelf") {
				document.querySelector(".add-shelf").disabled = false;
				document.querySelector(".shelf-panel").classList.toggle("active");
			}
		});
	});
	const sortByDropdown = shelfDiv.querySelector(".sort-by-dropdown");
	if (sortByDropdown) {
		sortByDropdown.addEventListener("click", () => {
			sortOptions.classList.toggle("active");
		});
	}
	return shelfDiv;
}

export function hideAllDropdowns() {
	const allDropdowns = document.querySelectorAll(".dropdown");
	allDropdowns.forEach((dd) => {
		console.log(dd);
	});
	console.log("hede all dropdowns");
}
