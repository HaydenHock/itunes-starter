document.getElementById("columnSelect").value;
var selectPlayer = document.getElementById("playerSelect").value;
var win = 0;
var counter = 0;

class Circle {
    constructor(x, y, radius, value) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.value = value;
    }

    function test(){
        
    }

    setColor() {
        if (this.value == 0) {
            return "white";
        }
        if (this.value == 1) {
            return "red";
        }
        if (this.value == 2) {
            return "blue";
        }
    }

    draw(context) {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = this.setColor();
        context.fill();
        context.stroke();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("circleCanvas");
    const context = canvas.getContext("2d");
    
    canvas.width = 400;
    canvas.height = 375;

    var circles = [];

    class GameBoard {
        constructor(circles) {
            // Deep copy of circle values (0: empty, 1: red, 2: blue)
            this.grid = Array(6).fill(null).map((_, row) => 
                Array(7).fill(null).map((_, col) => 
                    circles[row * 7 + col].value
                )
            );
        }
    
        clone() {
            const newBoard = new GameBoard([]);
            newBoard.grid = this.grid.map(row => row.slice());
            return newBoard;
        }
    
        getValidMoves() {
            const moves = [];
            for (let col = 0; col < 7; col++) {
                if (this.grid[0][col] === 0) moves.push(col);
            }
            return moves;
        }
    
        makeMove(col, player) {
            for (let row = 5; row >= 0; row--) {
                if (this.grid[row][col] === 0) {
                    this.grid[row][col] = player;
                    return true;
                }
            }
            return false; // column full
        }
    
        isWinning(player) {
            const grid = this.grid;
            for (let row = 0; row < 6; row++) {
                for (let col = 0; col < 7; col++) {
                    // Horizontal
                    if (col + 3 < 7 &&
                        grid[row][col] === player &&
                        grid[row][col + 1] === player &&
                        grid[row][col + 2] === player &&
                        grid[row][col + 3] === player)
                        return true;
    
                    // Vertical
                    if (row + 3 < 6 &&
                        grid[row][col] === player &&
                        grid[row + 1][col] === player &&
                        grid[row + 2][col] === player &&
                        grid[row + 3][col] === player)
                        return true;
    
                    // Diagonal /
                    if (row + 3 < 6 && col - 3 >= 0 &&
                        grid[row][col] === player &&
                        grid[row + 1][col - 1] === player &&
                        grid[row + 2][col - 2] === player &&
                        grid[row + 3][col - 3] === player)
                        return true;
    
                    // Diagonal \
                    if (row + 3 < 6 && col + 3 < 7 &&
                        grid[row][col] === player &&
                        grid[row + 1][col + 1] === player &&
                        grid[row + 2][col + 2] === player &&
                        grid[row + 3][col + 3] === player)
                        return true;
                }
            }
            return false;
        }
    
        evaluate() {
            // Simple heuristic: +100 if AI wins, -100 if human wins, 0 otherwise
            if (this.isWinning(2)) return 100; // AI (blue)
            if (this.isWinning(1)) return -100; // Human (red)
            return 0;
        }
    
        isFull() {
            return this.getValidMoves().length === 0;
        }
    }
    

    function createCircles() {
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 7; col++) {
                let x = 25 + col * 58;
                let y = 325 - row * 58;
                circles.push(new Circle(x, y, 25, 0));
            }
        }
    }

    function redrawCircles() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        circles.forEach(circle => circle.draw(context));
    }

    function updateCircle(index, newValue) {
        if (index >= 0 && index < circles.length) {
            circles[index].value = newValue;
            redrawCircles();
        }
    }

    function getCircleColor(index) {
        if (index >= 0 && index < circles.length) {
            let circle = circles[index];
            return circle.setColor(); // Calls the function that determines color
        } else {
            return null;
        }
    }

    function getColor(row, col) {
        if (row < 0 || row > 5 || col < 0 || col > 6) return null;
        let index = row * 7 + col;
        return getCircleColor(index);
    }
    

    function drop() {
        // Loop from the bottom row (row 0) upward in the selected column
        for (let row = 0; row < 6; row++) {
            let index = row * 7 + columnDrop;
            let color = getCircleColor(index);
            if (color === "white") {
                updateCircle(index, selectPlayer);
                counter += 1;
                document.getElementById("counter").innerText = counter;
                return true; // Piece successfully placed
            }
        }
        return false; // Column is full
    }
    
    
    

    

    function selection() {
        columnDrop = parseInt(document.getElementById("columnSelect").value);
        selectPlayer = parseInt(document.getElementById("playerSelect").value); // parse to int
        // Check the top cell of the selected column (row 5) to see if the column is full
        var topCellIndex = columnDrop + 35;
        var tempColor = getCircleColor(topCellIndex);
    
        if ((tempColor == 'red' && selectPlayer == 2) || (tempColor == 'blue' && selectPlayer == 1)) {
            document.getElementById("output").innerText = "Already Taken";
            return;
        }
    
        // Human move
        drop();
        checkWin();
        if (win === 1) {
            document.getElementById("output").innerText = "Player " + selectPlayer + " wins!";
            return;
        }
        // Update output after human move
        document.getElementById("output").innerText = "Human moved.";
    
        // AI move
        aiMove();
        // If AI hasn't won, update output message accordingly
        if (win !== 1) {
            document.getElementById("output").innerText = "AI moved.";
        }
    
        if (win == 1) {
            for (var i = 0; i < 42; i++) {
                updateCircle(i, selectPlayer);
            }
        }
    }
    
    

    function checkWin() {
        function getValue(row, col) {
            if (row < 0 || row >= 6 || col < 0 || col >= 7) return null;
            return circles[row * 7 + col].value;
        }
    
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 7; col++) {
                let current = getValue(row, col);
                if (current === 0) continue;
    
                // Horizontal
                if (
                    current === getValue(row, col + 1) &&
                    current === getValue(row, col + 2) &&
                    current === getValue(row, col + 3)
                ) {
                    win = 1;
                    return;
                }
    
                // Vertical
                if (
                    current === getValue(row + 1, col) &&
                    current === getValue(row + 2, col) &&
                    current === getValue(row + 3, col)
                ) {
                    win = 1;
                    return;
                }
    
                // Diagonal (bottom-left to top-right)
                if (
                    current === getValue(row + 1, col + 1) &&
                    current === getValue(row + 2, col + 2) &&
                    current === getValue(row + 3, col + 3)
                ) {
                    win = 1;
                    return;
                }
    
                // Diagonal (top-left to bottom-right)
                if (
                    current === getValue(row - 1, col + 1) &&
                    current === getValue(row - 2, col + 2) &&
                    current === getValue(row - 3, col + 3)
                ) {
                    win = 1;
                    return;
                }
            }
        }
    }

    function minimax(board, depth, alpha, beta, maximizingPlayer) {
        var evalScore = board.evaluate();
        if (depth === 0 || Math.abs(evalScore) === 100 || board.isFull()) {
            return { score: evalScore, column: null };
        }
    
        const validMoves = board.getValidMoves();
    
        if (maximizingPlayer) {
            let maxEval = { score: -Infinity, column: null };
            for (let col of validMoves) {
                const newBoard = board.clone();
                newBoard.makeMove(col, 2); // AI
                const result = minimax(newBoard, depth - 1, alpha, beta, false);
                if (result.score > maxEval.score) {
                    maxEval = { score: result.score, column: col };
                }
                alpha = Math.max(alpha, result.score);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = { score: Infinity, column: null };
            for (let col of validMoves) {
                const newBoard = board.clone();
                newBoard.makeMove(col, 1); // Human
                const result = minimax(newBoard, depth - 1, alpha, beta, true);
                if (result.score < minEval.score) {
                    minEval = { score: result.score, column: col };
                }
                beta = Math.min(beta, result.score);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }

    function aiMove() {
        var board = new GameBoard(circles);
        var bestMove = minimax(board, 4, -Infinity, Infinity, true); // depth = 4
        if (bestMove.column !== null) {
            columnDrop = bestMove.column;
            selectPlayer = 2; // AI is blue
            drop();
            checkWin();
            if (win === 1) {
                document.getElementById("output").innerText = "AI wins!";
            }
        }
    }
    
    

    createCircles();
    redrawCircles();

    document.getElementById("goButton").addEventListener("click", selection);
});
