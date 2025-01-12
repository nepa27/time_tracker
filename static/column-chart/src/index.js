import fetchJson from "../../fetch-json.js";
import Tooltip from "../../tooltip/src/index.js";

// const BACKEND_URL = "http://127.0.0.1:5000/statistics/";
const BACKEND_URL = "http://127.0.0.1:5001/statistics/";

// let res = await fetch('/api/statistics')
// console.log(await res.json())

export default class ColumnChart {
  element;
  subElements = {};
  chartHeight = 50; //150

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

  // dashboard__chart_tasks

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
      // const value = Object.values(this.data);

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
    let hightColumn;

    if (value !== 0 && Math.floor(value * scale) === 0) {
      return (hightColumn = 3);
    } else {
      return (hightColumn = Math.floor(value * scale));
    }
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

    if (this.data && Object.values(this.data).length) {
      this.subElementsTask.header.textContent = commonTime; //this.getHeaderValue();

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


      this.subElementsTask.body.innerHTML = result; // this.getColumnBody(valueTask);
      this.elementTask.classList.remove("column-chart_loading");

      const tasksNode = document.querySelector("[data-element='oneTaskChart']");
      tasksNode.textContent = "";
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

const from = new Date();
from.setMonth(from.getMonth() - 1);
const to = new Date();

const tasksChart = new ColumnChart({
  url: "/api/statistics",
  range: {
    from,
    to,
  },
  label: "дел",
  // link: "#",
});

const tooltip = new Tooltip();
tooltip.initialize();

const contentNode = document.querySelector("#content");
const tasksNode = document.querySelector("[data-element='tasksChart']");

tasksNode.append(tasksChart.element);

// document.addEventListener('DOMContentLoaded', function() {
//     fetch('/api/statistics')
//         .then(response => response.json())
//         .then(data => {
//             if (this.data) {
//                 console.log(data);
//             } else {
//                 console.log('Нет данных для отображения');
//             }
//         })
//         .catch(error => console.error('Ошибка:', error));
// });

// export default class ColumnChart {
//   element;
//   subElements = {};
//   chartHeight = 50;

//   constructor({
//     label = '',
//     link = '',
//     formatHeading = data => data,
//     url = '',
//     range = {
//       from: new Date(),
//       to: new Date(),
//     }
//   } = {}) {
//     this.url = new URL(url, BACKEND_URL);
//     this.range = range;
//     this.label = label;
//     this.link = link;
//     this.formatHeading = formatHeading;

//     this.render();
//   }

//   render() {
//     const { from, to } = this.range;
//     const element = document.createElement('div');

//     element.innerHTML = this.template;

//     this.element = element.firstElementChild;
//     this.subElements = this.getSubElements(this.element);

//     this.loadData(from, to);
//   }

//   getHeaderValue(data) {
//     return this.formatHeading(Object.values(data).reduce((accum, item) => (accum + item), 0));
//   }

//   async loadData(from, to) {
//     this.element.classList.add('column-chart_loading');
//     this.subElements.header.textContent = '';
//     this.subElements.body.innerHTML = '';

//     this.url.searchParams.set('from', from.toISOString());
//     this.url.searchParams.set('to', to.toISOString());

//     const data = await fetchJson(this.url);

//     this.setNewRange(from, to);

//     if (data && Object.values(data).length) {
//       this.subElements.header.textContent = this.getHeaderValue(data);
//       this.subElements.body.innerHTML = this.getColumnBody(data);

//       this.element.classList.remove('column-chart_loading');
//     }
//   }

//   setNewRange(from, to) {
//     this.range.from = from;
//     this.range.to = to;
//   }

//   getColumnBody(data) {
//     const maxValue = Math.max(...Object.values(data));

//     return Object.entries(data).map(([key, value]) => {
//       const scale = this.chartHeight / maxValue;
//       const percent = (value / maxValue * 100).toFixed(0);
//       const tooltip = `<span>
//         <small>${key.toLocaleString('default', {dateStyle: 'medium'})}</small>
//         <br>
//         <strong>${percent}%</strong>
//       </span>`;

//       return `<div style="--value: ${Math.floor(value * scale)}" data-tooltip="${tooltip}"></div>`;
//     }).join('');
//   }

//   getLink() {
//     return this.link ? `<a class="column-chart__link" href="${this.link}">View all</a>` : '';
//   }

//   get template() {
//     return `
//       <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
//         <div class="column-chart__title">
//           Total ${this.label}
//           ${this.getLink()}
//         </div>
//         <div class="column-chart__container">
//           <div data-element="header" class="column-chart__header"></div>
//           <div data-element="body" class="column-chart__chart"></div>
//         </div>
//       </div>
//     `;
//   }

//   getSubElements(element) {
//     const elements = element.querySelectorAll('[data-element]');

//     return [...elements].reduce((accum, subElement) => {
//       accum[subElement.dataset.element] = subElement;

//       return accum;
//     }, {});
//   }

//   async update(from, to) {
//     return await this.loadData(from, to);
//   }

//   destroy() {
//     this.element.remove();
//   }
// }
