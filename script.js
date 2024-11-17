const cells = document.querySelectorAll('[data-cell]');
const board = document.getElementById('board');
const popup = document.getElementById('popup');
const popupContent = document.getElementById('popup-content');
const closePopupButton = document.getElementById('closePopupButton');
const restartButton = document.getElementById('restartButton');
const modeSelection = document.getElementById('mode-selection');
const playerVsPlayerButton = document.getElementById('player-vs-player');
const playerVsAiButton = document.getElementById('player-vs-ai');
const difficultyPopup = document.getElementById('difficulty-popup');
const easyButton = document.getElementById('easy');
const hardButton = document.getElementById('hard');
const impossibleButton = document.getElementById('impossible');

let currentPlayer = 'X';
let isGameOver = false;
let boardState = Array(9).fill(null);
let isAiMode = false;
let aiDifficulty = 'easy'; // Default AI difficulty

const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function handleClick(e) {
    const cell = e.target;
    const index = Array.from(cells).indexOf(cell);

    if (boardState[index] !== null || isGameOver) return;

    boardState[index] = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase());
    cell.textContent = currentPlayer;

    if (checkWin()) {
        isGameOver = true;
        showPopup(`${currentPlayer} wins!`);
    } else if (boardState.every(cell => cell !== null)) {
        isGameOver = true;
        showPopup(`It's a draw!`);
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        if (isAiMode && currentPlayer === 'O') {
            aiMove();
        }
    }
}

function checkWin() {
    return winningCombinations.some(combination => {
        return combination.every(index => {
            return boardState[index] === currentPlayer;
        });
    });
}

function showPopup(message) {
    popupContent.textContent = message;
    popup.style.display = 'block';
}

function closePopup() {
    popup.style.display = 'none';
    modeSelection.style.display = 'flex'; // Show the mode selection buttons again
    restartButton.style.display = 'none'; // Hide the restart button after closing the popup
}

function restartGame() {
    boardState.fill(null);
    cells.forEach(cell => {
        cell.classList.remove('x', 'o');
        cell.textContent = '';
    });
    currentPlayer = 'X';
    isGameOver = false;
    closePopup();
    modeSelection.style.display = 'flex'; // Show the mode selection buttons again
    restartButton.style.display = 'none';
}

function aiMove() {
    setTimeout(() => {
        const availableMoves = boardState.map((cell, index) => cell === null ? index : -1).filter(index => index !== -1);
        let move;

        if (aiDifficulty === 'easy') {
            move = easyModeMove(availableMoves);
        } else if (aiDifficulty === 'hard') {
            move = hardModeMove(availableMoves);
        } else if (aiDifficulty === 'impossible') {
            move = impossibleModeMove(availableMoves);
        }

        boardState[move] = 'O';
        cells[move].classList.add('o');
        cells[move].textContent = 'O';

        if (checkWin()) {
            isGameOver = true;
            showPopup(`O wins!`);
        } else if (boardState.every(cell => cell !== null)) {
            isGameOver = true;
            showPopup(`It's a draw!`);
        } else {
            currentPlayer = 'X';
        }
    }, 1000); // AI takes 1 second to make a move
}

function easyModeMove(availableMoves) {
    let blockMove = findBlockingMove('X');
    if (blockMove !== -1) return blockMove;

    let winMove = findBlockingMove('O');
    if (winMove !== -1) return winMove;

    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

function hardModeMove(availableMoves) {
    let bestScore = -Infinity;
    let bestMove = -1;

    availableMoves.forEach(move => {
        boardState[move] = 'O';
        let score = minimax(boardState, 0, false);
        boardState[move] = null;

        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    });

    return bestMove;
}

function impossibleModeMove(availableMoves) {
    let bestScore = -Infinity;
    let bestMove = -1;

    availableMoves.forEach(move => {
        boardState[move] = 'O';
        let score = minimax(boardState, 0, false);
        boardState[move] = null;

        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    });

    return bestMove;
}

function findBlockingMove(player) {
    for (let combination of winningCombinations) {
        let [a, b, c] = combination;
        let cells = [boardState[a], boardState[b], boardState[c]];
        if (cells.filter(cell => cell === player).length === 2 && cells.includes(null)) {
            return combination[cells.indexOf(null)];
        }
    }
    return -1;
}

function minimax(board, depth, isMaximizing) {
    const winner = checkWinner(board);
    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return depth - 10;
    if (board.every(cell => cell !== null)) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false);
                board[i] = null;
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = null;
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinner(board) {
    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        if (board[a] !== null && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}

playerVsPlayerButton.addEventListener('click', () => {
    isAiMode = false;
    modeSelection.style.display = 'none';
    board.style.display = 'grid';
    restartButton.style.display = 'inline-block';
});

playerVsAiButton.addEventListener('click', () => {
    isAiMode = true;
    modeSelection.style.display = 'none';
    difficultyPopup.style.display = 'block';
});

easyButton.addEventListener('click', () => {
    aiDifficulty = 'easy';
    startGame();
});

hardButton.addEventListener('click', () => {
    aiDifficulty = 'hard';
    startGame();
});

impossibleButton.addEventListener('click', () => {
    aiDifficulty = 'impossible';
    startGame();
});

function startGame() {
    difficultyPopup.style.display = 'none';
    board.style.display = 'grid';
    restartButton.style.display = 'inline-block';
    currentPlayer = 'X';
}

cells.forEach(cell => {
    cell.addEventListener('click', handleClick);
});

restartButton.addEventListener('click', restartGame);
closePopupButton.addEventListener('click', closePopup);
