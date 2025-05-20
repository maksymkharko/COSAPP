document.addEventListener('DOMContentLoaded', function() {
    // Получаем текущую дату
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Определяем количество дней в текущем месяце
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Определяем текущий период
    let currentPeriod;
    let periodEndDate;
    
    if (currentDay >= 1 && currentDay <= 7) {
        currentPeriod = 1;
        periodEndDate = new Date(currentYear, currentMonth, 7, 23, 59, 59);
    } else if (currentDay >= 8 && currentDay <= 15) {
        currentPeriod = 2;
        periodEndDate = new Date(currentYear, currentMonth, 15, 23, 59, 59);
    } else if (currentDay >= 16 && currentDay <= 22) {
        currentPeriod = 3;
        periodEndDate = new Date(currentYear, currentMonth, 22, 23, 59, 59);
    } else {
        currentPeriod = 4;
        periodEndDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
    }
    
    // Подсвечиваем текущий период
    const allPeriods = document.querySelectorAll('.period-card');
    allPeriods.forEach(period => period.classList.remove('active'));
    
    const activePeriod = document.getElementById(`period${currentPeriod}`);
    if (activePeriod) {
        activePeriod.classList.add('active');
        
        // Анимация для активного периода
        setTimeout(() => {
            activePeriod.style.transform = 'scale(1.05)';
            setTimeout(() => {
                activePeriod.style.transform = 'scale(1)';
            }, 300);
        }, 500);
        
        // Обновляем оставшееся время
        updateTimeLeft();
        setInterval(updateTimeLeft, 1000 * 60); // Обновляем каждую минуту
    }
    
    function updateTimeLeft() {
        const now = new Date();
        const diff = periodEndDate - now;
        
        if (diff <= 0) {
            document.getElementById(`time-left${currentPeriod}`).textContent = "Период завершен";
            return;
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        let timeLeftStr = "";
        if (days > 0) {
            timeLeftStr += `${days} ${declOfNum(days, ['день', 'дня', 'дней'])} `;
        }
        timeLeftStr += `${hours} ${declOfNum(hours, ['час', 'часа', 'часов'])}`;
        
        document.getElementById(`time-left${currentPeriod}`).textContent = `Осталось: ${timeLeftStr}`;
    }
    
    // Функция для склонения слов
    function declOfNum(number, titles) {
        const cases = [2, 0, 1, 1, 1, 2];
        return titles[
            number % 100 > 4 && number % 100 < 20 
                ? 2 
                : cases[number % 10 < 5 ? number % 10 : 5]
        ];
    }
    
    // Добавляем анимацию при наведении на карточки
    document.querySelectorAll('.period-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            if (!card.classList.contains('active')) {
                card.style.transform = 'translateY(-5px)';
                card.style.boxShadow = '0 12px 24px rgba(7, 89, 133, 0.2)';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            if (!card.classList.contains('active')) {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '8px 8px 16px #0F172A, -8px -8px 16px #2D3748';
            }
        });
    });
    
    // Проверяем, поддерживает ли браузер PWA-функционал
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