document.addEventListener('DOMContentLoaded', () => {
    const linksContainer = document.getElementById('links-container');
    const addLinkBtn = document.getElementById('add-link-btn');
    const editBtn = document.getElementById('edit-btn');
    const linkModal = document.getElementById('link-modal');
    const cancelBtn = document.getElementById('cancel-btn');
    const saveLinkBtn = document.getElementById('save-link-btn');
    const linkNameInput = document.getElementById('link-name');
    const linkUrlInput = document.getElementById('link-url');
    const linkDescriptionInput = document.getElementById('link-description');

    let isEditMode = false;
    let isDragging = false;
    let dragItem = null;

    // Загрузка ссылок из localStorage
    function loadLinks() {
        const links = JSON.parse(localStorage.getItem('app2Links')) || [];
        linksContainer.innerHTML = '';
        links.forEach((link, index) => {
            const linkCard = document.createElement('div');
            linkCard.className = 'link-card';
            linkCard.innerHTML = `
                <i class="fas fa-grip-lines grip-icon"></i>
                <i class="fas fa-link link-icon"></i>
                <div class="link-content" data-url="${link.url}">
                    <h3>${link.name}</h3>
                    <p>${link.description}</p>
                </div>
                <button class="delete-btn" onclick="deleteLink(${index})">&times;</button>
            `;
            linksContainer.appendChild(linkCard);

            // Открытие ссылки в новом окне
            const linkContent = linkCard.querySelector('.link-content');
            linkContent.addEventListener('click', (e) => {
                if (!isEditMode) {
                    window.open(link.url, '_blank');
                }
            });

            // Добавляем обработчики для перетаскивания только в режиме редактирования
            if (isEditMode) {
                linkCard.draggable = true;
                linkCard.addEventListener('dragstart', () => {
                    dragItem = linkCard;
                    setTimeout(() => linkCard.classList.add('dragging'), 0);
                });

                linkCard.addEventListener('dragend', () => {
                    dragItem = null;
                    linkCard.classList.remove('dragging');
                    saveLinksOrder();
                });
            } else {
                linkCard.draggable = false;
            }
        });

        // Добавляем обработчики для перетаскивания
        linksContainer.addEventListener('dragover', (e) => {
            if (!isEditMode) return;
            e.preventDefault();
            if (!dragItem) return;

            const afterElement = getDragAfterElement(linksContainer, e.clientY);
            if (afterElement) {
                linksContainer.insertBefore(dragItem, afterElement);
            } else {
                linksContainer.appendChild(dragItem);
            }
        });
    }

    // Получение элемента, после которого нужно вставить перетаскиваемый элемент
    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.link-card:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // Сохранение порядка ссылок
    function saveLinksOrder() {
        const links = [];
        document.querySelectorAll('.link-card').forEach((card) => {
            const name = card.querySelector('h3').textContent;
            const url = card.querySelector('.link-content').getAttribute('data-url');
            const description = card.querySelector('p').textContent;
            links.push({ name, url, description });
        });
        localStorage.setItem('app2Links', JSON.stringify(links));
    }

    // Удаление ссылки
    window.deleteLink = function(index) {
        const links = JSON.parse(localStorage.getItem('app2Links')) || [];
        links.splice(index, 1);
        localStorage.setItem('app2Links', JSON.stringify(links));
        loadLinks();
    };

    // Переключение режима редактирования
    editBtn.addEventListener('click', () => {
        isEditMode = !isEditMode;
        linksContainer.classList.toggle('edit-mode', isEditMode);
        editBtn.innerHTML = isEditMode ? '<i class="fas fa-check"></i> Готово' : '<i class="fas fa-edit"></i> Редактировать';
        loadLinks(); // Перезагружаем ссылки для обновления draggable состояния
    });

    // Открытие модального окна
    addLinkBtn.addEventListener('click', () => {
        linkNameInput.value = '';
        linkUrlInput.value = '';
        linkDescriptionInput.value = '';
        linkModal.classList.remove('hidden');
    });

    // Закрытие модального окна
    cancelBtn.addEventListener('click', () => {
        linkModal.classList.add('hidden');
    });

    // Сохранение ссылки
    saveLinkBtn.addEventListener('click', () => {
        const name = linkNameInput.value.trim();
        let url = linkUrlInput.value.trim();
        const description = linkDescriptionInput.value.trim();

        // Добавляем протокол, если он отсутствует
        if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
            url = `https://${url}`;
        }

        if (name && url) {
            const links = JSON.parse(localStorage.getItem('app2Links')) || [];
            links.push({ name, url, description });
            localStorage.setItem('app2Links', JSON.stringify(links));
            loadLinks();
            linkModal.classList.add('hidden');
        }
    });

    // Загрузка ссылок при загрузке страницы
    loadLinks();
});