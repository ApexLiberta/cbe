function sortObjectKeys(obj) {
	const sortedKeys = Object.keys(obj).sort();
	const sortedObject = {};

	sortedKeys.forEach((key) => {
		sortedObject[key] = obj[key];
	});

	return sortedObject;
}

function findDifferencesType1(obj1, obj2) {
	const differences = {};
	for (const [key, value] of Object.entries(obj1)) {
		if (obj2[key] !== value) {
			differences[key] = { obj1Value: value, obj2Value: obj2[key] };
		}
	}

	if (Object.keys(differences).length === 0) {
		console.log("Objects have the same properties with identical values.");
	} else {
		console.log("Differences found:");
		console.log(differences);
	}
}
function findDifferences(obj1, obj2) {
	const differences = {};
	const keys = [...new Set([...Object.keys(obj1), ...Object.keys(obj2)])];
	console.log("keys:", keys);
	for (const key of keys) {
		if (obj1[key] !== obj2[key]) {
			differences[key] = { obj1Value: obj1[key], obj2Value: obj2[key] };
		}
	}

	return differences;
}

const obj1 = {
	name: "FINAL FANTASY XVI",
	description:
		"An epic dark fantasy where fates are decided by mighty Eikons and the Dominants who wield them. This is the tale of Clive Rosfield, a tragic warrior who swears revenge on the Dark Eikon Ifrit, a mysterious entity that brings calamity in its wake.",
	genres: ["Action", "Fantasy", "RPG"],
	features: ["Controller Support", "Single Player"],
	developers: ["Square Enix"],
	publishers: ["Square Enix"],
	releaseDate: "2024-09-16",
	links: ["https://store.epicgames.com/en-US/p/final-fantasy-xvi"],
};

const obj2 = {
	name: "FINAL FANTASY XVI",
	description:
		"An epic dark fantasy where fates are decided by mighty Eikons and the Dominants who wield them. This is the tale of Clive Rosfield, a tragic warrior who swears revenge on the Dark Eikon Ifrit, a mysterious entity that leaves naught but calamity in its wake.",
	releaseDate: "2023-12-16",
	developers: ["Square Enix"],
	publishers: ["Square Enix"],
	tags: [
		"Spectacle fighter",
		"Action RPG",
		"Story Rich",
		"Action",
		"JRPG",
		"Fantasy",
		"RPG",
		"Dark Fantasy",
		"Singleplayer",
		"Third Person",
		"3D",
		"Cinematic",
		"Drama",
		"Emotional",
		"Atmospheric",
		"Magic",
		"Party-Based RPG",
		"Great Soundtrack",
		"Violent",
		"LGBTQ+",
	],
	links: ["https://store.steampowered.com/app/2515020/FINAL_FANTASY_XVI/"],
};
function mergeUniqueValues(obj1, obj2) {
	return {
		// Use the name from obj1 since they are identical
		name: obj1.name || obj2.name,

		// Pick the longer description
		description:
			obj1.description.length > obj2.description.length
				? obj1.description
				: obj2.description,

		// Combine arrays and remove duplicates
		genres: Array.from(
			new Set([...(obj1.genres || []), ...(obj2.genres || [])])
		),
		features: Array.from(
			new Set([...(obj1.features || []), ...(obj2.features || [])])
		),
		developers: Array.from(
			new Set([...(obj1.developers || []), ...(obj2.developers || [])])
		),
		publishers: Array.from(
			new Set([...(obj1.publishers || []), ...(obj2.publishers || [])])
		),

		// Choose the earlier release date
		releaseDate:
			new Date(obj1.releaseDate) < new Date(obj2.releaseDate)
				? obj1.releaseDate
				: obj2.releaseDate,

		// Combine tags, if they exist, and remove duplicates
		tags: Array.from(new Set([...(obj1.tags || []), ...(obj2.tags || [])])),

		// Combine links and remove duplicates
		links: Array.from(new Set([...(obj1.links || []), ...(obj2.links || [])])),
	};
}

const mergedObject = mergeUniqueValues(obj1, obj2);
//console.log(mergedObject);



function wildcardToRegExp(wildcard) {
	// Escape special regex characters and replace wildcards with regex equivalents
	return new RegExp(
		"^" +
			wildcard
				.replace(/\./g, "\\.") // Escape '.' to match it literally
				.replace(/\*/g, ".*") + // Replace '*' with '.*' to match any sequence of characters
			"$"
	); // Ensure the whole string is matched
}

function doesUrlMatchPattern(url, pattern) {
	return wildcardToRegExp(pattern).test(url);
}

function parseDate(dateString) {
	// Handle different date formats
	let parsedDate;

	if (dateString.match(/\d{2}\/\d{2}\/\d{2}/)) {
		// Format: MM/DD/YY
		parsedDate = new Date(dateString.replace(/\//g, "-"));
	} else if (dateString.match(/\d{1,2} \w+, \d{4}/)) {
		// Format: D MMM, YYYY
		const [day, month, year] = dateString.split(" ");
		const monthIndex = [
			"Jan",
			"Feb",
			"Mar",
			"Apr",
			"May",
			"Jun",
			"Jul",
			"Aug",
			"Sep",
			"Oct",
			"Nov",
			"Dec",
		].indexOf(month);
		parsedDate = new Date(year, monthIndex, day);
	} else {
		// Handle other formats or throw an error
		throw new Error("Invalid date format");
	}

	// Convert to C# format
	const csharpFormat = parsedDate.toISOString().slice(0, 10); // YYYY-MM-DD

	return csharpFormat;
}

export {
	sortObjectKeys,
	findDifferences,
	mergeUniqueValues,
	doesUrlMatchPattern,
	parseDate,
};
