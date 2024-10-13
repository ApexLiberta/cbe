import { sortObjectKeys, findDifferences } from "./../helpers.js";

const gamesDb = {
	name: "games",
	version: 1,
}
const comicsDb = {
	name: "games",
	version: 1,
};

//const dbName = "connect";
const dbName = "library";
const dbVersion = 1;

let db;
const gamesStore = "games";
const objectStoreName = gamesStore;

const sourcesStore = "sources"

function openDB() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(gamesDb.name, gamesDb.version);

		request.onupgradeneeded = (event) => {
			const db = event.target.result;

			// Assuming you have a database object named `db` and a store name `gamesStore`
			if (!db.objectStoreNames.contains(gamesStore)) {
				const store = db.createObjectStore(gamesStore, {
					keyPath: "id",
					autoIncrement: true,
				});
				store.createIndex("name", "name", { unique: true });
				store.createIndex("description", "description", { unique: false });
				store.createIndex("platform", "platform", { unique: false });
				store.createIndex("developers", "developers", { unique: false });
				store.createIndex("publishers", "publishers", { unique: false });
				store.createIndex("categories", "categories", { unique: false });
				store.createIndex("genres", "genres", { unique: false });
				store.createIndex("features", "features", { unique: false });
				store.createIndex("tags", "tags", { unique: false });
				store.createIndex("releaseDate", "releaseDate", { unique: false });
				store.createIndex("series", "series", { unique: false });
				store.createIndex("ageRating", "ageRating", { unique: false });
				store.createIndex("region", "region", { unique: false });
				store.createIndex("source", "source", { unique: false });
				store.createIndex("completionStatus", "completionStatus", {
					unique: false,
				});
				store.createIndex("userScore", "userScore", { unique: false });
				store.createIndex("criticScore", "criticScore", { unique: false });
				store.createIndex("communityScore", "communityScore", {
					unique: false,
				});
			}
			// Create sourcesStore with relevant keyPath
			if (!db.objectStoreNames.contains(sourcesStore)) {
				const store = db.createObjectStore(sourcesStore, {
					keyPath: "id", // Define a unique key path for sources
					autoIncrement: true, // Optional: automatically generate IDs
				});
			}
		};

		request.onsuccess = (event) => {
			db = event.target.result;
			resolve(db);
		};

		request.onerror = (event) => {
			reject(event.target.error);
		};
	});
}

// Adding a Game
const addGame = async (game) => {
	game = sortObjectKeys(game)
	console.log('sorted', game)
	try {
		const db = await openDB();
		const tx = db.transaction(objectStoreName, "readwrite");
		const store = tx.objectStore(objectStoreName);
		const index = store.index("name");
		const request = index.getAll(game.name);
		const result = await new Promise((resolve, reject) => {
			request.onsuccess = (event) => resolve(event.target.result);
			request.onerror = (event) => reject(event.target.error);
		});
		if (result.length <= 0) {
			try {
				await store.put({ ...game });
				console.log("Game added successfully");
			} catch (error) {
				console.error("Error adding game:", error);
				// Handle add error (e.g., reject a promise)
			}
		} else {
			const updatedGame = { ...result[0], ...game };
			console.log(findDifferences(game, result[0]));
			for (const key in game) {
				console.log(key)
			}
			try {
				await store.put(sortObjectKeys(updatedGame));
				console.log("Game updated successfully");
			} catch (error) {
				console.error("Error updating game:", error);
				// Handle update error (e.g., reject a promise)
			}
		}

		return tx.complete;
	} catch (error) {
		console.error("Error adding game:", error); // Handle overall error (e.g., reject a promise)
	}
};

const getGame = async (name) => {
	try {
		const db = await openDB();
		const tx = db.transaction(objectStoreName, "readonly");
		const store = tx.objectStore(objectStoreName);
		const index = store.index("name"); // Assuming the index exists

		const request = index.get(name);
		const result = await new Promise((resolve, reject) => {
			request.onsuccess = (event) => resolve(event.target.result);
			request.onerror = (event) => reject(event.target.error);
		});

		return result;
	} catch (error) {
		console.error("Error getting game by name:", error);
		// Handle error (e.g., return null or throw an exception)
	}
};
// Get all games from the IndexedDB database
const getAllGames = async () => {
	try {
		const db = await openDB();
		const tx = db.transaction(objectStoreName, "readonly");
		const store = tx.objectStore(objectStoreName);

		const request = store.getAll();
		console.log(request)
		return new Promise((resolve, reject) => {
			request.onsuccess = (event) => {
				resolve(event.target.result);
			};
			request.onerror = (event) => {
				reject(event.target.error);
			};
		});
	} catch (error) {
		console.error("Error getting games:", error);
	}
};

// Get the total number of games in the database
const getTotalGames = async () => {
	try {
		const db = await openDB();
		const tx = db.transaction(objectStoreName, "readonly");
		const store = tx.objectStore(objectStoreName);

		const request = store.getAll();
		return new Promise((resolve, reject) => {
			request.onsuccess = (event) => {
				resolve(event.target.result.length);
			};
			request.onerror = (event) => {
				reject(event.target.error);
			};
		});
	} catch (error) {
		console.error("Error getting total games:", error);
	}
};
// Implement other database operations like getGames, updateGame, deleteGame, etc.
function exportIndexedDB() {
	const dbName = "myDatabase"; // Replace with your database name
	const storeName = "myStore"; // Replace with your object store name

	const request = indexedDB.open(dbName);

	request.onerror = function (event) {
		console.error("Error opening database:", event.target.error);
	};

	request.onsuccess = function (event) {
		const db = event.target.result;
		const transaction = db.transaction(storeName, "readonly");
		const store = transaction.objectStore(storeName);
		const cursorRequest = store.openCursor();

		cursorRequest.onerror = function (event) {
			console.error("Error opening cursor:", event.target.error);
		};

		cursorRequest.onsuccess = function (event) {
			const cursor = event.target.result;
			if (cursor) {
				const data = cursor.value;
				// Convert data to JSON
				const jsonData = JSON.stringify(data);

				// Save the JSON file
				const blob = new Blob([jsonData], { type: "application/json" });
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = "indexeddb_export.json";
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);

				cursor.continue();
			} else {
				console.log("Export complete");
			}
		};
	};
}







export { openDB, addGame, getAllGames, getGame, exportIndexedDB };
