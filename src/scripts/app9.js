document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const subscriptionsList = document.querySelector('.subscriptions-list');
    const addSubscriptionBtn = document.querySelector('.btn-add');
    const addSubscriptionModal = document.getElementById('addSubscriptionModal');
    const archiveModal = document.getElementById('archiveModal');
    const archiveBtn = document.querySelector('.btn-archive');
    const closeModalBtns = document.querySelectorAll('.btn-close');
    const saveSubscriptionBtn = document.querySelector('.btn-save');
    const deleteAllArchiveBtn = document.querySelector('.btn-delete-all');
    const archiveList = document.querySelector('.archive-list');
    
    // App Data
    let subscriptions = JSON.parse(localStorage.getItem('ClownadesSubsApp')) || [];
    let archivedSubscriptions = JSON.parse(localStorage.getItem('ClownadesSubsAppArchive')) || [];
    
    // Initialize App
    renderSubscriptions();
    
    // Open Add Subscription Modal
    addSubscriptionBtn.addEventListener('click', function() {
        addSubscriptionModal.classList.add('active');
        document.getElementById('subscriptionDate').valueAsDate = new Date();
    });
    
    // Open Archive Modal
    archiveBtn.addEventListener('click', function() {
        renderArchive();
        archiveModal.classList.add('active');
    });
    
    // Close Modals
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            addSubscriptionModal.classList.remove('active');
            archiveModal.classList.remove('active');
        });
    });
    
    // Close Modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === addSubscriptionModal) {
            addSubscriptionModal.classList.remove('active');
        }
        if (event.target === archiveModal) {
            archiveModal.classList.remove('active');
        }
    });
    
    // Save New Subscription
    saveSubscriptionBtn.addEventListener('click', function() {
        const name = document.getElementById('subscriptionName').value.trim();
        const amount = document.getElementById('subscriptionAmount').value.trim();
        const frequency = document.getElementById('subscriptionFrequency').value;
        const card = document.getElementById('subscriptionCard').value.trim();
        const link = document.getElementById('subscriptionLink').value.trim();
        const date = document.getElementById('subscriptionDate').value;
        
        // Validation
        if (!name || !amount || !date) {
            if (!name) document.getElementById('subscriptionName').classList.add('error');
            if (!amount) document.getElementById('subscriptionAmount').classList.add('error');
            if (!date) document.getElementById('subscriptionDate').classList.add('error');
            
            setTimeout(() => {
                document.getElementById('subscriptionName').classList.remove('error');
                document.getElementById('subscriptionAmount').classList.remove('error');
                document.getElementById('subscriptionDate').classList.remove('error');
            }, 500);
            
            return;
        }
        
        // Create new subscription
        const newSubscription = {
            id: Date.now(),
            name,
            amount: parseFloat(amount),
            frequency,
            card,
            link,
            nextPaymentDate: date,
            createdAt: new Date().toISOString()
        };
        
        subscriptions.push(newSubscription);
        saveSubscriptions();
        renderSubscriptions();
        addSubscriptionModal.classList.remove('active');
        
        // Clear form
        document.getElementById('subscriptionName').value = '';
        document.getElementById('subscriptionAmount').value = '';
        document.getElementById('subscriptionCard').value = '';
        document.getElementById('subscriptionLink').value = '';
        
        showNotification('Подписка добавлена');
    });
    
    // Delete All Archived Subscriptions
    deleteAllArchiveBtn.addEventListener('click', function() {
        if (archivedSubscriptions.length === 0) return;
        
        if (confirm('Вы уверены, что хотите удалить все подписки из архива?')) {
            archivedSubscriptions = [];
            saveArchivedSubscriptions();
            renderArchive();
            showNotification('Архив очищен');
        }
    });
    
    // Calculate Monthly Total
    function calculateMonthlyTotal() {
        let total = 0;
        subscriptions.forEach(sub => {
            switch(sub.frequency) {
                case 'daily':
                    total += sub.amount * 30;
                    break;
                case 'weekly':
                    total += sub.amount * 4;
                    break;
                case 'monthly':
                    total += sub.amount;
                    break;
                case 'yearly':
                    total += sub.amount / 12;
                    break;
            }
        });
        return total.toFixed(2);
    }
    
    // Render Subscriptions List
    function renderSubscriptions() {
        subscriptionsList.innerHTML = '';
        
        // Add monthly total at the top
        const monthlyTotal = calculateMonthlyTotal();
        const totalElement = document.createElement('div');
        totalElement.className = 'monthly-total';
        totalElement.innerHTML = `
            <div class="total-amount">
                <span class="total-label">Всего в месяц:</span>
                <span class="total-value">${monthlyTotal} zł</span>
            </div>
        `;
        subscriptionsList.appendChild(totalElement);
        
        if (subscriptions.length === 0) {
            subscriptionsList.innerHTML += '<p style="text-align: center; color: var(--text-secondary);">Нет активных подписок</p>';
            return;
        }
        
        // Sort by next payment date
        subscriptions.sort((a, b) => new Date(a.nextPaymentDate) - new Date(b.nextPaymentDate));
        
        subscriptions.forEach(sub => {
            const daysLeft = getDaysLeft(sub.nextPaymentDate);
            
            const subscriptionItem = document.createElement('div');
            subscriptionItem.className = 'subscription-item';
            subscriptionItem.innerHTML = `
                <div class="subscription-header">
                    <div class="subscription-name">${sub.name}</div>
                    <button class="btn btn-delete" data-id="${sub.id}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="subscription-details">
                    <div class="subscription-date">Осталось ${daysLeft} дней</div>
                    <div class="subscription-amount">${sub.amount} zł</div>
                </div>
            `;
            
            subscriptionsList.appendChild(subscriptionItem);
            
            // Delete subscription handler
            subscriptionItem.querySelector('.btn-delete').addEventListener('click', function(e) {
                e.stopPropagation();
                moveToArchive(sub.id);
            });
            
            // Edit subscription handler
            subscriptionItem.addEventListener('click', function() {
                editSubscription(sub.id);
            });
        });
    }
    
    // Render Archive List
    function renderArchive() {
        archiveList.innerHTML = '';
        
        if (archivedSubscriptions.length === 0) {
            archiveList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Архив пуст</p>';
            return;
        }
        
        archivedSubscriptions.forEach(sub => {
            const archiveItem = document.createElement('div');
            archiveItem.className = 'archive-item';
            archiveItem.innerHTML = `
                <div>${sub.name} - ${sub.amount} zł</div>
                <button class="btn btn-restore" data-id="${sub.id}">
                    <i class="fas fa-undo"></i>
                </button>
            `;
            
            archiveList.appendChild(archiveItem);
            
            // Restore subscription handler
            archiveItem.querySelector('.btn-restore').addEventListener('click', function(e) {
                e.stopPropagation();
                restoreFromArchive(sub.id);
            });
        });
    }
    
    // Move Subscription to Archive
    function moveToArchive(id) {
        const index = subscriptions.findIndex(sub => sub.id === id);
        if (index === -1) return;
        
        const [sub] = subscriptions.splice(index, 1);
        archivedSubscriptions.push(sub);
        
        saveSubscriptions();
        saveArchivedSubscriptions();
        renderSubscriptions();
        showNotification('Подписка перемещена в архив');
    }
    
    // Restore Subscription from Archive
    function restoreFromArchive(id) {
        const index = archivedSubscriptions.findIndex(sub => sub.id === id);
        if (index === -1) return;
        
        const [sub] = archivedSubscriptions.splice(index, 1);
        subscriptions.push(sub);
        
        saveSubscriptions();
        saveArchivedSubscriptions();
        renderArchive();
        renderSubscriptions();
        showNotification('Подписка восстановлена');
    }
    
    // Edit Subscription
    function editSubscription(id) {
        const sub = subscriptions.find(sub => sub.id === id);
        if (!sub) return;
        
        document.getElementById('subscriptionName').value = sub.name;
        document.getElementById('subscriptionAmount').value = sub.amount;
        document.getElementById('subscriptionFrequency').value = sub.frequency;
        document.getElementById('subscriptionCard').value = sub.card;
        document.getElementById('subscriptionLink').value = sub.link;
        document.getElementById('subscriptionDate').value = sub.nextPaymentDate;
        
        addSubscriptionModal.classList.add('active');
        
        // Update save handler for editing
        saveSubscriptionBtn.onclick = function() {
            const name = document.getElementById('subscriptionName').value.trim();
            const amount = document.getElementById('subscriptionAmount').value.trim();
            const frequency = document.getElementById('subscriptionFrequency').value;
            const card = document.getElementById('subscriptionCard').value.trim();
            const link = document.getElementById('subscriptionLink').value.trim();
            const date = document.getElementById('subscriptionDate').value;
            
            // Validation
            if (!name || !amount || !date) {
                if (!name) document.getElementById('subscriptionName').classList.add('error');
                if (!amount) document.getElementById('subscriptionAmount').classList.add('error');
                if (!date) document.getElementById('subscriptionDate').classList.add('error');
                
                setTimeout(() => {
                    document.getElementById('subscriptionName').classList.remove('error');
                    document.getElementById('subscriptionAmount').classList.remove('error');
                    document.getElementById('subscriptionDate').classList.remove('error');
                }, 500);
                
                return;
            }
            
            // Update subscription
            sub.name = name;
            sub.amount = parseFloat(amount);
            sub.frequency = frequency;
            sub.card = card;
            sub.link = link;
            sub.nextPaymentDate = date;
            
            saveSubscriptions();
            renderSubscriptions();
            addSubscriptionModal.classList.remove('active');
            
            // Restore default save handler
            saveSubscriptionBtn.onclick = arguments.callee;
            
            showNotification('Подписка обновлена');
        };
    }
    
    // Save Subscriptions to localStorage
    function saveSubscriptions() {
        localStorage.setItem('ClownadesSubsApp', JSON.stringify(subscriptions));
    }
    
    // Save Archived Subscriptions to localStorage
    function saveArchivedSubscriptions() {
        localStorage.setItem('ClownadesSubsAppArchive', JSON.stringify(archivedSubscriptions));
    }
    
    // Calculate Days Left
    function getDaysLeft(dateString) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const paymentDate = new Date(dateString);
        paymentDate.setHours(0, 0, 0, 0);
        
        const diffTime = paymentDate - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    // Show Notification
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
});
