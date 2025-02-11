export function createSectionElement(section, sectionKey) {
	const sectionDiv = document.createElement("div");
	sectionDiv.classList.add("settings-section"); // Add a class for styling

	const sectionHeader = document.createElement("h2");
	sectionHeader.textContent = section.label || sectionKey; // Use label if available, otherwise key
	sectionDiv.appendChild(sectionHeader);

	if (section.description) {
		const sectionDescription = document.createElement("p");
		sectionDescription.classList.add("section-description");
		sectionDescription.textContent = section.description;
		sectionDiv.appendChild(sectionDescription);
	}

	if (section.config) {
		const configContainer = document.createElement("div");
		configContainer.classList.add("settings-config");
		for (const settingKey in section.config) {
			const setting = section.config[settingKey];
			const settingElement = createSettingElement(
				setting,
				settingKey,
				sectionKey
			);
			configContainer.appendChild(settingElement);
		}
		sectionDiv.appendChild(configContainer);
	}

	return sectionDiv;
}

export function createSettingElement(setting, settingKey, sectionKey) {
	const settingDiv = document.createElement("div");
	settingDiv.classList.add("setting-item", setting.type);

	// Create a group div for label and description
	const labelDescriptionGroup = document.createElement("div");
	labelDescriptionGroup.classList.add("setting-label-group"); // Add class for potential styling

	const labelElement = document.createElement("label");
	labelElement.textContent = setting.label || settingKey;
	labelElement.classList.add("setting-label");
	labelDescriptionGroup.appendChild(labelElement); // Append label to the group

	if (setting.description) {
		const descriptionElement = document.createElement("p");
		descriptionElement.classList.add("setting-description");
		descriptionElement.textContent = setting.description;
		labelDescriptionGroup.appendChild(descriptionElement); // Append description to the group
	}

	settingDiv.appendChild(labelDescriptionGroup); // Append the group to settingDiv

	let inputElement;

	switch (setting.type) {
		case "toggle":
			inputElement = createToggleElement(setting, settingKey, sectionKey);
			break;
		case "link":
			inputElement = createLinkElement(setting, settingKey, sectionKey);
			break;
		case "button":
			inputElement = createButtonElement(setting, settingKey, sectionKey);
			break;
		case "dropdown":
			inputElement = createDropdownElement(setting, settingKey, sectionKey);
			break;
		case "text":
			inputElement = createTextElement(setting, settingKey, sectionKey);
			break;
		case "number":
			inputElement = createNumberElement(setting, settingKey, sectionKey);
			break;
		case "static":
			inputElement = createStaticElement(setting, settingKey, sectionKey);
			break;
		case "list": // For list types like filters, tags, collections, sources
			inputElement = createListElement(setting, settingKey, sectionKey);
			break;
		default:
			inputElement = document.createElement("span"); // Default to span if type is unknown
			inputElement.textContent = `Unknown setting type: ${setting.type}`;
			console.warn(
				`Unknown setting type: ${setting.type} for ${settingKey} in ${sectionKey}`
			);
	}

	settingDiv.appendChild(inputElement);
	return settingDiv;
}

export function createToggleElement(setting, settingKey, sectionKey) {
	const toggleContainer = document.createElement("div");
	toggleContainer.classList.add("toggle-container");

	const input = document.createElement("input");
	input.type = "checkbox";
	input.id = `${sectionKey}-${settingKey}`; // Unique ID for label association
	input.checked = setting.default === true; // Set default value if provided

	const label = document.createElement("label");
	label.classList.add("toggle-switch");
	label.setAttribute("for", `${sectionKey}-${settingKey}`); // Associate label with input

	toggleContainer.appendChild(input);
	toggleContainer.appendChild(label);

	input.addEventListener("change", (event) => {
		// Handle toggle change event, save setting value, etc.
		console.log(
			`Toggle ${sectionKey}.${settingKey} changed to: ${event.target.checked}`
		);
		// You would typically store the setting value here
		updateSettingValue(sectionKey, settingKey, event.target.checked);
	});

	return toggleContainer;
}

export function createLinkElement(setting, settingKey, sectionKey) {
	const link = document.createElement("a");
	link.href = setting.href;
	link.textContent = setting.label || settingKey; // Use label or key as link text
	link.classList.add("setting-link");
	return link;
}

export function createButtonElement(setting, settingKey, sectionKey) {
	const button = document.createElement("button");
	button.textContent = setting.label || settingKey;
	button.classList.add("setting-button");

	button.addEventListener("click", () => {
		// Handle button click action
		console.log(
			`Button ${sectionKey}.${settingKey} clicked. Action: ${setting.action}`
		);
		if (setting.action === "addLibrary") {
			// Example action handling - you'd implement the actual logic
			alert("Add Library action triggered (not implemented in this example).");
		}
		// ... handle other actions based on setting.action
	});

	return button;
}

export function createDropdownElement(setting, settingKey, sectionKey) {
	const select = document.createElement("select");
	select.classList.add("setting-dropdown");

	setting.options.forEach((option) => {
		const optionElement = document.createElement("option");
		optionElement.value = option.value;
		optionElement.textContent = option.label;
		optionElement.selected = option.value === setting.default; // Set default selection
		select.appendChild(optionElement);
	});

	select.addEventListener("change", (event) => {
		// Handle dropdown change event
		console.log(
			`Dropdown ${sectionKey}.${settingKey} changed to: ${event.target.value}`
		);
		updateSettingValue(sectionKey, settingKey, event.target.value);
	});

	return select;
}

export function createTextElement(setting, settingKey, sectionKey) {
	const input = document.createElement("input");
	input.type = "text";
	input.classList.add("setting-text");
	input.placeholder = setting.placeholder || "";
	input.value = setting.value || ""; // Set initial value if available

	input.addEventListener("change", (event) => {
		console.log(
			`Text input ${sectionKey}.${settingKey} changed to: ${event.target.value}`
		);
		updateSettingValue(sectionKey, settingKey, event.target.value);
	});

	return input;
}

export function createNumberElement(setting, settingKey, sectionKey) {
	const input = document.createElement("input");
	input.type = "number";
	input.classList.add("setting-number");
	input.value = setting.value || ""; // Set initial value if available

	input.addEventListener("change", (event) => {
		console.log(
			`Number input ${sectionKey}.${settingKey} changed to: ${event.target.value}`
		);
		updateSettingValue(sectionKey, settingKey, parseFloat(event.target.value)); // Parse to number
	});

	return input;
}

export function createStaticElement(setting, settingKey, sectionKey) {
	const span = document.createElement("span");
	span.classList.add("setting-static");
	span.textContent = setting.value;
	return span;
}

export function createListElement(setting, settingKey, sectionKey) {
	const listContainer = document.createElement("div");
	listContainer.classList.add("setting-list-container");

	const listItemsContainer = document.createElement("div");
	listItemsContainer.classList.add("setting-list-items");
	listContainer.appendChild(listItemsContainer);

	if (setting.list && Array.isArray(setting.list)) {
		setting.list.forEach((listItem, index) => {
			const listItemElement = createListItemElement(
				listItem,
				setting.listItemType,
				settingKey,
				sectionKey,
				index
			);
			listItemsContainer.appendChild(listItemElement);
		});
	}

	if (setting.addable) {
		const addButton = document.createElement("button");
		addButton.textContent = `Add ${
			setting.label
				? setting.label.toLowerCase().slice(0, -1)
				: settingKey.toLowerCase().slice(0, -1)
		} item`; // Simple plural to singular conversion for label
		addButton.classList.add("setting-list-add-button");
		addButton.addEventListener("click", () => {
			const newListItem = createNewListItem(setting.listItemType); // Function to create a new empty list item based on listItemType
			setting.list.push(newListItem); // Add to the settings data (important for persistence if you save the settings object later)
			const listItemElement = createListItemElement(
				newListItem,
				setting.listItemType,
				settingKey,
				sectionKey,
				setting.list.length - 1
			);
			listItemsContainer.appendChild(listItemElement);
			// Optionally, you might want to re-render the entire list for more complex cases
		});
		listContainer.appendChild(addButton);
	}

	return listContainer;
}

export function createListItemElement(
	listItem,
	listItemType,
	settingKey,
	sectionKey,
	itemIndex
) {
	const listItemDiv = document.createElement("div");
	listItemDiv.classList.add("setting-list-item");

	if (listItemType === "group") {
		// If list item is a group, render settings within it
		const configContainer = document.createElement("div");
		configContainer.classList.add("setting-list-item-config");
		for (const configKey in listItem.config) {
			const configSetting = listItem.config[configKey];
			const configSettingElement = createSettingElement(
				configSetting,
				configKey,
				`${sectionKey}.${settingKey}[${itemIndex}]`
			); // Nested key
			configContainer.appendChild(configSettingElement);
		}
		listItemDiv.appendChild(configContainer);
	} else if (listItemType === "text") {
		// If list item is text, render a text input
		const textInput = document.createElement("input");
		textInput.type = "text";
		textInput.classList.add("setting-list-item-text");
		textInput.value = listItem; // Assuming listItem is the text value
		textInput.addEventListener("change", (event) => {
			// Update the list item value in the settings data
			updateListItemValue(
				sectionKey,
				settingKey,
				itemIndex,
				event.target.value
			); // Assuming a function to update list item value
			console.log(
				`List item ${sectionKey}.${settingKey}[${itemIndex}] changed to: ${event.target.value}`
			);
		});
		listItemDiv.appendChild(textInput);
	}

	// Add remove button if removable
	const removeButton = document.createElement("button");
	removeButton.textContent = "Remove";
	removeButton.classList.add("setting-list-item-remove-button");
	removeButton.addEventListener("click", () => {
		// Remove the list item from the settings data and the UI
		removeListItem(sectionKey, settingKey, itemIndex);
		listItemDiv.remove(); // Remove from the DOM
	});
	listItemDiv.appendChild(removeButton);

	return listItemDiv;
}

export function createNewListItem(listItemType) {
	if (listItemType === "group") {
		// Example for group list item, adjust based on your needs. This should match your settings structure for sources, filters etc.
		return {
			type: "group",
			label: "New Item", // Or generate a dynamic label
			config: {
				name: { type: "text", label: "Name", value: "" },
				// ... other config items with default values or empty values
			},
		};
	} else if (listItemType === "text") {
		return ""; // Empty string for text list items
	}
	// Add more cases if you have other listItemTypes
	return null; // Or a default empty object if type is unknown
}

export function updateSettingValue(sectionKey, settingKey, newValue) {
	// In a real application, you would save this value to your settings storage
	// (e.g., localStorage, chrome.storage, server database, etc.)
	// For this example, we just log it.
	console.log(`Setting ${sectionKey}.${settingKey} updated to: ${newValue}`);

	// Optionally, you could update the `improvedSettings` object directly if you want to keep the UI in sync with the data in memory.
	// improvedSettings[sectionKey].config[settingKey].value = newValue; // If you add 'value' property to your setting definition
}

export function updateListItemValue(sectionKey, settingKey, itemIndex, newValue) {
	// Update the value of a list item in the settings data.
	//  This function assumes your list items are directly stored as strings if listItemType is 'text'.
	// For 'group' types, you'd need to update properties within listItem.config.

	const settingList = improvedSettings[sectionKey].config[settingKey].list;
	if (settingList && settingList[itemIndex] !== undefined) {
		settingList[itemIndex] = newValue; // Directly update for text type. Adjust for 'group' types.
		console.log(
			`List item ${sectionKey}.${settingKey}[${itemIndex}] updated to: ${newValue}`
		);
	} else {
		console.warn(
			`List item at index ${itemIndex} not found in ${sectionKey}.${settingKey}`
		);
	}
}

export function removeListItem(sectionKey, settingKey, itemIndex) {
	const settingList = improvedSettings[sectionKey].config[settingKey].list;
	if (settingList && settingList[itemIndex] !== undefined) {
		settingList.splice(itemIndex, 1); // Remove the item from the array
		console.log(
			`List item ${sectionKey}.${settingKey} at index ${itemIndex} removed.`
		);

		// Optionally, re-render the list if needed for more complex UIs or indexing issues.
		//  For this example, removing the element from DOM in createListItemElement's remove button handler is sufficient.
	} else {
		console.warn(
			`List item at index ${itemIndex} not found in ${sectionKey}.${settingKey} for removal.`
		);
	}
}
