console.log("app.js loaded"); // Confirm that the app.js script has been successfully included in the project
logToConsole("app.js script successfully loaded.", 'info');

console.log(window.wikiTriggers); // Log predefined trigger phrases for debugging and verification
logToConsole(`wikiTriggers loaded: ${JSON.stringify(window.wikiTriggers)}`, 'info');

console.log(window.specificResponses); // Log specific responses object to ensure it is loaded correctly
logToConsole("specificResponses object initialized.", 'info');

// Global variables for app state management
let lastResponse = null; // Stores the last bot response object to enable metadata or retry logic
let awaitingSelection = false; // Tracks whether the bot is waiting for user disambiguation input
let optionsList = []; // Stores options presented to the user for disambiguation
let typingInterval = null; // Stores the interval ID for typing effect
let isTyping = false; // Flag indicating whether the bot is simulating typing
let userScrolling = false; // Tracks if the user is manually scrolling, used to prevent auto-scroll interruptions
let chatBox = null; // Global reference to the chat box for appending messages
let isResponsesLoaded = false; // Flag to check if specific responses are loaded

// Detect if the user is on an Android device using the user-agent string
const isAndroid = /android/i.test(navigator.userAgent);

// Initialize an empty object to store specific responses loaded from JSON
window.specificResponses = {};

// Load the specificResponses from an external JSON file
async function loadSpecificResponses() {
    try {
        const response = await fetch('./data/specificResponses.json'); // Request JSON file
        if (!response.ok) throw new Error(`Failed to load specificResponses.json: ${response.status}`); // Handle HTTP errors
        const data = await response.json(); // Parse JSON response
        window.specificResponses = data.responses; // Assign loaded responses to global variable
        isResponsesLoaded = true; // Set loaded flag
        console.log("JSON Responses loaded successfully:", window.specificResponses); // Log success
        logToConsole("JSON Responses loaded successfully.", 'info');
    } catch (error) {
        console.error("Error loading specificResponses.json:", error); // Log error details
        logToConsole(`Error loading specificResponses.json: ${error.message}`, 'error');
        isResponsesLoaded = false; // Reset loaded flag on failure
    }
}

// Match user input with predefined specific responses
function getSpecificResponse(userInput) {
    if (!window.specificResponses || window.specificResponses.length === 0) {
        console.warn("specificResponses is empty or not loaded yet."); // Warn if no responses are available
        logToConsole("specificResponses is empty or not loaded yet.", 'warn');
        return null; // Return null if no match can be found
    }

    // Normalize user input for consistent matching
    const normalizedInput = userInput.toLowerCase();

    for (const response of window.specificResponses) {
        const triggers = response.triggers || []; // Retrieve trigger words
        if (triggers.some(trigger => normalizedInput.includes(trigger.toLowerCase()))) {
            // Check if `response.response` is an array and return a random response
            if (Array.isArray(response.response)) {
                const randomIndex = Math.floor(Math.random() * response.response.length);
                return response.response[randomIndex];
            } else if (typeof response.response === "string") {
                return response.response; // Return single string response
            }
        }
    }
    return null; // No match found
}

// Initialize app when DOM content is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded. Initializing application."); // Log initialization
    logToConsole("DOM fully loaded. Initializing application.", 'info');

    // Initialize chat box
    chatBox = document.getElementById("chat-box"); // Locate chat box element
    if (chatBox) {
        console.log("Chat box element found and initialized."); // Log chat box initialization
        logToConsole("Chat box element found and initialized.", 'info');

        // Attach scroll listener to the chat box
        chatBox.addEventListener("scroll", () => {
            const isAtBottom = chatBox.scrollTop + chatBox.clientHeight >= chatBox.scrollHeight - 10; // Check scroll position
            userScrolling = !isAtBottom; // Update scrolling state
          //  console.log(`User scrolling detected. Auto-scroll enabled: ${!userScrolling}`);
          //  logToConsole(`User scrolling detected. Auto-scroll enabled: ${!userScrolling}`, 'info');
        });
    } else {
        console.error("Chat box element not found in the DOM."); // Log error if chat box is missing
        logToConsole("Chat box element not found in the DOM.", 'error');
    }

    // Load specific responses when the DOM is ready
    loadSpecificResponses()
        .then(() => {
            console.log("Specific responses loaded successfully."); // Log successful response load
            logToConsole("Specific responses loaded successfully.", 'info');
        })
        .catch((error) => {
            console.error(`Error loading specific responses: ${error.message}`);
            logToConsole(`Error loading specific responses: ${error.message}`, 'error');
        });

    // Initialize user input field
    const userInput = document.getElementById("user-input"); // Locate user input field
    if (userInput) {
        console.log("User input field initialized.");
        logToConsole("User input field initialized.", 'info');

        // Adjust scroll behavior on Android when the input gains focus
        userInput.addEventListener("focus", () => {
           // console.log("User input field focused.");
          //  logToConsole("User input field focused.", 'info');
            if (isAndroid) {
                setTimeout(() => {
                    userInput.scrollIntoView({ behavior: "smooth", block: "center" });
                    console.log("Input field scrolled into view (Android adjustment).");
                    logToConsole("Input field scrolled into view (Android adjustment).", 'info');
                }, 300);
            } else {
                document.documentElement.scrollTop = 0; // Reset scroll for non-Android
                document.body.scrollTop = 0;
                //console.log("Scroll position reset for non-Android devices.");
               // logToConsole("Scroll position reset for non-Android devices.", 'info');
            }
        });

        // Handle Enter key submissions
        userInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
             //   console.log("Enter key pressed in user input field."); // Log Enter key press
             //   logToConsole("Enter key pressed in user input field.", 'info');
                if (isTyping) {
                    console.log("Typing in progress. Stopping typing effect.");
                    logToConsole("Typing in progress. Stopping typing effect.", 'info');
                    stopTypingWithEllipsis();
                }
                sendMessage(); // Process user message
                dismissKeyboard(); // Hide keyboard
            }
        });
    } else {
        console.error("User input field not found in the DOM.");
        logToConsole("User input field not found in the DOM.", 'error');
    }

    // Initialize send button
    const sendButton = document.getElementById("send-button"); // Locate send button
    if (sendButton) {
        console.log("Send button element found and initialized.");
        logToConsole("Send button element found and initialized.", 'info');

        // Attach click event listener to the send button
        sendButton.addEventListener("click", () => {
            console.log("Send button clicked."); // Log button click
            logToConsole("Send button clicked.", 'info');
            if (isTyping) {
                console.log("Typing in progress. Stopping typing effect.");
                logToConsole("Typing in progress. Stopping typing effect.", 'info');
                stopTypingWithEllipsis();
            }
            sendMessage(); // Process user message
            dismissKeyboard(); // Hide keyboard
        });
    } else {
        console.error("Send button not found in the DOM.");
        logToConsole("Send button not found in the DOM.", 'error');
    }

    // Typing effect and its logs
    if (isTyping) {
        console.log("Typing effect initialized.");
        logToConsole("Typing effect initialized.", 'info');
    } else {
        console.log("Typing effect not active.");
        logToConsole("Typing effect not active.", 'info');
    }

    // Log completion of DOMContentLoaded
    console.log("Application initialization complete."); // Log application readiness
    logToConsole("Application initialization complete.", 'info');
});

// Function to handle sending the user's message
function sendMessage() {
    const userInputElement = document.getElementById("user-input"); // Get reference to user input field
    if (!userInputElement || !chatBox) {
        console.error("Required DOM elements are missing."); // Log error if critical elements are missing
        logToConsole("Required DOM elements are missing.", 'error');
        return;
    }

    let userInput = userInputElement.value.trim(); // Trim whitespace from user input
    userInputElement.value = ""; // Clear the input field immediately after retrieving the value

    if (!userInput) {
        console.warn("Empty user input. No message sent.");
        logToConsole("Empty user input. No message sent.", 'warn');
        return; // Exit if the input is empty
    }

    console.log(`User input received: ${userInput}`); // Log received input
    logToConsole(`User input received: ${userInput}`, 'info');

    // Append the user's message to the chatbox
    appendMessage(chatBox, "You", userInput);

    const specificResponse = getSpecificResponse(userInput); // Match input with predefined response
    if (specificResponse) {
        console.log(`Specific response matched: ${specificResponse}`);
        logToConsole(`Specific response matched: ${specificResponse}`, 'info');
        displayResponse(chatBox, { text: specificResponse }); // Show matched response
        return; // Exit early if a specific response is found
    }

    userInput = sanitizeInput(userInput); // Clean up user input to prevent issues

    // Stop typing effect if active
    if (typingInterval) {
        clearInterval(typingInterval); // Clear typing interval
        typingInterval = null;
        isTyping = false;
        console.log(`Typing effect stopped.`);
        logToConsole("Typing effect stopped.", 'info');
    }

    userScrolling = false; // Reset auto-scroll behavior
    setTimeout(() => {
        chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom of the chat box
    }, 0);

    // Handle workflow if awaiting disambiguation input
    if (awaitingSelection) {
        const optionIndex = parseInt(userInput, 10) - 1; // Convert user input to a 0-based index
        if (isNaN(optionIndex) || optionIndex < 0 || optionIndex >= optionsList.length) {
            console.warn(`Invalid selection during disambiguation.`);
            logToConsole("Invalid selection during disambiguation.", 'warn');
            // Exit disambiguation mode and process input as a new query
            awaitingSelection = false;
            generateResponse(userInput)
                .then((response) => {
                    lastResponse = response; // Store response for metadata
                    displayResponse(chatBox, response); // Display the response
                })
                .catch((error) => {
                    console.error("Error processing the message:", error);
                    logToConsole(`Error processing the message: ${error.message}`, 'error');
                    appendMessage(chatBox, "SymbolicBot", "There was an error processing your message. Please try again.");
                });
            return;
        }
    }

    // Choose appropriate response handler based on current workflow state
    const responseHandler = awaitingSelection ? handleUserSelection : generateResponse;

    responseHandler(userInput)
        .then((response) => {
            console.log("Response generated:", response);
            logToConsole("Response generated.", 'info');
            lastResponse = response; // Save response for future reference
            displayResponse(chatBox, response); // Show bot's response
        })
        .catch((error) => {
            console.error("Error processing the message:", error);
            logToConsole(`Error processing the message: ${error.message}`, 'error');
            appendMessage(chatBox, "SymbolicBot", "There was an error processing your message. Please try again.");
        });
}

// Sanitize user input to remove unwanted characters or formatting
function sanitizeInput(input) {
    const sanitizedInput = input
        .replace(/'/g, "") // Remove single quotes
        .replace(/[^\w\s"]+/g, "") // Remove special characters except alphanumeric and spaces
        .replace(/\s{2,}/g, " "); // Replace multiple spaces with a single space

    console.log(`Sanitized input: ${sanitizedInput}`);
    logToConsole(`Sanitized input: ${sanitizedInput}`, 'info');
    return sanitizedInput;
}

// Append a message to the chat UI
function appendMessage(container, sender, message) {
    const messageElement = document.createElement("p"); // Create a new paragraph element for the message
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`; // Format message content
    container.appendChild(messageElement); // Add message to the chat box

    console.log(`Message appended to chat: ${message}`);
    logToConsole(`Message appended to chat: ${message}`, 'info');
}

// Display bot's response with a typing effect and optional metadata
function displayResponse(chatBox, response, typingSpeed = 200) {
    if (!response || typeof response.text !== "string") {
        console.error("Invalid response format. 'text' must be a string.");
      //  logToConsole("Invalid response format. 'text' must be a string.", 'error');
        return;
    }

    if (typingInterval) {
        clearInterval(typingInterval); // Stop any ongoing typing effect
        typingInterval = null;
    }
    isTyping = true; // Set typing flag to true

    const messageElement = document.createElement("p");
    messageElement.innerHTML = `<strong>SymbolicBot:</strong> `;
    chatBox.appendChild(messageElement);

    const words = response.text.split(" "); // Safely split text into words
    let wordIndex = 0;

    // Typing effect
    typingInterval = setInterval(() => {
        if (wordIndex < words.length) {
            messageElement.innerHTML += words[wordIndex] + " ";
            if (!userScrolling) {
                chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the bottom
            }
            wordIndex++;
        } else {
            clearInterval(typingInterval);
            typingInterval = null;
            isTyping = false;

           // console.log("Typing effect complete.");
           // logToConsole("Typing effect complete.", 'info');

            // Display image if present in the response
            if (response.image) {
                const imgElement = document.createElement("img");
                imgElement.src = response.image;
                imgElement.alt = "Response Image";
                imgElement.className = "response-image";
                chatBox.appendChild(imgElement);
                if (!userScrolling) {
                    chatBox.scrollTop = chatBox.scrollHeight;
                }
                console.log("Image appended to response.");
                logToConsole("Image appended to response.", 'info');
            }

            // Append source and license metadata if available
            appendSourceAndLicense(chatBox, response);

            if (!userScrolling) {
                chatBox.scrollTop = chatBox.scrollHeight; // Final scroll to ensure full response visibility
            }
        }
    }, typingSpeed); // Custom typing speed
}

// Stop typing and append ellipsis, then ensure metadata is appended
function stopTypingWithEllipsis() {
    if (typingInterval) {
        clearInterval(typingInterval); // Clear the current typing effect interval to stop it
        typingInterval = null; // Reset the interval variable
        isTyping = false; // Update typing state to indicate the bot is no longer typing

        const ellipsis = document.createElement("span"); // Create a new span element for the ellipsis
        ellipsis.innerHTML = "..."; // Add three dots to indicate continuation or pause
        chatBox.lastElementChild.appendChild(ellipsis); // Append ellipsis to the last message in the chat box

        console.log("Ellipsis appended to the last message.");
        logToConsole("Ellipsis appended to the last message.", 'info');

        appendSourceAndLicense(chatBox, lastResponse); // Ensure source and license metadata is appended to the message
    }
}

// Append source and license metadata to the chat box
function appendSourceAndLicense(chatBox, response) {
    if (!response || !response.source || !response.license) return; // Exit if response lacks required metadata

    // Decode the source URL for display, extracting the page title
    const decodedSourceTitle = decodeURIComponent(response.source.split("/").pop());

    const sourceElement = document.createElement("p"); // Create a new paragraph element for metadata
    sourceElement.innerHTML = `
        <br>... [Source: <a href="${response.source}" target="_blank" rel="noopener noreferrer">${decodedSourceTitle}</a>]
        <br>[License: <a href="${response.license}" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a>]
    `; // Add metadata with clickable links for source and license
    chatBox.appendChild(sourceElement); // Append the metadata element to the chat box

    console.log("Source and license metadata appended to response.");
    logToConsole("Source and license metadata appended to response.", 'info');

    if (!userScrolling) {
        chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom of the chat box if the user is not manually scrolling
    }
}

// Populate options list with disambiguation data
function populateOptionsList(disambiguationData) {
    optionsList = disambiguationData.map((item) => ({
        text: item.text || "Unknown Text", // Use 'text' as the item title or fallback to a default
        description: item.description || "No description available", // Include a description if available
        source: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.text || "Unknown Text")}`, // Construct source URL for the option
        image: item.image || null, // Include an image if available, otherwise set to null
    }));

    console.log("Options List Populated:", optionsList); // Log populated options for debugging and data integrity verification
    logToConsole("Options list populated successfully.", 'info');
}

// Handle disambiguation results and display response
function handleDisambiguation(response) {
    if (!response || !response.text) {
        console.error("Disambiguation response is missing required fields."); // Log error if the response is invalid
        logToConsole("Disambiguation response missing required fields.", 'error');
        return;
    }

    displayResponse(chatBox, response); // Use central display function to handle the response

    // Append metadata if source and license information are available
    if (response.source && response.license) {
        appendSourceAndLicense(chatBox, response);
    }

    console.log("Disambiguation response displayed successfully."); // Log successful handling
    logToConsole("Disambiguation response displayed successfully.", 'info');
}

// Process user selection during disambiguation
function handleUserSelection(selection) {
    const optionIndex = parseInt(selection, 10) - 1; // Convert user input to a 0-based index

    console.log("User Selection:", selection); // Log the raw user input for debugging
    logToConsole(`User selection received: ${selection}`, 'info');
    console.log("Option Index:", optionIndex); // Log the calculated index
    logToConsole(`Calculated option index: ${optionIndex}`, 'info');
    console.log("Options List:", optionsList); // Log the full list of options for reference
    logToConsole("Full options list logged for reference.", 'info');

    if (isNaN(optionIndex) || optionIndex < 0 || optionIndex >= optionsList.length) {
        // Handle invalid selection
        const response = { text: "Invalid selection. Please try again." };
        displayResponse(chatBox, response); // Display error message using central function
        console.error("Invalid selection: index out of range or not a number.");
        logToConsole("Invalid selection provided by user.", 'warn');
        return Promise.reject("Invalid selection"); // Reject the promise with an error
    }

    const selectedOption = optionsList[optionIndex]; // Get the selected option from the list
    if (!selectedOption || !selectedOption.text) {
        // Handle missing or invalid option
        const response = { text: "Selection could not be processed. Please try again." };
        displayResponse(chatBox, response); // Display error message using central function
        console.error("Selected option missing or invalid.");
        logToConsole("Selected option missing or invalid.", 'error');
        return Promise.reject("Invalid option"); // Reject the promise with an error
    }

    // Construct Wikipedia API URL to fetch the full article
    const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&exintro&titles=${encodeURIComponent(
        selectedOption.text
    )}&format=json&redirects=1&pithumbsize=500&origin=*`;

    logToConsole(`Fetching full article for selected option: ${selectedOption.text}`, 'info');
    console.log("Fetching article from API URL:", apiUrl);

    return fetch(apiUrl)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to fetch article."); // Throw error for HTTP failures
            }
            return response.json(); // Parse the response as JSON
        })
        .then((data) => {
            const page = data.query.pages[Object.keys(data.query.pages)[0]]; // Extract the first page from the response
            if (!page || !page.extract) {
                throw new Error("No detailed information available."); // Handle missing content
            }

            const response = {
                text: `You selected: ${selectedOption.text}\n\n${page.extract}`, // Combine selection and article extract
                source: `https://en.wikipedia.org/wiki/${encodeURIComponent(selectedOption.text)}`, // Include article URL
                license: "https://creativecommons.org/licenses/by-sa/4.0/", // Add license link
                image: page.thumbnail?.source || null, // Include image if available
            };

            console.log("Selected Option Full Article Response:", response); // Log full article response for debugging
            logToConsole("Full article fetched and response prepared.", 'info');

            lastResponse = response; // Save the response for reference
            displayResponse(chatBox, response); // Use central display function to handle the response
            return response;
        })
        .catch((error) => {
            console.error("Error fetching full article:", error); // Log errors encountered during fetch
            logToConsole(`Error fetching full article: ${error.message}`, 'error');
            const response = { text: "There was an error fetching the full article. Please try again." };
            displayResponse(chatBox, response); // Display fallback message using central function
            return Promise.reject(error); // Reject the promise with the error
        });
}

// Hide the keyboard on mobile devices to improve UX
function dismissKeyboard() {
    const input = document.getElementById("user-input"); // Get reference to the input field
    input.blur(); // Remove focus from the input field to dismiss the keyboard
    document.documentElement.scrollTop = 0; // Reset scroll position of the HTML document
    document.body.scrollTop = 0; // Reset scroll position of the body element

   // console.log("Keyboard dismissed and scroll position reset."); // Log keyboard dismissal
   // logToConsole("Keyboard dismissed and scroll position reset.", 'info');
}

