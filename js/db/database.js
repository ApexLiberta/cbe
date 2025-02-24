import { sortObjectKeys, findDifferences } from "../extension/modules/helpers.js";

const RECORDS_STORE = "records";
const COLLECTIONS_STORE = "collections";
const SOURCES_STORE = "sources";
const SHELFS_STORE = "shelfs";
const FILTERS_STORE = "shelfs";

const NAME_INDEX = "name";
const DESCRIPTION_INDEX = "description";


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



async function getAllIndexedDBs() {
	try {
		const dbs = await indexedDB.databases();
		//console.log("IndexedDB Databases:", dbs);
		return dbs;
	} catch (error) {
		console.error("Error getting IndexedDB databases:", error);
		return [];
	}
}


//getAllIndexedDBs().then((databaseNames) => {
//	console.log("IndexedDB Databases:", databaseNames);
//	if (databaseNames.length > 0) {
//		// Do something with the database names, e.g.,
//		databaseNames.forEach((dbName) => {
//			console.log("Found DB:", dbName);
//		});
//		//if (dbs.some((db) => db.name === "mangas")) {
//		//	indexedDB.deleteDatabase("mangas");
//		//	console.warn("mangas database exists");
//		//} else {
//		//	console.info("mangas database does not exist");
//		//}
//		//console.log("IndexedDB Databases:", dbs);
//	} else {
//		console.log("No IndexedDB databases found.");
//	}
//});
console.log("indexedDB")
export function indexedDBPromise(dbName, version, action) {
	return new Promise((resolve, reject) => {

		//if (!dbName || !version || !action) {
		//	const errorMessage =
		//		"Database name, version, and object store name are required.";
		//	console.error(errorMessage);
		//	reject(errorMessage);
		//	return;
		//}
		console.log(
			`Attempting to open database: ${dbName}, version: ${version}, objectStore: ${action.objectStoreName}`
		);

		const request = indexedDB.open(dbName, version ? version : 1);

		request.onerror = (event) => {
			console.error(`Error opening database ${dbName}:`, event.target.error);
			reject(event.target.error); // Reject the promise on error
		};
		request.onupgradeneeded = (event) => {
			const db = event.target.result;
			db.createObjectStore(action.objectStoreName, { keyPath: "id", autoIncrement: true });
		};
		request.onsuccess = (event) => resolve(event.target.result);
	});

}



function openDB() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(gamesDb.name, gamesDb.version);

		request.onupgradeneeded = (event) => {
			const db = event.target.result;
			console.log(db)

			// Assuming you have a database object named `db` and a store name `gamesStore`
			if (!db.objectStoreNames.contains(RECORDS_STORE)) {
				const store = db.createObjectStore(RECORDS_STORE, {
					keyPath: "id",
					autoIncrement: true,
				});
				store.createIndex("name", "name", { unique: true });
				store.createIndex("description", "description");
				store.createIndex("platform", "platform", { multiEntry: true, });
				store.createIndex("developers", "developers", { multiEntry: true, });
				store.createIndex("publishers", "publishers", { multiEntry: true, });
				store.createIndex("categories", "categories", { multiEntry: true, });
				store.createIndex("genres", "genres", { multiEntry: true, });
				store.createIndex("features", "features", { multiEntry: true, });
				store.createIndex("tags", "tags", { multiEntry: true });
				store.createIndex("releaseDate", "releaseDate");
				store.createIndex("series", "series");
				store.createIndex("ageRating", "ageRating");
				store.createIndex("region", "region");
				store.createIndex("source", "source", { multiEntry: true });
				store.createIndex("completionStatus", "completionStatus");
				store.createIndex("userScore", "userScore");
				store.createIndex("criticScore", "criticScore");
				store.createIndex("communityScore", "communityScore");
				store.createIndex("soundtracks", "soundtracks");
				store.createIndex("software", "software");
				store.createIndex("tools", "tools");
			}
			// Create sourcesStore with relevant keyPath
			if (!db.objectStoreNames.contains(SOURCES_STORE)) {
				const store = db.createObjectStore(SOURCES_STORE, {
					keyPath: "id", // Define a unique key path for sources
					autoIncrement: true, // Optional: automatically generate IDs
				});
				store.createIndex("name", "name", { unique: true });
				store.createIndex("version", "version");
				store.createIndex("matches", "matches");
				store.createIndex("selectors", "selectors");
			}
			if (!db.objectStoreNames.contains(COLLECTIONS_STORE)) {
				const store = db.createObjectStore(COLLECTIONS_STORE, {
					keyPath: "name",
				});
				store.createIndex("include_genres", "include_genres", {
					multiEntry: true,
				});
				store.createIndex("exclude_genres", "exclude_genres", {
					multiEntry: true,
				});
				store.createIndex("include_features", "include_features", {
					multiEntry: true,
				});
				store.createIndex("exclude_features", "exclude_features", {
					multiEntry: true,
				});
				store.createIndex("include_tags", "include_tags", {
					multiEntry: true,
				});
				store.createIndex("exclude_tags", "exclude_tags", {
					multiEntry: true,
				});
				store.createIndex("include_stores", "include_stores", {
					multiEntry: true,
				});
				store.createIndex("exclude_stores", "exclude_stores", {
					multiEntry: true,
				});
				store.createIndex("isDynamic", "isDynamic");
				store.createIndex("isHidden", "isHidden");
				store.createIndex("inSidebar", "inSidebar");
				store.createIndex("isPrivate", "isPrivate");
			}
			if (!db.objectStoreNames.contains(SHELFS_STORE)) {
				const store = db.createObjectStore(SHELFS_STORE, {
					keyPath: "id", // Define a unique key path for sources
					autoIncrement: true, // Optional: automatically generate IDs
				});
			}
			if (!db.objectStoreNames.contains(FILTERS_STORE)) {
				const store = db.createObjectStore(FILTERS_STORE, {
					keyPath: "id", // Define a unique key path for sources
					autoIncrement: true, // Optional: automatically generate IDs
				});
			}
		};

		request.onsuccess = (event) => {
			const db = event.target.result;
			db.onversionchange = () => {
				db.close();
				alert("Database is being upgraded. Please refresh.");
			};
			resolve(db);
		};

		request.onerror = (event) => {
			console.error("IndexedDB open error:", event.target.error);
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


// Sources
async function addOrUpdateSource(sourceData) {
	try {
		const db = await openDB();
		const transaction = db.transaction([SOURCES_STORE], "readwrite");
		const store = transaction.objectStore(SOURCES_STORE);

		// Check if a source with the same name and matches already exists
		const nameIndex = store.index("name");
		const nameRequest = nameIndex.get(sourceData.name);

		return new Promise((resolve, reject) => {
			nameRequest.onsuccess = async (event) => {
				const existingSourceByName = event.target.result;

				if (existingSourceByName) {
					const matchesIndex = store.index("matches");
					const matchesRequest = matchesIndex.get(sourceData.matches);

					matchesRequest.onsuccess = async (event2) => {
						const existingSourceByMatches = event2.target.result;
						if (
							existingSourceByMatches &&
							existingSourceByMatches.id === existingSourceByName.id
						) {
							// Source with same name and matches exists: UPDATE
							sourceData.id = existingSourceByName.id; // Preserve the existing ID
							const updateRequest = store.put(sourceData);

							updateRequest.onsuccess = () =>
								resolve({ action: "updated", id: existingSourceByName.id, source: sourceData });
							updateRequest.onerror = (event) =>
								reject("Error updating source: " + event.target.errorCode);
						} else {
							// Source with same name but different matches exists: Reject
							reject(
								"A source with the same name but different matches already exists."
							);
						}
					};
					matchesRequest.onerror = (event) =>
						reject(
							"Error checking source by matches: " + event.target.errorCode
						);
				} else {
					// No source with the same name exists: CREATE
					const addRequest = store.add(sourceData);
					addRequest.onsuccess = (event) =>
						resolve({ action: "created", id: event.target.result, source: sourceData });
					addRequest.onerror = (event) =>
						reject("Error adding source: " + event.target.errorCode);
				}
			};
			nameRequest.onerror = (event) =>
				reject("Error checking source by name: " + event.target.errorCode);
		});
	} catch (error) {
		console.error(error);
		throw error;
	}
}
async function deleteSource(name) {
	try {
		const db = await openDB();
		const transaction = db.transaction([SOURCES_STORE], "readwrite");
		const store = transaction.objectStore(SOURCES_STORE);
		const request = store.delete(name);

		return new Promise((resolve, reject) => {
			request.onsuccess = () => resolve();
			request.onerror = (event) =>
				reject("Error deleting source: " + event.target.errorCode);
		});
	} catch (error) {
		console.error(error);
		throw error;
	}
}

async function getSourceById(id) {}
async function getAllSources() {
	try {
		const db = await openDB();
		const transaction = db.transaction([SOURCES_STORE], "readonly");
		const store = transaction.objectStore(SOURCES_STORE);
		const request = store.getAll();

		return new Promise((resolve, reject) => {
			request.onsuccess = (event) => resolve(event.target.result);
			request.onerror = (event) =>
				reject("Error getting all sources: " + event.target.errorCode);
		});
	} catch (error) {
		console.error(error);
		throw error;
	}
}


//collection
async function addOrUpdateCollection(name, data) {
	return new Promise(async (resolve, reject) => {
		// Wrap the entire function in a Promise
		const db = await openDB();
		const tx = db.transaction(COLLECTIONS_STORE, "readwrite");
		const store = tx.objectStore(COLLECTIONS_STORE);

		try {
			const getItemRequest = store.get(name); // Get the IDBRequest directly

			getItemRequest.onsuccess = (event) => {
				// Attach handlers to the request
				let operation = "";
				let resultData = null;
				if (event.target.result) {
					operation = "updated";
					const updatedData = { ...event.target.result, ...data };
					const putRequest = store.put(updatedData); // Use putRequest for promise handling

					putRequest.onsuccess = (putEvent) => {
						console.group("existingItem - Updated");
						console.table(updatedData);
						console.groupEnd();
						resultData = updatedData; // Data after update
					};
					putRequest.onerror = (putEvent) => {
						operation = "error_updating";
						reject(putEvent.target.error); // Reject promise on error
					};
				} else {
					operation = "created";
					const newData = { name, ...data };
					const addRequest = store.add(newData); // Use addRequest for promise handling
					addRequest.onsuccess = (addEvent) => {
						operation = "created";
						resultData = newData; // Data after creation
					};
					addRequest.onerror = (addEvent) => {
						operation = "error_creating";
						reject(addEvent.target.error); // Reject promise on error
					};
				}

				tx.oncomplete = () => {
					// Wait for transaction to complete successfully
					db.close();
					resolve({
						// Resolve the promise with operation details
						opperation: operation,
						opperationStatus: true,
						collection: resultData, // Return the data (could be before or after operation depending on timing, adjust if needed more specific return data)
					});
				};
				tx.onerror = (event) => {
					db.close();
					reject(event.target.error); // Reject promise if transaction fails
				};
			};

			getItemRequest.onerror = (event) => {
				db.close();
				reject(event.target.error); // Reject promise if initial get fails
			};
		} catch (error) {
			db.close();
			console.error("Error in addOrUpdateCollection:", error);
			reject(error); // Reject promise if any other error occurs
		}
	});
}

async function getCollectionOrAll(name) {
	const db = await openDB();
	const transaction = db.transaction(COLLECTIONS_STORE, "readonly");
	const store = transaction.objectStore(COLLECTIONS_STORE);

	return new Promise((resolve, reject) => {
		let request;
		if (name) {
			// Check if a name is provided
			request = store.get(name);
		} else {
			request = store.getAll();
		}

		request.onsuccess = (event) => {
			console.group("Collection(s) retrieved:");
				console.table(event.target.result);
			console.groupEnd();
			resolve(event.target.result); // Resolve with the result (either a single collection or an array of collections)
		};

		request.onerror = (event) => {
			console.error("Error retrieving collection(s):", event.target.error);
			reject(event.target.error);
		};
	});
}
async function deleteCollection(collectionName) {
	const db = await openDB();
	const transaction = db.transaction(COLLECTIONS_STORE, "readwrite");
	const store = transaction.objectStore(COLLECTIONS_STORE);
	const deleteRequest = store.delete(collectionName);
	deleteRequest.onsuccess = (event) => {
		console.log("Collection deleted successfully:", event.target.result);
	};
	deleteRequest.onerror = (event) => {
		console.error("Error deleting collection:", event.target.error);
	};
	await transaction.complete;
}



export {
	openDB,
	addGame,
	getAllGames,
	getGame,
	exportIndexedDB,
	addOrUpdateSource,
	getSourceById,
	getAllSources,
	deleteSource,
	addOrUpdateCollection,
	getCollectionOrAll,
	deleteCollection,
	getAllIndexedDBs,
};
