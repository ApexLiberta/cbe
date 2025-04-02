import {
	sortObjectKeys,
	findDifferences,
} from "../modules/helpers.js";

const STORE_RECORDS = "records";
const STORE_COLLECTIONS = "collections";
const STORE_SOURCES = "sources";
const STORE_SHELFS = "shelfs";
const STORE_FILTERS = "filters";
const GENRES_STORE = "genres";
const TAGS_STORE = "tags";
const FEATURES_STORE = "features";


const NAME_INDEX = "name";
const DESCRIPTION_INDEX = "description";

const gamesDb = {
	name: "games",
	version: 1,
};
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
console.log("indexedDB");
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
			db.createObjectStore(action.objectStoreName, {
				keyPath: "id",
				autoIncrement: true,
			});
		};
		request.onsuccess = (event) => resolve(event.target.result);
	});
}

function openDB() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(gamesDb.name, gamesDb.version);

		request.onupgradeneeded = (event) => {
			const db = event.target.result;
			console.log(db);

			// Assuming you have a database object named `db` and a store name `gamesStore`
			if (!db.objectStoreNames.contains(STORE_RECORDS)) {
				const store = db.createObjectStore(STORE_RECORDS, {
					keyPath: "id",
					autoIncrement: true,
				});
				store.createIndex("name", "name", { unique: true });
				store.createIndex("description", "description");
				store.createIndex("platform", "platform", { multiEntry: true });
				store.createIndex("developers", "developers", { multiEntry: true });
				store.createIndex("publishers", "publishers", { multiEntry: true });
				store.createIndex("categories", "categories", { multiEntry: true });
				store.createIndex("collections", "collections", { multiEntry: true });
				store.createIndex("genre", "genre");
				store.createIndex("genres", "genres", { multiEntry: true });
				store.createIndex("subGenres", "subGenres", { multiEntry: true });
				store.createIndex("features", "features", { multiEntry: true });
				store.createIndex("tags", "tags", { multiEntry: true });
				store.createIndex("releaseDate", "releaseDate");
				store.createIndex("addedDate", "addedDate");
				store.createIndex("modifiedDate", "modifiedDate");
				store.createIndex("updatedDate", "updatedDate");
				store.createIndex("status", "status");
				store.createIndex("playedTime", "playedTime");
				store.createIndex("completionTime", "completionTime");
				store.createIndex("completionDate", "completionDate");
				store.createIndex("completionStatus", "completionStatus");
				store.createIndex("playedDate", "playedDate");
				store.createIndex("completedDate", "completedDate");
				store.createIndex("rating", "rating");
				store.createIndex("franchise", "franchise");
				store.createIndex("series", "series");
				store.createIndex("ageRating", "ageRating");
				store.createIndex("region", "region");
				store.createIndex("source", "source", { multiEntry: true });
				store.createIndex("userScore", "userScore");
				store.createIndex("criticScore", "criticScore");
				store.createIndex("communityScore", "communityScore");
				store.createIndex("soundtracks", "soundtracks");
				store.createIndex("software", "software");
				store.createIndex("tools", "tools");
			}

			// Create sourcesStore with relevant keyPath

			if (!db.objectStoreNames.contains(STORE_SOURCES)) {
				const store = db.createObjectStore(STORE_SOURCES, {
					keyPath: "id",
					autoIncrement: true,
				});
				store.createIndex("name", "name", { unique: true });
				store.createIndex("version", "version");
				store.createIndex("matches", "matches");
				store.createIndex("selectors", "selectors");
			}

			if (!db.objectStoreNames.contains(STORE_COLLECTIONS)) {
				const store = db.createObjectStore(STORE_COLLECTIONS, {
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
				store.createIndex("include_tags", "include_tags", { multiEntry: true });
				store.createIndex("exclude_tags", "exclude_tags", { multiEntry: true });
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
				store.createIndex("beShelfed", "beShelfed");
			}
			if (!db.objectStoreNames.contains(STORE_SHELFS)) {
				const store = db.createObjectStore(STORE_SHELFS, {
					keyPath: "id",
					autoIncrement: true,
				});
				store.createIndex("name", "name", { unique: false });
				store.createIndex("category", "category", { unique: false }); // categories -- collection, default
				store.createIndex("type", "type", { unique: false }); // types -- collection, collections, timeline
			}
			if (!db.objectStoreNames.contains(STORE_FILTERS)) {
				const store = db.createObjectStore(STORE_FILTERS, {
					keyPath: "id",
					autoIncrement: true,
				});
				store.createIndex("name", "name", { unique: false });
				store.createIndex("type", "type", { unique: false });
			}
			if(false){
				// Create genres object store
				if (!db.objectStoreNames.contains(GENRES_STORE)) {
					const genresStore = db.createObjectStore(GENRES_STORE, {
						keyPath: "value",
					}); // Key is the genre value
					genresStore.createIndex("value", "value", { unique: true }); // Ensure unique genres
				}

				// Create tags object store
				if (!db.objectStoreNames.contains(TAGS_STORE)) {
					const tagsStore = db.createObjectStore(TAGS_STORE, { keyPath: "value" }); // Key is the tag value
					tagsStore.createIndex("value", "value", { unique: true }); // Ensure unique tags
				}

				// Create features object store
				if (!db.objectStoreNames.contains(FEATURES_STORE)) {
					const featuresStore = db.createObjectStore(FEATURES_STORE, {
						keyPath: "value",
					}); // Key is the feature value
					featuresStore.createIndex("value", "value", { unique: true }); // Ensure unique features
				}
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
const addRecord = async (record) => {
	record = sortObjectKeys(record);
	console.log("sorted", record);
	try {
		const db = await openDB();
		const tx = db.transaction([STORE_RECORDS, STORE_FILTERS], "readwrite");
		const recordsStore = tx.objectStore(STORE_RECORDS);
		const filtersStore = tx.objectStore(STORE_FILTERS);

		getCollectionOrAll().then((collections) => {
			const dynamicCollections = collections.filter(
				(collection) => collection.isDynamic
			);
			console.log(collections, dynamicCollections);
		});

		console.log(filtersStore);
		const index = recordsStore.index("name");
		const request = index.getAll(record.name);
		const result = await new Promise((resolve, reject) => {
			request.onsuccess = (event) => resolve(event.target.result);
			request.onerror = (event) => reject(event.target.error);
		});
		if (result.length <= 0) {
			if (!record.collections || record.collections.length === 0) {
				record.collections = ["uncategorized"];
				addOrUpdateCollection("uncategorized", {
					inSidebar: true,
					isDynamic: false,
					records: [record.name],
				});
			}
			try {
				record.addedDate = new Date().toISOString();
				record.releaseDate = record.releaseDate
					? new Date(record.releaseDate).toISOString()
					: null;
				await recordsStore.put({ ...record });
				console.log("Game added successfully");
			} catch (error) {
				console.error("Error adding record:", error);
			}
		} else {
			const updatedGame = { ...result[0], ...record };
			if (!updatedGame.collections || updatedGame.collections.length === 0) {
				updatedGame.collections = ["uncategorized"];
				addOrUpdateCollection("uncategorized", {
					inSidebar: true,
					isDynamic: false,
					records: [record.name],
				});
			}
			console.log(findDifferences(record, result[0]));
			for (const key in record) {
				console.log(key);
			}
			try {
				await recordsStore.put(sortObjectKeys(updatedGame));
				console.log("Game updated successfully");
			} catch (error) {
				console.error("Error updating record:", error);
			}
		}

		// Add genres, tags, and features to filters
		const addToFilters = async (items, type) => {
			for (const item of items) {
				const index = filtersStore.index("name");
				const request = index.get(item);
				console.log("request", request);
				const result = await new Promise((resolve, reject) => {
					request.onsuccess = (event) => resolve(event.target.result);
					request.onerror = (event) => reject(event.target.error);
				});
				console.log(result);
				if (!result) {
					await filtersStore.add({ name: item, type });
				}
			}
		};

		const logFilters = async () => {
			const allFilters = await filtersStore.getAll();
			allFilters.onsuccess = (event) => {
				const filters = (event.target.result).sort((a, b) => a.name.localeCompare(b.name));
				const combinedItems = [
					...(record.genres || []),
					...(record.tags || []),
					...(record.features || []),
				];
				combinedItems.map((item) => item.name);
				const uniqueItems = [...new Set(combinedItems)];
				console.group("Filters");
				console.log("allFilters", event.target.result);
				console.log("allFilters", filters);
				console.log("combinedItems", combinedItems);
				console.log("uniqueItems", uniqueItems);
				console.groupEnd();
			}
		}
		logFilters();
		if (record.genres) {
			await addToFilters(record.genres, "genre");
		}
		if (record.tags) {
			await addToFilters(record.tags, "tag");
		}
		if (record.features) {
			await addToFilters(record.features, "feature");
		}

		return tx.complete;
	} catch (error) {
		console.error("Error adding record:", error);
	}
};

const getRecord = async (name) => {
	try {
		const db = await openDB();
		const tx = db.transaction(STORE_RECORDS, "readonly");
		const store = tx.objectStore(STORE_RECORDS);
		const index = store.index("name"); // Assuming the index exists

		const request = index.get(name);
		const result = await new Promise((resolve, reject) => {
			request.onsuccess = (event) => resolve(event.target.result);
			request.onerror = (event) => reject(event.target.error);
		});

		return result;
	} catch (error) {
		console.error("Error getting record by name:", error);
	}
};

const getAllRecords = async () => {
	try {
		const db = await openDB();
		const tx = db.transaction(STORE_RECORDS, "readonly");
		const store = tx.objectStore(STORE_RECORDS);
		const request = store.getAll();
		const result = new Promise((resolve, reject) => {
			request.onsuccess = (event) => resolve(event.target.result);
			request.onerror = (event) => reject(event.target.error);
		});
		return result;
	} catch (error) {
		console.error("Error getting games:", error);
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
		const transaction = db.transaction([STORE_SOURCES], "readwrite");
		const store = transaction.objectStore(STORE_SOURCES);

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
								resolve({
									action: "updated",
									id: existingSourceByName.id,
									source: sourceData,
								});
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
						resolve({
							action: "created",
							id: event.target.result,
							source: sourceData,
						});
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
		const transaction = db.transaction([STORE_SOURCES], "readwrite");
		const store = transaction.objectStore(STORE_SOURCES);
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
		const transaction = db.transaction([STORE_SOURCES], "readonly");
		const store = transaction.objectStore(STORE_SOURCES);
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
export async function toggleSource(sourceName) {
	try {
		const db = await openDB();
		const transaction = db.transaction([STORE_SOURCES], "readwrite");
		const store = transaction.objectStore(STORE_SOURCES);
		const index = store.index("name");
		const source = await new Promise((resolve, reject) => {
			const request = index.get(sourceName);
			request.onsuccess = (event) => resolve(event.target.result);
			request.onerror = (event) => reject(event.target.error);
		});
		if (!source) {
			console.error("Source not found:", sourceName);
			return;
		}
		source.enabled = !source.enabled;
		return await new Promise((resolve, reject) => {
			const updateRequest = store.put(source);
			updateRequest.onsuccess = (event) => {
				console.log(`Source '${sourceName}' toggled to ${source.enabled ? "enabled" : "disabled"}`);
				resolve(event.target.result);
			};
			updateRequest.onerror = (event) => reject(event.target.error);
		});
	} catch (error) {
		console.error("Error toggling source:", error);
	}
}

export async function addShelf(shelfData) {
	try {
		const db = await openDB();
		const transaction = db.transaction([STORE_SHELFS], "readwrite");
		const store = transaction.objectStore(STORE_SHELFS);

		const addRequest = store.add(shelfData);
		return new Promise((resolve, reject) => {
			addRequest.onsuccess = (event) => {
				const returnObject = {
					...shelfData,
					action: "created",
					id: event.target.result,
				};
				resolve({ shelf: returnObject });
			};
			addRequest.onerror = (event) =>
				reject("Error adding shelf: " + event.target.errorCode);
		});
	} catch (error) {
		console.error(error);
		throw error;
	}
}

export async function getShelfs() {
	try {
		const db = await openDB();
		const transaction = db.transaction([STORE_SHELFS], "readonly");
		const store = transaction.objectStore(STORE_SHELFS);
		const request = store.getAll();

		return new Promise((resolve, reject) => {
			request.onsuccess = (event) => resolve(event.target.result);
			request.onerror = (event) =>
				reject("Error getting shelfs: " + event.target.errorCode);
		});
	} catch (error) {
		console.error(error);
		throw error;
	}
}
export async function deleteShelf(shelfId) {
	try {
		const db = await openDB();
		const transaction = db.transaction([STORE_SHELFS], "readwrite");
		const store = transaction.objectStore(STORE_SHELFS);
		const request = store.delete(shelfId);

		return new Promise((resolve, reject) => {
			request.onsuccess = () => resolve();
			request.onerror = (event) =>
				reject("Error deleting shelf: " + event.target.errorCode);
		});
	} catch (error) {
		console.error(error);
		throw error;
	}
}
//collection
async function addOrUpdateCollection(name, data) {
    return new Promise(async (resolve, reject) => {
        const db = await openDB();
        const tx = db.transaction(
					[STORE_COLLECTIONS, STORE_RECORDS],
					"readwrite"
				);
        const store = tx.objectStore(STORE_COLLECTIONS);

        try {
            const getItemRequest = store.get(name);
            getItemRequest.onsuccess = async (event) => {
                let operation = "";
				const collection = event.target.result
                if (collection) {
                    operation = "updated";
					console.groupCollapsed(operation, "Tables | collection - data")
						console.table(collection)
						console.log(data)
					console.groupEnd()
					const recordStore = tx.objectStore(STORE_RECORDS);
					const filteredRecords = [];
					for (const key of Object.keys(data)) {
						const filter = Array.isArray(data[key]) ? data[key] : [data[key]];
						//console.clear();
						const index = recordStore.index(key === "sources"? "source" : key);
						const filterPromises = filter.map(filterValue => {
							return new Promise((resolve, reject) => {
								const request = index.getAll(IDBKeyRange.only(filterValue));
								request.onsuccess = (rangeEvent) => {
									const records = rangeEvent.target.result;
									const recordsNames = records.map(record => record.name);
									filteredRecords.push(...recordsNames);
									console.log(filterValue, "filteredRecords", filteredRecords);
									if (collection.filters) {
										collection.filters[key].push(filterValue);
									} else {
										collection.filters = {};
										collection.filters[key] = [filterValue];
									}
									resolve();
								};
								request.onerror = (rangeEvent) => {
									console.error("Error retrieving filters:", rangeEvent.target.error);
									reject(rangeEvent.target.error);
								};
							});
						});

						Promise.all(filterPromises).then(() => {
							const uniqueFilteredRecords = Array.from(
								new Set(filteredRecords.map((a) => a.id))
							).map((id) => {
								return filteredRecords.find((a) => a.id === id);
							});
							collection.records = uniqueFilteredRecords;
							collection.records = filteredRecords;
							console.log(collection, uniqueFilteredRecords, filteredRecords);
							console.log("collection.records", collection.records);
							const putRequest = store.put(collection);
							putRequest.onsuccess = () => {
								db.close();
								resolve({
									operation: operation,
									operationStatus: true,
									collection: collection,
								});
							};
							putRequest.onerror = (event) => {
								db.close();
								operation = "error_updating";
								reject(event.target.error);
							};
						}).catch(error => {
							console.error("Error processing filters:", error);
							db.close();
							reject(error);
						});
					}
                } else {
                    operation = "created";
                    const newData = { name, ...data };
                    const addRequest = store.add(newData);
                    addRequest.onsuccess = (addEvent) => {
                        operation = "created";
                        resolve({
                            operation: operation,
                            operationStatus: true,
                            collection: newData,
                        });
                    };
                    addRequest.onerror = (addEvent) => {
                        operation = "error_creating";
                        reject(addEvent.target.error);
                    };
                }
            };
            getItemRequest.onerror = (event) => {
                db.close();
                reject(event.target.error);
            };

            tx.oncomplete = () => {
                console.log("Transaction completed successfully.");
            };
            tx.onerror = (event) => {
                db.close();
                reject(event.target.error);
            };
        } catch (error) {
            db.close();
            console.error("Error in addOrUpdateCollection:", error);
            reject(error);
        }
    });
}

export async function getCollectionOrAll(name) {
	const db = await openDB();
	const transaction = db.transaction(STORE_COLLECTIONS, "readonly");
	const store = transaction.objectStore(STORE_COLLECTIONS);
	return new Promise((resolve, reject) => {
		let request;
		if (name) {
			// Check if a name is provided
			request = store.get(name);
		} else {
			request = store.getAll();
		}
		request.onsuccess = (event) => {
			//console.group("Collection(s) retrieved:");
			//	console.table(event.target.result);
			//console.groupEnd();
			resolve(event.target.result); // Resolve with the result (either a single collection or an array of collections)
		};
		request.onerror = (event) => {
			console.error("Error retrieving collection(s):", event.target.error);
			reject(event.target.error);
		};
	});
}

export async function deleteCollection(collectionName) {
	const db = await openDB();
	const transaction = db.transaction([STORE_COLLECTIONS, STORE_SHELFS], "readwrite");
	const collectionsStore = transaction.objectStore(STORE_COLLECTIONS);
	const shelfsStore = transaction.objectStore(STORE_SHELFS);

	// Delete the collection
	const deleteRequest = collectionsStore.delete(collectionName);
	deleteRequest.onsuccess = (event) => {
		console.log("Collection deleted successfully:", event.target.result);
	};
	deleteRequest.onerror = (event) => {
		console.error("Error deleting collection:", event.target.error);
	};

	// Remove shelfs that contain the collection
	const shelfsRequest = shelfsStore.getAll();
	shelfsRequest.onsuccess = (event) => {
		const shelfs = event.target.result;
		shelfs.forEach((shelf) => {
			if (shelf.collections && shelf.collections.includes(collectionName)) {
				const updatedCollections = shelf.collections.filter(
					(name) => name !== collectionName
				);
				if (updatedCollections.length === 0) {
					shelfsStore.delete(shelf.id);
				} else {
					shelf.collections = updatedCollections;
					shelfsStore.put(shelf);
				}
			}
		});
	};
	shelfsRequest.onerror = (event) => {
		console.error("Error retrieving shelfs:", event.target.error);
	};

	await transaction.complete;
}

export async function toggleFavorites(recordName) {
	try {
		const db = await openDB();
		const transaction = db.transaction(
			[STORE_RECORDS, STORE_COLLECTIONS],
			"readwrite"
		);
		const recordStore = transaction.objectStore(STORE_RECORDS);
		const collectionsStore = transaction.objectStore(STORE_COLLECTIONS);
		const recordIndex = recordStore.index("name");
		const record = await new Promise((resolve, reject) => {
			const request = recordIndex.get(recordName);
			request.onsuccess = (event) => resolve(event.target.result);
			request.onerror = (event) => reject(event.target.error);
		});
		if (!record) {
			console.error("Record not found:", recordName);
			return;
		}
		const isFavorite = record.collections.includes("favorites");
		if (isFavorite) {
			record.collections = record.collections.filter(
				(col) => col !== "favorites"
			);
			await new Promise((resolve, reject) => {
				const updateRequest = recordStore.put(record);
				updateRequest.onsuccess = () => resolve();
				updateRequest.onerror = (event) => reject(event.target.error);
			});
			const collection = await new Promise((resolve, reject) => {
				const request = collectionsStore.get("favorites");
				request.onsuccess = (event) => resolve(event.target.result);
				request.onerror = (event) => reject(event.target.error);
			});
			if (collection) {
				collection.records = collection.records.filter(
					(rec) => rec !== recordName
				);
				await new Promise((resolve, reject) => {
					const updateRequest = collectionsStore.put(collection);
					updateRequest.onsuccess = () => resolve();
					updateRequest.onerror = (event) => reject(event.target.error);
				});
			}
		} else {
			record.collections.push("favorites");
			await new Promise((resolve, reject) => {
				const updateRequest = recordStore.put(record);
				updateRequest.onsuccess = () => resolve();
				updateRequest.onerror = (event) => reject(event.target.error);
			});
			const collection = await new Promise((resolve, reject) => {
				const request = collectionsStore.get("favorites");
				request.onsuccess = (event) => resolve(event.target.result);
				request.onerror = (event) => reject(event.target.error);
			});
			if (!collection) {
				await new Promise((resolve, reject) => {
					const addRequest = collectionsStore.add({
						name: "favorites",
						inSidebar: true,
						isDynamic: false,
						records: [recordName],
					});
					addRequest.onsuccess = () => resolve();
					addRequest.onerror = (event) => reject(event.target.error);
				});
			} else {
				collection.records.push(recordName);
				await new Promise((resolve, reject) => {
					const updateRequest = collectionsStore.put(collection);
					updateRequest.onsuccess = () => resolve();
					updateRequest.onerror = (event) => reject(event.target.error);
				});
			}
		}
		await transaction.complete;
	} catch (error) {
		console.error("Error toggling favorite:", error);
	}
}

export async function getCollectionsFromStore() {}
export async function getFromStore(storeName, key = null) {
	try {
		const db = await openDB();
		const transaction = db.transaction([storeName], "readonly");
		const store = transaction.objectStore(storeName);
		let request;

		if (key) {
			request = store.get(key);
		} else {
			request = store.getAll();
		}

		return new Promise((resolve, reject) => {
			request.onsuccess = (event) => resolve(event.target.result);
			request.onerror = (event) =>
				reject("Error getting data: " + event.target.errorCode);
		});
	} catch (error) {
		console.error(error);
		throw error;
	}
}
// const source = await getFromStore(STORE_SOURCES, sourceId);
// const allSources = await getFromStore(STORE_SOURCES);
// const collection = await getFromStore(STORE_COLLECTIONS, collectionName);
// const allCollections = await getFromStore(STORE_COLLECTIONS);

//Timeline
export async function getRecordsTimeline() {
	try {
		const records = await getAllRecords();
		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const yesterday = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate() - 1
		);
		const startOfWeek = getStartOfWeek(now);
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const currentYear = now.getFullYear();
		const currentMonth = now.getMonth();
		const timeline = {
			today: [],
			yesterday: [],
			thisWeek: [],
			thisMonth: [],
			previousMonths: [],
			previousYears: [],
		};
		records.forEach((record) => {
			if (record.addedDate) {
				const itemDate = new Date(record.addedDate);
				const isSameDay = (date1, date2) =>
					date1.getFullYear() === date2.getFullYear() &&
					date1.getMonth() === date2.getMonth() &&
					date1.getDate() === date2.getDate();
				if (isSameDay(itemDate, today)) {
					timeline.today.push(record);
				} else if (isSameDay(itemDate, yesterday)) {
					timeline.yesterday.push(record);
				} else if (itemDate >= startOfWeek && itemDate < today) {
					timeline.thisWeek.push(record);
				} else if (itemDate >= startOfMonth && itemDate < yesterday) {
					timeline.thisMonth.push(record);
				} else {
					const year = itemDate.getFullYear();
					const month = itemDate.toLocaleString("default", { month: "short" });
					const monthYearKey = `${month} ${year}`;

					if (
						itemDate.getFullYear() === now.getFullYear() &&
						itemDate.getMonth() < now.getMonth()
					) {
						if (!timeline.previousMonths[monthYearKey]) {
							timeline.previousMonths[monthYearKey] = [];
						}
						timeline.previousMonths[monthYearKey].push(record);
					} else if (itemDate.getFullYear() < now.getFullYear()) {
						if (!timeline.previousYears[year]) {
							timeline.previousYears[year] = [];
						}
						timeline.previousYears[year].push(record);
					}
				}
			}
		});
		return timeline;
	} catch (error) {
		console.error("Error getting records timeline:", error);
		throw error;
	}
}
function getStartOfWeek(date) {
	const dayOfWeek = date.getDay(); // 0 for Sunday, 1 for Monday, etc.
	const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust when day is Sunday
	return new Date(date.setDate(diff));
}

export {
	openDB,
	addRecord,
	getRecord,
	getAllRecords,
	exportIndexedDB,
	addOrUpdateSource,
	getSourceById,
	getAllSources,
	deleteSource,
	addOrUpdateCollection,
	getAllIndexedDBs,
};
