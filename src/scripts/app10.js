document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const goalsList = document.querySelector('.goals-list');
    const addGoalBtn = document.querySelector('.btn-add');
    const addGoalModal = document.getElementById('addGoalModal');
    const archiveModal = document.getElementById('archiveModal');
    const archiveBtn = document.querySelector('.btn-archive');
    const closeModalBtns = document.querySelectorAll('.btn-close');
    const saveGoalBtn = document.querySelector('.btn-save');
    const deleteAllArchiveBtn = document.querySelector('.btn-delete-all');
    const archiveList = document.querySelector('.archive-list');
    
    // App Data
    let goals = JSON.parse(localStorage.getItem('ClownadesGoalsEBATskokProshlo')) || [];
    let archivedGoals = JSON.parse(localStorage.getItem('ClownadesGoalsEBATskokProshloArchive')) || [];
    
    // Initialize App
    renderGoals();
    
    // Open Add Goal Modal
    addGoalBtn.addEventListener('click', function() {
        addGoalModal.classList.add('active');
        document.getElementById('goalStartDate').valueAsDate = new Date();
    });
    
    // Open Archive Modal
    archiveBtn.addEventListener('click', function() {
        renderArchive();
        archiveModal.classList.add('active');
    });
    
    // Close Modals
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            addGoalModal.classList.remove('active');
            archiveModal.classList.remove('active');
        });
    });
    
    // Close Modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === addGoalModal) {
            addGoalModal.classList.remove('active');
        }
        if (event.target === archiveModal) {
            archiveModal.classList.remove('active');
        }
    });
    
    // Save New Goal
    saveGoalBtn.addEventListener('click', function() {
        const name = document.getElementById('goalName').value.trim();
        const startDate = document.getElementById('goalStartDate').value;
        
        // Validation
        if (!name || !startDate) {
            if (!name) document.getElementById('goalName').classList.add('error');
            if (!startDate) document.getElementById('goalStartDate').classList.add('error');
            
            setTimeout(() => {
                document.getElementById('goalName').classList.remove('error');
                document.getElementById('goalStartDate').classList.remove('error');
            }, 500);
            
            return;
        }
        
        // Create new goal
        const newGoal = {
            id: Date.now(),
            name,
            startDate,
            createdAt: new Date().toISOString()
        };
        
        goals.push(newGoal);
        saveGoals();
        renderGoals();
        addGoalModal.classList.remove('active');
        
        // Clear form
        document.getElementById('goalName').value = '';
        
        showNotification('Цель добавлена');
    });
    
    // Delete All Archived Goals
    deleteAllArchiveBtn.addEventListener('click', function() {
        if (archivedGoals.length === 0) return;
        
        if (confirm('Вы уверены, что хотите удалить все цели из архива?')) {
            archivedGoals = [];
            saveArchivedGoals();
            renderArchive();
            showNotification('Архив очищен');
        }
    });
    
    // Calculate Time Passed
    function getTimePassed(dateString) {
        // Create dates in Warsaw timezone
        const today = new Date();
        const startDate = new Date(dateString);
        
        // Convert to Warsaw timezone
        const warsawToday = new Date(today.toLocaleString('en-US', { timeZone: 'Europe/Warsaw' }));
        const warsawStartDate = new Date(startDate.toLocaleString('en-US', { timeZone: 'Europe/Warsaw' }));
        
        // Set time to midnight to avoid timezone issues
        warsawToday.setHours(0, 0, 0, 0);
        warsawStartDate.setHours(0, 0, 0, 0);
        
        // Calculate total days difference
        const diffTime = warsawToday - warsawStartDate;
        const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        // Calculate years
        let years = Math.floor(totalDays / 365.25); // Account for leap years
        let remainingDays = totalDays % 365.25;
        
        // Calculate months (average 30.44 days per month)
        let months = Math.floor(remainingDays / 30.44);
        remainingDays = Math.floor(remainingDays % 30.44);
        
        // Calculate days
        let days = remainingDays;
        
        // Adjust for negative values
        if (days < 0) {
            months--;
            days += 30;
        }
        if (months < 0) {
            years--;
            months += 12;
        }
        
        return {
            years,
            months,
            days
        };
    }
    
    // Format Time Passed
    function formatTimePassed(time) {
        const parts = [];
        
        if (time.years > 0) {
            parts.push(`${time.years} ${getRussianWord(time.years, 'год', 'года', 'лет')}`);
        }
        if (time.months > 0) {
            parts.push(`${time.months} ${getRussianWord(time.months, 'месяц', 'месяца', 'месяцев')}`);
        }
        if (time.days > 0) {
            parts.push(`${time.days} ${getRussianWord(time.days, 'день', 'дня', 'дней')}`);
        }
        
        return parts.length > 0 ? parts.join(' ') : '0 дней';
    }
    
    // Get Russian word form
    function getRussianWord(number, one, two, five) {
        const lastDigit = number % 10;
        const lastTwoDigits = number % 100;
        
        if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return five;
        if (lastDigit === 1) return one;
        if (lastDigit >= 2 && lastDigit <= 4) return two;
        return five;
    }
    
    // Render Goals List
    function renderGoals() {
        goalsList.innerHTML = '';
        
        if (goals.length === 0) {
            goalsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Нет активных целей</p>';
            return;
        }
        
        // Sort by start date
        goals.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        
        goals.forEach(goal => {
            const timePassed = getTimePassed(goal.startDate);
            
            const goalItem = document.createElement('div');
            goalItem.className = 'goal-item';
            goalItem.innerHTML = `
                <div class="goal-header">
                    <div class="goal-name">${goal.name}</div>
                    <button class="btn btn-delete" data-id="${goal.id}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="goal-details">
                    <div>Начало: ${formatDate(goal.startDate)}</div>
                    <div class="time-passed">Прошло: ${formatTimePassed(timePassed)}</div>
                </div>
            `;
            
            goalsList.appendChild(goalItem);
            
            // Delete goal handler
            goalItem.querySelector('.btn-delete').addEventListener('click', function(e) {
                e.stopPropagation();
                moveToArchive(goal.id);
            });
            
            // Edit goal handler
            goalItem.addEventListener('click', function() {
                editGoal(goal.id);
            });
        });
    }
    
    // Render Archive List
    function renderArchive() {
        archiveList.innerHTML = '';
        
        if (archivedGoals.length === 0) {
            archiveList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Архив пуст</p>';
            return;
        }
        
        archivedGoals.forEach(goal => {
            const archiveItem = document.createElement('div');
            archiveItem.className = 'archive-item';
            archiveItem.innerHTML = `
                <div>${goal.name}</div>
                <button class="btn btn-restore" data-id="${goal.id}">
                    <i class="fas fa-undo"></i>
                </button>
            `;
            
            archiveList.appendChild(archiveItem);
            
            // Restore goal handler
            archiveItem.querySelector('.btn-restore').addEventListener('click', function(e) {
                e.stopPropagation();
                restoreFromArchive(goal.id);
            });
        });
    }
    
    // Move Goal to Archive
    function moveToArchive(id) {
        const index = goals.findIndex(goal => goal.id === id);
        if (index === -1) return;
        
        const [goal] = goals.splice(index, 1);
        archivedGoals.push(goal);
        
        saveGoals();
        saveArchivedGoals();
        renderGoals();
        showNotification('Цель перемещена в архив');
    }
    
    // Restore Goal from Archive
    function restoreFromArchive(id) {
        const index = archivedGoals.findIndex(goal => goal.id === id);
        if (index === -1) return;
        
        const [goal] = archivedGoals.splice(index, 1);
        goals.push(goal);
        
        saveGoals();
        saveArchivedGoals();
        renderArchive();
        renderGoals();
        showNotification('Цель восстановлена');
    }
    
    // Edit Goal
    function editGoal(id) {
        const goal = goals.find(goal => goal.id === id);
        if (!goal) return;
        
        document.getElementById('goalName').value = goal.name;
        document.getElementById('goalStartDate').value = goal.startDate;
        
        addGoalModal.classList.add('active');
        
        // Update save handler for editing
        saveGoalBtn.onclick = function() {
            const name = document.getElementById('goalName').value.trim();
            const startDate = document.getElementById('goalStartDate').value;
            
            // Validation
            if (!name || !startDate) {
                if (!name) document.getElementById('goalName').classList.add('error');
                if (!startDate) document.getElementById('goalStartDate').classList.add('error');
                
                setTimeout(() => {
                    document.getElementById('goalName').classList.remove('error');
                    document.getElementById('goalStartDate').classList.remove('error');
                }, 500);
                
                return;
            }
            
            // Update goal
            goal.name = name;
            goal.startDate = startDate;
            
            saveGoals();
            renderGoals();
            addGoalModal.classList.remove('active');
            
            // Restore default save handler
            saveGoalBtn.onclick = arguments.callee;
            
            showNotification('Цель обновлена');
        };
    }
    
    // Save Goals to localStorage
    function saveGoals() {
        localStorage.setItem('ClownadesGoalsEBATskokProshlo', JSON.stringify(goals));
    }
    
    // Save Archived Goals to localStorage
    function saveArchivedGoals() {
        localStorage.setItem('ClownadesGoalsEBATskokProshloArchive', JSON.stringify(archivedGoals));
    }
    
    // Format Date
    function formatDate(dateString) {
        const date = new Date(dateString);
        const warsawDate = new Date(date.toLocaleString('en-US', { timeZone: 'Europe/Warsaw' }));
        return warsawDate.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            timeZone: 'Europe/Warsaw'
        });
    }
    
    // Show Notification
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
});
