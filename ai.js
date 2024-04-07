
class ComputerLogic {
    constructor() {}

    // Return an instance of ProbabilityAI to handle game logic
    logic() {
        return new ProbabilityAI();
    }
}

/* AI superclass for each strategy to inherit from */
class AI {
    constructor() {}

    selectTarget() { return null; }             // returns list [i,j] of coordinates to fire at 

    updateHit(i, j, hit=false, ship=null) {}    // call to inform AI that [i,j] is a hit (and which ship) or miss

    updateSink(ship) {}                         // call to inform AI that ship (number) has sinked
}

// randomly shuffle an array
function shuffle(arr) {
    // Fisher-Yates shuffle algorithm: rearranges the elements of 'arr' randomly.
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i+1)); // Generates a random index between 0 and i (inclusive).
        let temp = arr[i]; // Swaps the elements at indices i and j.
        arr[i] = arr[j];
        arr[j] = temp;
    }
}

/* This AI estimates the probability of ships being in each cell */
class ProbabilityAI extends AI {
    constructor() {
        super(); // Calls the constructor of the superclass (AI)
        
        // Constants used by the AI.
        this.WEIGHT = 8;
        this.UNVISITED = 0;
        this.HIT = -1;
        this.MISS_SUNK = -2;
        
        // Properties to keep track of ship positions, alive ships, and the status board
        this.shipCoords = {}
        this.aliveShips = SHIPS.slice(); // Creates a copy of the array 'SHIPS'.
        this.statusBoard = emptyBoard(); // Initializes the status board.

        // Initializes the ship coordinates for each ship.
        for (let ship of SHIPS) {
            this.shipCoords[ship] = [];
        }
    }

    /* Helper method for horizontal ship placement in selectTarget */
    checkHorizontal(statusBoard, densityBoard, i0, j0, length) {
         // Checks for available space horizontally to place a ship.
        // If available, updates the density board based on the likelihood of a ship being there.
        if (j0 + length > statusBoard[0].length) return;
        let multiplier = 1;
        for (let j = j0; j < j0 + length; j++) {
            if (statusBoard[i0][j] === this.MISS_SUNK) return;
            else if (statusBoard[i0][j] === this.HIT)  multiplier += this.WEIGHT;
        }
        // update density board
        for (let j = j0; j < j0 + length; j++) {
            if (statusBoard[i0][j] === this.UNVISITED) densityBoard[i0][j] += multiplier;
        }
    }

    /* Helper method for horizontal ship placement in selectTarget */
    checkVertical(statusBoard, densityBoard, i0, j0, length) {
        // Checks for available space vertically to place a ship.
        // If available, updates the density board based on the likelihood of a ship being there.
        if (i0 + length > statusBoard.length) return;
        let multiplier = 1;
        for (let i = i0; i < i0 + length; i++) {
            if (statusBoard[i][j0] === this.MISS_SUNK) return;
            else if (statusBoard[i][j0] === this.HIT) multiplier *= this.WEIGHT;
        }
        // update density board
        for (let i = i0; i < i0 + length; i++) {
            if (statusBoard[i][j0] === this.UNVISITED) densityBoard[i][j0] += multiplier;
        }
    }

    /* Helper method for finding most probable indices in selectTarget */
    findMaxCell(densityBoard) {
        // Finds the cell with the highest probability of containing a ship.
        // Returns one of the most probable indices randomly.
        let maxVal = densityBoard[0][0];
        let maxIndices = [];

        for (let i = 0; i < densityBoard.length; i++) {
            for (let j = 0; j < densityBoard[0].length; j++) {
                if (densityBoard[i][j] > maxVal) {
                    maxVal = densityBoard[i][j];
                    maxIndices = [[i,j]];
                } else if (densityBoard[i][j] == maxVal) {
                    maxIndices.push([i,j]);
                }
            }
        }
        // select one of most probable (dense) indices
        let random_choice = Math.floor(Math.random() * maxIndices.length);
        return maxIndices[random_choice]
    }


    selectTarget() {
        let densityBoard = emptyBoard(N);
        // generate density board
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                for (let ship of this.aliveShips) {
                    this.checkHorizontal(this.statusBoard, densityBoard, i, j, SIZES[ship]);
                    this.checkVertical(this.statusBoard, densityBoard, i, j, SIZES[ship]);
                }
            }
        }
        let [i, j] = this.findMaxCell(densityBoard);
        return [i, j];
    }

    updateHit(i, j, hit=true, ship=null) {
        // update status board and list of ship coordinates
        if (hit) {
            this.statusBoard[i][j] = this.HIT;
            this.shipCoords[ship].push([i,j]);
        } else {
            this.statusBoard[i][j] = this.MISS_SUNK;
        }
    }

    updateSink(ship) {
        // remove ship from list of alive, mark as sunk on status board
        this.aliveShips.splice(this.aliveShips.indexOf(ship), 1);
        let coords = this.shipCoords[ship];
        for (let [i, j] of coords) {
            this.statusBoard[i][j] = this.MISS_SUNK;
        }
    }
}