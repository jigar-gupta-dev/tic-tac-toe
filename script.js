const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('status');
const resetBtn = document.getElementById('reset-btn');
const themeSelect = document.getElementById('theme-select');
const confettiContainer = document.getElementById('confetti');
const resultPopup = document.getElementById('result-popup');
const resultMessage = document.getElementById('result-message');
const restartBtn = document.getElementById('restart-btn');
const xSound = document.getElementById('x-sound');
const oSound = document.getElementById('o-sound');

let currentPlayer = 'X';
let gameState = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let isProcessing = false;

const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

function playSound(sound) {
    sound.play().catch(err => console.log("Audio playback failed:", err));
}

function handleCellClick(e) {
    if (isProcessing || !gameActive) return;
    isProcessing = true;

    const cell = e.target;
    const index = parseInt(cell.getAttribute('data-index'));

    if (gameState[index] !== '') {
        isProcessing = false;
        return;
    }

    gameState[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase());
    playSound(xSound);

    checkWinner();
    if (gameActive) {
        currentPlayer = 'O';
        statusDisplay.textContent = "AI is thinking...";
        document.querySelector('.game-board').classList.add('disabled');
        setTimeout(() => {
            aiMove();
            document.querySelector('.game-board').classList.remove('disabled');
            isProcessing = false;
        }, 500);
    } else {
        isProcessing = false;
    }
}

function aiMove() {
    const bestMove = findBestMove();
    gameState[bestMove] = 'O';
    const cell = document.querySelector(`.cell[data-index="${bestMove}"]`);
    cell.textContent = 'O';
    cell.classList.add('o');
    playSound(oSound);

    checkWinner();
    if (gameActive) {
        currentPlayer = 'X';
        statusDisplay.textContent = "Your turn (X)";
    }
}

function findBestMove() {
    let bestScore = -Infinity;
    let move;

    for (let i = 0; i < 9; i++) {
        if (gameState[i] === '') {
            gameState[i] = 'O';
            let score = minimax(gameState, 0, false);
            gameState[i] = '';
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(board, depth, isMaximizing) {
    const result = checkResult();
    if (result !== null) {
        if (result === 'O') return 10 - depth;
        if (result === 'X') return -10 + depth;
        return 0;
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkResult() {
    for (let combo of winningCombinations) {
        const [a, b, c] = combo;
        if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
            return gameState[a];
        }
    }
    return gameState.includes('') ? null : 'draw';
}

function checkWinner() {
    for (let combo of winningCombinations) {
        const [a, b, c] = combo;
        if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
            gameActive = false;
            if (gameState[a] === 'X') {
                showPopup("You Won!");
                createConfetti();
            } else {
                showPopup("You Lost!");
                createRain();
            }
            return;
        }
    }

    if (!gameState.includes('')) {
        gameActive = false;
        showPopup("It's a Draw!");
    }
}

function showPopup(message) {
    resultMessage.textContent = message;
    resultPopup.style.display = 'flex';
}

function createConfetti() {
    for (let i = 0; i < 50; i++) {
        const piece = document.createElement('div');
        piece.classList.add('confetti-piece');
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
        piece.style.animationDelay = `${Math.random() * 0.5}s`;
        confettiContainer.appendChild(piece);

        setTimeout(() => piece.remove(), 2000);
    }
}

function createRain() {
    for (let i = 0; i < 50; i++) {
        const drop = document.createElement('div');
        drop.classList.add('rain-drop');
        drop.style.left = `${Math.random() * 100}%`;
        drop.style.animationDelay = `${Math.random() * 0.5}s`;
        confettiContainer.appendChild(drop);

        setTimeout(() => drop.remove(), 1500);
    }
}

function resetGame() {
    currentPlayer = 'X';
    gameState = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    isProcessing = false;
    statusDisplay.textContent = "Your turn (X)";
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o');
    });
    confettiContainer.innerHTML = '';
    resultPopup.style.display = 'none';
    document.querySelector('.game-board').classList.remove('disabled');
}

function handleThemeChange() {
    const theme = themeSelect.value;
    if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
        document.documentElement.setAttribute('data-theme', theme);
    }
    localStorage.setItem('theme', theme);
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetBtn.addEventListener('click', resetGame);
restartBtn.addEventListener('click', resetGame);
themeSelect.addEventListener('change', handleThemeChange);

// Load saved theme on page load
const savedTheme = localStorage.getItem('theme') || 'system';
themeSelect.value = savedTheme;
handleThemeChange();

// System theme change listener
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleThemeChange);