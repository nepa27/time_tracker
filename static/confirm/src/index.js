export default class ConfirmMessage {
  element;
  result;
  subElements = {};

  constructor(message = "") {
    this.message = message;
    this.element = this.createElement(this.createElementTemplate());
    this.subElements = this.getSubElements(this.element);
    this.render();
  }

  createElement(template) {
    const element = document.createElement("div");
    element.innerHTML = template;
    return element.firstElementChild;
  }

  createElementTemplate() {
    return `<div class="confirm-wrapper">
              <div class="confirm">
                <span class="confirm-text">${this.message}</span>
                <div class="confirm__btn-wrapper inner-wrapper">
                  <button data-element="confirmYes" class="confirm-yes btn--confirm">Да</button>
                  <button data-element="confirmNo" class="confirm-no btn--confirm">Нет</button>
                </div>
              </div>
            </div>`;
  }

  render() {
    document.body.appendChild(this.element);
    this.createEventListeners();
  }

  handlePointerDownYes = () => {
    this.result = true;
    this.close();
  };

  handlePointerDownNo = () => {
    this.result = false;
    this.close();
  };

  createEventListeners() {
    this.subElements.confirmYes.addEventListener(
      "pointerdown",
      this.handlePointerDownYes
    );
    this.subElements.confirmNo.addEventListener(
      "pointerdown",
      this.handlePointerDownNo
    );
  }

  removeEventListeners() {
    this.subElements.confirmYes.removeEventListener(
      "pointerdown",
      this.handlePointerDownYes
    );
    this.subElements.confirmNo.removeEventListener(
      "pointerdown",
      this.handlePointerDownNo
    );
  }

  getSubElements(element) {
    const subElements = {};

    for (const subElement of element.querySelectorAll("[data-element]")) {
      subElements[subElement.dataset.element] = subElement;
    }

    return subElements;
  }

  close() {
    this.remove();
    this.removeEventListeners();
    this.resolve(this.result); // Resolve the promise with the result
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.removeEventListeners();
  }

  // New method to show the confirm dialog and return a promise
  static show(message) {
    return new Promise((resolve) => {
      const confirmMessage = new ConfirmMessage(message);
      confirmMessage.resolve = resolve; // Store the resolve function
    });
  }
}
