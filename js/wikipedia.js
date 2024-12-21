// Log confirmation that the wikipedia.js script has been successfully included
console.log("wikipedia.js loaded");
logToConsole("wikipedia.js script loaded successfully.", 'info');
console.log(window.wikiTriggers); // Log the wiki trigger phrases to verify initialization and for debugging
logToConsole(`WikiTriggers initialized: ${JSON.stringify(window.wikiTriggers)}`, 'info');

// Base URL for all Wikipedia API calls, configured to enable CORS using 'origin=*'
const WIKIPEDIA_API_BASE_URL = "https://en.wikipedia.org/w/api.php";

// Function: processInput
// Purpose: This function sanitizes user input using `filterInput` and fetches a Wikipedia summary.
// The function focuses on querying Wikipedia directly without fallback logic.
async function processInput(input) {
    const filteredQuery = filterInput(input); // Filter the input to refine the query
    console.log(`Processing input for Wikipedia: "${filteredQuery}"`);
    logToConsole(`Processing input for Wikipedia: "${filteredQuery}"`, 'info');
    return await getWikipediaSummary(filteredQuery); // Fetch Wikipedia summary using the filtered query
}

// Function: shouldQueryWikipedia
// Purpose: Determines if the user's input matches the conditions to query Wikipedia.
// Conditions include:
// - Input starts with a wiki trigger phrase (e.g., "who is", "describe").
// - Input is fully enclosed in quotes (e.g., `"Albert Einstein"`).
function shouldQueryWikipedia(input) {
    if (typeof input !== "string" || input.trim() === "") {
        console.log("Invalid input provided to shouldQueryWikipedia.");
        logToConsole("Invalid input provided to shouldQueryWikipedia.", 'warn');
        return false; // Return false for invalid or empty input
    }

    const inputLower = input.toLowerCase().trim(); // Normalize input for case-insensitive matching
    const isQuoted = input.startsWith('"') && input.endsWith('"'); // Check if input is fully quoted
    const matchedTrigger = wikiTriggers.some((trigger) => inputLower.startsWith(trigger)); // Check for trigger phrases

    if (matchedTrigger || isQuoted) {
        console.log(`Wikipedia trigger matched or double quotes found in: "${input}"`);
        logToConsole(`Wikipedia trigger matched or double quotes found in: "${input}"`, 'info');
        return true; // Indicate that input should query Wikipedia
    }

    console.log(`No Wikipedia trigger matched for input: "${inputLower}"`);
    logToConsole(`No Wikipedia trigger matched for input: "${inputLower}"`, 'info');
    return false; // Indicate that input should not query Wikipedia
}

// Function: getWikipediaSummary
// Purpose: Fetches a Wikipedia summary for a given topic using the Wikipedia API.
// Handles:
// - Normal pages: Returns summary text and thumbnail image (if available).
// - Disambiguation pages: Delegates to `handleDisambiguationPage` for user selection.
// Returns a formatted object containing text, image, source, and license.
async function getWikipediaSummary(topic) {
    try {
        const apiUrl = `${WIKIPEDIA_API_BASE_URL}?action=query&prop=extracts|pageimages&exintro&titles=${encodeURIComponent(topic)}&format=json&redirects=1&pithumbsize=500&origin=*`;
        console.log(`Connecting to Wikipedia API: ${apiUrl}`);
        logToConsole(`Connecting to Wikipedia API: ${apiUrl}`, 'info');

        const response = await fetch(apiUrl); // Perform the API request
        console.log(`API Response Status: ${response.status}`);
        logToConsole(`API Response Status: ${response.status}`, 'info');
        if (!response.ok) {
            throw new Error(`Failed to fetch Wikipedia data. Status: ${response.status}`); // Handle HTTP errors
        }

        const data = await response.json(); // Parse the JSON response
        console.log(`API Response Data: ${JSON.stringify(data)}`);
        logToConsole(`API Response Data: ${JSON.stringify(data)}`, 'info');

        const pages = Object.values(data.query.pages); // Extract the pages from the response
        if (pages.length === 0 || pages[0].missing !== undefined) {
            console.log(`No valid pages found in the response.`);
            logToConsole("No valid pages found in the response.", 'warn');
            // No valid pages found
            return { text: "Sorry, I couldn't find relevant information on that topic.", image: null };
        }

        const page = pages[0]; // Get the first page object

        // Handle disambiguation pages by detecting "may refer to:" in the extract
        if (page.extract?.includes("may refer to:")) {
            console.log(`Detected disambiguation page for topic: ${topic}`);
            logToConsole(`Detected disambiguation page for topic: ${topic}`, 'info');
            return await handleDisambiguationPage(topic); // Process disambiguation
        }

        // Return the summary and metadata for normal pages
        return {
            text: page.extract?.replace(/<[^>]+>/g, '') || "No detailed information available.", // Remove HTML tags
            source: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`, // Source URL
            license: "https://creativecommons.org/licenses/by-sa/4.0/", // License for content
            image: page.thumbnail?.source || null, // Thumbnail image (if available)
        };
    } catch (error) {
        console.error(`Error fetching Wikipedia summary: ${error.message}`);
        logToConsole(`Error fetching Wikipedia summary: ${error.message}`, 'error');
        return { text: "There was an error fetching information from Wikipedia.", image: null }; // Return error response
    }
}

// Function: handleDisambiguationPage
// Purpose: Processes disambiguation pages, which list multiple possible matches for a query.
// Prompts the user to select from a numbered list of options.
// Uses "action=parse" API to fetch the disambiguation content.
async function handleDisambiguationPage(topic) {
    const apiUrl = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(topic)}&format=json&prop=text&origin=*`;
    console.log(`Fetching disambiguation page details from: ${apiUrl}`);
    logToConsole(`Fetching disambiguation page details from: ${apiUrl}`, 'info');

    try {
        const response = await fetch(apiUrl); // Perform the API request
        const status = response.status;
        console.log(`Received response with status code: ${response.status}`);
        logToConsole(`Received response with status code: ${response.status}`, 'info');

        if (response.ok) {
            const data = await response.json(); // Parse the JSON response
            console.log(`Received disambiguation data: ${JSON.stringify(data)}`);
            logToConsole(`Received disambiguation data: ${JSON.stringify(data)}`, 'info');

            const parser = new DOMParser();
            const doc = parser.parseFromString(data.parse?.text["*"] || '', "text/html"); // Parse HTML content

            const items = doc.querySelectorAll("ul li a"); // Select disambiguation options from the HTML
            optionsList = []; // Clear any existing options

            items.forEach((item, index) => {
                const term = item.textContent.trim(); // Extract the term (link text)
                const description = item.parentElement?.textContent.replace(term, '').trim() || "No description available"; // Extract description
                const link = item.getAttribute("href"); // Extract the link URL

                if (term && link) {
                    // Add valid options to the options list
                    optionsList.push({
                        text: term,
                        description: description,
                        apiUrl: `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&exintro&titles=${encodeURIComponent(term)}&format=json&redirects=1&pithumbsize=500&origin=*`,
                    });
                    console.log(`Disambiguation item found: ${term}`);
                    logToConsole(`Disambiguation item found: ${term}`, 'info');
                }
            });

            if (optionsList.length > 0) {
                awaitingSelection = true; // Set state to awaiting user selection
                // Return the list of options to the user
                const disambiguationResponse = {
                    text: `
                        This topic has multiple references. Please select one by typing the corresponding number:<br><br>
                        ${optionsList.map((option, index) => `${index + 1}. ${option.text} - ${option.description}`).join('<br>')}<br><br>
                        [END OF LIST]
                    `,
                    image: null
                };
            
                displayResponse(chatBox, disambiguationResponse, 70); // Medium-fast typing for disambiguation
                return; // Ensure the function exits after displaying the response
            }

            console.log(`No relevant options found in disambiguation page.`);
            logToConsole("No relevant options found in disambiguation page.", 'warn');
            // Handle the case where options list is empty
            return { text: "No relevant options were found for this topic.", image: null };
        } else {
            throw new Error(`Failed to fetch disambiguation page. Status code: ${status}`);
        }
    } catch (error) {
        console.error(`Error fetching disambiguation page data: ${error.message}`);
        logToConsole(`Error fetching disambiguation page data: ${error.message}`, 'error');
        return { text: "There was an error fetching disambiguation details from Wikipedia.", image: null }; // Return error response
    }
}

// Function: handleUserSelection
// Purpose: Handles user input to select an option from a disambiguation list.
// Fetches the content for the selected option or resets the state if the input is invalid.
async function handleUserSelection(input) {
    try {
        const selectedIndex = parseInt(input.trim(), 10) - 1; // Convert user input to a 0-based index

        if (!isNaN(selectedIndex) && selectedIndex >= 0 && selectedIndex < optionsList.length) {
            const selectedOption = optionsList[selectedIndex]; // Retrieve the selected option
            console.log(`Valid selection: ${selectedOption.text}`);
            logToConsole(`Valid selection: ${selectedOption.text}`, 'info');

            const response = await fetch(selectedOption.apiUrl); // Fetch details for the selected option
            if (response.ok) {
                const data = await response.json(); // Parse the JSON response
                const pages = Object.values(data.query.pages);

                if (pages.length > 0 && !pages[0].missing) {
                    const page = pages[0];
                    awaitingSelection = false; // Reset the selection state
                    // Return the content of the selected page
                    return {
                        text: page.extract?.replace(/<[^>]+>/g, '') || "No detailed information available.",
                        image: page.thumbnail?.source || null,
                    };
                }
            }
            return { text: "Sorry, I couldn't fetch details for the selected option.", image: null }; // Handle fetch failure
        } else if (isNaN(selectedIndex)) {
            console.log("Non-numeric input detected. Treating as a new query.");
            logToConsole("Non-numeric input detected. Treating as a new query.", 'warn');
            awaitingSelection = false; // Reset the state
            return await generateResponse(input); // Process as a new query
        } else {
            console.log("Invalid selection number provided.");
            logToConsole("Invalid selection number provided.", 'warn');
            return { text: "Invalid selection. Please try again or enter a new query.", image: null }; // Return error message
        }
    } catch (error) {
        console.error(`Error in handleUserSelection: ${error.message}`);
        logToConsole(`Error in handleUserSelection: ${error.message}`, 'error');
        return { text: "There was an error processing your selection.", image: null }; // Return error response
    }
}
