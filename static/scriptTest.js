//  <script type="module">
//   import TimerItem from "../static/scriptTest.js"; */}

class Component {
  TIMEOUT = 1_000;

  constructor({ title = "" } = {}) {
    this.title = title;
    this.element = this.createElement(this.createElementTemplate());

    this.createEventListeners();
    // this.createTimer();
  }

  createEventListeners() {
    this.element.addEventListener("click", this.func); //!!!
  }

  //   createTimer(fn) {
  //     this.intervalId = setInterval(() => {
  //       fn;
  //     }, Component.TIMEOUT);
  //   }

  createElement(template) {
    const element = document.createElement("div");
    element.innerHTML = template;

    return element.firstElementChild;
  }

  rerenderElement(text) {
    this.element.innerHTML = text;
  }
  render(container = this.container) {
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

  update({ title }) {
    this.title = title;
  }
}

class InputBox {
  constructor(inputElement) {
    //   this.inputElement = inputElement;
    //   this.inputElement.addEventListener("input", this.onInputChange.bind(this));
  }
}

class Button extends Component {
  constructor({ buttonElement, seconds = 0 }) {
    super();
    this.seconds = seconds;
    this.element = this.createElement(this.createElementTemplate());
    //   this.buttonElement = buttonElement;
    //   this.buttonElement.addEventListener("click", this.onClick.bind(this));
  }

  createElement(template) {
    const element = document.createElement("div");
    element.innerHTML = template;

    return element.firstElementChild;
  }
  createElementTemplate() {
    return `<button class="table-button" onclick="${1}">${this.title}</button>`;
  }

  //   startTimer() {
  //     this.createTimer();
  //     this.timerField = setInterval(() => {
  //       this.seconds++;
  //       //   totalSeconds++;
  //       const hrs = Math.floor(this.seconds / 3600);
  //       const mins = Math.floor((this.seconds % 3600) / 60);
  //       const secs = this.seconds % 60;
  //       const timeString = `${hrs.toString().padStart(2, "0")}:${mins
  //         .toString()
  //         .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

  //       //   console.log(timeString);

  //       return timeString;
  //       // updateTotalTime();
  //     }, 0);
  //   }

  //   stopTimer(timeString) {
  //     // clearInterval(this.timerField);
  //     this.destroyTimer();
  //     // totalSeconds += this.seconds;
  //     this.seconds = 0;
  //     // timerElement.textContent = "00:00:00"; //???
  //     return timeString;
  //   }
}

class TimerItem extends Component {
  constructor({
    title = "",
    seconds = 0,
    time = 0,
    totalSeconds = 0,
    //   container = document.body,
  }) {
    super();
    this.title = title;
    this.time = time;
    this.element = this.createElement(this.createElementTemplate());
    this.seconds = seconds;
    //   this.container = container;
  }

  //   createElement(template) {
  //     const element = document.createElement("div");
  //     element.innerHTML = template;

  //     return element.firstElementChild;
  //   }

  createElementTemplate() {
    return `
            <div class="task-item">
                <p>Название дела: <span class="nameWork">${this.title}</span></p>
                <p>Время: <span class="time">${this.time}</span></p>
                <button class="table-button" onclick="location.href='#'">Изменить</button>
                <button class="table-button" onclick="${this.remove.bind(this)}">Удалить</button>
            </div>
        `;
  }

  formattedDate() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    return `${day}.${month}.${year}`;
  }

  update({ time = this.time, title = this.title } = {}) {
    this.title = title;
    this.time = time;
    // this.render()
    this.element = this.createElement(this.createElementTemplate());
  }

  destroy() {
    this.remove();
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
    // this.createTimer();
  }
  createElementTemplate() {
    return `<div class="timer" id="${this.id}">${this.text}</div>`;
  }

  createTimer() {
    this.intervalId = setInterval(() => {
      this.rerenderTimer();
    }, Component.TIMEOUT);
  }

  rerenderTimer() {
    this.seconds++;
    const hrs = Math.floor(this.seconds / 3600);
    const mins = Math.floor((this.seconds % 3600) / 60);
    const secs = this.seconds % 60;
    this.text = `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

    this.rerenderElement(this.text);
    //   this.totalSeconds
    // this.element.innerHTML = this.totalSeconds
  }

  destroyTimer() {
    super.destroyTimer();
    this.seconds = 0;
    this.element.innerHTML = "00:00:00";
  }
  destroyTimerTotal() {
    super.destroyTimer();
    this.totalSeconds += this.seconds;
  }
}

//============================================================================
// const timerElement = document.getElementById("timer");
// let seconds = 0;
// let totalSeconds = 0;

// function startTimer() {
//   timerField = setInterval(() => {
//     seconds++;
//     totalSeconds++;
//     const hrs = Math.floor(seconds / 3600);
//     const mins = Math.floor((seconds % 3600) / 60);
//     const secs = seconds % 60;
//     timerElement.textContent = `${hrs.toString().padStart(2, "0")}:${mins
//       .toString()
//       .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
//     // updateTotalTime();
//   }, 1000);
// }

// function stopTimer() {
//   clearInterval(timerField);
//   totalSeconds += seconds;
//   seconds = 0;
//   timerElement.textContent = "00:00:00";
// }

// document.addEventListener("DOMContentLoaded", () => {

// const totalTimeString = totalTimerElement.textContent;
// totalSeconds = timeStringToSeconds(totalTimeString);
// updateTotalTime();
// populateDatalist();
// });

const input = document.querySelector("#taskName");
const startButton = document.getElementById("startButton");

const timer = new Timer({ id: "timer" });
const totalTimer = new Timer({ id: "total_timer" });
const inputBox = document.querySelector(".task-input");
const totalTimeBox = document.querySelector(".total-time-container");

timer.render(inputBox);
totalTimer.render(totalTimeBox);

startButton.addEventListener("click", () => {
  if (startButton.textContent === "Пуск") {
    startButton.textContent = "Стоп";
    timer.createTimer();
    totalTimer.createTimer();
  } else {
    const taskItem = new TimerItem({
      title: input.value,
    });

    taskItem.update({ time: timer.text });
    timer.destroyTimer();
    totalTimer.destroyTimerTotal();

    startButton.textContent = "Пуск";
    input.value = "";
    // stopTimer();

    const container = document.querySelector(".date-item");

    taskItem.render(container);

    // const input = document.querySelector("#taskName");
    // const conteiner = document.querySelector(".date-item");
    // const itemTemplate = document.querySelector("#template__task-item");
    // const cloneTemplate = itemTemplate.content.cloneNode(true);
    // const item = cloneTemplate.querySelector(".task-item");
    // const nowDate = formattedDate();
    // const helloMessage = document.querySelector(".hello-message");

    // const name = item.querySelector(".nameWork");
    // name.textContent = input.value;
    // const date = document.querySelector(".strongDate");
    // date.textContent = nowDate;
    // const time = item.querySelector(".time");
    // time.textContent = timerElement.textContent;

    // const nameWorkAll = document.querySelectorAll('.nameWork');
    // let isExist = false;

    // nameWorkAll.forEach(elem => {
    //     const existingItem = elem.closest('.task-item');
    //     const existingDate = date.textContent;

    //     if (elem.textContent === input.value && existingDate === nowDate) {
    //         isExist = true;
    //         const time = existingItem.querySelector('.time');
    //         const timeString = time.textContent;
    //         const [hoursWork, minutesWork, secondsWork] = timeString.split(':').map(Number);
    //         const sec = (hoursWork * 3600) + (minutesWork * 60) + secondsWork;
    //         seconds += sec;
    //         const hrs = Math.floor(seconds / 3600);
    //         const mins = Math.floor((seconds % 3600) / 60);
    //         const secs = seconds % 60;
    //         time.textContent = `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    //     }
    // });
    // const objInf = {
    //     name_of_work: `${input.value}`,
    //     time: `${time.textContent}`,
    //     date: `${date.textContent}`
    // };

    // date.textContent = `Дата: ${date.textContent}`
    // if (!isExist) {
    //     const currentItems = document.querySelectorAll('.task-item');
    //     const perPage = 5;
    //     conteiner.prepend(item);
    //     if (currentItems.length === perPage){
    //         conteiner.lastElementChild.remove();
    //     }
    //     if (currentItems.length === 0){
    //         helloMessage.textContent = ''
    //     }
    // }

    // fetch(`/`, {
    //     method: "POST",
    //     headers: {
    //         "Content-Type": "application/json;charset=utf-8",
    //     },
    //     body: JSON.stringify(objInf),
    // });

    // startButton.textContent = "Пуск";
    // input.value = '';
    // stopTimer();
  }
});
