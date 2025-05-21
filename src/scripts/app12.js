document.addEventListener('DOMContentLoaded', function() {
    // Получаем данные из JSON
    const subscriptionsData = JSON.parse(document.getElementById('subscriptions-data').textContent);
    const container = document.getElementById('subscriptions-container');
    
    // Генерируем HTML для каждой подписки
    for (const [serviceId, serviceData] of Object.entries(subscriptionsData)) {
        const serviceName = serviceId === 'youtube' ? 'YouTube Premium' : 'Kinopub';
        const serviceHtml = `
            <div class="subscription-container" id="${serviceId}">
                <div class="service-header">
                    <h2 class="service-title">${serviceName}</h2>
                    <p class="service-price">${serviceData.price}</p>
                </div>
                <div class="user-list">
                    ${serviceData.members.map(member => `
                        <div class="user-card">
                            <div class="user-info">
                                <span class="user-name">${member.name}</span>
                                <a href="https://t.me/${member.telegram}" class="telegram-link" target="_blank">@${member.telegram}</a>
                            </div>
                            <div class="subscription-info">
                                <span class="payment-date">до ${member.end_date}</span>
                                <span class="time-left" data-end="${member.end_date}">...</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', serviceHtml);
    }
    
    // Функция для форматирования даты
    function formatDate(dateStr) {
        const [day, month, year] = dateStr.split('.');
        return new Date(`${year}-${month}-${day}`);
    }
    
    // Обновляем таймеры
    function updateTimers() {
        const timeElements = document.querySelectorAll('.time-left');
        const now = new Date();
        
        timeElements.forEach(element => {
            const endDateStr = element.getAttribute('data-end');
            const endDate = formatDate(endDateStr);
            const diff = endDate - now;
            
            if (diff <= 0) {
                element.textContent = 'Истекла!';
                element.style.color = 'var(--danger-color)';
                return;
            }
            
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            
            if (days > 30) {
                const months = Math.floor(days / 30);
                const remainingDays = days % 30;
                element.textContent = `${months}м ${remainingDays}д`;
                element.style.color = 'var(--accent-color)';
            } else if (days > 0) {
                element.textContent = `${days}д`;
                element.style.color = days < 7 ? 'var(--warning-color)' : 'var(--accent-color)';
            } else {
                element.textContent = `${hours}ч`;
                element.style.color = 'var(--danger-color)';
            }
        });
    }
    
    // Обновляем таймеры сразу и каждую минуту
    updateTimers();
    setInterval(updateTimers, 60000);
});
