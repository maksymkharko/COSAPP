document.addEventListener('DOMContentLoaded', function() {
    const STORAGE_PREFIX = 'clownades.';
    const GOALS_KEY = STORAGE_PREFIX + 'Goals';
    
    // DOM Elements
    const goalsList = document.getElementById('goalsList');
    const modalOverlay = document.getElementById('modalOverlay');
    const goalNameInput = document.getElementById('goalName');
    const btnAdd = document.querySelector('.btn-add');
    const btnCancel = document.querySelector('.btn-cancel');
    const btnStart = document.querySelector('.btn-start');
    
    let goals = JSON.parse(localStorage.getItem(GOALS_KEY)) || [];
    let isEditing = false;
    
    // Initialize the app
    function init() {
        renderGoals();
        setupEventListeners();
    }
    
    // Set up event listeners
    function setupEventListeners() {
        btnAdd.addEventListener('click', openModal);
        btnCancel.addEventListener('click', closeModal);
        btnStart.addEventListener('click', startNewGoal);
    }
    
    // Open modal for new goal
    function openModal() {
        modalOverlay.classList.add('active');
        goalNameInput.focus();
    }
    
    // Close modal
    function closeModal() {
        modalOverlay.classList.remove('active');
        goalNameInput.value = '';
    }
    
    // Start a new goal
    function startNewGoal() {
        const name = goalNameInput.value.trim();
        
        if (!name) {
            goalNameInput.classList.add('shake');
            setTimeout(() => goalNameInput.classList.remove('shake'), 400);
            return;
        }
        
        const newGoal = {
            id: Date.now(),
            name: name,
            startDate: new Date().toISOString(),
            isArchived: false
        };
        
        goals.push(newGoal);
        saveGoals();
        renderGoals();
        closeModal();
    }
    
    // Toggle editing mode
    function toggleEditingMode(enable) {
        isEditing = enable;
        const goalsContainer = document.querySelectorAll('.goal-card:not(.archived-goal)');
        
        goalsContainer.forEach(goal => {
            if (enable) {
                goal.classList.add('editing');
            } else {
                goal.classList.remove('editing');
            }
        });
    }
    
    // Delete a goal
    function deleteGoal(id, archive = true) {
        const goalIndex = goals.findIndex(goal => goal.id === id);
        
        if (goalIndex !== -1) {
            if (archive) {
                goals[goalIndex].isArchived = true;
                goals[goalIndex].endDate = new Date().toISOString();
            } else {
                goals.splice(goalIndex, 1);
            }
            
            saveGoals();
            renderGoals();
        }
    }
    
    // Save goals to localStorage
    function saveGoals() {
        localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
    }
    
    // Render all goals
    function renderGoals() {
        const activeGoals = goals.filter(goal => !goal.isArchived);
        const archivedGoals = goals.filter(goal => goal.isArchived);
        
        goalsList.innerHTML = '';
        
        // Active goals
        activeGoals.forEach(goal => {
            goalsList.appendChild(createGoalCard(goal, false));
        });
        
        // Add edit button if there are active goals
        if (activeGoals.length > 0) {
            const editBtn = document.createElement('button');
            editBtn.className = 'btn';
            editBtn.textContent = isEditing ? 'Готово' : 'Редактировать';
            editBtn.style.marginTop = '20px';
            editBtn.style.width = '100%';
            editBtn.addEventListener('click', () => toggleEditingMode(!isEditing));
            goalsList.appendChild(editBtn);
        }
        
        // Archived goals section
        if (archivedGoals.length > 0) {
            const archiveSection = document.createElement('div');
            archiveSection.className = 'archive-section';
            
            const archiveTitle = document.createElement('div');
            archiveTitle.className = 'archive-title';
            archiveTitle.textContent = 'Архив';
            archiveSection.appendChild(archiveTitle);
            
            archivedGoals.forEach(goal => {
                archiveSection.appendChild(createGoalCard(goal, true));
            });
            
            goalsList.appendChild(archiveSection);
        }
    }
    
    // Create a goal card element
    function createGoalCard(goal, isArchived = false) {
        const startDate = new Date(goal.startDate);
        const endDate = isArchived ? new Date(goal.endDate) : new Date();
        const diff = endDate - startDate;
        
        // Calculate time units
        const seconds = Math.floor(diff / 1000) % 60;
        const minutes = Math.floor(diff / (1000 * 60)) % 60;
        const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24)) % 30;
        const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30)) % 12;
        const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
        
        const goalCard = document.createElement('div');
        goalCard.className = `goal-card ${isArchived ? 'archived-goal' : ''}`;
        goalCard.dataset.id = goal.id;
        
        goalCard.innerHTML = `
            <div class="goal-title">${goal.name}</div>
            <div class="timer-display">
                <div class="time-unit">
                    <div class="time-value">${years}</div>
                    <div class="time-label">Лет</div>
                </div>
                <div class="time-unit">
                    <div class="time-value">${months}</div>
                    <div class="time-label">Месяцев</div>
                </div>
                <div class="time-unit">
                    <div class="time-value">${days}</div>
                    <div class="time-label">Дней</div>
                </div>
                <div class="time-unit">
                    <div class="time-value">${hours}</div>
                    <div class="time-label">Часов</div>
                </div>
                <div class="time-unit">
                    <div class="time-value">${minutes}</div>
                    <div class="time-label">Минут</div>
                </div>
                <div class="time-unit">
                    <div class="time-value">${seconds}</div>
                    <div class="time-label">Секунд</div>
                </div>
            </div>
            <div class="goal-meta">Создано: ${formatDate(startDate)}${isArchived ? `<br>Завершено: ${formatDate(new Date(goal.endDate))}` : ''}</div>
            ${isArchived ? '' : '<button class="delete-btn">В архив</button>'}
        `;
        
        // Add iOS-style close button for archived goals
        if (isArchived) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'archive-close-btn';
            closeBtn.title = 'Удалить навсегда';
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteGoal(goal.id, false);
            });
            goalCard.appendChild(closeBtn);
        }
        
        // Update timer every second for active goals
        if (!isArchived) {
            const intervalId = setInterval(() => {
                if (goalCard.isConnected) {
                    const now = new Date();
                    const diff = now - startDate;
                    
                    const seconds = Math.floor(diff / 1000) % 60;
                    const minutes = Math.floor(diff / (1000 * 60)) % 60;
                    const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
                    const days = Math.floor(diff / (1000 * 60 * 60 * 24)) % 30;
                    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30)) % 12;
                    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
                    
                    const timeValues = goalCard.querySelectorAll('.time-value');
                    timeValues[0].textContent = years;
                    timeValues[1].textContent = months;
                    timeValues[2].textContent = days;
                    timeValues[3].textContent = hours;
                    timeValues[4].textContent = minutes;
                    timeValues[5].textContent = seconds;
                } else {
                    clearInterval(intervalId);
                }
            }, 1000);
        }
        
        // Add delete button functionality for active goals
        if (!isArchived) {
            const deleteBtn = goalCard.querySelector('.delete-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    deleteGoal(goal.id, true);
                });
            }
        }
        
        return goalCard;
    }
    
    // Format date for display
    function formatDate(date) {
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // Initialize the application
    init();
});