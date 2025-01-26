// Логика выбора подъезда
const entranceBlocks = document.querySelectorAll(".entrance-block");
const chatTitle = document.getElementById("chat-title");
const chatMessages = document.getElementById("chat-messages");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");

let currentChat = "general"; // Текущий чат (general или подъезд)
let currentUser = { name: "Иван Иванов", entrance: 1 }; // Текущий пользователь

// Загрузка сообщений
function loadMessages(chat) {
  const messages = JSON.parse(localStorage.getItem(chat)) || [];
  chatMessages.innerHTML = messages.map(msg => `
    <div class="message" data-id="${msg.id}">
      <div class="user-info">
        <div class="user-avatar">${msg.user.entrance}</div>
        <div class="user-name">${msg.user.name}</div>
        <div class="user-entrance">(Подъезд ${msg.user.entrance})</div>
      </div>
      <div class="text">${msg.text}</div>
      ${msg.file ? `<a href="${msg.file}" download>Скачать файл</a>` : ""}
      <div class="time">${msg.time}</div>
      ${msg.edited ? `<div class="edited">Изменено: ${msg.edited}</div>` : ""}
      <div class="actions">
        <button onclick="editMessage('${msg.id}', '${chat}')">✏️</button>
        <button onclick="deleteMessage('${msg.id}', '${chat}')">❌</button>
      </div>
    </div>
  `).join("");
  chatMessages.scrollTop = chatMessages.scrollHeight; // Автопрокрутка
}

// Отправка сообщений
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = chatInput.value.trim();
  if (message) {
    const messages = JSON.parse(localStorage.getItem(currentChat)) || [];
    const newMessage = {
      id: Date.now().toString(),
      user: currentUser,
      text: message,
      time: new Date().toLocaleTimeString()
    };
    messages.push(newMessage);
    localStorage.setItem(currentChat, JSON.stringify(messages));
    chatInput.value = "";
    loadMessages(currentChat);
  }
});

// Редактирование сообщения
function editMessage(id, chat) {
  const messages = JSON.parse(localStorage.getItem(chat)) || [];
  const message = messages.find(msg => msg.id === id);
  const newText = prompt("Редактировать сообщение:", message.text);
  if (newText) {
    message.text = newText;
    message.edited = new Date().toLocaleTimeString();
    localStorage.setItem(chat, JSON.stringify(messages));
    loadMessages(chat);
  }
}

// Удаление сообщения
function deleteMessage(id, chat) {
  const messages = JSON.parse(localStorage.getItem(chat)) || [];
  const updatedMessages = messages.filter(msg => msg.id !== id);
  localStorage.setItem(chat, JSON.stringify(updatedMessages));
  loadMessages(chat);
}

// Переключение между общим чатом и чатом подъезда
entranceBlocks.forEach(block => {
  block.addEventListener("click", () => {
    const entrance = block.getAttribute("data-entrance");
    currentChat = `entrance-${entrance}`;
    currentUser.entrance = entrance; // Обновляем подъезд пользователя
    chatTitle.textContent = `Чат подъезда ${entrance}`;
    loadMessages(currentChat);
  });
});

// Загружаем общий чат при загрузке страницы
loadMessages(currentChat);

// Прикрепление файлов
const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.style.display = "none";
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      const messages = JSON.parse(localStorage.getItem(currentChat)) || [];
      messages.push({
        id: Date.now().toString(),
        user: currentUser,
        text: `Файл: ${file.name}`,
        file: reader.result,
        time: new Date().toLocaleTimeString(),
      });
      localStorage.setItem(currentChat, JSON.stringify(messages));
      loadMessages(currentChat);
    };
    reader.readAsDataURL(file);
  }
});
document.getElementById("file-button").addEventListener("click", () => fileInput.click());

// Календарь
const calendar = document.getElementById("calendar");
let currentDate = new Date();

function renderCalendar() {
  const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
  document.getElementById("current-month").textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  const calendarGrid = document.querySelector(".calendar-grid");
  calendarGrid.innerHTML = "";

  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  for (let i = 0; i < firstDay.getDay(); i++) {
    calendarGrid.appendChild(document.createElement("div"));
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    const day = document.createElement("div");
    day.textContent = i;
    if (i === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear()) {
      day.classList.add("today");
    }
    calendarGrid.appendChild(day);
  }
}

document.getElementById("prev-month").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

document.getElementById("next-month").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

renderCalendar();

// Модальное окно для добавления события
const modal = document.getElementById("event-modal");
const closeModal = document.querySelector(".close");
const calendarGrid = document.querySelector(".calendar-grid");

calendarGrid.addEventListener("click", (e) => {
  if (e.target.tagName === "DIV" && e.target.textContent) {
    modal.style.display = "block";
  }
});

closeModal.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

document.getElementById("event-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("event-title").value;
  const description = document.getElementById("event-description").value;
  if (title) {
    const event = { title, description };
    localStorage.setItem("events", JSON.stringify(event));
    modal.style.display = "none";
    alert("Событие добавлено!");
  }
});

// Голосования
const polls = document.getElementById("polls");

function createPoll(question, options) {
  const poll = document.createElement("div");
  poll.className = "poll";
  poll.innerHTML = `
    <h3>${question}</h3>
    ${options.map(option => `
      <div class="poll-option">
        <input type="radio" name="poll" value="${option}">
        <label>${option}</label>
      </div>
    `).join("")}
    <button onclick="submitPoll(this)">Голосовать</button>
  `;
  polls.appendChild(poll);
}

function submitPoll(button) {
  const poll = button.parentElement;
  const selectedOption = poll.querySelector("input:checked");
  if (selectedOption) {
    alert(`Вы проголосовали за: ${selectedOption.value}`);
  } else {
    alert("Выберите вариант!");
  }
}

createPoll("Как часто нужно убирать подъезд?", ["Раз в неделю", "Раз в две недели", "Раз в месяц"]);

// Тихие уведомления
function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Минималистичное окно добавления события
document.getElementById("event-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("event-title").value;
  const description = document.getElementById("event-description").value;
  if (title) {
    const event = { title, description };
    localStorage.setItem("events", JSON.stringify(event));
    modal.style.display = "none";
    showNotification("Событие добавлено!");
  }
});