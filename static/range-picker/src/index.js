export default class RangePicker {
  element;
  subElements = {};

  constructor({
    from = new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to = new Date(),
  } = {}) {
    this.from = from;
    this.to = to;

    this.element = this.createElement(this.createTemplate());
    this.selectSubElements();
    this.createEventListener();
  }

  createElement(template) {
    const element = document.createElement("div");
    element.innerHTML = template;
    return element.firstElementChild;
  }

  createTemplate() {
    const from = this.formatDate(this.from);
    const to = this.formatDate(this.to);
    return `
            <div class="rangepicker">
                <div class="rangepicker__input" data-element="input">
                    <span  data-element="from">${from}</span> -
                    <span  data-element="to">${to}</span>
                </div>

                <div class="rangepicker__selector" data-element="selector"></div>
            </div>
            `;
  }

  createSelectorTemplate() {
    return `
            <div class="rangepicker__selector-arrow"></div>
            <div class="rangepicker__selector-control-left"></div>
            <div class="rangepicker__selector-control-right"></div>

            ${this.leftCalendar}
            ${this.rightCalendar}

        `;
  }

  createCalendarTemplate(dateShow) {
    const date = new Date(dateShow);

    const monthName = date.toLocaleString("ru", { month: "long" });
    return `
            <div class="rangepicker__calendar">
                        <div class="rangepicker__month-indicator">
                            <time datetime="${monthName}">${monthName}</time>
                        </div>
                        <div class="rangepicker__day-of-week">
                            <div>Пн</div>
                            <div>Вт</div>
                            <div>Ср</div>
                            <div>Чт</div>
                            <div>Пт</div>
                            <div>Сб</div>
                            <div>Вс</div>
                        </div>
                        <div class="rangepicker__date-grid">
                            ${this.createCalendarCellsTemplate(date)}
                        </div>
            </div>
            `;
  }

  createCalendarCellsTemplate(dateShow) {
    const year = dateShow.getFullYear();
    const month = dateShow.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();

    const date = new Date(Date.UTC(year, month, 1));

    const getGridStartIndex = (dayIndex) => {
      const index = dayIndex === 0 ? 6 : dayIndex - 1;
      return index + 1;
    };

    let buttonsTemplate = `
        <button type="button"
            class="rangepicker__cell"
            data-value="${date.toISOString()}"
            style="--start-from: ${getGridStartIndex(date.getDay())}">
            ${date.getDate()}
        </button>`;

    while (date.getDate() < lastDay) {
      date.setDate(date.getDate() + 1);

      buttonsTemplate += `
                <button type="button"
                    class="rangepicker__cell"
                    data-value="${date.toISOString()}">
                    ${date.getDate()}
                </button>`;
    }

    return buttonsTemplate;
  }

  formatDate(date) {
    //'04.01.2025'
    return date.toLocaleString("ru", { dateStyle: "short" });
  }

  convertUTCDateFormat(dateString) {
    const [day, month, year] = dateString.split(".");
    return `${year}-${month}-${day}`;
  }

  selectSubElements() {
    this.element.querySelectorAll("[data-element]").forEach((element) => {
      this.subElements[element.dataset.element] = element;
    });
  }

  handleInputClick = () => {
    const date = new Date(this.to);
    date.setMonth(date.getMonth() - 1);
    this.leftCalendar = this.createCalendarTemplate(date);
    this.rightCalendar = this.createCalendarTemplate(this.to);

    this.subElements.selector.innerHTML = this.createSelectorTemplate();

    this.rangePickerToggle();

    this.removeHighLightCells();
    this.highlightCells();
  };

  handleSelectorClick = (e) => {
    const [firstCalendar, secondCalendar] =
      this.subElements.selector.querySelectorAll(".rangepicker__calendar");

    if (e.target.classList.contains("rangepicker__selector-control-left")) {
      const newDateLeftCalendar =
        firstCalendar.querySelector("[data-value]").dataset.value;

      const date = new Date(newDateLeftCalendar);
      date.setMonth(date.getMonth() - 1);
      this.rightCalendar = this.leftCalendar;
      this.leftCalendar = this.createCalendarTemplate(date);

      this.subElements.selector.innerHTML = this.createSelectorTemplate();
    }

    if (e.target.classList.contains("rangepicker__selector-control-right")) {
      const newDateRightCalendar =
        secondCalendar.querySelector("[data-value]").dataset.value;

      const date = new Date(newDateRightCalendar);
      date.setMonth(date.getMonth() + 1);

      this.leftCalendar = this.rightCalendar;
      this.rightCalendar = this.createCalendarTemplate(date);

      this.subElements.selector.innerHTML = this.createSelectorTemplate();
    }

    if (e.target.classList.contains("rangepicker__cell")) {
      this.removeHighLightCells();
      this.updateRange(e.target.dataset.value);
    }
  };

  createEventListener() {
    this.subElements.input.addEventListener("click", this.handleInputClick);
    this.subElements.selector.addEventListener(
      "click",
      this.handleSelectorClick
    );
  }
  removeEventListener() {
    this.subElements.input.removeEventListener("click", this.handleInputClick);
    this.subElements.selector.removeEventListener(
      "click",
      this.handleSelectorClick
    );
  }

  updateRange(value) {
    const selectedDate = new Date(value);

    if (!this.from || this.to) {
      this.from = selectedDate;
      this.to = null;
    } else if (!this.to) {
      this.to = selectedDate;
      this.updateInput();
      this.highlightCells();
      this.rangePickerToggle();
    }

  }

  updateInput() {
    if (Date.parse(this.from) > Date.parse(this.to)) {
      [this.from, this.to] = [this.to, this.from];
    }

    this.subElements.from.innerHTML = `${this.formatDate(this.from)}`;
    this.subElements.to.innerHTML = `${this.formatDate(this.to)}`;
    this.dispatchEvent();
  }

  dispatchEvent = () => {
    const event = new CustomEvent("date-select", {
      bubbles: true,
      detail: {
        from: this.from,
        to: this.to,
      },
    });
    this.element.dispatchEvent(event);
  };

  rangePickerToggle() {
    const inputWrapper = this.subElements.input.parentElement;
    inputWrapper.classList.toggle("rangepicker_open");
  }

  highlightCells() {
    const cells = this.element.querySelectorAll(".rangepicker__cell");

    const fromUTCDate = this.convertUTCDateFormat(
      this.subElements.from.textContent
    );
    const toUTCDate = this.convertUTCDateFormat(
      this.subElements.to.textContent
    );

    for (const cell of cells) {
      const dateSelect = cell.dataset.value;
      const currentDate = new Date(dateSelect).toISOString().split("T")[0];

      if (currentDate === fromUTCDate) {
        cell.classList.add("rangepicker__selected-from");
      } else if (currentDate === toUTCDate) {
        cell.classList.add("rangepicker__selected-to");
      } else if (fromUTCDate < currentDate && currentDate < toUTCDate) {
        cell.classList.add("rangepicker__selected-between");
      }
    }
  }

  removeHighLightCells() {
    const cells = this.element.querySelectorAll(".rangepicker__cell");

    for (const cell of cells) {
      cell.classList.remove("rangepicker__selected-from");
      cell.classList.remove("rangepicker__selected-between");
      cell.classList.remove("rangepicker__selected-to");
    }
  }

  remove() {
    this.element.remove();
  }
  destroy() {
    this.remove();
    this.removeEventListener();
  }
}
