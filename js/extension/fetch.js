export async function fetchShelves() {
	try {
		const response = await browser.runtime.sendMessage({ action: "getShelfs" });
		if (response.error || typeof response.shelfs === "undefined") {
			throw new Error(response.error || "Failed to fetch shelves");
		}
		return response.shelfs;
	} catch (error) {
		console.error("Error loading shelves:", error);
		throw error;
	}
}

export async function fetchCollections() {
	try {
		const response = await browser.runtime.sendMessage({
			action: "getCollectionOrAll",
		});
		if (response.error) {
			throw new Error(response.error);
		}
		return response.collections;
	} catch (error) {
		console.error("Error getting all collections:", error);
		throw error;
	}
}
export async function fetchCollection(collection) {
	try {
		const response = await browser.runtime.sendMessage({
			action: "getCollectionOrAll",
			name: collection,
		});
		if (response.error) {
			throw new Error(response.error);
		}
		return response;
	} catch (error) {
		console.error("Error fetching collection:", error);
		throw error;
	}
}
export async function fetchRecord(record) {
	try {
		const response = await browser.runtime.sendMessage({
			action: "getGame",
			name: record.toLowerCase(),
		});
		if (response.error) {
			throw new Error(response.error);
		}
		return response;
	} catch (error) {
		console.error("Error fetching record:", error);
		throw error;
	}
}
export async function fetchRecords() {
	try {
		const response = await browser.runtime.sendMessage({
			action: "getRecords",
		});
		if (response.error) {
			throw new Error(response.error);
		}
		return response.games;
	} catch (error) {
		console.error("Error fetching records:", error);
		throw error;
	}
}