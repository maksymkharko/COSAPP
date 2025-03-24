document.getElementById('searchQuery').addEventListener('input', function () {
    const query = this.value.trim();
    const encodedQuery = encodeURIComponent(query);
    const link = `https://g.zeos.in/?q=${encodedQuery}`;

    const linkContainer = document.getElementById('linkContainer');
    if (query) {
        linkContainer.innerHTML = `
            <a href="${link}" target="_blank" class="button primary">Перейти</a>
            <button class="button secondary" onclick="copyToClipboard('${link}')">Копировать</button>
            <button class="button secondary" onclick="shareLink('${link}')">Поделиться</button>
        `;
    } else {
        linkContainer.innerHTML = '';
    }
});

// Функция для копирования ссылки в буфер обмена
function copyToClipboard(link) {
    navigator.clipboard.writeText(link)
        .then(() => alert('Ссылка скопирована!'))
        .catch(() => alert('Не удалось скопировать ссылку.'));
}

// Функция для поделиться ссылкой
function shareLink(link) {
    if (navigator.share) {
        navigator.share({
            title: 'Посмотрите эту ссылку',
            url: link
        }).catch(() => alert('Не удалось поделиться ссылкой.'));
    } else {
        alert('Ваш браузер не поддерживает функцию "Поделиться".');
    }
}