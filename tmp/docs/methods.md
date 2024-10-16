# header

## checkForMatches

```js
    async function checkForMatches(tabUrl) {
        if (!tabUrl) {
            return; // Handle missing tabUrl gracefully
        }

        try {
            const sources = await browser.storage.local.get("sources");
            const sourcesVar = sources?.sources;

            if (!sourcesVar) {
            return; // Handle missing or empty sources
            }

            for (const source of sourcesVar) {
            const { matches: pattern } = source; // Destructure directly
            const response = await browser.runtime.sendMessage({
                action: "checkUrl",
                url: tabUrl,
                pattern,
            });

            if (response) {
                console.log(`Matches found for source: ${source.name || 'Unnamed Source'}`); // Use source name if available
                for (const [selector, value] of Object.entries(source.selectors)) {
                console.log(`${selector}:`, value);
                }
            } else {
                console.log("The current URL does not match any provided URLs.");
            }
            }
        } catch (error) {
            console.error("Error checking for matches:", error); // Handle errors
        }
        }

        // Usage:
        browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        const tabUrl = tabs[0].url; // Assuming you want the URL of the active tab
        checkForMatches(tabUrl);
    });
```

## extractData

```js
    function extractData(key, selector, selectorType) {
        // Validate input parameters

        // Get the element(s) based on the selector and selector type
        const elements = document.querySelectorAll(selector);

        // Iterate over the elements and extract data based on the selector type
        const extractedData = [];
        for (const element of elements) {
            let data;
            switch (selectorType) {
            case "textContent":
                data = element.textContent;
                break;
            case "allLinksText":
                // Extract text from all links within the element
                data = element.querySelectorAll("a").map(link => link.textContent);
                break;
            case "innerTextSplit":
                // Extract inner text and split it by ", "
                data = element.innerText.split(", ");
                break;
            case "siblingMatch":
                // Check if sibling text content matches the key
                const sibling = element.nextElementSibling;
                if (sibling && sibling.textContent === key) {
                data = element.textContent;
                }
                break;
            // Add more cases for other selector types as needed
            }

            // Process the extracted data if necessary
            // ...

            extractedData.push(data);
        }

        return extractedData;
    }
```
