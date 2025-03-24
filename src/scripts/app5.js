document.addEventListener("DOMContentLoaded", () => {
  const calendars = JSON.parse(localStorage.getItem("app5")) || [];
  const calendarList = document.getElementById("calendar-list");
  const addCalendarBtn = document.getElementById("add-calendar-btn");
  const createModal = document.getElementById("create-modal");
  const saveCalendarBtn = document.getElementById("save-calendar-btn");
  const closeModalBtn = document.getElementById("close-modal-btn");
  const viewModal = document.getElementById("view-modal");
  const closeViewModalBtn = document.getElementById("close-view-modal-btn");
  const deleteCalendarBtn = document.getElementById("delete-calendar-btn");
  const confirmDeleteModal = document.getElementById("confirm-delete-modal");
  const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
  const cancelDeleteBtn = document.getElementById("cancel-delete-btn");

  let currentCalendarId = null;

  // Функция для форматирования даты в "Месяц Год"
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.toLocaleString("ru", { month: "long" });
    const year = date.getFullYear();
    return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
  };

  // Открыть модальное окно для создания календаря
  addCalendarBtn.addEventListener("click", () => {
    createModal.style.display = "flex";
  });

  // Закрыть модальное окно
  closeModalBtn.addEventListener("click", () => {
    createModal.style.display = "none";
  });

  // Сохранить календарь
  saveCalendarBtn.addEventListener("click", () => {
    const name = document.getElementById("calendar-name").value;
    const date = document.getElementById("calendar-date").value;

    if (name && date) {
      const newCalendar = {
        id: Date.now(),
        name,
        date,
        days: []
      };
      calendars.push(newCalendar);
      localStorage.setItem("app5", JSON.stringify(calendars));
      renderCalendars();
      createModal.style.display = "none";
    }
  });

  // Открыть календарь для просмотра
  const openCalendar = (id) => {
    currentCalendarId = id;
    const calendar = calendars.find((c) => c.id === id);
    document.getElementById("view-calendar-name").textContent = calendar.name;
    renderCalendarDays(calendar);
    viewModal.style.display = "flex";
  };

  // Открыть модальное окно подтверждения удаления
  deleteCalendarBtn.addEventListener("click", () => {
    confirmDeleteModal.style.display = "flex";
  });

  // Подтвердить удаление календаря
  confirmDeleteBtn.addEventListener("click", () => {
    const updatedCalendars = calendars.filter((c) => c.id !== currentCalendarId);
    localStorage.setItem("app5", JSON.stringify(updatedCalendars));
    confirmDeleteModal.style.display = "none";
    viewModal.style.display = "none";
    renderCalendars();
  });

  // Отмена удаления
  cancelDeleteBtn.addEventListener("click", () => {
    confirmDeleteModal.style.display = "none";
  });

  // Закрыть модальное окно просмотра
  closeViewModalBtn.addEventListener("click", () => {
    viewModal.style.display = "none";
  });

  // Отобразить список календарей
  const renderCalendars = () => {
    calendarList.innerHTML = calendars
      .map((calendar) => {
        const daysInMonth = new Date(
          new Date(calendar.date).getFullYear(),
          new Date(calendar.date).getMonth() + 1,
          0
        ).getDate();
        const markedDays = calendar.days.length;
        return `
          <div class="calendar-item" onclick="openCalendar(${calendar.id})">
            <i class="fas fa-calendar-alt calendar-icon"></i>
            <div>
              <h3>${calendar.name}</h3>
              <p>${formatDate(calendar.date)}</p>
              <div class="calendar-widget">
                <span>${markedDays} из ${daysInMonth} дней</span>
              </div>
            </div>
          </div>
        `;
      })
      .join("");
  };

  // Отобразить дни календаря
  const renderCalendarDays = (calendar) => {
    const daysContainer = document.getElementById("calendar-days");
    daysContainer.innerHTML = "";

    const year = new Date(calendar.date).getFullYear();
    const month = new Date(calendar.date).getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      const day = document.createElement("div");
      day.classList.add("day");
      day.textContent = i;
      if (calendar.days.includes(i)) {
        day.classList.add("selected");
      }
      day.addEventListener("click", () => {
        day.classList.toggle("selected");
        if (calendar.days.includes(i)) {
          calendar.days = calendar.days.filter((d) => d !== i);
        } else {
          calendar.days.push(i);
        }
        localStorage.setItem("app5", JSON.stringify(calendars));
        renderCalendars(); // Обновляем виджет
      });
      daysContainer.appendChild(day);
    }
  };

  renderCalendars();

  // Глобальная функция для открытия календаря
  window.openCalendar = openCalendar;
});