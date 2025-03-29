document.addEventListener('DOMContentLoaded', () => {
    // Элементы DOM
    const gameBoard = document.getElementById('game-board');
    const startBtn = document.getElementById('start-btn');
    const resetBtn = document.getElementById('reset-btn');
    const nextBtn = document.getElementById('next-btn');
    const levelDisplay = document.getElementById('level');
    const movesDisplay = document.getElementById('moves');
    const highScoreDisplay = document.getElementById('high-score');
    const notification = document.getElementById('notification');

    // Состояние игры
    let currentLevel = 1;
    let moves = 0;
    let highScore = localStorage.getItem('ClownadesTrubaGame') || 0;
    let isWaterFlowing = false;
    let board = [];
    let waterPath = [];
    let isTutorial = true;
    let tutorialStep = 0;
    
    // Данные для обучения
    const TUTORIAL_DATA = [
        {
            message: "Соедините трубы от начала (⛲) до конца (🏁)",
            highlight: [0, 4]
        },
        {
            message: "Кликайте на трубы, чтобы поворачивать их",
            highlight: [1, 2, 3]
        },
        {
            message: "Нажмите 'Пустить воду', чтобы проверить решение",
            highlight: []
        }
    ];

    // Предзаготовленные уровни (5x5 - 8x8)
    const levelData = generateLevels(50);

    // Инициализация игры
    initGame();

    function initGame() {
        highScoreDisplay.textContent = highScore;
        loadLevel(currentLevel);
        setupTutorial();
    }

    // Настройка обучения
    function setupTutorial() {
        if (!isTutorial) return;
        
        showNotification(TUTORIAL_DATA[tutorialStep].message);
        highlightPipes(TUTORIAL_DATA[tutorialStep].highlight);
        
        // Специальный обработчик для обучения
        gameBoard.addEventListener('click', handleTutorialClick, { once: true });
    }

    function handleTutorialClick() {
        tutorialStep++;
        if (tutorialStep < TUTORIAL_DATA.length) {
            setupTutorial();
        } else {
            isTutorial = false;
            removeHighlights();
        }
    }

    function highlightPipes(indices) {
        removeHighlights();
        indices.forEach(idx => {
            if (board[idx]) {
                board[idx].classList.add('highlight');
            }
        });
    }

    function removeHighlights() {
        board.forEach(pipe => {
            pipe.classList.remove('highlight');
        });
    }

    // Генерация 50 уровней сложности
    function generateLevels(count) {
        const levels = [];
        for (let i = 1; i <= count; i++) {
            const size = Math.min(5 + Math.floor(i / 10), 8);
            const board = Array(size * size).fill().map((_, idx) => {
                if (idx === 0) return { type: 'start', rotation: 0 };
                if (idx === size * size - 1) return { type: 'end', rotation: 0 };
                
                // Первые 3 уровня делаем проще (только угловые и прямые трубы)
                const types = i <= 3 ? ['corner', 'straight'] : ['corner', 'straight', 't-shape'];
                const type = types[Math.floor(Math.random() * types.length)];
                
                return { 
                    type,
                    rotation: Math.floor(Math.random() * 4) * 90
                };
            });
            
            // Убедимся, что уровень решаем
            if (i <= 3) {
                makeSolvable(board, size);
            }
            
            levels.push({ size, board, startPos: 0, endPos: size * size - 1 });
        }
        return levels;
    }

    // Делаем уровень решаемым (для первых уровней)
    function makeSolvable(board, size) {
        // Простой путь направо и вниз
        for (let i = 0; i < size; i++) {
            if (i < size - 1) {
                board[i].type = 'straight';
                board[i].rotation = 0;
            }
            
            const lastInRow = (i + 1) * size - 1;
            if (lastInRow < board.length - 1) {
                board[lastInRow].type = 'corner';
                board[lastInRow].rotation = 90;
            }
        }
        
        // Последний ряд - прямые трубы вниз
        for (let i = (size - 1) * size; i < board.length - 1; i++) {
            board[i].type = 'straight';
            board[i].rotation = 90;
        }
    }

    // Загрузка уровня
    function loadLevel(levelNum) {
        if (levelNum > levelData.length) {
            showNotification('Поздравляем! Вы прошли все уровни!');
            currentLevel = 1;
            loadLevel(currentLevel);
            return;
        }

        const level = levelData[levelNum - 1];
        currentLevel = levelNum;
        moves = 0;
        movesDisplay.textContent = moves;
        levelDisplay.textContent = currentLevel;
        
        if (currentLevel > highScore) {
            highScore = currentLevel;
            highScoreDisplay.textContent = highScore;
            localStorage.setItem('ClownadesTrubaGame', highScore);
        }

        renderBoard(level);
    }

    // Отрисовка игрового поля
    function renderBoard(level) {
        gameBoard.innerHTML = '';
        gameBoard.style.gridTemplateColumns = `repeat(${level.size}, 1fr)`;
        board = [];
        waterPath = [];
        isWaterFlowing = false;
        nextBtn.disabled = true;

        level.board.forEach((pipeData, i) => {
            const pipe = document.createElement('div');
            pipe.className = 'pipe';
            if (i === level.startPos) pipe.classList.add('start-pipe');
            if (i === level.endPos) pipe.classList.add('end-pipe');
            pipe.dataset.index = i;
            pipe.dataset.type = pipeData.type;
            pipe.dataset.rotation = pipeData.rotation;

            // Создание соединений трубы
            getPipeConnections(pipeData.type, pipeData.rotation).forEach(conn => {
                const connection = document.createElement('div');
                connection.className = `pipe-connection ${conn}`;
                pipe.appendChild(connection);
            });

            pipe.addEventListener('click', () => rotatePipe(i));
            gameBoard.appendChild(pipe);
            board.push(pipe);
        });

        if (isTutorial) setupTutorial();
    }

    // Получение соединений для трубы
    function getPipeConnections(type, rotation) {
        const connections = [];
        const dirs = getPipeDirections(type, rotation);
        
        if (dirs.includes('left')) connections.push('horizontal');
        if (dirs.includes('right')) connections.push('horizontal');
        if (dirs.includes('up')) connections.push('vertical');
        if (dirs.includes('down')) connections.push('vertical');
        
        return [...new Set(connections)];
    }

    // Поворот трубы
    function rotatePipe(index) {
        if (isWaterFlowing || 
            board[index].dataset.type === 'start' || 
            board[index].dataset.type === 'end') return;
        
        const pipe = board[index];
        let rotation = (parseInt(pipe.dataset.rotation) + 90) % 360;
        pipe.dataset.rotation = rotation;
        
        // Обновление соединений
        pipe.innerHTML = '';
        getPipeConnections(pipe.dataset.type, rotation).forEach(conn => {
            const connection = document.createElement('div');
            connection.className = `pipe-connection ${conn}`;
            pipe.appendChild(connection);
        });

        moves++;
        movesDisplay.textContent = moves;
        
        if (isTutorial && tutorialStep === 1) {
            handleTutorialClick();
        }
    }

    // Запуск воды
    function startFlow() {
        if (isWaterFlowing) return;
        isWaterFlowing = true;
        
        if (isTutorial && tutorialStep === 2) {
            handleTutorialClick();
        }

        const level = levelData[currentLevel - 1];
        const visited = new Set();
        const queue = [{ index: level.startPos, path: [level.startPos] }];
        let solutionFound = false;

        // Поиск пути (BFS)
        while (queue.length > 0 && !solutionFound) {
            const current = queue.shift();
            visited.add(current.index);

            if (current.index === level.endPos) {
                solutionFound = true;
                waterPath = current.path;
                break;
            }

            getConnectedNeighbors(current.index, level).forEach(neighbor => {
                if (!visited.has(neighbor)) {
                    queue.push({
                        index: neighbor,
                        path: [...current.path, neighbor]
                    });
                }
            });
        }

        if (solutionFound) {
            animateWater();
            setTimeout(() => {
                showNotification('Уровень пройден!');
                nextBtn.disabled = false;
                
                // Звук победы
                playSound('success');
            }, waterPath.length * 300 + 500);
        } else {
            showNotification('Нет пути! Поверните трубы');
            // Звук ошибки
            playSound('error');
        }
        isWaterFlowing = false;
    }

    // Воспроизведение звука
    function playSound(type) {
        if (typeof Audio !== 'undefined') {
            const audio = new Audio();
            audio.src = type === 'success' ? 
                'https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3' :
                'https://assets.mixkit.co/sfx/preview/mixkit-warning-alarm-688.mp3';
            audio.volume = 0.2;
            audio.play().catch(e => console.log('Audio play error:', e));
        }
    }

    // Получение соединенных соседей
    function getConnectedNeighbors(index, level) {
        const neighbors = [];
        const pipe = board[index];
        const dirs = getPipeDirections(pipe.dataset.type, parseInt(pipe.dataset.rotation));
        const size = level.size;
        const row = Math.floor(index / size);
        const col = index % size;

        // Проверка каждого возможного направления
        if (dirs.includes('left') && col > 0) {
            const leftIdx = index - 1;
            const leftDirs = getPipeDirections(board[leftIdx].dataset.type, 
                parseInt(board[leftIdx].dataset.rotation));
            if (leftDirs.includes('right')) neighbors.push(leftIdx);
        }
        
        if (dirs.includes('right') && col < size - 1) {
            const rightIdx = index + 1;
            const rightDirs = getPipeDirections(board[rightIdx].dataset.type, 
                parseInt(board[rightIdx].dataset.rotation));
            if (rightDirs.includes('left')) neighbors.push(rightIdx);
        }
        
        if (dirs.includes('up') && row > 0) {
            const upIdx = index - size;
            const upDirs = getPipeDirections(board[upIdx].dataset.type, 
                parseInt(board[upIdx].dataset.rotation));
            if (upDirs.includes('down')) neighbors.push(upIdx);
        }
        
        if (dirs.includes('down') && row < size - 1) {
            const downIdx = index + size;
            const downDirs = getPipeDirections(board[downIdx].dataset.type, 
                parseInt(board[downIdx].dataset.rotation));
            if (downDirs.includes('up')) neighbors.push(downIdx);
        }

        return neighbors;
    }

    // Направления трубы
    function getPipeDirections(type, rotation) {
        const baseDirs = {
            'start': ['right'],
            'end': ['left'],
            'straight': rotation % 180 === 0 ? ['left', 'right'] : ['up', 'down'],
            'corner': 
                rotation === 0 ? ['right', 'down'] :
                rotation === 90 ? ['left', 'down'] :
                rotation === 180 ? ['left', 'up'] : ['right', 'up'],
            't-shape':
                rotation === 0 ? ['left', 'right', 'down'] :
                rotation === 90 ? ['up', 'down', 'left'] :
                rotation === 180 ? ['left', 'right', 'up'] : ['up', 'down', 'right']
        };
        return baseDirs[type] || [];
    }

    // Анимация воды
    function animateWater() {
        board.forEach(pipe => pipe.classList.remove('water'));
        waterPath.forEach((idx, i) => {
            setTimeout(() => {
                board[idx].classList.add('water');
                
                // Звук текущей воды (каждый 3-й шаг)
                if (i % 3 === 0) playSound('water');
            }, i * 300);
        });
    }

    // Сброс уровня
    function resetLevel() {
        if (isWaterFlowing) return;
        loadLevel(currentLevel);
    }

    // Уведомление
    function showNotification(message) {
        notification.textContent = message;
        notification.classList.add('show');
        setTimeout(() => notification.classList.remove('show'), 2000);
    }

    // События
    startBtn.addEventListener('click', startFlow);
    resetBtn.addEventListener('click', resetLevel);
    nextBtn.addEventListener('click', () => loadLevel(currentLevel + 1));

    // Добавляем обработчик для кнопки "Назад"
    document.querySelector('.back-button').addEventListener('click', (e) => {
        if (isWaterFlowing) {
            e.preventDefault();
            showNotification('Дождитесь окончания анимации');
        }
    });
});