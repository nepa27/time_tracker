//  <script type="module">
//   import TimerItem from "../static/scriptTest.js"; */}

class Component {
  TIMEOUT = 1_000;

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

class InputBox {
  constructor(inputElement) {
    //   this.inputElement = inputElement;
    //   this.inputElement.addEventListener("input", this.onInputChange.bind(this));
  }
}

class Button extends Component {
  constructor({ id = "", title = "" }) {
    super();
    this.id = id;
    this.title = title;
    this.element = this.createElement(this.createElementTemplate());
    this.eventListeners = {};
  }

  createElementTemplate() {
    return `<button class="table-button">${this.title}</button>`;
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

  createEventListenersClick(event) {
    console.log(event);

    this.element.addEventListener("click", event);
  }

  update({ title = "" }) {
    this.title = title;
    this.element.textContent = title;
  }
}

class TimerItem extends Component {
  static collection = new Map();

  constructor({ title = "", time = "00:00:00" }) {
    super();
    this.title = title;
    this.time = time;
    this.date = this.formattedDate();
    // this.element = this.createElement(this.createContainerTemplate());
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

  createElementTemplate() {
    return `
        <div class="task-item" data-name-work="${this.title}">
            <p>Название дела: <span class="nameWork">${this.title}</span></p>
            <p>Время: <span class="time">${this.time}</span></p>
            <button class="table-button" onclick="location.href='#'">Изменить</button>
            <button class="table-button btn-delete">Удалить</button> 
        </div>
    `;
  }

  attachEventListeners() {
    if (this.element.classList.contains("date-item")) {
      this.element = this.element.querySelector(".task-item");
    }
    this.btnDelete = this.element.querySelector(".btn-delete");

    if (this.btnDelete) {
      this.btnDelete.addEventListener("click", (evt) => {
        // this.deleteItemInBD(idWork,evt)
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

  formattedDate() {
    const now = new Date();
    // const now = new Date(Date.now()* (Math.random()/5));
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    // const year = now.getFullYear();
    const year = new Date(Date.now() * (Math.random() / 10)).getFullYear();
    return `${day}.${month}.${year}`;
  }

  timeToSeconds(time) {
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
    const totalSeconds1 = this.timeToSeconds(time1);
    const totalSeconds2 = this.timeToSeconds(time2);
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
      super.renderIn(container);
      this.attachEventListeners();
      // this.element = this.createElement(this.createElementTemplate)
    }
  }

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

  deleteItemInBD(idWork, event) {
    event.stopPropagation();
    if (confirm("Вы уверены, что хотите удалить эту запись?")) {
      fetch(`/delete/${idWork}`, {
        method: "DELETE",
      }).then((response) => {
        if (response.ok) {
          location.reload();
        } else {
          alert("Ошибка при удалении записей");
        }
      });
    }
  }
}

class Timer extends Component {
  constructor({
    id = "",
    text = "00:00:00",
    seconds = 0,
    totalSeconds = 0,
  } = {}) {
    super();
    this.id = id;
    this.text = text;
    this.seconds = seconds;
    this.totalSeconds = totalSeconds;
    this.element = this.createElement(this.createElementTemplate());
  }

  createElementTemplate() {
    return `<div class="timer" id="${this.id}">${this.text}</div>`;
  }

  createTimer() {
    this.intervalId = setInterval(
      () => this.rerenderTimer(),
      Component.TIMEOUT //1_000
    );
  }

  rerenderTimer() {
    this.seconds++;
    this.updateText();
    this.element.innerHTML = this.text;
  }

  updateText() {
    const hrs = Math.floor(this.seconds / 3600);
    const mins = Math.floor((this.seconds % 3600) / 60);
    const secs = this.seconds % 60;
    this.text = `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    this.updateTotalTime();
  }

  updateTotalTime() {
    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    const hrs = Math.floor(this.totalSeconds / 3600);
    const mins = Math.floor((this.totalSeconds % 3600) / 60);
    const secs = this.totalSeconds % 60;
    this.element.textContent = `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  resetTimer() {
    this.seconds = 0;
    this.text = "00:00:00";
    this.element.innerHTML = this.text;
  }
  destroyTimer() {
    clearInterval(this.intervalId);
    this.resetTimer();
  }

  destroyTimerTotal() {
    super.destroyTimer();
    this.totalSeconds += this.seconds;
  }
}

//============================================================================

// document.addEventListener("DOMContentLoaded", () => {

// const totalTimeString = totalTimerElement.textContent;
// totalSeconds = timeStringToSeconds(totalTimeString);
// updateTotalTime();
// populateDatalist();
// });

//================================================================

const input = document.querySelector("#taskName");
// const workContainer = document.getElementById("work-container");
const timer = new Timer({ id: "timer" });
const totalTimer = new Timer({ id: "total_timer" });
const inputBox = document.querySelector(".task-input");
const totalTimeBox = document.querySelector(".total-time-container");
const startButton = new Button({ id: "startButton", title: "Пуск" });

startButton.renderIn(inputBox);
timer.renderIn(inputBox);
totalTimer.renderIn(totalTimeBox);
// totalTimer.updateTotalTime()

const workingTimer = () => {
  if (startButton.title === "Пуск") {
    startButton.update({ title: "Стоп" });

    timer.createTimer();

    totalTimer.createTimer();
  } else if (startButton.title === "Стоп") {
    const taskItem = new TimerItem({
      title: input.value,
      time: timer.text,
    });
    // const date = document.querySelector(".date");

    timer.destroyTimer();
    totalTimer.destroyTimerTotal();

    startButton.update({ title: "Пуск" });
    input.value = "";

    const container = document.querySelector(".task-list");
    taskItem.renderIn(container);

    taskItem.updateBD();
  }
};

startButton.addEventListener("click", workingTimer);

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
