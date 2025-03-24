document.getElementById('passwordForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const birthdate = document.getElementById('birthdate').value;
    const code = document.getElementById('code').value;
    
    // Проверка длины даты и кода
    if (birthdate.length !== 8 || code.length !== 4) {
        alert('Пожалуйста, введите корректную дату рождения (ГГГГММДД) и код верификации (4 цифры).');
        return;
    }
    
    // Проверка, что введены только цифры
    if (!/^\d+$/.test(birthdate) || !/^\d+$/.test(code)) {
        alert('Пожалуйста, используйте только цифры.');
        return;
    }
    
    // Генерация пароля
    let password = '';
    for (let i = 0; i < code.length; i++) {
        const index = parseInt(code[i]) - 1; // Получаем индекс (позицию) в дате
        if (index >= 0 && index < birthdate.length) {
            password += birthdate[index]; // Добавляем символ из даты
        }
    }
    
    // Вывод результата
    document.getElementById('passwordText').innerText = password;
    document.getElementById('result').style.display = 'flex';
    
    // Сохранение данных в localStorage
    localStorage.setItem('birthdate', birthdate);
    localStorage.setItem('code', code);
});

// Копирование пароля
document.getElementById('copyButton').addEventListener('click', function() {
    const passwordText = document.getElementById('passwordText').innerText;
    navigator.clipboard.writeText(passwordText).then(() => {
        alert('Пароль скопирован в буфер обмена!');
    });
});

// Загрузка сохраненных данных при загрузке страницы
window.addEventListener('load', function() {
    const savedBirthdate = localStorage.getItem('birthdate');
    const savedCode = localStorage.getItem('code');
    
    if (savedBirthdate) {
        document.getElementById('birthdate').value = savedBirthdate;
    }
    if (savedCode) {
        document.getElementById('code').value = savedCode;
    }
});