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
    let periodDates;
    
    if (currentDay >= 1 && currentDay <= 7) {
        currentPeriod = 1;
        periodDates = "1-7 число";
    } else if (currentDay >= 8 && currentDay <= 15) {
        currentPeriod = 2;
        periodDates = "8-15 число";
    } else if (currentDay >= 16 && currentDay <= 22) {
        currentPeriod = 3;
        periodDates = "16-22 число";
    } else {
        currentPeriod = 4;
        periodDates = `23-${daysInMonth} число`;
    }
    
    // Устанавливаем название месяца
    const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
                       "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
    document.getElementById('month-name').textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    // Устанавливаем текущий период
    document.getElementById('current-dates').textContent = periodDates;
    
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
    }
    
    // Добавляем анимацию при наведении на карточки
    document.querySelectorAll('.period-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            if (!card.classList.contains('active')) {
                card.style.transform = 'translateY(-5px)';
                card.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.1)';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            if (!card.classList.contains('active')) {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff';
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