import fetchJson from "../../fetch-json.js";
import Tooltip from "../../tooltip/src/index.js";

const BACKEND_URL = "https://yaknep-timetracker.ru:8443/statistics/";

export default class ColumnChart {
  element;
  subElements = {};
  chartHeight = 120; //50

  constructor({
    label = "",
    link = "",
    formatHeading = (data) => data,
    url = "/api/statistics",
    range = {
      from: new Date(),
      to: new Date(),
    },
  } = {}) {
    this.url = new URL(url, BACKEND_URL);
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;

    this.render();
  }

  createElement(template) {
    const element = document.createElement("div");
    element.innerHTML = template;

    return element.firstElementChild;
  }

  createElementTemplate() {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${
        this.chartHeight
      }">
        <div  data-element="chartTitle" class="column-chart__title">
          Всего времени в работе 
          ${this.getLink()}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header"></div>
          <div data-element="body" class="column-chart__chart"></div>
        </div>
      </div>
    `;
  }

  render() {
    const { from, to } = this.range;

    this.element = this.createElement(this.createElementTemplate());

    this.subElements = this.getSubElements(this.element);

    this.createEventListener();

    this.loadData(from, to);
  }

  async loadData(from, to) {
    this.element.classList.add("column-chart_loading");
    this.subElements.header.textContent = "";
    this.subElements.body.innerHTML = "";

    this.url.searchParams.set("from", from.toISOString().split("T")[0]);
    this.url.searchParams.set("to", to.toISOString().split("T")[0]);

    const data = await fetchJson(this.url);
    this.data = data.data;

    this.setNewRange(from, to);

    if (this.data && Object.values(this.data).length) {

      this.totalTasks = Object.entries(this.data).reduce((acc, cur) => {
        const [key, value] = cur;

        const val = value.reduce((acc, curr) => {
          return (acc += this.timeStringToSeconds(Object.values(curr)[0]));
        }, 0);

        acc[key] = val;
        return acc;
      }, {});

      this.subElements.header.textContent = this.getHeaderValue();
      this.subElements.body.innerHTML = this.getColumnBody();

      this.element.classList.remove("column-chart_loading");
    }
  }

  timeStringToSeconds(timeString) {
    const [hours, minutes, seconds] = timeString.split(":").map(Number);

    return hours * 3600 + minutes * 60 + seconds;
  }

  SecondsToTimeString(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  setNewRange(from, to) {
    this.range.from = from;
    this.range.to = to;
  }

  getHeaderValue() {
    const values = Object.values(this.totalTasks);
    return this.SecondsToTimeString(values.reduce((acc, curr) => acc + curr));
  }

  getColumnBody() {
    const maxValue = Math.max(...Object.values(this.totalTasks));
    return Object.entries(this.totalTasks)
      .map(([key, value]) => {
        const hightColumn = this.getHightColumn(value, maxValue);

        const tooltip = this.createTooltip(key, value);

        return `<div style="--value: ${hightColumn}" data-task="${key}"  data-commonTime="${value}" data-tooltip="${tooltip}"></div>`;
      })
      .join("");
  }

  getHightColumn(value, maxValue) {
    const scale = this.chartHeight / maxValue;
    return Math.floor(value * scale);
    // if (value !== 0 && Math.floor(value * scale) === 0) {
    //   return 1; //(hightColumn = 1);
    // } else {
      // return Math.floor(value * scale);
    // }
  }

  createTooltip(key, value) {
    return `<span>
              <small>${key}</small>
              <br>
              <strong>${this.SecondsToTimeString(value)}</strong>
            </span>`;
  }

  getLink() {
    return this.link
      ? `<a class="column-chart__link" href="${this.link}">View all</a>`
      : "";
  }

  getSubElements(element) {
    const elements = element.querySelectorAll("[data-element]");

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  handlePointerDown = (e) => {
    const target = e.target;

    if (!target.hasAttribute("data-task")) return;

    const nameTask = target.dataset.task;
    const commonTime = this.SecondsToTimeString(target.dataset.commontime);

    const valueTask = this.data[target.dataset.task];

    this.elementTask = this.createElement(this.createElementTemplate());
    this.subElementsTask = this.getSubElements(this.elementTask);

    this.elementTask.classList.add("column-chart_loading");

    // создание одного дела при клике на столбец статистики
    if (this.data && Object.values(this.data).length) {
      this.subElementsTask.header.textContent = commonTime;

      this.subElementsTask.chartTitle.textContent = nameTask;

      const maxValue = valueTask.reduce((acc, cur) => {
        cur = this.timeStringToSeconds(Object.values(cur)[0]);
        return (acc += cur);
      }, 0);

      const result = valueTask
        .map((item) => {
          const [key, value] = Object.entries(item)[0];
          const seconds = this.timeStringToSeconds(value);

          const hightColumn = this.getHightColumn(seconds, maxValue);
          const tooltip = this.createTooltip(key, seconds);

          return `<div style="--value: ${hightColumn}" data-task="${key}" data-tooltip="${tooltip}"></div>`;
        })
        .join("");

      this.subElementsTask.body.innerHTML = result;
      this.elementTask.classList.remove("column-chart_loading");
      this.elementTask.dataset.element = "oneTaskChart";

      document.querySelector("[data-element='oneTaskChart']")?.remove();
      const tasksNode = document.querySelector("[data-element='columnChart']");

      tasksNode.appendChild(this.elementTask);
    }
  };

  createEventListener() {
    this.subElements.body.addEventListener(
      "pointerdown",
      this.handlePointerDown
    );
  }
  removeEventListener() {
    this.subElements.body.removeEventListener(
      "pointerdown",
      this.handlePointerDown
    );
  }

  async update(from, to) {
    return await this.loadData(from, to);
  }

  destroy() {
    this.element.remove();
    this.removeEventListener();
  }
}
