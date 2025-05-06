import { classNames, select, templates } from '../settings.js';
import { utils } from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Product {
  constructor(id, data) {
    this.id = id;
    this.data = data;
    this.dom = {};

    this.renderInMenu();
    this.getElements();
    this.initAccordion();
    this.initOrderForm();
    this.initAmountWidget();
    this.processOrder();
  }

  renderInMenu() {
    const generatedHTML = templates.menuProduct(this.data);
    this.dom.element = utils.createDOMFromHTML(generatedHTML);
    const menuContainer = document.querySelector(select.containerOf.menu);
    menuContainer.appendChild(this.dom.element);
  }

  getElements() {
    this.dom.accordionTrigger = this.dom.element.querySelector(
      select.menuProduct.clickable
    );

    this.dom.form = this.dom.element.querySelector(select.menuProduct.form);
    this.dom.formInputs = this.dom.form.querySelectorAll(select.all.formInputs);
    this.dom.cartButton = this.dom.element.querySelector(
      select.menuProduct.cartButton
    );
    this.dom.priceElem = this.dom.element.querySelector(
      select.menuProduct.priceElem
    );

    this.imageWrapper = select.menuProduct.imageWrapper;
    this.dom.amountWidgetElem = this.dom.element.querySelector(
      select.menuProduct.amountWidget
    );
  }

  initAccordion() {
    const thisProduct = this;

    thisProduct.dom.accordionTrigger.addEventListener(
      'click',
      function (event) {
        event.preventDefault();

        const activeProducts = document.querySelectorAll(
          select.all.menuProducts
        );

        activeProducts.forEach((product) => {
          if (
            product.classList.contains(classNames.menuProduct.wrapperActive) &&
            product !== thisProduct.dom.element
          ) {
            product.classList.remove(classNames.menuProduct.wrapperActive);
          }
        });

        thisProduct.dom.element.classList.toggle(
          classNames.menuProduct.wrapperActive
        );
      }
    );
  }

  initOrderForm() {
    const thisProduct = this;

    thisProduct.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
    });

    for (let input of thisProduct.dom.formInputs) {
      input.addEventListener('change', function () {
        thisProduct.processOrder();
      });
    }

    thisProduct.dom.cartButton.addEventListener('click', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  initAmountWidget() {
    const thisProduct = this;
    thisProduct.amountWidget = new AmountWidget(
      thisProduct.dom.amountWidgetElem
    );

    thisProduct.dom.amountWidgetElem.addEventListener('updated', function () {
      thisProduct.processOrder();
    });
  }

  processOrder() {
    const thisProduct = this;
    const formData = utils.serializeFormToObject(thisProduct.dom.form);

    let price = thisProduct.data.price;

    for (const paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];

      for (const optionId in param.options) {
        const option = param.options[optionId];
        const ingredientWithActiveClass = document.querySelector(
          `.${paramId}-${optionId}`
        );

        if (
          ingredientWithActiveClass &&
          ingredientWithActiveClass.classList.contains(
            classNames.menuProduct.imageVisible
          )
        ) {
          ingredientWithActiveClass.classList.remove(
            classNames.menuProduct.imageVisible
          );
        }

        if (formData[paramId] && formData[paramId].includes(optionId)) {
          const optionImage = document.querySelector(`.${paramId}-${optionId}`);
          if (optionImage) {
            optionImage.classList.add(classNames.menuProduct.imageVisible);
          }

          if (!option.default) {
            price += option.price;
          }
        } else {
          if (option.default) {
            price -= option.price;
          }
        }
      }
    }

    thisProduct.priceSingle = price;
    price *= thisProduct.amountWidget.value;
    thisProduct.dom.priceElem.innerHTML = price;
  }

  addToCart() {
    const thisProduct = this;

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      },
    });

    thisProduct.dom.element.dispatchEvent(event);
  }

  prepareCartProduct() {
    const thisProduct = this;

    const productSummary = {
      id: thisProduct.id,
      name: thisProduct.data.name,
      amount: thisProduct.amountWidget.value,
      price: thisProduct.priceSingle * thisProduct.amountWidget.value,
      priceSingle: thisProduct.priceSingle,
      params: thisProduct.prepareCartProductParams(),
    };

    return productSummary;
  }

  prepareCartProductParams() {
    const thisProduct = this;

    const formData = utils.serializeFormToObject(thisProduct.dom.form);
    const params = {};

    for (let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];

      params[paramId] = {
        label: param.label,
        options: {},
      };

      const options = {};
      for (let optionId in param.options) {
        const option = param.options[optionId];
        const optionSelected =
          formData[paramId] && formData[paramId].includes(optionId);

        if (optionSelected) {
          options[optionId] = option.label;
          params[paramId].options = options;
        }
      }
    }

    return params;
  }
}

export default Product;
