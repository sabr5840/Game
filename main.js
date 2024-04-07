// Configuration for the game including the player's board
var settings = {
    playerBoard: null, // Holds the state of the player's board
}

var game = null; // Placeholder for the game instance

/* Delays execution for a given number of milliseconds, useful for creating pauses */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/* Refreshes the user interface elements related to the game panels and footers, setting them up for a new game */
function refreshUI() {
    // Update the footer texts and reset their colors for player and AI.
    for (let id of ['player-footer', 'ai-footer']) {
        let elem = document.getElementById(id);
        elem.innerText = (id === 'player-footer') ? "Player" : "AI";
        elem.style.color = "";
    }
    // Reset text colors in the player and AI panels
    for (let id of ['player-panel', 'ai-panel']) {
        let divs = document.querySelectorAll(`#${id} div`)
        for (let div of divs) {
            div.style.color = "";
        }
    }
}

/* Controls the enabled/disabled state of the game control buttons (Start and Randomize) */
function adjustButtonsState(disabled = true) {
    let buttonIds = ['start-btn', 'randomize-btn']; 
    for (let id of buttonIds) {
        let element = document.getElementById(id);
        if (element) { 
            element.disabled = disabled; // Disable or enable buttons based on argument
        }
    }
}

/* Initialize HTML document with two empty boards */
function initBoards() {
    let boardIds = ["playerboard", "enemyboard"]
    let rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    for (let boardId of boardIds) {
        let board = document.getElementById(boardId);
        let id = boardId[0];
        for (let row of rows) {
            for (let col = 0; col < 10; col++) {
                let div = document.createElement("div");
                div.id = `${id}${row}${col}`;
                div.className = "opaque";
                if (boardId === "enemyboard") {
                    div.onclick = () => handleBoardClick(div.id);
                }
                board.appendChild(div);
            }
        }
    }
}

/* Handles the event where the player clicks the button to randomize/create their board */
function setupBoardEvent() { 
    settings.playerBoard = randomBoard();  // Generate a random board configuration
    let state = getBoardState("playerboard", settings.playerBoard); // Get the state of the player board for rendering

    // Make the player board visible and render it along with an empty enemy board.
    document.getElementById('playerboard').classList.remove("hidden");
    // document.getElementById('player-footer').classList.remove("hidden");
    render(state, true, true);
    render(getBoardState("enemyboard", emptyBoard()), true, true); // Render enemy board without ships initially

    // If a board has been generated reveal the start button
    if (settings.playerBoard != null) {
        document.getElementById('start-btn').classList.remove("hidden");
    }
}


/* Initiates the game when the player clicks the start button, disabling buttons and revealing game panels. */
function startGameEvent() {
    adjustButtonsState(true); // Disable the control buttons as the game starts
    refreshUI(); // Reset UI elements to their initial state for the game start.

    // Reveal game-related panels and boards for both player and AI.
    for (let id of ['player-panel', 'ai-panel', 'enemyboard', 'ai-footer', 'player-footer']) {
        document.getElementById(id).classList.remove("hidden");
    }

    game = new Game(settings.playerBoard);
    game.start(); // Start the game logic.
}


/* Handle player cell selection on enemy board */
function handleBoardClick(id) {
    game.playerSelect = id.substring(1);
}




/*  Visualizes the game board state by updating the CSS classes of cells based on their current status
  - coordMap: An object mapping cell IDs to their status (e.g., hit, miss, empty, ship).
  - renderShips: A boolean indicating whether ship positions should be visually indicated on the board.
  - opaque: A boolean to toggle a visual style that makes cells appear faded, useful for hiding details or showing inactive states.
*/
function render(coordMap, renderShips=true, opaque=false) {
    for (let state of Object.keys(coordMap)) {
        let opacity = (opaque) ? "opaque " : "";
        for (let cellId of coordMap[state]) {
            let div = document.getElementById(cellId); // Retrieve the cell element by its ID.

            if (state == EMPTY) {
                div.className = opacity;
            } else if (state == HIT) {
                div.className = opacity + "hit";
            } else if (state == MISS) {
                div.className = opacity + "miss";
            } else if (renderShips) {
                div.className = opacity + "ship";
            } else {
                div.className = opacity;
            }
        }
    }
}

/* Display when a ship sunk */
function displaySink(owner, shipId) {
    if (owner === "player" || owner === "ai") {
        document.getElementById(`${owner}-ship-label-${shipId}`).style.color = "#9e0f10";
        document.getElementById(`${owner}-ship-count-${shipId}`).style.color = "#9e0f10";
    } else {
        console.log("Warning: Invalid sink: " + owner);
    }
}


/* Display the game winner */
function displayWinner(winner, loser) {
    let winnerElem = document.getElementById(`${winner}-footer`);
    let loserElem = document.getElementById(`${loser}-footer`);
    loserElem.classList.add("hidden");
    winnerElem.innerText += " Wins!";

    winnerElem.style.color = (winner === "player") ? "green" : "red";
}


// Start page
initBoards();

document.getElementById('randomize-btn').onclick = () => setupBoardEvent();
document.getElementById('start-btn').onclick = () => startGameEvent();


