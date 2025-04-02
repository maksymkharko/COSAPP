document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const backButton = document.querySelector('.back-button');
    const addButton = document.querySelector('.add-button');
    const eventsList = document.getElementById('eventsList');
    const archiveButton = document.getElementById('archiveButton');
    
    // Модальные окна
    const addEventModal = document.getElementById('addEventModal');
    const editEventModal = document.getElementById('editEventModal');
    const archiveModal = document.getElementById('archiveModal');
    
    // Кнопки модальных окон
    const cancelAdd = document.getElementById('cancelAdd');
    const confirmAdd = document.getElementById('confirmAdd');
    const cancelEdit = document.getElementById('cancelEdit');
    const saveEdit = document.getElementById('saveEdit');
    const archiveEvent = document.getElementById('archiveEvent');
    const cancelArchive = document.getElementById('cancelArchive');
    const deleteAllArchive = document.getElementById('deleteAllArchive');
    
    // Поля ввода
    const eventName = document.getElementById('eventName');
    const eventDate = document.getElementById('eventDate');
    const eventNote = document.getElementById('eventNote');
    const editEventName = document.getElementById('editEventName');
    const editEventDate = document.getElementById('editEventDate');
    const editEventNote = document.getElementById('editEventNote');
    
    // Архив
    const archiveList = document.getElementById('archiveList');
    
    // Текущее редактируемое событие
    let currentEventId = null;
    
    // Загрузка данных из LocalStorage
    function loadData() {
        const data = localStorage.getItem('ClownadesWasznajaData');
        return data ? JSON.parse(data) : { events: [], archive: [] };
    }
    
    // Сохранение данных в LocalStorage
    function saveData(data) {
        localStorage.setItem('ClownadesWasznajaData', JSON.stringify(data));
    }
    
    // Открытие модального окна
    function openModal(modal) {
        modal.classList.add('active');
    }
    
    // Закрытие модального окна
    function closeModal(modal) {
        modal.classList.remove('active');
    }
    
    // Очистка полей формы
    function clearForm() {
        eventName.value = '';
        eventDate.value = '';
        eventNote.value = '';
    }
    
    // Создание ID для события
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // Форматирование даты
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // Расчет оставшегося времени
    function calculateTimeRemaining(targetDate) {
        const now = new Date();
        const target = new Date(targetDate);
        const diff = target - now;
        
        if (diff <= 0) return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
        
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30.44); // Среднее количество дней в месяце
        const years = Math.floor(months / 12);
        
        return {
            years: years,
            months: months % 12,
            days: days % 30,
            hours: hours % 24,
            minutes: minutes % 60,
            seconds: seconds % 60
        };
    }
    
    // Проверка, осталось ли меньше года до события
    function isLessThanYearAway(targetDate) {
        const now = new Date();
        const target = new Date(targetDate);
        const diff = target - now;
        const days = diff / (1000 * 60 * 60 * 24);
        
        return days < 365;
    }
    
    // Проверка, осталась ли неделя до события
    function isLessThanWeekAway(targetDate) {
        const now = new Date();
        const target = new Date(targetDate);
        const diff = target - now;
        const days = diff / (1000 * 60 * 60 * 24);
        
        return days < 7;
    }
    
    // Создание элемента таймера
    function createTimerElement(timeRemaining, targetDate) {
        const timerContainer = document.createElement('div');
        timerContainer.className = 'timer-container';
        
        if (isLessThanWeekAway(targetDate)) {
            timerContainer.classList.add('timer-warning');
        }
        
        const yearsBox = document.createElement('div');
        yearsBox.className = 'timer-box';
        yearsBox.innerHTML = `<div class="timer-value">${timeRemaining.years}</div><div class="timer-label">лет</div>`;
        
        const monthsBox = document.createElement('div');
        monthsBox.className = 'timer-box';
        monthsBox.innerHTML = `<div class="timer-value">${timeRemaining.months}</div><div class="timer-label">мес</div>`;
        
        const daysBox = document.createElement('div');
        daysBox.className = 'timer-box';
        daysBox.innerHTML = `<div class="timer-value">${timeRemaining.days}</div><div class="timer-label">дней</div>`;
        
        const hoursBox = document.createElement('div');
        hoursBox.className = 'timer-box';
        hoursBox.innerHTML = `<div class="timer-value">${timeRemaining.hours}</div><div class="timer-label">часов</div>`;
        
        timerContainer.appendChild(yearsBox);
        timerContainer.appendChild(monthsBox);
        timerContainer.appendChild(daysBox);
        timerContainer.appendChild(hoursBox);
        
        return timerContainer;
    }
    
    // Создание карточки события
    function createEventCard(event) {
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';
        eventCard.dataset.id = event.id;
        
        const timeRemaining = calculateTimeRemaining(event.date);
        
        eventCard.innerHTML = `
            <h3>${event.name}</h3>
            <div class="event-date">${formatDate(event.date)}</div>
            <div class="event-note">${event.note}</div>
        `;
        
        const timerElement = createTimerElement(timeRemaining, event.date);
        eventCard.appendChild(timerElement);
        
        return eventCard;
    }
    
    // Обновление таймеров
    function updateTimers() {
        const eventCards = document.querySelectorAll('.event-card');
        eventCards.forEach(card => {
            const timerContainer = card.querySelector('.timer-container');
            if (timerContainer) {
                const eventId = card.dataset.id;
                const data = loadData();
                const event = data.events.find(e => e.id === eventId);
                
                if (event) {
                    const timeRemaining = calculateTimeRemaining(event.date);
                    const newTimer = createTimerElement(timeRemaining, event.date);
                    timerContainer.replaceWith(newTimer);
                    
                    // Добавляем класс warning, если осталось меньше недели
                    if (isLessThanWeekAway(event.date)) {
                        card.querySelector('.timer-container').classList.add('timer-warning');
                    }
                }
            }
        });
    }
    
    // Отображение списка событий
    function renderEvents() {
        eventsList.innerHTML = '';
        const data = loadData();
        
        data.events.forEach(event => {
            const eventCard = createEventCard(event);
            eventsList.appendChild(eventCard);
        });
        
        // Добавляем обработчики событий для карточек
        addEventCardListeners();
    }
    
    // Отображение списка архивных событий
    function renderArchive() {
        archiveList.innerHTML = '';
        const data = loadData();
        
        if (data.archive.length === 0) {
            archiveList.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">Архив пуст</p>';
            return;
        }
        
        data.archive.forEach(event => {
            const archiveItem = document.createElement('div');
            archiveItem.className = 'archive-item';
            archiveItem.innerHTML = `
                <div class="archive-item-info">
                    <h4>${event.name}</h4>
                    <div class="event-date">${formatDate(event.date)}</div>
                </div>
                <button class="restore-button" data-id="${event.id}">Вернуть</button>
            `;
            archiveList.appendChild(archiveItem);
        });
        
        // Добавляем обработчики событий для кнопок восстановления
        document.querySelectorAll('.restore-button').forEach(button => {
            button.addEventListener('click', function() {
                restoreFromArchive(this.dataset.id);
            });
        });
    }
    
    // Добавление обработчиков событий для карточек
    function addEventCardListeners() {
        document.querySelectorAll('.event-card').forEach(card => {
            card.addEventListener('click', function() {
                const eventId = this.dataset.id;
                openEditModal(eventId);
            });
        });
    }
    
    // Открытие модального окна редактирования
    function openEditModal(eventId) {
        const data = loadData();
        const event = data.events.find(e => e.id === eventId);
        
        if (event) {
            currentEventId = eventId;
            editEventName.value = event.name;
            editEventDate.value = event.date.replace(' ', 'T').slice(0, 16);
            editEventNote.value = event.note;
            openModal(editEventModal);
        }
    }
    
    // Добавление нового события
    function addNewEvent() {
        if (!eventName.value || !eventDate.value) {
            if (!eventName.value) {
                eventName.classList.add('shake');
                setTimeout(() => eventName.classList.remove('shake'), 400);
            }
            if (!eventDate.value) {
                eventDate.classList.add('shake');
                setTimeout(() => eventDate.classList.remove('shake'), 400);
            }
            return;
        }
        
        const data = loadData();
        const newEvent = {
            id: generateId(),
            name: eventName.value,
            date: eventDate.value,
            note: eventNote.value
        };
        
        data.events.push(newEvent);
        saveData(data);
        renderEvents();
        clearForm();
        closeModal(addEventModal);
    }
    
    // Сохранение изменений события
    function saveEventChanges() {
        if (!editEventName.value || !editEventDate.value) {
            if (!editEventName.value) {
                editEventName.classList.add('shake');
                setTimeout(() => editEventName.classList.remove('shake'), 400);
            }
            if (!editEventDate.value) {
                editEventDate.classList.add('shake');
                setTimeout(() => editEventDate.classList.remove('shake'), 400);
            }
            return;
        }
        
        const data = loadData();
        const eventIndex = data.events.findIndex(e => e.id === currentEventId);
        
        if (eventIndex !== -1) {
            data.events[eventIndex] = {
                id: currentEventId,
                name: editEventName.value,
                date: editEventDate.value,
                note: editEventNote.value
            };
            
            saveData(data);
            renderEvents();
            closeModal(editEventModal);
        }
    }
    
    // Перемещение события в архив
    function moveToArchive() {
        const data = loadData();
        const eventIndex = data.events.findIndex(e => e.id === currentEventId);
        
        if (eventIndex !== -1) {
            const [archivedEvent] = data.events.splice(eventIndex, 1);
            data.archive.push(archivedEvent);
            saveData(data);
            renderEvents();
            closeModal(editEventModal);
        }
    }
    
    // Восстановление из архива
    function restoreFromArchive(eventId) {
        const data = loadData();
        const eventIndex = data.archive.findIndex(e => e.id === eventId);
        
        if (eventIndex !== -1) {
            const [restoredEvent] = data.archive.splice(eventIndex, 1);
            data.events.push(restoredEvent);
            saveData(data);
            renderEvents();
            renderArchive();
        }
    }
    
    // Удаление всех архивных событий
    function deleteAllArchive() {
        const data = loadData();
        data.archive = [];
        saveData(data);
        renderArchive();
    }
    
    // Инициализация приложения
    function init() {
        // Проверяем, есть ли данные в LocalStorage
        if (!localStorage.getItem('ClownadesWasznajaData')) {
            const initialData = {
                events: [],
                archive: []
            };
            saveData(initialData);
        }
        
        // Рендерим события
        renderEvents();
        
        // Обновляем таймеры каждую секунду
        setInterval(updateTimers, 1000);
    }
    
    // Обработчики событий
    backButton.addEventListener('click', function() {
        window.location.href = 'index.html';
    });
    
    addButton.addEventListener('click', function() {
        clearForm();
        openModal(addEventModal);
    });
    
    cancelAdd.addEventListener('click', function() {
        closeModal(addEventModal);
    });
    
    confirmAdd.addEventListener('click', addNewEvent);
    
    cancelEdit.addEventListener('click', function() {
        closeModal(editEventModal);
    });
    
    saveEdit.addEventListener('click', saveEventChanges);
    
    archiveEvent.addEventListener('click', moveToArchive);
    
    archiveButton.addEventListener('click', function() {
        renderArchive();
        openModal(archiveModal);
    });
    
    cancelArchive.addEventListener('click', function() {
        closeModal(archiveModal);
    });
    
    deleteAllArchive.addEventListener('click', deleteAllArchive);
    
    // Инициализация
    init();
});

