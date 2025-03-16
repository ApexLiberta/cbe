import { hideAllDropdowns } from "./../index.js";

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

function createOptionButton(text) {
	const optionBtn = document.createElement("button");
	optionBtn.classList.add("option-btn");
	const btnSpan = document.createElement("span");
	btnSpan.classList.add("name");
	btnSpan.textContent = text;
	optionBtn.appendChild(btnSpan);
	return optionBtn;
}

function getShelHeaderfHtml(shelf, collections) {
	const wrapper = document.createElement("div");
	wrapper.classList.add("shelf-top");

	let selectShelfContent = "";
	if (shelf.variation === "add") {
		selectShelfContent = `
            <button class="select-shelf-btn">
                <span class="name">choose a shelf</span>
                <span class="icon"><i class="fa-solid fa-chevron-down"></i></span>
            </button>
        `;
	} else {
		selectShelfContent = `
            <button class="select-shelf-btn">
                <span class="name">${shelf.name}</span>
                ${
					shelf.type === "collection"
						? `<span class="count">( ${shelf.count} )</span>`
						: ""
				}
            </button>
        `;
	}

	let sortContent = "";
	if (shelf.type === "collection") {
		sortContent = `
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
	}

	wrapper.innerHTML = `
        <div class="select-shelf dropdown">
            ${selectShelfContent}
            <div class="shelf-options dropdown-menu">
                <div id="collOptsGrp" class="options-group"></div>
                <div id="default-options" class="options-group"></div>
                <div class="options-group">
                    <button id="deleteShelfBtn" class="option-btn"><span class="name">delete this shelf</span></button>
                </div>
            </div>
        </div>
        ${sortContent}
    `;

	const collOptsGrp = wrapper.querySelector("#collOptsGrp");
	collections.forEach((collection) => {
		if (
			collection.name !== "uncategorized" &&
			collection.name !== "favorites"
		) {
			collOptsGrp.appendChild(createOptionButton(collection.name));
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
		defaultOptions.appendChild(createOptionButton(option));
	});

	const sortOptions = wrapper.querySelector(".sort-options");
	if (sortOptions) {
		const sortArr = [
			"Alphabetical",
			"Release Date",
			"Date Added to Library",
			"Metacritic Score",
		];
		sortArr.forEach((sort) => {
			sortOptions.appendChild(createOptionButton(sort));
		});
	}

	return wrapper;
}

export function getShelfHtml(shelf, collections) {
	const shelfDiv = document.createElement("div");
	if (shelf.variation === "add") {
		shelfDiv.prepend(
			getShelHeaderfHtml({ variation: "add", type: "add" }, collections)
		);
	} else {
		shelfDiv.classList.add("shelf-cont", "shelf");
		shelf.variation = "shelf";
		shelfDiv.append(getShelHeaderfHtml(shelf, collections));
	}

	const options = shelfDiv.querySelector(".shelf-options");
	const selectShelfBtn = shelfDiv.querySelector(".select-shelf-btn");
	const sortOptions = shelfDiv.querySelector(".sort-options");

	selectShelfBtn.addEventListener("click", () => {
		hideAllDropdowns();
		options.classList.toggle("active");
	});

	options.addEventListener("click", (event) => {
		const target = event.target.closest(".option-btn");
		if (!target) return;

		hideAllDropdowns();
		options.classList.remove("active");
		const selectedOption = target.textContent.toLowerCase();

		if (
			["uncategorized", "all", "recently added", "collections view"].includes(
				selectedOption
			)
		) {
			const newShelf = document.createElement("div");
			newShelf.classList.add("shelf");
			newShelf.append(getShelHeaderfHtml(shelf, collections));
			shelfDiv.replaceWith(newShelf);
		} else if (selectedOption === "delete this shelf") {
			document.querySelector(".add-shelf").disabled = false;
			document.querySelector(".shelf-panel").classList.toggle("active");
			browser.runtime.sendMessage(
				{ action: "deleteShelf", id: shelf.id },
				(response) => {
					if (response && response.success) {
						shelfDiv.remove();
					} else {
						console.error("Failed to delete shelf:", response);
					}
				}
			);
		} else {
			console.log("selectedOption", selectedOption);
		}
	});

	const sortByDropdown = shelfDiv.querySelector(".sort-by-dropdown");
	if (sortByDropdown) {
		sortByDropdown.addEventListener("click", () => {
			sortOptions.classList.toggle("active");
		});
	}

	return shelfDiv;
}



export function getDropdownHtml({ buttonText, options }) {
	const dropdownWrapper = document.createElement("div");
	dropdownWrapper.classList.add("dropdown-wrapper");

	const dropdownButton = document.createElement("button");
	dropdownButton.classList.add("dropdown-button");
	dropdownButton.textContent = buttonText;
	dropdownWrapper.appendChild(dropdownButton);

	const dropdownMenu = document.createElement("div");
	dropdownMenu.classList.add("dropdown-menu");

	options.forEach((option) => {
		const optionButton = document.createElement("button");
		optionButton.classList.add("dropdown-option");
		optionButton.textContent = option;
		dropdownMenu.appendChild(optionButton);
	});

	dropdownWrapper.appendChild(dropdownMenu);

	dropdownButton.addEventListener("click", () => {
		dropdownMenu.classList.toggle("active");
	});

	return dropdownWrapper;
}

export function getLabeledDropdownHtml({ label, buttonText, options }) {
	const dropdownWrapper = getDropdownHtml({ buttonText, options });

	const dropdownLabel = document.createElement("span");
	dropdownLabel.classList.add("dropdown-label");
	dropdownLabel.textContent = label;

	dropdownWrapper.classList.add("labeled-dropdown");
	dropdownWrapper.prepend(dropdownLabel);

	return dropdownWrapper;
}