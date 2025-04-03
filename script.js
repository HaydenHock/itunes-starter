var win = 0;
var counter = 0;
var columnDrop; // set when a letter is clicked
var selectPlayer = 1; // used for move determination

class Circle {
  constructor(x, y, radius, value) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.value = value;
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

  // Toggle player selection dropdown based on AI mode
  const aiOnElem = document.getElementById("aiOn");
  const playerSelectContainer = document.getElementById("playerSelectContainer");
  aiOnElem.addEventListener("change", () => {
    if (aiOnElem.value == "2") {
      // AI off: show player selection for two-player mode
      playerSelectContainer.style.display = "block";
    } else {
      // AI on: hide player selection, default human to player 1
      playerSelectContainer.style.display = "none";
    }
  });

  class GameBoard {
    constructor(circles) {
      if (circles && circles.length > 0) {
        // Build a 6x7 grid from circle values.
        this.grid = Array(6).fill(null).map((_, row) =>
          Array(7).fill(null).map((_, col) =>
            circles[row * 7 + col].value
          )
        );
      } else {
        this.grid = Array(6).fill(null).map(() => Array(7).fill(0));
      }
    }

    clone() {
      const newBoard = new GameBoard([]);
      newBoard.grid = this.grid.map(row => row.slice());
      return newBoard;
    }

    getValidMoves() {
      const moves = [];
      for (let col = 0; col < 7; col++) {
        if (this.grid[5][col] === 0) moves.push(col);
      }
      return moves;
    }

    makeMove(col, player) {
      for (let row = 0; row < 6; row++) {
        if (this.grid[row][col] === 0) {
          this.grid[row][col] = player;
          return true;
        }
      }
      return false;
    }

    isWinning(player) {
      const grid = this.grid;
      for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 7; col++) {
          // Horizontal check
          if (col + 3 < 7 &&
              grid[row][col] === player &&
              grid[row][col + 1] === player &&
              grid[row][col + 2] === player &&
              grid[row][col + 3] === player)
            return true;

          // Vertical check
          if (row + 3 < 6 &&
              grid[row][col] === player &&
              grid[row + 1][col] === player &&
              grid[row + 2][col] === player &&
              grid[row + 3][col] === player)
            return true;

          // Diagonal (bottom-left to top-right)
          if (row + 3 < 6 && col - 3 >= 0 &&
              grid[row][col] === player &&
              grid[row + 1][col - 1] === player &&
              grid[row + 2][col - 2] === player &&
              grid[row + 3][col - 3] === player)
            return true;

          // Diagonal (top-left to bottom-right)
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
      if (this.isWinning(2)) return 100;  // AI wins
      if (this.isWinning(1)) return -100; // Human wins
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
      return circles[index].setColor();
    } else {
      return null;
    }
  }

  // Drop a piece into the selected column.
  function drop() {
    for (let row = 0; row < 6; row++) {
      let index = row * 7 + columnDrop;
      if (getCircleColor(index) === "white") {
        updateCircle(index, selectPlayer);
        counter++;
        document.getElementById("counter").innerText = counter;
        return true;
      }
    }
    return false;
  }

  // Called when a column letter is clicked.
  function selection(colIndex) {
    columnDrop = colIndex;
    let aiOnVal = document.getElementById("aiOn").value;

    if (aiOnVal == "2") {
      // Two-player mode: use the selected player value
      selectPlayer = parseInt(document.getElementById("playerSelect").value);
    } else {
      // AI mode: human is always player 1
      selectPlayer = 1;
    }

    // Check if the top cell in the column is taken.
    var topCellIndex = columnDrop + 35;
    var tempColor = getCircleColor(topCellIndex);
    if ((tempColor == 'red' && selectPlayer == 2) || (tempColor == 'blue' && selectPlayer == 1)) {
      document.getElementById("output").innerText = "Already Taken";
      return;
    }

    drop();
    checkWin();
    if (win === 1) {
      document.getElementById("output").innerText = "Player " + selectPlayer + " wins!";
      for (var i = 0; i < 42; i++) {
        updateCircle(i, selectPlayer);
      }
      return;
    }

    if (aiOnVal == "1") {
      aiMove();
      
      if (win == 1) {
        for (var i = 0; i < 42; i++) {
          updateCircle(i, selectPlayer);
        }
      }
    } else {
      // Two-player mode: alternate the selected player for the next move.
      let playerSelectElem = document.getElementById("playerSelect");
      if (playerSelectElem.value == "1") {
        playerSelectElem.value = "2";
      } else {
        playerSelectElem.value = "1";
      }
      
    }
  }

  function final() {
    
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

        // Horizontal win
        if (current === getValue(row, col + 1) &&
            current === getValue(row, col + 2) &&
            current === getValue(row, col + 3)) {
          win = 1;
          return;
        }

        // Vertical win
        if (current === getValue(row + 1, col) &&
            current === getValue(row + 2, col) &&
            current === getValue(row + 3, col)) {
          win = 1;
          return;
        }

        // Diagonal (bottom-left to top-right)
        if (current === getValue(row + 1, col + 1) &&
            current === getValue(row + 2, col + 2) &&
            current === getValue(row + 3, col + 3)) {
          win = 1;
          return;
        }

        // Diagonal (top-left to bottom-right)
        if (current === getValue(row - 1, col + 1) &&
            current === getValue(row - 2, col + 2) &&
            current === getValue(row - 3, col + 3)) {
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
        newBoard.makeMove(col, 2);
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
        newBoard.makeMove(col, 1);
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
    var aiOnVal = document.getElementById("aiOn").value;
    if (aiOnVal == 2) {
      // AI is turned off; do nothing.
    } else {
      var board = new GameBoard(circles);
      var bestMove = minimax(board, 4, -Infinity, Infinity, true);
      if (bestMove.column !== null) {
        columnDrop = bestMove.column;
        selectPlayer = 2; // AI is player 2
        drop();
        checkWin();
        if (win === 1) {
          document.getElementById("output").innerText = "AI wins!";
        }
      }
    }
  }

  createCircles();
  redrawCircles();

  // Add click event listeners to the column letters.
  document.querySelectorAll("#coord td").forEach((cell) => {
    cell.addEventListener("click", () => {
      let colIndex = parseInt(cell.getAttribute("data-col"));
      selection(colIndex);
    });
  });
});
