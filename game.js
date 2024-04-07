// Define constants
const EMPTY = 0;
const HIT = -1;
const MISS = -2;
const N = 10;

const CARRIER = 1;
const BATTLESHIP = 2;
const DESTROYER = 3;
const SUBMARINE = 4;
const PATROLBOAT = 5;
const SHIPS = [CARRIER, BATTLESHIP, DESTROYER, SUBMARINE, PATROLBOAT];

const SIZES = {}
SIZES[CARRIER] = 5;
SIZES[BATTLESHIP] = 4;
SIZES[DESTROYER] = 3;
SIZES[SUBMARINE] = 3;
SIZES[PATROLBOAT] = 2;


// Class to manage game logic, state, and interactions for a the game
class Game {
    constructor(playerBoard) {
        this.playerBoard = playerBoard;
        this.enemyBoard = null;
        this.playerSelect = null;
        this.progressState = null;
        this.NUM_SHIP_CELL = Object.values(SIZES).reduce((a, b) => a + b, 0);
    }

    /* Update game state with player selected shot, return whether shot is valid */
    playerAction() {
        // parse selected cell and update state
        let i = this.playerSelect.charCodeAt(0) - 'A'.charCodeAt(0);
        let j = parseInt(this.playerSelect[1]);
        let cell = this.enemyBoard[i][j]
        if (cell == HIT || cell == MISS) {
            console.log("WARNING: Player has chosen a previously selected cell. Choose another cell.")
            return false;
        } else {
            this.enemyBoard[i][j] = (cell == EMPTY) ? MISS : HIT;
        }
        return true;
    }

    /* Update game state  with enemy selected shot */
    opponentAction() {
        // request AI selection and inform if hit or miss
        let [i, j] = this.enemyAI.selectTarget();
        let cell = this.playerBoard[i][j];

        if (cell == HIT || cell == MISS) {
            console.log("WARNING: AI has chosen a previously selected cell;")
        }
        cell = (cell == EMPTY || cell == MISS) ? MISS : HIT;
        this.enemyAI.updateHit(i, j, cell == HIT, this.playerBoard[i][j]);
        this.playerBoard[i][j] = cell;
    }

    /* Update the enemy-side UI (for the player) and return if player won */
    refreshOpponentView(newEnemyState) {
        // display to user if enemy ship sunk
        for (let ship of SHIPS) {
            if (this.enemyState[ship].length > 0 && newEnemyState[ship].length == 0) {
                displaySink("ai", ship)
            }
        }
        // render enemy board to screen and check player win-state
        this.enemyState = newEnemyState;
        render(this.enemyState, false);

        // check if player has won
        if (this.enemyState[HIT].length === this.NUM_SHIP_CELL) {
            displayWinner("player", "ai");
            return true;
        }
        return false;
    }

    /* Update the player-side UI (for the AI actions) and return if enemy won */
    refreshPlayerView(newPlayerState) {
        // Inform AI and display if ship sunk
        for (let ship of SHIPS) {
            if (this.playerState[ship].length > 0 && newPlayerState[ship].length == 0) {
                this.enemyAI.updateSink(ship);
                displaySink("player", ship)
            }
        }
        // render player board to screen and check enemy win-state
        this.playerState = newPlayerState;
        render(this.playerState);

        // check if AI has won
        if (this.playerState[HIT].length === this.NUM_SHIP_CELL) {
            displayWinner("ai", "player");
            return true;
        }
        return false;
    }

    /* Starts the game */
    async start() {
        // init board arrays if not yet init
        if (this.playerBoard == null) this.playerBoard = randomBoard();
        if (this.enemyBoard == null) this.enemyBoard = randomBoard();

        // initialize AI always with "hard" difficulty
        this.enemyAI = new ComputerLogic().logic();

        // render boards
        this.playerState = getBoardState("playerboard", this.playerBoard);
        this.enemyState = getBoardState("enemyboard", this.enemyBoard);
        render(this.playerState);
        render(this.enemyState, false);

        // Play phase
        while (true) {
            // loop/wait until player has selected a cell
            this.playerSelect = null;
            while (this.playerSelect === null) {
                await sleep(100);
            }
            // process shots chosen - if player selects invalid (prev. selected) cell, retry turn
            let valid = this.playerAction();
            if (!valid) continue;
            this.opponentAction();
            
            // fetch board state maps
            const newEnemyState = getBoardState("enemyboard", this.enemyBoard);
            const newPlayerState = getBoardState("playerboard", this.playerBoard);

            // update the UI, end game if winner found
            let playerWon = this.refreshOpponentView(newEnemyState)
            if (playerWon) break;

            await sleep(300); // delay to let enemy "choose"

            let enemyWon = this.refreshPlayerView(newPlayerState);
            if (enemyWon) break;
        }

        this.endGame();
    }
    
    endGame() {
        render(this.enemyState, true);
        toggleButtons(false);
        settings.playerBoard = null;
    }
}