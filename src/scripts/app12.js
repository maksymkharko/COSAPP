document.addEventListener('DOMContentLoaded', function() {
    // Обновляем таймеры для всех подписок
    function updateTimers() {
        const timeElements = document.querySelectorAll('.time-left');
        const now = new Date();
        
        timeElements.forEach(element => {
            const endDate = new Date(element.getAttribute('data-end'));
            const diff = endDate - now;
            
            if (diff <= 0) {
                element.textContent = 'Подписка истекла!';
                element.style.color = '#ff5555';
                return;
            }
            
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            
            if (days > 0) {
                element.textContent = `Осталось: ${days} дн. ${hours} ч.`;
            } else {
                element.textContent = `Осталось: ${hours} часов`;
                element.style.color = '#ffaa00';
            }
        });
    }
    
    // Обновляем таймеры сразу и каждую минуту
    updateTimers();
    setInterval(updateTimers, 60000);
    
    // Регистрация Service Worker для PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js').then(registration => {
                console.log('ServiceWorker registration successful');
            }).catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    }
});