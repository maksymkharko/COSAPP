document.addEventListener('DOMContentLoaded', function() {
    // Функция для форматирования даты
    function formatDate(dateStr) {
        const [day, month, year] = dateStr.split('.');
        return new Date(`${year}-${month}-${day}`);
    }

    // Обновляем таймеры для всех подписок
    function updateTimers() {
        const timeElements = document.querySelectorAll('.time-left');
        const now = new Date();
        
        timeElements.forEach(element => {
            const endDateStr = element.getAttribute('data-end');
            const endDate = formatDate(endDateStr);
            const diff = endDate - now;
            
            if (diff <= 0) {
                element.textContent = 'Подписка истекла!';
                element.style.color = 'var(--danger-color)';
                return;
            }
            
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            
            if (days > 30) {
                element.textContent = `Осталось: ${Math.floor(days/30)} мес. ${days%30} дн.`;
                element.style.color = 'var(--accent-color)';
            } else if (days > 0) {
                element.textContent = `Осталось: ${days} дн.`;
                if (days < 7) {
                    element.style.color = 'var(--warning-color)';
                } else {
                    element.style.color = 'var(--accent-color)';
                }
            } else {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                element.textContent = `Осталось: ${hours} ч.`;
                element.style.color = 'var(--danger-color)';
            }
        });
    }
    
    // Обновляем таймеры сразу и каждую минуту
    updateTimers();
    setInterval(updateTimers, 60000);
});