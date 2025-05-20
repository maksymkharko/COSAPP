// НАСТРОЙКИ ПОДПИСКИ
const subscription = {
  названиеСервиса: "YouTube Premium (семейная)",
  логотип: "🎬",
  доКакогоЧислаОплачено: "2025-06-15", // формат: ГГГГ-ММ-ДД
  пользователи: [
    { имя: "Максим", телега: "@maks_kharko", сумма: 10 },
    { имя: "Катя", телега: "@katya_v", сумма: 10 },
    { имя: "Марина", телега: "@marina23", сумма: 10 },
    { имя: "Женя", телега: "@zhenyaX", сумма: 10 },
    { имя: "Али", телега: "@ali04", сумма: 10 }
  ]
};

// ФУНКЦИИ
function отобразитьПриложение() {
  document.getElementById("serviceName").textContent = subscription.названиеСервиса;
  document.getElementById("logo").textContent = subscription.логотип;

  const отсчет = document.getElementById("countdown");
  const дата = new Date(subscription.доКакогоЧислаОплачено);
  const сейчас = new Date();
  const разница = дата - сейчас;
  const осталосьДней = Math.max(Math.ceil(разница / (1000 * 60 * 60 * 24)), 0);

  отсчет.textContent = `Оплачено до ${дата.toLocaleDateString('ru-RU')} (осталось ${осталосьДней} дней)`;

  const список = document.getElementById("usersList");
  список.innerHTML = "";
  subscription.пользователи.forEach(п => {
    const li = document.createElement("li");
    li.innerHTML = `👤 <strong>${п.имя}</strong> — <a href="https://t.me/${п.телега.replace('@', '')}" target="_blank">${п.телега}</a> — 💰 ${п.сумма} zł`;
    список.appendChild(li);
  });
}

function goBack() {
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", отобразитьПриложение);