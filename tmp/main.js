const indexedDB =
	window.indexedDB ||
	window.mozIndexedDB ||
	window.webkitIndexedDB ||
	window.msIndexedDB ||
	window.shimIndexedDB;

if (!indexedDB) {
	console.log("IndexedDB could not be found in this browser.");
}


let db;

let librariesArray = [
	{
		name: "games",
		indexes: [
			{
				name: "name",
				unique: true,
			},
			{
				name: "description",
				unique: false,
			},
			{
				name: "platform",
				unique: false,
			},
			{
				name: "developers",
				unique: false,
			},
			{
				name: "publishers",
				unique: false,
			},
			{
				name: "categories",
				unique: false,
			},
			{
				name: "genres",
				unique: false,
			},
			{
				name: "features",
				unique: false,
			},
			{
				name: "tags",
				unique: false,
			},
			{
				name: "releaseDate",
				unique: false,
			},
			{
				name: "series",
				unique: false,
			},
			{
				name: "ageRating",
				unique: false,
			},
			{
				name: "region",
				unique: false,
			},
			{
				name: "source",
				unique: false,
			},
			{
				name: "completionStatus",
				unique: false,
			},
			{
				name: "userScore",
				unique: false,
			},
			{
				name: "criticScore",
				unique: false,
			},
			{
				name: "communityScore",
				unique: false,
			},
		],
	},
	{
		name: "comics",
		indexes: [

		]
	}
];
const gamesStore = "games";
const objectStoreName = gamesStore;

const request = indexedDB.open("libraries", 1);

request.onupgradeneeded = (event) => {
	const db = event.target.result;

	for (const library of librariesArray) {
		const store = db.createObjectStore(library.name, {
			keyPath: "id",
			autoIncrement: true,
		});

		for (const index of library.indexes) {
			store.createIndex(index.name, index.name, { unique: index.unique });
		}
	}
};


const addStoreBtn = document.getElementById("addStoreBtn");
const libraryForm = document.getElementById("libraryForm");
const libraryFieldsContainer = document.getElementById("libraryFields");

addStoreBtn.addEventListener("click", () => {
	if(addStoreBtn.classList.contains("visible")){
		libraryForm.style.display = "none";
		addStoreBtn.classList.toggle('visible')
		libraryFieldsContainer.innerHTML = ''

	} else{
		libraryForm.style.display = "block";
		addStoreBtn.classList.toggle('visible')
		librariesArray.forEach(createLibraryFields);
	}

});


function createLibraryFields(library) {
	const librarySection = document.createElement("div");
	librarySection.innerHTML = `<h2>${library.name}</h2>`;

	library.indexes.forEach((index) => {
		const inputField = document.createElement("input");
		inputField.type = "text";
		inputField.name = `${library.name}_${index.name}`;
		inputField.placeholder = index.name;

		if (index.unique) {
			inputField.classList.add("unique-field"); // For styling or validation
		}

		librarySection.appendChild(inputField);
	});

	libraryFieldsContainer.appendChild(librarySection);
}



const librariesCont = document.createElement("div");
librariesCont.classList.add("libraries-cont");

// Assuming you have a function `getAllLibraries` to fetch data from IndexedDB
getAllLibraries().then((libraries) => {
	libraries.forEach((library) => {
		// Create a new div for each library
		const libraryDiv = document.createElement("div");
		libraryDiv.classList.add("library");

		// Populate the library div with data from the IndexedDB object
		// For example:
		libraryDiv.innerHTML = `
      <h2>${library.name}</h2>
      <p>Description: ${library.description}</p>
      `;

		librariesCont.appendChild(libraryDiv);
	});

	document.body.appendChild(librariesCont); // Append the libraries container to the body
});


browser.storage.local.get("indexedDBNames", (result) => {
	if (result.indexedDBNames) {
		const indexedDBNames = result.indexedDBNames;
		indexedDBNames.forEach((dbName) => {
			const liTag = document.createElement("li");
			liTag.innerText = dbName;
			sourceList.append(liTag);
		});
	}
});
