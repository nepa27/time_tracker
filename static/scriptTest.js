//  <script type="module">
//   import TimerItem from "../static/scriptTest.js"; */}

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

  // createEventListenersClick(event) {
  //   // console.log(event);

  //   this.element.addEventListener("click", event);
  // }

  update({ title = "" }) {
    this.title = title;
    this.element.textContent = title;
  }
}

class TimerItem extends Component {
  static collection = new Map();

  constructor({ title = "", time = "00:00:00", date = null }) {
    super();
    this.title = title;
    this.time = time;
    this.date = date || this.formattedDate();
    // this.element = super.createContainerTemplate(this.createElement(this.createTemplate()));
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

  attachEventListeners() {
    if (this.element.classList.contains("date-item")) {
      this.element = this.element.querySelector(".task-item");
    }
    this.btnDelete = this.element.querySelector(".btn-delete");

    if (this.btnDelete) {
      this.btnDelete.addEventListener("click", (evt) => {
        this.deleteItemInBD();
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

  // removeTimeFromTotalTimer() {
  //     const totalTimer = document.querySelector("#totalTimer"); // replace 'totalTimer' with the id of your total timer element
  //     if (totalTimer) {
  //         const totalSecondsToRemove = TimerItem.timeToSeconds(this.time);
  //         totalTimer.totalSeconds -= totalSecondsToRemove;
  //         totalTimer.rerenderTotalTime();
  //     }
  // }

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

  deleteItemInBD() {
    function convertDateFormat(dateString) {
      // Split the input date string by the dot separator
      const [day, month, year] = dateString.split(".");

      // Return the date in the format YYYY-MM-DD
      return `${year}-${month}-${day}`;
    }
    const date = convertDateFormat(this.date);

    // event.stopPropagation();
    if (confirm("Вы уверены, что хотите удалить эту запись?")) {
      fetch(`/delete/${date}/${this.title}`, {
        // 2024-12-05
        method: "DELETE",
      }).then((response) => {
        if (response.ok) {
          // location.reload();
        } else {
          alert("Ошибка при удалении записей");
        }
      });
    }
  }
}

class TotalTimer extends Component {
  // static totalSeconds =

  constructor({
    id = "",
    text = "00:00:00",
    // seconds = 0,
    totalSeconds = 0,
  } = {}) {
    super();
    this.id = id;
    this.text = text;
    this.totalSeconds = totalSeconds;

    this.element = super.createElement(this.createElementTemplate());

    // this.startUpdateInterval();
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
    this.totalSeconds++;
    this.element.textContent = TotalTimer.updateSecondsToString(
      this.totalSeconds
    );
  }

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

    this.element = this.createElement(this.createElementTemplate());
    // this.startUpdateInterval();
  }

  // createTimer() {
  //   this.intervalId = setInterval(
  //     () => this.rerenderTimer(),
  //     Component.TIMEOUT //1_000
  //   );
  // }

  rerenderTimer() {
    this.seconds++;
    // this.updateText();
    this.text = TotalTimer.updateSecondsToString(this.seconds);

    this.element.innerHTML = this.text;
  }

  // updateText() {
  //   const hrs = Math.floor(this.seconds / 3600);
  //   const mins = Math.floor((this.seconds % 3600) / 60);
  //   const secs = this.seconds % 60;
  //   this.text = `${hrs.toString().padStart(2, "0")}:${mins
  //     .toString()
  //     .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  // }

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

const input = document.querySelector("#taskName");
// const workContainer = document.getElementById("work-container");
const timer = new Timer({ id: "timer" });
let totalTimer = null;
const inputBox = document.querySelector(".task-input");
const totalTimeBox = document.querySelector(".total-time-container");
const startButton = new Button({ id: "startButton", title: "Пуск" });

//===============================================================

function setError(element, msg) {

  element.style.border = "1px solid rgb(218, 0, 0)";
  element.nextElementSibling.classList.add("error");
  element.nextElementSibling.textContent = msg;
}

function setSuccess(element) {
  element.nextElementSibling.textContent = "";
  input.style = "";
}

function inputCheck(e) {
  if (input.value === "") {
    setError(input, "Поле обязательно!");
    e.preventDefault();
  } else {
    if (input.value.length < 3) {
      e.preventDefault();
      setError(input, "Название дела слишком короткое - минимум 3 символа");
    } else {
      setSuccess(input);
    }
  }
}

input.addEventListener("input", (e) => {
  inputCheck(e);
  
});

//================================================================

document.addEventListener("DOMContentLoaded", async function () {
  let data = null;
  try {
    const response = await fetch("/api/data/");
    
    data = await response.json();
  } catch (err) {
    // перехватит любую ошибку в блоке try: и в fetch, и в response.json
    alert(err);
  }

  const { data: dataItems = {}, total_time: totalTime = "00:00:00" } =
    data || {};

  totalTimer = new TotalTimer({
    id: "total_timer",
    text: totalTime,
    totalSeconds: TimerItem.timeToSeconds(totalTime),
  });
  totalTimer.renderIn(totalTimeBox);

  // if (!dataItems) return;

  for (const [date, namesTimes] of Object.entries(dataItems).reverse()) {
    let time = "";
    let title = "";

    Object.entries(namesTimes).forEach((item) => {
      [title, time] = item;

      const taskItem = new TimerItem({
        title: title,
        time: time,
        date: date,
      });

      taskItem.renderIn(document.querySelector("#work-container"));
    });
  }

  TimerItem.collection = new Map(Object.entries(dataItems));
});

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

    timer.createTimer();
    totalTimer.createTimer();
  } else if (startButton.title === "Стоп") {
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

startButton.addEventListener("click", workingTimer);

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
