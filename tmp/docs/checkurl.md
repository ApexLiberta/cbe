# header

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
