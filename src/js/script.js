/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  ('use strict');

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(
      document.querySelector(select.templateOf.menuProduct).innerHTML
    ),
  };

  class Product {
    constructor(id, data) {
      this.id = id;
      this.data = data;

      this.renderInMenu();
      this.getElements();
      this.initAccordion();
      this.initOrderForm();
      this.initAmountWidget();
      this.processOrder();

      console.log('Product: ', this);
    }

    renderInMenu() {
      const generatedHTML = templates.menuProduct(this.data);
      this.element = utils.createDOMFromHTML(generatedHTML);
      const menuContainer = document.querySelector(select.containerOf.menu);
      menuContainer.appendChild(this.element);
    }

    getElements() {
      this.accordionTrigger = this.element.querySelector(
        select.menuProduct.clickable
      );
      this.form = this.element.querySelector(select.menuProduct.form);
      this.formInputs = this.form.querySelectorAll(select.all.formInputs);
      this.cartButton = this.element.querySelector(
        select.menuProduct.cartButton
      );
      this.priceElem = this.element.querySelector(select.menuProduct.priceElem);

      this.imageWrapper = select.menuProduct.imageWrapper;
      this.amountWidgetElem = this.element.querySelector(
        select.menuProduct.amountWidget
      );
    }

    initAccordion() {
      const thisProduct = this;

      thisProduct.accordionTrigger.addEventListener('click', function (event) {
        event.preventDefault();

        const activeProducts = document.querySelectorAll(
          select.all.menuProducts
        );

        activeProducts.forEach((product) => {
          if (
            product.classList.contains(classNames.menuProduct.wrapperActive) &&
            product !== thisProduct.element
          ) {
            product.classList.remove(classNames.menuProduct.wrapperActive);
          }
        });

        thisProduct.element.classList.toggle(
          classNames.menuProduct.wrapperActive
        );
      });
    }

    initOrderForm() {
      const thisProduct = this;

      thisProduct.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function () {
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });
    }

    initAmountWidget() {
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    }

    processOrder() {
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form);

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
            const optionImage = document.querySelector(
              `.${paramId}-${optionId}`
            );
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

      thisProduct.priceElem.innerHTML = price;
    }
  }

  class AmountWidget {
    constructor(element) {
      const thisWidget = this;

      // console.log('AmountWidget: ', thisWidget);
      // console.log('constructor arguments: ', element);
      thisWidget.getElements(element);
    }

    getElements(element) {
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(
        select.widgets.amount.input
      );
      thisWidget.linkDecrease = thisWidget.element.querySelector(
        select.widgets.amount.linkDecrease
      );
      thisWidget.linkIncrease = thisWidget.element.querySelector(
        select.widgets.amount.linkIncrease
      );
    }
  }

  const app = {
    initData: function () {
      const thisApp = this;
      thisApp.data = dataSource;
    },

    initMenu: function () {
      const thisApp = this;

      for (const productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    init: function () {
      const thisApp = this;
      // console.log('*** App starting ***');
      // console.log('thisApp:', thisApp);
      // console.log('classNames:', classNames);
      // console.log('settings:', settings);
      // console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
