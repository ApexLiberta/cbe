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

export function getShelfHtml(shelf) {
	const contDiv = document.createElement("div");
	contDiv.classList.add("shelf", "test");
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
		</div>
		<select class="sort-by-dropdown">
			<option value="alphabetical">Alphabetical</option>
			<option value="alphabetical">Alphabetical</option>
		</select>
		</div>
	`;
	contDiv.innerHTML = headerTemplate;
	return contDiv;
}

export function getShelfContainerHtml() {
	const contDiv = document.createElement("div");
	return contDiv;
}

export function getAddShelfHtml() {
	const contDiv = document.createElement("div");
	contDiv.classList.add("shelf-cont", "choose-collection");
	const innerHTMLVar = `
		<div class="shelf-header">
			<select class="sort-by-dropdown">
				<optgroup label="Select a Shelf" style="display: none;">
					<option value="">Choose a Shelf</option>
				</optgroup>
				<optgroup label="Collections">
					<option value="">Steam</option>
				</optgroup>
				<optgroup label="Game Shelves">
				<option value="uncategorized">Uncategorized</option>
				<option value="all-games">All Games</option>
				<option value="recent-games">Recent Games</option>
				<option value="collections">Collections View</option>
				<option value="play-next">Play Next</option>
				</optgroup>
				<optgroup label="Delete This Shelves">
					<option value="alphabetical">Delete this shelf</option>
				</optgroup>
			</select>
			<div class="shelf-sort">
				<span class="name">sort by</span>
				<select class="sort-by-dropdown">
					<option value="alphabetical">Alphabetical</option>
					<option value="alphabetical">Friends Playing</option>
					<option value="alphabetical">% of Achievements Complete</option>
					<option value="alphabetical">Hours Played</option>
					<option value="alphabetical">Last Played</option>
					<option value="alphabetical">Release Date</option>
					<option value="alphabetical">Date Added to Library</option>
					<option value="alphabetical">Size on Disk</option>
					<option value="alphabetical">Metacritic Score</option>
					<option value="alphabetical">Steam Review</option>
				</select>
			</div>
		</div>
		<div class="shelf-row">
		</div>
	`;
	contDiv.innerHTML = innerHTMLVar;
	return contDiv;
}