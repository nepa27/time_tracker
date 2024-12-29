export default class Tooltip {
  static instance = null;

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }
    this.element = this.createElement(this.createElementTemplate());
    Tooltip.instance = this.element;
  }

  initialize() {
    this.createListeners();
  }

  createElement(template) {
    const element = document.createElement("div");
    element.innerHTML = template;
    return element.firstElementChild;
  }

  createElementTemplate() {
    return `<div class="tooltip">${this.dataset || ""}</div>`;
  }

  handleTooltipMouseOver = (e) => {
    const target = e.target.closest("[data-tooltip]");
    if (!target) {
      return;
    }

    const { clientX, clientY } = e;

    this.dataset = target.dataset.tooltip;
    this.element.innerHTML = this.dataset;

    this.updatePosition(clientX, clientY);

    this.render();
  };

  handleTooltipMouseMove = (e) => {
    if (!Tooltip.instance) {
      return;
    }

    const { clientX, clientY } = e;
    this.updatePosition(clientX, clientY);
  };

  handleTooltipMouseOut = (e) => {
    const target = e.target.closest("[data-tooltip]");
    if (!target) {
      return;
    }

    this.remove();
  };

  createListeners() {
    document.addEventListener("pointerover", this.handleTooltipMouseOver);
    document.addEventListener("mousemove", this.handleTooltipMouseMove);
    document.addEventListener("pointerout", this.handleTooltipMouseOut);
  }

  destroyListeners() {
    document.removeEventListener("pointerover", this.handleTooltipMouseOver);
    document.removeEventListener("mousemove", this.handleTooltipMouseMove);
    document.removeEventListener("pointerout", this.handleTooltipMouseOut);
  }

  render() {
    document.body.appendChild(this.element);
  }

  updatePosition(clientX, clientY) {
    this.element.style.transform = `translate(${clientX + 10}px, ${
      clientY -280
    }px)`;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.destroyListeners();
  }
}
