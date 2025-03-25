document.addEventListener('DOMContentLoaded', function() {
    const STORAGE_PREFIX = 'clownades.';
    const GAME_STATE_KEY = STORAGE_PREFIX + '2048GameState';
    const BEST_SCORE_KEY = STORAGE_PREFIX + '2048BestScore';
    
    // DOM Elements
    const gameBoard = document.getElementById('gameBoard');
    const currentScoreEl = document.getElementById('currentScore');
    const bestScoreEl = document.getElementById('bestScore');
    const newGameBtn = document.getElementById('newGameBtn');
    const newGameBtn2 = document.getElementById('newGameBtn2');
    const restartBtn = document.getElementById('restartBtn');
    const continueBtn = document.getElementById('continueBtn');
    const gameOverEl = document.getElementById('gameOver');
    const winMessageEl = document.getElementById('winMessage');
    const finalScoreEl = document.getElementById('finalScore');
    
    // Game state
    let board = [];
    let score = 0;
    let bestScore = 0;
    let gameOver = false;
    let won = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    
    // Initialize the game
    function init() {
        loadBestScore();
        setupEventListeners();
        startNewGame();
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', handleKeyPress);
        
        // Touch events for mobile
        gameBoard.addEventListener('touchstart', handleTouchStart, { passive: false });
        gameBoard.addEventListener('touchend', handleTouchEnd, { passive: false });
        
        // Button events
        newGameBtn.addEventListener('click', startNewGame);
        newGameBtn2.addEventListener('click', startNewGame);
        restartBtn.addEventListener('click', startNewGame);
        continueBtn.addEventListener('click', continueGame);
    }
    
    // Start a new game
    function startNewGame() {
        board = Array(4).fill().map(() => Array(4).fill(0));
        score = 0;
        gameOver = false;
        won = false;
        
        updateScore();
        renderBoard();
        addRandomTile();
        addRandomTile();
        
        gameOverEl.classList.remove('active');
        winMessageEl.classList.remove('active');
        
        saveGameState();
    }
    
    // Continue game after winning
    function continueGame() {
        won = true;
        winMessageEl.classList.remove('active');
    }
    
    // Load best score from localStorage
    function loadBestScore() {
        const savedBestScore = localStorage.getItem(BEST_SCORE_KEY);
        if (savedBestScore) {
            bestScore = parseInt(savedBestScore);
            bestScoreEl.textContent = bestScore;
        }
    }
    
    // Save game state to localStorage
    function saveGameState() {
        const gameState = {
            board: board,
            score: score,
            bestScore: bestScore,
            won: won
        };
        localStorage.setItem(GAME_STATE_KEY, JSON.stringify(gameState));
        
        if (score > bestScore) {
            bestScore = score;
            bestScoreEl.textContent = bestScore;
            localStorage.setItem(BEST_SCORE_KEY, bestScore.toString());
        }
    }
    
    // Load game state from localStorage
    function loadGameState() {
        const savedGame = localStorage.getItem(GAME_STATE_KEY);
        if (savedGame) {
            const gameState = JSON.parse(savedGame);
            board = gameState.board;
            score = gameState.score;
            bestScore = gameState.bestScore || 0;
            won = gameState.won || false;
            
            updateScore();
            renderBoard();
            
            if (isGameOver()) {
                showGameOver();
            }
        } else {
            startNewGame();
        }
    }
    
    // Update score display
    function updateScore() {
        currentScoreEl.textContent = score;
        bestScoreEl.textContent = bestScore;
    }
    
    // Render the game board
    function renderBoard() {
        gameBoard.innerHTML = '';
        
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const tileValue = board[row][col];
                const tile = document.createElement('div');
                tile.className = `tile tile-${tileValue}`;
                
                if (tileValue > 2048) {
                    tile.classList.add('tile-super');
                }
                
                if (tileValue !== 0) {
                    tile.textContent = tileValue;
                }
                
                gameBoard.appendChild(tile);
            }
        }
    }
    
    // Add a random tile (2 or 4) to an empty cell
    function addRandomTile() {
        const emptyCells = [];
        
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (board[row][col] === 0) {
                    emptyCells.push({ row, col });
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            board[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
            
            // Add animation class to new tile
            const tileIndex = randomCell.row * 4 + randomCell.col;
            gameBoard.children[tileIndex].classList.add('tile-new');
            
            return true;
        }
        
        return false;
    }
    
    // Handle keyboard input
    function handleKeyPress(e) {
        if (gameOver) return;
        
        let moved = false;
        
        switch (e.key) {
            case 'ArrowUp':
                moved = moveUp();
                break;
            case 'ArrowDown':
                moved = moveDown();
                break;
            case 'ArrowLeft':
                moved = moveLeft();
                break;
            case 'ArrowRight':
                moved = moveRight();
                break;
            default:
                return;
        }
        
        if (moved) {
            addRandomTile();
            saveGameState();
            
            if (isGameOver()) {
                showGameOver();
            }
            
            if (!won && hasWon()) {
                showWinMessage();
            }
        }
    }
    
    // Handle touch start for mobile
    function handleTouchStart(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        e.preventDefault();
    }
    
    // Handle touch end for mobile
    function handleTouchEnd(e) {
        if (gameOver) return;
        
        touchEndX = e.changedTouches[0].clientX;
        touchEndY = e.changedTouches[0].clientY;
        
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;
        
        // Determine the direction of the swipe
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 50) {
                // Right swipe
                if (moveRight()) {
                    afterMove();
                }
            } else if (dx < -50) {
                // Left swipe
                if (moveLeft()) {
                    afterMove();
                }
            }
        } else {
            if (dy > 50) {
                // Down swipe
                if (moveDown()) {
                    afterMove();
                }
            } else if (dy < -50) {
                // Up swipe
                if (moveUp()) {
                    afterMove();
                }
            }
        }
        
        e.preventDefault();
    }
    
    // Common actions after a move
    function afterMove() {
        addRandomTile();
        saveGameState();
        
        if (isGameOver()) {
            showGameOver();
        }
        
        if (!won && hasWon()) {
            showWinMessage();
        }
    }
    
    // Move tiles up
    function moveUp() {
        let moved = false;
        
        for (let col = 0; col < 4; col++) {
            // Combine tiles
            for (let row = 1; row < 4; row++) {
                if (board[row][col] !== 0) {
                    let currentRow = row;
                    
                    while (currentRow > 0) {
                        if (board[currentRow - 1][col] === 0) {
                            // Move to empty space
                            board[currentRow - 1][col] = board[currentRow][col];
                            board[currentRow][col] = 0;
                            currentRow--;
                            moved = true;
                        } else if (board[currentRow - 1][col] === board[currentRow][col]) {
                            // Merge tiles
                            board[currentRow - 1][col] *= 2;
                            score += board[currentRow - 1][col];
                            board[currentRow][col] = 0;
                            moved = true;
                            break;
                        } else {
                            break;
                        }
                    }
                }
            }
        }
        
        if (moved) {
            updateScore();
            renderBoard();
        }
        
        return moved;
    }
    
    // Move tiles down
    function moveDown() {
        let moved = false;
        
        for (let col = 0; col < 4; col++) {
            // Combine tiles
            for (let row = 2; row >= 0; row--) {
                if (board[row][col] !== 0) {
                    let currentRow = row;
                    
                    while (currentRow < 3) {
                        if (board[currentRow + 1][col] === 0) {
                            // Move to empty space
                            board[currentRow + 1][col] = board[currentRow][col];
                            board[currentRow][col] = 0;
                            currentRow++;
                            moved = true;
                        } else if (board[currentRow + 1][col] === board[currentRow][col]) {
                            // Merge tiles
                            board[currentRow + 1][col] *= 2;
                            score += board[currentRow + 1][col];
                            board[currentRow][col] = 0;
                            moved = true;
                            break;
                        } else {
                            break;
                        }
                    }
                }
            }
        }
        
        if (moved) {
            updateScore();
            renderBoard();
        }
        
        return moved;
    }
    
    // Move tiles left
    function moveLeft() {
        let moved = false;
        
        for (let row = 0; row < 4; row++) {
            // Combine tiles
            for (let col = 1; col < 4; col++) {
                if (board[row][col] !== 0) {
                    let currentCol = col;
                    
                    while (currentCol > 0) {
                        if (board[row][currentCol - 1] === 0) {
                            // Move to empty space
                            board[row][currentCol - 1] = board[row][currentCol];
                            board[row][currentCol] = 0;
                            currentCol--;
                            moved = true;
                        } else if (board[row][currentCol - 1] === board[row][currentCol]) {
                            // Merge tiles
                            board[row][currentCol - 1] *= 2;
                            score += board[row][currentCol - 1];
                            board[row][currentCol] = 0;
                            moved = true;
                            break;
                        } else {
                            break;
                        }
                    }
                }
            }
        }
        
        if (moved) {
            updateScore();
            renderBoard();
        }
        
        return moved;
    }
    
    // Move tiles right
    function moveRight() {
        let moved = false;
        
        for (let row = 0; row < 4; row++) {
            // Combine tiles
            for (let col = 2; col >= 0; col--) {
                if (board[row][col] !== 0) {
                    let currentCol = col;
                    
                    while (currentCol < 3) {
                        if (board[row][currentCol + 1] === 0) {
                            // Move to empty space
                            board[row][currentCol + 1] = board[row][currentCol];
                            board[row][currentCol] = 0;
                            currentCol++;
                            moved = true;
                        } else if (board[row][currentCol + 1] === board[row][currentCol]) {
                            // Merge tiles
                            board[row][currentCol + 1] *= 2;
                            score += board[row][currentCol + 1];
                            board[row][currentCol] = 0;
                            moved = true;
                            break;
                        } else {
                            break;
                        }
                    }
                }
            }
        }
        
        if (moved) {
            updateScore();
            renderBoard();
        }
        
        return moved;
    }
    
    // Check if the player has won (reached 2048)
    function hasWon() {
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (board[row][col] === 2048) {
                    return true;
                }
            }
        }
        return false;
    }
    
    // Check if the game is over
    function isGameOver() {
        // Check for empty cells
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (board[row][col] === 0) {
                    return false;
                }
            }
        }
        
        // Check for possible merges
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const current = board[row][col];
                
                // Check right neighbor
                if (col < 3 && board[row][col + 1] === current) {
                    return false;
                }
                
                // Check bottom neighbor
                if (row < 3 && board[row + 1][col] === current) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    // Show game over message
    function showGameOver() {
        gameOver = true;
        finalScoreEl.textContent = score;
        gameOverEl.classList.add('active');
    }
    
    // Show win message
    function showWinMessage() {
        winMessageEl.classList.add('active');
    }
    
    // Initialize the game
    init();
    loadGameState();
});