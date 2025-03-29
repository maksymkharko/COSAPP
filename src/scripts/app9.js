document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const startBtn = document.getElementById('start-btn');
    const resetBtn = document.getElementById('reset-btn');
    const levelDisplay = document.getElementById('level');
    const highScoreDisplay = document.getElementById('high-score');
    const notification = document.getElementById('notification');

    // Game state
    let level = 1;
    let highScore = localStorage.getItem('ClownadesTrubaGame') || 0;
    let boardSize = 5;
    let pipes = [];
    let startPipe = null;
    let endPipe = null;
    let isWaterFlowing = false;

    // Initialize game
    initGame();

    // Functions
    function initGame() {
        highScoreDisplay.textContent = highScore;
        levelDisplay.textContent = level;
        createBoard();
    }

    function createBoard() {
        gameBoard.innerHTML = '';
        gameBoard.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
        pipes = [];

        // Create pipes
        for (let i = 0; i < boardSize * boardSize; i++) {
            const pipe = document.createElement('div');
            pipe.className = 'pipe';
            pipe.dataset.index = i;
            pipe.dataset.rotation = 0;
            pipe.dataset.type = Math.random() > 0.5 ? 'straight' : 'corner';

            // Set start and end pipes
            if (i === 0) {
                startPipe = pipe;
                pipe.dataset.type = 'start';
            } else if (i === boardSize * boardSize - 1) {
                endPipe = pipe;
                pipe.dataset.type = 'end';
            }

            pipe.addEventListener('click', rotatePipe);
            gameBoard.appendChild(pipe);
            pipes.push(pipe);
        }

        updatePipeVisuals();
    }

    function rotatePipe(e) {
        if (isWaterFlowing) return;
        const pipe = e.target;
        const currentRotation = parseInt(pipe.dataset.rotation);
        pipe.dataset.rotation = (currentRotation + 90) % 360;
        updatePipeVisuals();
    }

    function updatePipeVisuals() {
        pipes.forEach(pipe => {
            pipe.style.transform = `rotate(${pipe.dataset.rotation}deg)`;
        });
    }

    function startFlow() {
        if (isWaterFlowing) return;
        isWaterFlowing = true;

        // Simple path check (placeholder logic)
        const isPathComplete = Math.random() > 0.5; // Replace with actual pathfinding

        if (isPathComplete) {
            showNotification('Level Complete!');
            level++;
            levelDisplay.textContent = level;
            if (level > highScore) {
                highScore = level;
                highScoreDisplay.textContent = highScore;
                localStorage.setItem('ClownadesTrubaGame', highScore);
            }
            setTimeout(() => {
                isWaterFlowing = false;
                createBoard();
            }, 1500);
        } else {
            showNotification('No Path Found!');
            setTimeout(() => {
                isWaterFlowing = false;
            }, 1000);
        }
    }

    function resetGame() {
        level = 1;
        levelDisplay.textContent = level;
        createBoard();
    }

    function showNotification(message) {
        notification.textContent = message;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    }

    // Event listeners
    startBtn.addEventListener('click', startFlow);
    resetBtn.addEventListener('click', resetGame);
});