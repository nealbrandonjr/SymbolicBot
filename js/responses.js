console.log("responses.js loaded"); // Log confirmation that responses.js script has been successfully included
logToConsole("responses.js script loaded successfully.", 'info');
console.log(window.wikiTriggers); // Log the array of trigger phrases to ensure they are correctly initialized
logToConsole(window.wikiTriggers, 'info');

// Define an array of trigger phrases. These phrases prompt the bot to query Wikipedia when detected in user input.
window.wikiTriggers = [
    "what", "who", "who is", "what is", "when is", "where", "where is", "how", "how to", 
    "tell me", "what happened", "what are", "who are",
    "who wrote", "who created", "who made", "how many", "when",
    "when did", "why", "explain", "describe"
];

// Log initialization of WikiTriggers
console.log(`WikiTriggers initialized.`);
logToConsole(`WikiTriggers initialized.`, 'info');

// Define words to exclude from user input before sending queries to Wikipedia.
// This helps narrow down the input to its most relevant parts, improving search results.
window.excludedWords = [
    "a", "an", "the", "this", "then", "their", "when", "we", "who", "what", "why", "and", "if", "that", "where", 
    "with", "you", "your", "about", "tell", "me", "had", "have", "not", "occur", "occurred", "history", 
    "historical", "past", "present", "future", "current", "new", "news", "old", "newer", "older", "oldest", 
    "newest", "year", "years", "how", "has", "too", "to", "top", "won", "win", "wins", "show", "is", "wrote", "written",
    "made", "makes", "written", "movie", "song", "sings", "title", "art", "artwork", "drew", "drawn", "tv", "show", "podcast",
    "do", "does", "occur", "occurred", "are", "did", "don't", "didn't", "on", "off"
];

// Log initialization of ExcludedWords
console.log(`ExcludedWords initialized.`);
logToConsole(`ExcludedWords initialized.`, 'info');

// Reflection logic: Generate conversational responses by rephrasing user's input using predefined patterns.
function reflectInput(userInput) {
    console.log(`Original Input: "${userInput}"`);
    logToConsole(`Original user input for reflection: "${userInput}"`, 'info');

    const reflections = {
        "i am": "Why do you believe you are",
        "i feel": "What makes you feel",
        "i think": "Why do you think",
        "i want": "Why do you want",
        "i hate": "What makes you hate",
        "i love": "Why do you love",
        "i need": "Why do you need",
        "i should": "Why do you feel you should",
        "i hope": "What makes you hopeful",
        "i miss": "Why do you miss",
        "i regret": "What do you regret about",
        "i forgive": "What made you forgive",
        "you are": "Why do you believe i am",
        "you feel": "What makes you think I feel",
        "you think": "Why do you think",
        "you want": "Why do I want",
        "you hate": "What would make me hate",
        "you love": "Why do I love",
        "you need": "Why do I need",
        "you should": "Why do you feel I should",
        "you hope": "What would make me hopeful",
        "you miss": "Why do I miss",
        "you regret": "What do I regret about",
        "you forgive": "What made me forgive",
        "you cant": "Why do you believe that",
        "we are": "Why do you believe we are",
        "we feel": "What makes you think we feel",
        "we think": "Why do we think",
        "we want": "Why do we want",
        "we hate": "What would make us hate",
        "we love": "Why do we love",
        "we need": "Why do we need",
        "we should": "Why do you feel we should",
        "we hope": "What would make us hopeful",
        "we miss": "Why do we miss",
        "we regret": "What do we regret about",
        "we forgive": "What made us forgive",
        "they are": "Why do you believe they are",
        "they feel": "What makes you think they feel",
        "they think": "Why do they think",
        "they want": "Why do they want",
        "they hate": "What would make them hate",
        "they love": "Why do they love",
        "they need": "Why do they need",
        "they should": "Why do you feel they should",
        "they hope": "What would make them hopeful",
        "they miss": "Why do they miss",
        "they regret": "What do they regret about",
        "they forgive": "What made them forgive"
    };

    let reflectedResponse = ` ${userInput.toLowerCase().trim()} `;

    for (const key in reflections) {
        const reflectionRegex = new RegExp(`^ ${key}\\b`, "i");
        if (reflectionRegex.test(reflectedResponse)) {
            const reflection = reflections[key];
            let trimmedPart = reflectedResponse.replace(reflectionRegex, "").trim();
            trimmedPart = adjustPronouns(trimmedPart, "object");

            const finalResponse = `${reflection} ${trimmedPart}?`.trim();
            console.log(`Final Combined Response: "${finalResponse}"`);
            logToConsole(`Reflected response generated: "${finalResponse}"`, 'info');
            return finalResponse; // Proper return statement inside the function
        }
    }

    console.log("No reflections matched.");
    logToConsole("No reflections matched the input.", 'warn');
    return null; // Return null if no reflection matches
}

const subjectPronouns = {
    "i": "you",
    "you": "i",
    "we": "you",
    "they": "us",
    "he": "she",
    "she": "he",
    "me": "you",
    "my": "your",
    "your": "my"
};

const objectPronouns = {
    "me": "you",
    "you": "me",
    "my": "your",
    "your": "my",
    "us": "them",
    "them": "us",
    "him": "her",
    "her": "him",
    "mine": "yours",
    "yours": "mine"
};

// Utility function to swap pronouns in user input, make responses feel more personal.
function adjustPronouns(text, pronounType) {
    const pronouns = pronounType === "subject" ? subjectPronouns : objectPronouns;
    return text
        .split(" ")
        .map((word) => pronouns[word.toLowerCase()] || word) // Replace if in pronouns mapping
        .join(" ");
}

// Generate a response based on the user's input by checking for specific matches, Wikipedia triggers, or fallback logic.
async function generateResponse(input) {
    try {
        // Ensure specific responses are loaded before processing
        if (!isResponsesLoaded) {
            console.warn("Specific responses not loaded yet. Waiting...");
            logToConsole("Specific responses not loaded yet. Waiting...", 'warn');
            await loadSpecificResponses(); // Ensure specificResponses.json is fully loaded
        }

        const normalizedInput = input.trim().toLowerCase(); // Normalize input for consistent processing
        console.log(`Normalized Input in generateResponse: "${normalizedInput}"`);
        logToConsole(`Normalized user input: "${normalizedInput}"`, 'info');

        // Step 1: Help command handling
        if (normalizedInput === "help") {
            console.log("Help command triggered.");
            logToConsole("Help command triggered.", 'info');
            const helpMessage = `
                Here are the commands you can use:<br>
                - <b>help</b>: Displays this help menu.<br>
                - <b>Double</b> <b>Quotes</b>: Using double quotes around words will send those words to Wikipedia API.<br>
                - <b>Wiki</b> <b>Triggers</b>: Using the following words first will send the entire submitted sentence to Wikipedia API: Who, What, Where, When, Why, How, Explain, Describe.<br>
                - <b>Specified</b> <b>Responses</b>: Can chat with the Symbolic AI using questions like: What are you doing, how are you, goodbye.<br>
                - <b>Reflections</b>: Can ask the Symbolic Bot Reflection statements such as: I see, you are, we should, they want.<br>
                - <b>Pronoun</b> <b>Types</b>: Used with Reflections. Such as: I, you, me, he, she, your, they.<br>
                - <b>Jokes</b>: Can type "Tell me a joke" to have SymbolicBot try to make you laugh.<br>
                [END OF HELP MENU]<br>
            `.trim();

            displayResponse(chatBox, { text: helpMessage }, 50); // Faster typing for Help
            return; // Ensure the function ends here
        }


        // Step 2: Check for predefined specific responses
        const specificResponse = getSpecificResponse(normalizedInput);
        if (specificResponse) {
            console.log(`Specific Response Matched: "${specificResponse}"`);
            logToConsole(`Specific response matched: "${specificResponse}"`, 'info');
            return { text: specificResponse, image: null };
        }

        // Step 3: Check for reflection-based responses
        const reflectedResponse = reflectInput(input);
        if (reflectedResponse) {
            console.log(`Reflected Response Generated: "${reflectedResponse}"`);
            logToConsole(`Reflected response generated: "${reflectedResponse}"`, 'info');
            return { text: reflectedResponse, image: null };
        }

        // Step 4: Check for Wikipedia triggers
        if (shouldQueryWikipedia(normalizedInput)) {
            console.log(`Wikipedia Trigger Matched for Input: "${normalizedInput}"`);
            logToConsole(`Wikipedia trigger matched for input: "${normalizedInput}"`, 'info');
            const filteredQuery = filterInput(normalizedInput);
            console.log(`Filtered Query for Wikipedia: "${filteredQuery}"`);
            logToConsole(`Filtered query for Wikipedia: "${filteredQuery}"`, 'info');
            return await getWikipediaSummary(filteredQuery);
        }

        // Step 5: Fallback response
        console.log("No match found. Providing fallback response.");
        logToConsole("No match found. Providing fallback response.", 'warn');
        const fallbackResponses = [
            "I see. That's interesting. Tell me more.",
            "Can you elaborate more on that?",
            "I'm here to listen. What else is on your mind?",
            "Could you explain that a bit more?",
            "By the way, you can type 'help' for a list of commands."
        ];
        const randomFallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        return { text: randomFallback, image: null };

    } catch (error) {
        console.error("Error in generateResponse:", error);
        logToConsole(`Error in generateResponse: ${error.message}`, 'error');
        return { text: "There was an error processing your input. Please try again later.", image: null };
    }
}

