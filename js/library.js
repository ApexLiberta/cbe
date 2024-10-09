const gamePopup = document.getElementById("gamePopup");
const closeButton = document.querySelector(".close-button");

//document
//	.querySelector(".game-library")
//	.prepend(getShelf({ name: "col1", count: 3 }));

const sortByDropdown = document.querySelector(".sort-by-dropdown");

sortByDropdown.addEventListener("change", () => {
	const selectedValue = sortByDropdown.value;
	// Implement sorting logic based on the selected value
	console.log("Selected value:", selectedValue);
});

browser.runtime.sendMessage({ action: "getAllGames" }, (response) => {
	if (typeof response === "undefined") {
		console.error("Error: No response received from background script.");
		return;
	}
	if (response.error) {
		console.error("Error:", response.error);
	} else {
		console.log("Received games:", response);
		const gameList = document.getElementById("game-list");
		gameList.innerHTML = ""; // Clear existing games
		response.games.forEach((game) => {
			const gameItem = document.createElement("div");
			gameItem.classList.add("game-item");
			gameItem.innerHTML = `
				<h3 class='name'>${game.name}</h3>
				<p class='source'>${game.source}</p>
				<button class="edit_lib_entry">Edit</button>
			`;
			gameList.appendChild(gameItem);
		});

		const gameItems = document.querySelectorAll(".game-item");
		gameItems.forEach((item) => {
			item.addEventListener("click", async () => {
				try {
					const gameName = item.querySelector("h3").innerText;
					fetchGameData(gameName)
						.then((gameInfo) => {
							//console.log("Received game:", gameInfo);
							gamePopup.style.display = "block";
							const pcd = document.querySelector("#gamePopup .popup-content");
							pcd.innerHTML = "";

							for (const fd in gameInfo) {
								if (fd !== "id") {
									if (fd === "genres" || fd === "features" || fd === "tags") {
										const fdd = document.createElement("div");
										fdd.classList.add(`fd-${fd}`);
										gameInfo[fd].forEach((element) => {
											createAndAppendSpan(fdd, element);
										});
										pcd.append(fdd);
									} else {
										createAndAppendSpan(pcd, gameInfo[fd], `fd-${fd}`);
									}
								}
							}
						})
						.catch((error) => {
							console.error("Error fetching game data:", error);
						});
				} catch (error) {
					console.error("Error fetching game data:", error);
				}
			});
		});
	}
});
function createAndAppendSpan(parent, text, className) {
	const span = document.createElement("span");
	span.innerText = text;
	if (className) {
		span.classList.add(className);
	}
	parent.append(span);
}

function fetchGameData(game) {
	return new Promise((resolve, reject) => {
		// Create a Promise
		browser.runtime.sendMessage(
			{ action: "getGame", name: game },
			(response) => {
				if (response.error) {
					reject(response.error);
				} else {
					resolve(response);
				}
			}
		);
	});
}

closeButton.addEventListener("click", () => {
	gamePopup.style.display = "none";
});

window.addEventListener("click", (event) => {
	if (event.target === gamePopup) {
		gamePopup.style.display = "none";
	}
});

function getShelf(shelf) {
	// Create the container element
	const contDiv = document.createElement("div");
	contDiv.classList.add("shelf"); // Apply the 'shelf' class for styling

	// Create the shelf header using template literals for cleaner HTML structure
	const headerTemplate = `
    <div class="shelf-header">
      <div class="select-shelf">
        <button class="select-shelf-btn">
          <span class="name">${shelf.name}</span>
          <span class="count">( ${shelf.count} )</span>
        </button>
      </div>
      <div class="sort-cont">
        <span class="name">sort by</span>
        <button class="select-sort">
          alphabetical
        </button>
      </div>
	  <select class="sort-by-dropdown">
                            <option value="alphabetical">Alphabetical</option>
                        </select>
    </div>
  `;

	// Set the HTML content of the container using the template literal
	contDiv.innerHTML = headerTemplate;

	// Return the complete shelf element
	return contDiv;
}
