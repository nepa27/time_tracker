import RangePicker from "./range-picker/src/index.js";
import ColumnChart from "./column-chart/src/index.js";
import Tooltip from "./tooltip/src/index.js";
import fetchJson from "./fetch-json.js";

const BACKEND_URL = "http://127.0.0.1:5001/statistics/";

export default class PageStatistic {
  subElements = {};

  constructor() {
    this.element = this.createElement(this.createElementTemplate());
    this.selectSubElements();

    this.createComponents();
    this.createEventListener();
  }

  createElement(template) {
    const element = document.createElement("div");
    element.innerHTML = template;
    return element.firstElementChild;
  }

  createElementTemplate() {
    return `
        <div class="container">
                <div class="content__top-panel">
                    <h2 class="page-title">Статистика дел</h2>
                    <div data-element="rangePicker"></div>
                </div>
                <div data-element="columnChart" class="dashboard__charts">
                </div>
            </div>
        `;
  }

  createComponents() {
    const from = new Date();
    from.setMonth(from.getMonth() - 1);
    const to = new Date();

    this.components = {
      rangePicker: new RangePicker({ from, to }),
      columnChart: new ColumnChart({
        url: "/api/statistics",
        range: {
          from,
          to,
        },
        label: "дел",
        // link: "#",
      }),
    };
  }

  async render() {
    console.log(this.subElements);
    // debugger
    for (const [name, component] of Object.entries(this.components)) {
      this.subElements[name].append(component.element);
    }
    return this.element;
  }

  async updateComponentData(from, to) {
    try {
      const url = "/api/statistics";
      this.url = new URL(url, BACKEND_URL);
      this.url.searchParams.set("from", from.toISOString().split("T")[0]);
      this.url.searchParams.set("to", to.toISOString().split("T")[0]);

      const data = await fetchJson(this.url);
      console.log(data);

      this.components.columnChart.update(from, to)
      
    //   const data = await this.fetchData(from, to);
    } catch (ex) {
      throw new Error(ex);
    }
  }

  async fetchData(from, to) {
    const url = this.components.sortableTable.url;
    url.searchParams.set("_start", 1);
    url.searchParams.set("_end", 20);
    url.searchParams.set("from", from);
    url.searchParams.set("to", to);
    const response = await fetchJson(url);
    return response;
  }

  //   createElementTemplate();

  selectSubElements() {
    this.element.querySelectorAll("[data-element]").forEach((element) => {
      this.subElements[element.dataset.element] = element;
    });
  }

  handleDateSelectEvent = async (event) => {
    const { from, to } = event.detail;
    await this.updateComponentData(from, to);
  };

  createEventListener() {
    document.addEventListener("date-select", this.handleDateSelectEvent);
  }

  removeEventListeners() {
    document.removeEventListener("date-select", this.handleDateSelectEvent);
  }

  remove() {
    this.element.remove();
    this.subElements = {};
  }

  destroy() {
    this.remove();
    this.removeEventListeners();
  }
}

// const from = new Date();
// from.setMonth(from.getMonth() - 1);
// const to = new Date();

// const tasksChart = new ColumnChart({
//   url: "/api/statistics",
//   range: {
//     from,
//     to,
//   },
//   label: "дел",
//   // link: "#",
// });

const tooltip = new Tooltip();
tooltip.initialize();

const contentNode = document.querySelector("#content");

async function initialize() {
  const page = new PageStatistic();
  const element = await page.render();

  contentNode.innerHTML = "";
  contentNode.append(element);
}

initialize();

// const contentNode = document.querySelector("#content");
// const tasksNode = document.querySelector("[data-element='tasksChart']");

// tasksNode.append(tasksChart.element);
