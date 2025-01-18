//  <script type="module">
//   import TimerItem from "../static/scriptTest.js"; */}
import NotificationMessage from "./notification/src/index.js";
import ConfirmMessage from "./confirm/src/index.js";
import fetchJson from "./fetch-json.js";

const BACKEND_URL = "http://127.0.0.1:5001/";

class Component {
  static TIMEOUT = 1_000;

  constructor({ title = "" } = {}) {
    this.title = title;
    this.element = this.createElement(this.createElementTemplate());

    // this.createEventListeners();
    // this.createTimer();
  }

  createEventListeners(func) {
    this.element.addEventListener("click", func); //!!!
  }

  createElement(template) {
    const element = document.createElement("div");
    element.innerHTML = template;

    return element.firstElementChild;
  }

  renderIn(container = this.container) {
    container.appendChild(this.element);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.destroyTimer();
    this.destroyEventListeners();
  }

  destroyEventListeners() {
    this.element.removeEventListener("click", this.func); //!!!
  }

  destroyTimer() {
    clearInterval(this.intervalId);
  }

  //   update({ title }) {
  //     this.title = title;
  //   }
}

class Input extends Component {
  constructor({ taskNames } = {}) {
    super();
    //   this.inputElement = inputElement;
    //   this.inputElement.addEventListener("input", this.onInputChange.bind(this));
    this.taskNames = taskNames;
    this.element = this.createElement(this.createElementWrapperTemplate());
    this.input = this.element.querySelector(".input");
    this.createEventListener();
  }

  createElementTemplate() {
    return `
      <input class ="input" type="text" id="taskName" placeholder="Название дела" list="taskNames"required
          minlength="3"/>
        `;
  }

  createElementWrapperTemplate() {
    return `
          <div class="task-input__inner">
                ${this.createElementTemplate()}
                <div class="block-error"></div>
                ${this.createDatalist()}
          </div>;
          `;
  }

  createDatalist() {
    const optionsList = this.taskNames
      .map((task) => {
        return `<option value="${task}"></option>`;
      })
      .join("");

    return `
            <datalist id="taskNames">
            ${optionsList}
            </datalist>
            `;
  }

  handleInputValue = (e) => {
    this.inputCheck(e);
  };

  createEventListener() {
    this.input.addEventListener("input", this.handleInputValue);
  }

  removeEventListener() {
    this.input.removeEventListener("input", this.handleInputValue);
  }

  setError(element, msg) {
    element.style.border = "1px solid rgb(218, 0, 0)";
    element.nextElementSibling.classList.add("error");
    element.nextElementSibling.textContent = msg;
  }

  setSuccess(element) {
    element.nextElementSibling.textContent = "";
    element.style.border = "";
  }

  inputCheck(e) {
    if (this.input.value === "") {
      this.setError(this.input, "Поле обязательно!");
      e.preventDefault();
    } else {
      if (this.input.value.length < 3) {
        e.preventDefault();
        this.setError(
          this.input,
          "Название дела слишком короткое - минимум 3 символа"
        );
      } else {
        this.setSuccess(this.input);
      }
    }
  }

  debounce = (fn, debounceTime) => {
    let isCalled = false;
    let idTimer;

    return function () {
      if (isCalled) {
        clearTimeout(idTimer);
        isCalled = false;
      }

      if (!isCalled) {
        idTimer = setTimeout(() => {
          return fn.apply(this, arguments);
        }, debounceTime);

        isCalled = true;
      }
    };
  };

  renderIn(container = this.container) {
    container.prepend(this.element);
  }
}

class Button extends Component {
  static isClicked = false;

  constructor({ id = "", title = "" }) {
    super();
    this.id = id;
    this.title = title;
    this.element = this.createElement(this.createElementTemplate());
    this.eventListeners = {};
  }

  createElementTemplate() {
    return `<button id="${this.id}" class="table-button">${this.title}</button>`;
  }

  addEventListener(eventType, callback) {
    if (!this.eventListeners[eventType]) {
      this.eventListeners[eventType] = [];
    }

    this.eventListeners[eventType].push(callback);
    this.element.addEventListener(eventType, callback);
  }

  removeEventListener(eventType, callback) {
    const callbacks = this.eventListeners[eventType];

    if (callbacks) {
      delete this.eventListeners[eventType];
      this.element.removeEventListener(eventType, callback);
    }
  }

  update({ title = "" }) {
    this.title = title;
    this.element.textContent = title;
  }
}

class TimerItem extends Component {
  static collection = new Map();
  static isLoading = false; // Флаг загрузки для всех экземпляров
  static lastRowEnd = 0; // Хранит последний загруженный конец диапазона

  constructor({ title = "", time = "00:00:00", date = null }) {
    super();
    this.title = title;
    this.time = time;
    this.date = date || this.formattedDate();

    this.stepFetchData = 10;
    this.rowStart = 0; // Начальный индекс
    this.rowEnd = this.rowStart + this.stepFetchData; // Конечный индекс
    this.container = document.getElementById("work-container");

    this.createEventListeners();
    this.element = this.createElement(this.createContainerTemplate());
  }

  createElementTemplate() {
    return `
        <div class="task-item" data-name-work="${this.title}">
            <p>Название дела: <span class="nameWork">${this.title}</span></p>
            <p>Время: <span class="time">${this.time}</span></p>
            <button class="table-button" onclick="location.href='/edit/${this.date}/${this.title}'">Изменить</button> 
            <button class="table-button btn-delete">Удалить</button> 
        </div>
    `;
  }
  createContainerTemplate() {
    return `
     <div class="date-item" data-date="${this.date}">
        <strong class="strongDate">Дата: 
            <span class="date">${this.date}</span>
        </strong>
        ${this.createElementTemplate()}
     </div>
    `;
  }

  createUrl() {
    const url = new URL("/api/data", BACKEND_URL);
    // const url = new URL("/api/data/");
    // url.searchParams.append("_order", `${this.order ?? "asc"}`);
    url.searchParams.append("_start", `${this.rowStart}`);
    url.searchParams.append("_end", `${this.rowEnd}`);

    return url.toString();
  }

  attachEventListeners() {
    if (this.element.classList.contains("date-item")) {
      this.element = this.element.querySelector(".task-item");
    }
    this.btnDelete = this.element.querySelector(".btn-delete");

    if (this.btnDelete) {
      this.btnDelete.addEventListener("pointerdown", async (evt) => {
        const isDeleted = await this.deleteItemInBD();

        if (!isDeleted) return;

        delete TimerItem.collection.get(this.date)[this.title];

        if (Object.keys(TimerItem.collection.get(this.date)).length === 0) {
          TimerItem.collection.delete(this.date);
        }

        if (evt.target.closest(".date-item").childElementCount === 2) {
          evt.target.closest(".date-item").remove();
          TimerItem.collection.delete(this.date);
        }

        this.destroy();
      });
    }
  }

  createEventListeners() {
    window.addEventListener("scroll", this.handleProductsContainerScroll);
  }

  handleProductsContainerScroll = async (e) => {
    const windowBottom =
      document.documentElement.getBoundingClientRect().bottom;
    const windowHeight = document.documentElement.clientHeight;

    // Проверяем, нужно ли загружать новые данные
    if (windowBottom < windowHeight * 1.8 && !TimerItem.isLoading) {
      TimerItem.isLoading = true; // Устанавливаем флаг загрузки
      this.renderLoadingLine();

      // Обновляем начальный и конечный индексы
      this.rowStart = TimerItem.lastRowEnd;
      this.rowEnd = this.rowStart + 10;

      const data = await fetchJson(this.createUrl());
      const { data: dataItems = {} } = data || {};

      const items = Object.values(dataItems).reduce((acc, cur) => {
        return (acc += Object.values(cur).length);
      }, 0);

      if (items < this.stepFetchData) return;
      // if (!Object.keys(dataItems).length) return;

      const dates = Object.entries(dataItems);
      const sortedDates = dates.sort(
        (a, b) => parseDate(b[0]) - parseDate(a[0])
      );

      for (const [date, namesTimes] of sortedDates) {
        for (const [title, time] of Object.entries(namesTimes)) {
          const taskItem = new TimerItem({
            title: title,
            time: time,
            date: date,
          });

          taskItem.renderIn(this.container);
        }
      }

      TimerItem.lastRowEnd = this.rowEnd; // Обновляем последний загруженный конец диапазона
      TimerItem.isLoading = false; // Сбрасываем флаг загрузки
    }
  };

  renderLoadingLine() {
    this.container.insertAdjacentHTML(
      "beforeend",
      `
        <div data-elem="loading" class="loading-line sortable-table__loading-line"></div>
      `
    );
  }

  formattedDate() {
    const now = new Date();
    // const now = new Date(Date.now()* (Math.random()/5));
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    // const year = new Date(Date.now() * (Math.random() / 10)).getFullYear();
    return `${day}.${month}.${year}`;
  }

  static timeToSeconds(time) {
    const parts = time.split(":");
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    const seconds = parseInt(parts[2]) || 0;
    return hours * 3600 + minutes * 60 + seconds;
  }

  secondsToTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Format to HH:MM:SS
    return [
      String(hours).padStart(2, "0"),
      String(minutes).padStart(2, "0"),
      String(seconds).padStart(2, "0"),
    ].join(":");
  }

  addTimeStrings(time1, time2) {
    const totalSeconds1 = TimerItem.timeToSeconds(time1);
    const totalSeconds2 = TimerItem.timeToSeconds(time2);
    const totalSeconds = totalSeconds1 + totalSeconds2;

    return this.secondsToTime(totalSeconds);
  }

  renderIn(container) {
    const existingItem = TimerItem.collection.has(this.date)
      ? TimerItem.collection.get(this.date)[this.title]
      : undefined;

    const isExistingDate = TimerItem.collection.has(this.date);

    if (isExistingDate && existingItem) {
      //+
      const newTime = this.addTimeStrings(existingItem, this.time);

      this.time = newTime;
      this.updateCollection();

      // Update the displayed time in the element
      const dataContainer = document.querySelector(
        `[data-date="${this.date}"]`
      );
      const taskItem = dataContainer.querySelector(
        `[data-name-work="${this.title}"]`
      );

      taskItem.querySelector(".time").textContent = this.time;
      this.attachEventListeners();
    }
    if (isExistingDate && !existingItem) {
      this.updateCollection();

      const containerDate = document.querySelector(
        `[data-date="${this.date}"]`
      );

      this.element = this.createElement(this.createElementTemplate());
      containerDate.append(this.element);
      this.attachEventListeners();
    }

    if (!isExistingDate) {
      this.updateCollection();

      this.element = this.createElement(this.createContainerTemplate());
      // super.renderIn(container);
      if (Button.isClicked) {
        container.prepend(this.element);
      } else {
        container.append(this.element);
      }
      // container.prepend(this.element);

      this.attachEventListeners();
      // this.element = this.createElement(this.createElementTemplate)
    }
  }
  // renderIn(container) {
  //   const existingItem = TimerItem.collection.has(this.date)
  //     ? TimerItem.collection.get(this.date)[this.title]
  //     : undefined;

  //   const isExistingDate = TimerItem.collection.has(this.date);

  //   if (isExistingDate && existingItem) {
  //     const newTime = this.addTimeStrings(existingItem, this.time);
  //     this.time = newTime;
  //     this.updateCollection();

  //     // Обновляем отображаемое время в элементе
  //     const dataContainer = document.querySelector(
  //       `[data-date="${this.date}"]`
  //     );
  //     const taskItem = dataContainer.querySelector(
  //       `[data-name-work="${this.title}"]`
  //     );

  //     taskItem.querySelector(".time").textContent = this.time;
  //     this.attachEventListeners();
  //   } else {

  //     if (isExistingDate) {
  //       const containerDate = document.querySelector(
  //         `[data-date="${this.date}"]`
  //       );

  //       this.element = this.createElement(this.createElementTemplate());
  //       containerDate.append(this.element);
  //       this.attachEventListeners();
  //     } else {
  //       this.element = this.createElement(this.createContainerTemplate());
  //       container.append(this.element);
  //       this.attachEventListeners();
  //     }
  //     console.log(TimerItem.collection);

  //     this.updateCollection();
  //   }
  // }

  update({ title = this.title, time = this.time } = {}) {
    this.title = title;
    this.time = time;

    this.element.querySelector(".nameWork").textContent = this.title;
    this.element.querySelector(".time").textContent = this.time;

    this.attachEventListeners();
  }

  updateCollection() {
    TimerItem.collection.set(this.date, {
      ...TimerItem.collection.get(this.date),
      [this.title]: this.time,
    });
  }

  updateBD() {
    const objInf = {
      name_of_work: `${this.title}`,
      time: `${this.time}`,
      date: `${this.date}`,
    };

    fetch(`/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify(objInf),
    });
  }

  async deleteItemInBD() {
    function convertDateFormat(dateString) {
      const [day, month, year] = dateString.split(".");
      return `${year}-${month}-${day}`;
    }
    const date = convertDateFormat(this.date);

    const result = await ConfirmMessage.show(
      "Вы уверены, что хотите удалить эту запись?"
    );
    if (result) {
      const response = await fetch(`/delete/${date}/${this.title}`, {
        method: "DELETE",
      });

      if (response.ok) {
        return true; // Успешное удаление
      } else {
        const notification = new NotificationMessage(
          "Ошибка при удалении записей",
          {
            duration: 3000,
            type: "error",
          }
        );
        notification.show();
        return false; // Ошибка при удалении
      }
    }
    return false; // Пользователь отменил удаление
  }
}

class TotalTimer extends Component {
  static totalSeconds;

  constructor({
    id = "",
    text = "00:00:00",
    // seconds = 0,
    totalSeconds = 0,
  } = {}) {
    super();
    this.id = id;
    this.text = text;
    TotalTimer.totalSeconds = totalSeconds;

    this.element = super.createElement(this.createElementTemplate());

    // this.startUpdateInterval();
  }

  createElementTemplate() {
    return `<div id="${this.id}" class="timer" >${this.text}</div>`;
  }

  createTimer() {
    this.intervalId = setInterval(
      () => this.rerenderTimer(),
      Component.TIMEOUT //1_000
    );
  }

  rerenderTimer() {
    TotalTimer.totalSeconds++;
    this.element.textContent = TotalTimer.updateSecondsToString(
      TotalTimer.totalSeconds
    );
  }

  resetTotalTimer = () => {
    TotalTimer.totalSeconds = 0;
    this.text = "00:00:00";
    // console.log( this.element);

    this.element.innerHTML = this.text;
  };

  static updateSecondsToString(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  destroyTotalTimer() {
    super.destroyTimer();
    // this.totalSeconds += seconds;
    // this.updateTotalTime()
  }
  // Rest of your code
}

class Timer extends TotalTimer {
  constructor({ id = "", text = "00:00:00", seconds = 0 } = {}) {
    super();
    this.id = id;
    this.text = text;
    this.seconds = seconds;

    // this.totalSeconds = totalSeconds
    // console.log(this.totalSeconds);

    this.resetTotalTimer();

    this.element = this.createElement(this.createElementTemplate());
    // this.startUpdateInterval();
  }

  createTimer() {
    //  !!!!!!!!!!!
    const timeStart = this.getCurrentTime();
    // console.log('timeStart =', timeStart);

    const timeStartTimestamp = this.getTimestampWithTime(timeStart);

    const timeEnd = "23:59:59";
    const timeEndTimestamp = this.getTimestampWithTime(timeEnd);

    this.differenceTime = timeEndTimestamp - timeStartTimestamp;
    // console.log(this.differenceTime);
    // console.log('timeStartTimestamp',timeStartTimestamp);
    // console.log('timeEndTimestamp',timeEndTimestamp);

    this.intervalId = setInterval(
      () => this.rerenderTimer(),
      Component.TIMEOUT //1_000
    );
  }

  getCurrentTime() {
    const now = new Date(); // Получаем текущее время
    const hours = String(now.getHours()).padStart(2, "0"); // Получаем часы и добавляем ведущий ноль
    const minutes = String(now.getMinutes()).padStart(2, "0"); // Получаем минуты и добавляем ведущий ноль
    const seconds = String(now.getSeconds()).padStart(2, "0"); // Получаем секунды и добавляем ведущий ноль

    // return `23:58:50`; // Форматируем строку
    return `${hours}:${minutes}:${seconds}`; // Форматируем строку
  }

  getTimestampWithTime(timeString) {
    // Получаем текущую дату
    const now = new Date();

    // Разбиваем строку времени на часы, минуты и секунды
    const [hours, minutes, seconds] = timeString.split(":").map(Number);

    // Устанавливаем часы, минуты и секунды в текущую дату
    now.setHours(hours, minutes, seconds, 0); // Устанавливаем часы, минуты, секунды и миллисекунды

    // Получаем timestamp в секундах
    const timestamp = Math.floor(now.getTime() / 1000);
    return timestamp; // Возвращаем timestamp
  }

  rerenderTimer() {
    this.seconds++;
    // this.updateText();
    if (this.differenceTime === this.seconds) {
      // document.querySelector("[data-element='btn-start-stop']").click();
      const input = document.querySelector("#taskName");
      const taskName = input.value;

      const elem = document.querySelector(".table-button");
      // elem.click();
      elem.dispatchEvent(new Event("pointerdown"));

      // super.resetTotalTimer();
      TotalTimer.totalSeconds = 0;
      const textTotalTimer = "00:00:00";
      const totalTimer = document.getElementById("total_timer");
      totalTimer.innerHTML = textTotalTimer;

      this.resetTimer();

      input.value = taskName;

      // elem.click();
      elem.dispatchEvent(new Event("pointerdown"));

      console.log("tut");
    }

    this.text = TotalTimer.updateSecondsToString(this.seconds);

    this.element.innerHTML = this.text;
  }

  resetTimer() {
    this.seconds = 0;
    this.text = "00:00:00";
    this.element.innerHTML = this.text;
  }
  destroyTimer() {
    clearInterval(this.intervalId);
    this.resetTimer();
    // super.destroyTotalTimer(this.seconds)
  }
}

class ReloadPage {}

//================================================================
// const totalTimeBox = document.querySelector(".total-time-container");

// const input = document.querySelector("#taskName");
// let input = new Input();
let input;

// const workContainer = document.getElementById("work-container");
const timer = new Timer({ id: "timer" });
let totalTimer = null;
const inputBox = document.querySelector(".task-input");
// input.renderIn(inputBox);

const totalTimeBox = document.querySelector(".total-time-container");
const startButton = new Button({ id: "startButton", title: "Пуск" });

//===============================================================

// function setError(element, msg) {
//   element.style.border = "1px solid rgb(218, 0, 0)";
//   element.nextElementSibling.classList.add("error");
//   element.nextElementSibling.textContent = msg;
// }

// function setSuccess(element) {
//   element.nextElementSibling.textContent = "";
//   element.style.border = ""; // Сброс стиля для элемента
// }

// function inputCheck(e) {

//   if (this.value === "") {
//     setError(this, "Поле обязательно!");
//     e.preventDefault();
//   } else {
//     if (this.value.length < 3) {
//       e.preventDefault();
//       setError(this, "Название дела слишком короткое - минимум 3 символа");
//     } else {
//       setSuccess(this);
//     }
//   }
// }

// input.addEventListener("input", function(e) {

//   inputCheck.call(this, e);
// });
//
//================================================================

function parseDate(dateString) {
  const [day, month, year] = dateString.split(".").map(Number);
  return new Date(year, month - 1, day); // Месяцы в JavaScript начинаются с 0
}

// document.addEventListener("DOMContentLoaded", async function () {
//   let data = null;
//   try {
//     // const response = await fetch("/api/data/");
//     // data = await response.json();

//     const response2 = await fetch("/api/data/?_start=0&_end=10");
//     // console.log(response2);
//     data = await response2.json();
//   } catch (err) {
//     // перехватит любую ошибку в блоке try: и в fetch, и в response.json
//     const notification = new NotificationMessage(`${err}`, {
//       duration: 3000,
//       type: "error",
//     });

//     notification.show();
//   }

//   const { data: dataItems = {}, total_time: totalTime = "00:00:00" } =
//     data || {};

//   totalTimer = new TotalTimer({
//     id: "total_timer",
//     text: totalTime,
//     totalSeconds: TimerItem.timeToSeconds(totalTime),
//   });
//   totalTimer.renderIn(totalTimeBox);

//   // if (!dataItems) return;
//   const dates = Object.entries(dataItems);
//   const sortedDates = dates.sort((a, b) => parseDate(a[0]) - parseDate(b[0]));
//   const container = document.querySelector("#work-container");

//   for (const [date, namesTimes] of sortedDates) {
//     let time = "";
//     let title = "";

//     Object.entries(namesTimes).forEach((item) => {
//       [title, time] = item;

//       const taskItem = new TimerItem({
//         title: title,
//         time: time,
//         date: date,
//       });

//       taskItem.renderIn(container);
//     });
//   }

//   // TimerItem.collection = new Map(Object.entries(dataItems));
// });

// Инициализация данных при загрузке страницы
document.addEventListener("DOMContentLoaded", async function () {
  const timerItem = new TimerItem({}); // Создаем экземпляр TimerItem
  await timerItem.loadInitialData(); // Загружаем начальные данные
});

// Метод для загрузки начальных данных
TimerItem.prototype.loadInitialData = async function () {
  let data = null;
  try {
    const response = await fetch("/api/data/?_start=0&_end=10");
    data = await response.json();

    document.createComment;

    const {
      total_time: totalTime = "00:00:00",
      data: dataItems = {},
      task_names: taskNames,
    } = data || {};

    input = new Input({ taskNames });
    input.renderIn(inputBox);

    // Создаем экземпляр TotalTimer только один раз
    totalTimer = new TotalTimer({
      id: "total_timer",
      text: totalTime,
      totalSeconds: TimerItem.timeToSeconds(totalTime),
    });

    totalTimer.renderIn(totalTimeBox); // Отображаем TotalTimer

    // Обработка полученных данных
    const dates = Object.entries(dataItems);
    const container = document.querySelector("#work-container");

    const sortedDates = dates.sort((a, b) => parseDate(b[0]) - parseDate(a[0]));
    // console.log(sortedDates.reverse());

    for (const [date, namesTimes] of sortedDates) {
      for (const [title, time] of Object.entries(namesTimes)) {
        const taskItem = new TimerItem({
          title: title,
          time: time,
          date: date,
        });

        taskItem.renderIn(container);
      }
    }

    TimerItem.lastRowEnd = 10; // Устанавливаем последний загруженный индекс
  } catch (err) {
    const notification = new NotificationMessage(`${err}`, {
      duration: 3000,
      type: "error",
    });

    notification.show();
  }
};

startButton.renderIn(inputBox);

timer.renderIn(inputBox);

// totalTimer.renderIn(totalTimeBox);
// totalTimer.updateTotalTime()

const workingTimer = (e) => {
  if (input.value === "" || input.value.length < 3) {
    inputCheck(e);
    return;
  }

  if (startButton.title === "Пуск") {
    startButton.update({ title: "Стоп" });

    Button.isClicked = false;

    timer.createTimer();

    totalTimer.createTimer();
  } else if (startButton.title === "Стоп") {
    Button.isClicked = true;

    const taskItem = new TimerItem({
      title: input.value,
      time: timer.text,
    });
    // const date = document.querySelector(".date");

    timer.destroyTimer();
    totalTimer.destroyTotalTimer();

    startButton.update({ title: "Пуск" });
    input.value = "";

    const container = document.querySelector(".task-list");
    taskItem.renderIn(container);

    taskItem.updateBD();
  }
};

startButton.addEventListener("pointerdown", workingTimer);

//===============================================================

// function setError(element, msg) {
//   element.classList.add("error");
//   element.placeholder = msg
//   // element.nextElementSibling.classList.add("error");
//   // element.nextElementSibling.textContent = msg;
//   // element.parentElement.querySelector('.error').classList.add("error")
//   // element.parentElement.querySelector('.error').textContent = msg
// }

// function setSuccess(element) {
//   // element.nextElementSibling.textContent = ""
//   element.nextElementSibling.textContent = "";
// }

// input.addEventListener("blur", (e) => {

//     if (input.value === "") {
//       setError(this, "Поле обязательно!");
//       e.preventDefault();
//     } else {
//       // setSuccess(input)
//       if (input.value.length < 3) {
//         e.preventDefault();
//         setError(this, "Пароль слишком короткий - минимум 3 символа");
//       } else {
//         setSuccess(input);
//       }
//     }
// });

//================================================================

// let obj = {
//     '01.12.2024': {
//         'дело1': "01:02:10",
//         'homework': "00:13:16",
//         'nameWork3': "00:02:18",
//     },
//     '02.12.2024': {
//         'дело1': "00:02:16",
//         'homework': "00:22:16",
//         'дело2': "00:02:16",
//     },

// }
