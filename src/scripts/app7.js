document.addEventListener('DOMContentLoaded', function() {
    const STORAGE_PREFIX = 'clownades.';
    const EVENTS_KEY = STORAGE_PREFIX + 'Events';
    
    // DOM Elements
    const eventsList = document.getElementById('eventsList');
    const modalOverlay = document.getElementById('modalOverlay');
    const eventNameInput = document.getElementById('eventName');
    const eventDateInput = document.getElementById('eventDate');
    const btnAdd = document.querySelector('.btn-add');
    const btnCancel = document.querySelector('.btn-cancel');
    const btnStart = document.querySelector('.btn-start');
    
    let events = JSON.parse(localStorage.getItem(EVENTS_KEY)) || [];
    let isEditing = false;
    
    // Set minimum date for input (today)
    eventDateInput.min = new Date().toISOString().slice(0, 16);
    
    // Initialize the app
    function init() {
        renderEvents();
        setupEventListeners();
    }
    
    // Set up event listeners
    function setupEventListeners() {
        btnAdd.addEventListener('click', openModal);
        btnCancel.addEventListener('click', closeModal);
        btnStart.addEventListener('click', createNewEvent);
    }
    
    // Open modal for new event
    function openModal() {
        modalOverlay.classList.add('active');
        eventNameInput.focus();
    }
    
    // Close modal
    function closeModal() {
        modalOverlay.classList.remove('active');
        eventNameInput.value = '';
        eventDateInput.value = '';
    }
    
    // Create new event
    function createNewEvent() {
        const name = eventNameInput.value.trim();
        const date = eventDateInput.value;
        
        if (!name || !date) {
            if (!name) eventNameInput.classList.add('shake');
            if (!date) eventDateInput.classList.add('shake');
            setTimeout(() => {
                eventNameInput.classList.remove('shake');
                eventDateInput.classList.remove('shake');
            }, 400);
            return;
        }
        
        const newEvent = {
            id: Date.now(),
            name: name,
            targetDate: date,
            isArchived: false,
            createdAt: new Date().toISOString()
        };
        
        events.push(newEvent);
        saveEvents();
        renderEvents();
        closeModal();
    }
    
    // Toggle editing mode
    function toggleEditingMode(enable) {
        isEditing = enable;
        const eventsContainer = document.querySelectorAll('.event-card:not(.archived-event)');
        
        eventsContainer.forEach(event => {
            if (enable) {
                event.classList.add('editing');
            } else {
                event.classList.remove('editing');
            }
        });
    }
    
    // Delete an event
    function deleteEvent(id, archive = true) {
        const eventIndex = events.findIndex(event => event.id === id);
        
        if (eventIndex !== -1) {
            if (archive) {
                events[eventIndex].isArchived = true;
                events[eventIndex].archivedAt = new Date().toISOString();
            } else {
                events.splice(eventIndex, 1);
            }
            
            saveEvents();
            renderEvents();
        }
    }
    
    // Save events to localStorage
    function saveEvents() {
        localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    }
    
    // Render all events
    function renderEvents() {
        const activeEvents = events.filter(event => !event.isArchived);
        const archivedEvents = events.filter(event => event.isArchived);
        
        eventsList.innerHTML = '';
        
        // Active events
        activeEvents.forEach(event => {
            eventsList.appendChild(createEventCard(event, false));
        });
        
        // Add edit button if there are events
        if (activeEvents.length > 0) {
            const editBtn = document.createElement('button');
            editBtn.className = 'btn';
            editBtn.textContent = isEditing ? 'Готово' : 'Редактировать';
            editBtn.style.marginTop = '20px';
            editBtn.style.width = '100%';
            editBtn.addEventListener('click', () => toggleEditingMode(!isEditing));
            eventsList.appendChild(editBtn);
        }
        
        // Archived events section
        if (archivedEvents.length > 0) {
            const archiveSection = document.createElement('div');
            archiveSection.className = 'archive-section';
            
            const archiveTitle = document.createElement('div');
            archiveTitle.className = 'archive-title';
            archiveTitle.textContent = 'Архив';
            archiveSection.appendChild(archiveTitle);
            
            archivedEvents.forEach(event => {
                archiveSection.appendChild(createEventCard(event, true));
            });
            
            eventsList.appendChild(archiveSection);
        }
    }
    
    // Create an event card element
    function createEventCard(event, isArchived = false) {
        const targetDate = new Date(event.targetDate);
        const now = new Date();
        let diff = targetDate - now;
        
        const isExpired = diff <= 0;
        if (isExpired) diff = 0;
        
        // Calculate time units
        const seconds = Math.floor(diff / 1000) % 60;
        const minutes = Math.floor(diff / (1000 * 60)) % 60;
        const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24)) % 30;
        const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30)) % 12;
        const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
        
        const eventCard = document.createElement('div');
        eventCard.className = `event-card ${isArchived ? 'archived-event' : ''}`;
        eventCard.dataset.id = event.id;
        
        eventCard.innerHTML = `
            <div class="event-title">${event.name}</div>
            <div class="timer-display">
                <div class="time-unit">
                    <div class="time-value">${Math.max(0, years)}</div>
                    <div class="time-label">Лет</div>
                </div>
                <div class="time-unit">
                    <div class="time-value">${Math.max(0, months)}</div>
                    <div class="time-label">Месяцев</div>
                </div>
                <div class="time-unit">
                    <div class="time-value">${Math.max(0, days)}</div>
                    <div class="time-label">Дней</div>
                </div>
                <div class="time-unit">
                    <div class="time-value">${Math.max(0, hours)}</div>
                    <div class="time-label">Часов</div>
                </div>
                <div class="time-unit">
                    <div class="time-value">${Math.max(0, minutes)}</div>
                    <div class="time-label">Минут</div>
                </div>
                <div class="time-unit">
                    <div class="time-value">${Math.max(0, seconds)}</div>
                    <div class="time-label">Секунд</div>
                </div>
            </div>
            <div class="event-meta">
                Создано: ${formatDate(new Date(event.createdAt))}
                ${isArchived ? '<br>Заархивировано: ' + formatDate(new Date(event.archivedAt)) : ''}
                <br>Событие: ${formatDate(targetDate)}
            </div>
            ${isArchived ? '' : '<button class="delete-btn">В архив</button>'}
        `;
        
        // Добавляем блок с информацией о наступившем событии
        if (isExpired && !isArchived) {
            const expiredInfo = document.createElement('div');
            expiredInfo.className = 'expired-info';
            expiredInfo.innerHTML = `
                <div class="expired-text">Событие "${event.name}" наступило</div>
                <button class="archive-btn">Перенести в архив</button>
            `;
            eventCard.appendChild(expiredInfo);
            
            // Обработчик кнопки "Перенести в архив"
            const archiveBtn = expiredInfo.querySelector('.archive-btn');
            archiveBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteEvent(event.id, true);
            });
        }
        
        // Add iOS-style close button for archived events
        if (isArchived) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'archive-close-btn';
            closeBtn.title = 'Удалить навсегда';
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteEvent(event.id, false);
            });
            eventCard.appendChild(closeBtn);
        }
        
        // Update timer every second for active events
        if (!isArchived && !isExpired) {
            const intervalId = setInterval(() => {
                if (eventCard.isConnected) {
                    const now = new Date();
                    const targetDate = new Date(event.targetDate);
                    let diff = targetDate - now;
                    
                    if (diff <= 0) {
                        clearInterval(intervalId);
                        
                        // Добавляем блок с информацией о наступившем событии
                        const expiredInfo = document.createElement('div');
                        expiredInfo.className = 'expired-info';
                        expiredInfo.innerHTML = `
                            <div class="expired-text">Событие "${event.name}" наступило</div>
                            <button class="archive-btn">Перенести в архив</button>
                        `;
                        eventCard.appendChild(expiredInfo);
                        
                        // Обработчик кнопки "Перенести в архив"
                        const archiveBtn = expiredInfo.querySelector('.archive-btn');
                        archiveBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            deleteEvent(event.id, true);
                        });
                        
                        diff = 0;
                    }
                    
                    const seconds = Math.floor(diff / 1000) % 60;
                    const minutes = Math.floor(diff / (1000 * 60)) % 60;
                    const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
                    const days = Math.floor(diff / (1000 * 60 * 60 * 24)) % 30;
                    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30)) % 12;
                    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
                    
                    const timeValues = eventCard.querySelectorAll('.time-value');
                    timeValues[0].textContent = Math.max(0, years);
                    timeValues[1].textContent = Math.max(0, months);
                    timeValues[2].textContent = Math.max(0, days);
                    timeValues[3].textContent = Math.max(0, hours);
                    timeValues[4].textContent = Math.max(0, minutes);
                    timeValues[5].textContent = Math.max(0, seconds);
                } else {
                    clearInterval(intervalId);
                }
            }, 1000);
        }
        
        // Add delete button functionality for active events
        if (!isArchived) {
            const deleteBtn = eventCard.querySelector('.delete-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    deleteEvent(event.id, true);
                });
            }
        }
        
        return eventCard;
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