console.log("utils.js loaded"); // Confirmation that utils.js script has loaded successfully
logToConsole(`utils.js loaded`, 'info');
console.log(window.wikiTriggers); // Log wikiTriggers array to verify initialization
logToConsole(JSON.stringify(window.wikiTriggers), 'info');

// Function: filterInput
// Purpose: Processes and sanitizes user input to prepare refined queries for Wikipedia API.
// Highlights:
// - Prioritizes quoted phrases for more accurate querying.
// - Filters unnecessary words based on excludedWords and wikiTriggers.
// - Cleans input by stripping punctuation and converting to lowercase.
// - Builds final query string prioritizing quoted content.

function filterInput(input) {
    try {
        // Input validation: Ensure input is non-empty string.
        if (typeof input !== 'string' || input.trim() === '') {
            console.error("Invalid input provided to filterInput function."); // Log invalid input scenario
            logToConsole(`Invalid input provided to filterInput function.`, 'error');
            return ''; // Return empty string for invalid input
        }

        console.log(`Original input: "${input}"`);
        logToConsole(`Original input for filtering: "${input}"`, 'info');
        const quotedParts = []; // Array to store quoted phrases extracted from input

        // Extract quoted phrases using RegEx and remove them from input
        input = input.replace(/"([^"]*)"/g, (match, p1) => {
            quotedParts.push(p1.trim()); // Store cleaned quoted phrase
            return ''; // Remove quoted content from main input
        });

        // Input sanitization:
        // - Lowercase transformation for consistency.
        // - Remove punctuation and special characters except whitespaces.
        const sanitizedInput = input.toLowerCase().replace(/[^\w\s]/g, ''); // Optimize for single-pass cleanup
        console.log(`Sanitized input: "${sanitizedInput}"`);
        logToConsole(`Sanitized input: "${sanitizedInput}"`, 'info');

        // Split input into words using whitespace delimiter
        const words = sanitizedInput.split(/\s+/);

        // Filter words to exclude unnecessary terms defined in excludedWords and wikiTriggers.
        const filteredWords = words.filter(word => !excludedWords.includes(word) && !wikiTriggers.includes(word));

        // Assemble final query by prioritizing quoted phrases followed by filtered words
        const finalQuery = [...quotedParts, filteredWords.join(' ')].filter(Boolean).join(' ').trim();
        console.log(`Filtered input for query: "${finalQuery}"`);
        logToConsole(`Filtered input for query: "${finalQuery}"`, 'info'); // Log refined query for debugging

        return finalQuery; // Return constructed query string
    } catch (error) {
        console.error("Error in filterInput function:", error); // Log unexpected errors
        logToConsole(`Error in filterInput function: ${error.message}`, 'error');
        return ''; // Return an empty string in case of error to Safeguard against runtime crashes
    }
}

// Function: logToConsole
// Purpose: Centralized logging for both:
// - On-page UI console for user visibility.
// - Browser's developer console for debugging.
// Highlights:
// - Handles missing DOM elements gracefully.
// - Ensures log messages are visible with auto-scroll.

// Utility for structured logging
function logToConsole(message, type = 'info') {
    try {
        const consoleBox = document.getElementById("console-box");
        if (!consoleBox) {
            console.error("Console box not found in the DOM.");
            logToConsole(`Console box not found in the DOM.`, 'error');
            return;
        }

        const logMessage = document.createElement("p");
        logMessage.textContent = `${new Date().toLocaleTimeString()} [${type.toUpperCase()}]: ${message}`;
        logMessage.style.color = type === 'error' ? 'red' : type === 'warn' ? 'orange' : '#80FF80';

        consoleBox.appendChild(logMessage);
        consoleBox.scrollTop = consoleBox.scrollHeight;
    } catch (error) {
        console.error("Error in logToConsole function:", error);
        logToConsole(`Error in logToConsole function:`, 'error');
    }
}

