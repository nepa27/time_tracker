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
  static itemsCollection = [];

  constructor({ title = "", time = "00:00:00" }) {
    super();
    this.title = title;
    this.time = time;
    this.element = this.createElement(this.createElementTemplate());
  }

  createElementTemplate() {
    return `
          <div class="task-item">
            <p>Название дела: <span data-name-work="${this.title}" class="nameWork">${this.title}</span></p>
            <p>Время: <span class="time">${this.time}</span></p>
            <button class="table-button" onclick="location.href='#'">Изменить</button>
            <button class="table-button btn-delete">Удалить</button>
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
    const existingItemIndex = TimerItem.itemsCollection.findIndex(
      (item) => item.title === this.title
    );

    if (existingItemIndex !== -1) {
      // If the item already exists, update the time
      const existingItem = TimerItem.itemsCollection[existingItemIndex];
      const newTime = this.addTimeStrings(existingItem.time, this.time);
      
      // Update the time in the collection and instance
      existingItem.time = newTime;
      this.time = newTime;

      // Update the displayed time in the element
      this.element.querySelector(".time").textContent = this.time;
    } else {
      // If it does not exist, add it to the collection
      TimerItem.itemsCollection.push({ title: this.title, time: this.time });
      super.renderIn(container); // Render the new element in the container
      return; // Exit early since we are adding a new item
    }

    // If the item was updated, find the existing element and update it
    const lastElement = container.querySelector(`[data-name-work="${this.title}"]`);
    if (lastElement) {
      lastElement.closest('.task-item').replaceWith(this.element);
    }
}

  update({ title = this.title, time = this.time } = {}) {
    this.title = title;
    this.time = time;

    this.element.querySelector(".nameWork").textContent = this.title;
    this.element.querySelector(".time").textContent = this.time;

    // Update delete button functionality
    this.btnDelete = this.element.querySelector(".btn-delete");
    this.btnDelete.addEventListener("click", () => this.destroy());
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
    });

    taskItem.update({ time: timer.text });

    timer.destroyTimer();
    totalTimer.destroyTimerTotal();

    startButton.update({ title: "Пуск" });
    input.value = "";

    const container = document.querySelector(".date-item");
    taskItem.renderIn(container);


    // const objInf = {
    //     name_of_work: `${input.value}`,
    //     time: `${timer.textContent}`,
    //     date: `${date.textContent}`
    // };

    // fetch(`/`, {
    //     method: "POST",
    //     headers: {
    //         "Content-Type": "application/json;charset=utf-8",
    //     },
    //     body: JSON.stringify(objInf),
    // });

  }
};

startButton.addEventListener("click", workingTimer);
