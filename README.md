# SymbolicBot v1.4.9

## Author
**Version:** 1.4.9  
**Author:** Neal Brandon Jr  
**Website:** [www.nealsdevsite.com](https://www.nealsdevsite.com)

## Purpose
**SymbolicBot** is a rule-based chatbot designed to demonstrate the capabilities of symbolic AI and its integration with external APIs. It includes:
- A conversational interface powered by symbolic logic, capable of handling predefined responses, reflective prompts, and queries to external APIs.
- Integration with the **Wikipedia API** to fetch relevant data in real-time.
- A platform for learning and experimenting with symbolic AI systems.

## Features
- **Symbolic Logic for Conversational AI**:
  - Uses a set of rules, reflections, and specific responses to simulate intelligent behavior.
  - Provides reflective responses to user input based on predefined logic.
- **Wikipedia Integration**:
  - Extracts summaries and images from Wikipedia based on user queries.
  - Handles disambiguation pages with a selection-based approach.
- **Interactive Console**:
  - Displays real-time logs for debugging and monitoring bot behavior.
- **User-Friendly Interface**:
  - Retro-inspired design with responsive layout.
  - Input field for user queries with instant bot responses.
- **Help and Commands**:
  - Users can type "menu" to access a help menu detailing the bot's capabilities.

## Technologies Used
- **HTML5**: Structure and layout of the application.
- **CSS3**: Retro-themed styling with responsive design.
- **JavaScript**: Core logic for symbolic processing and API integration.
- **Wikipedia API**: Fetches real-time data for user queries.

## How to Use
### Requirements
- A modern web browser (e.g., Chrome, Firefox, Edge).

### Steps
1. Download or clone this repository.

2. Due to CORS restrictions, the bot cannot fetch data from external APIs like Wikipedia when run directly from a local file. To run this application, you must use one of the following methods:

Option 1: Run with a Local Server

- Use a lightweight local server such as:

-- Python: Run python -m http.server in the project directory and access the app via http://localhost:8000.

-- Node.js: Use tools like http-server or live-server.

-- XAMPP/WAMP: Place the project files in the server's root directory and access the app via your browser.

Option 2: Deploy to a Web Server

- Upload the project files to a web hosting service.

Option 3: Use a CORS Proxy

- If you cannot use a server or hosting service, consider using a CORS proxy to bypass CORS restrictions.
-- However, this is not recommended for production due to potential security and performance concerns.

3. Access the application via your browser:

- Open the index.html file if running on a server.

- Or use the deployed URL if hosted online.

4. Use the following features:
   - **Input Field**:
     - Type a query and press Enter or click the "Send" button.
   - **Trigger Words**:
     - Use specific phrases like "what is," "who created," or "tell me about" to fetch data from Wikipedia.
   - **Reflection Words**:
     - Use reflection phrases like "I am, you are, we are, they are" to receive reflection responses.
   - **Help Menu**:
     - Type "help" to view available commands and features.
   - **Disambiguation**:
     - If the bot encounters multiple meanings for a query, it will provide a list of options for selection.
5. View the console output for real-time debugging and interaction logs.

## License
This project is licensed under the MIT License.  
For details, visit the [LICENSE](LICENSE) file or the [MIT License page](https://opensource.org/licenses/MIT).

### Attribution
If you use this project, please credit:  
[www.nealsdevsite.com](https://www.nealsdevsite.com)

## Contribution
Contributions are welcome! Fork this repository and submit a pull request or suggest fixes.

## Contact
For inquiries or support, visit [www.nealsdevsite.com](https://www.nealsdevsite.com).

## Version
**v1.4.9**
