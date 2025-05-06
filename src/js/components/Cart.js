import { classNames, select, settings, templates } from "../settings.js";
import { utils } from "../utils.js";
import CartProduct from "./CartProduct.js";

class Cart {
  constructor(element) {
    const thisCart = this;

    thisCart.products = [];
    thisCart.getElements(element);
    thisCart.initActions();
  }

  getElements(element) {
    const thisCart = this;

    thisCart.dom = {};
    thisCart.dom.wrapper = element;

    thisCart.dom.toggleTrigger = thisCart.dom.wrapper;
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(
      select.cart.productList
    );

    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(
      select.cart.deliveryFee
    );
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(
      select.cart.subtotalPrice
    );
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelector(
      select.cart.totalPrice
    );
    thisCart.dom.priceSum = thisCart.dom.wrapper.querySelector(
      select.cart.priceSum
    );
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(
      select.cart.totalNumber
    );
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);

    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(
      select.cart.phone
    );
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(
      select.cart.address
    );
  }

  initActions() {
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function (event) {
      if (event.target.name !== 'phone' && event.target.name !== 'address') {
        thisCart.dom.toggleTrigger.classList.toggle(
          classNames.cart.wrapperActive
        );
      }
    });

    thisCart.dom.productList.addEventListener('updated', function () {
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function (event) {
      thisCart.remove(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisCart.sendOrder();
    });

    thisCart.dom.phone.addEventListener('change', function (event) {
      event.preventDefault();
      thisCart.phone = event.target.value;
    });

    thisCart.dom.address.addEventListener('change', function (event) {
      event.preventDefault();
      thisCart.address = event.target.value;
    });
  }

  sendOrder() {
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.orders;

    const payload = {
      address: thisCart.address,
      phone: thisCart.phone,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: settings.cart.defaultDeliveryFee,
      products: [],
    };

    for (const prod of thisCart.products) {
      payload.products.push(prod.getData());
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function (response) {
        return response.json();
      })
      .then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse);
      });
  }

  add(menuProduct) {
    const thisCart = this;

    const generatedHTML = templates.cartProduct(menuProduct);
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    thisCart.dom.productList.appendChild(generatedDOM);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    thisCart.update();
  }

  update() {
    const thisCart = this;
    const deliveryFee = settings.cart.defaultDeliveryFee;
    let totalNumber = 0;
    let subtotalPrice = 0;

    for (const product of thisCart.products) {
      totalNumber += product.amount;
      subtotalPrice += product.price;
    }

    thisCart.totalPrice = subtotalPrice > 0 ? subtotalPrice + deliveryFee : 0;
    thisCart.totalNumber = totalNumber;
    thisCart.subtotalPrice = subtotalPrice;

    thisCart.dom.deliveryFee.textContent =
      subtotalPrice > 0 ? deliveryFee : 0;
    thisCart.dom.subtotalPrice.textContent = subtotalPrice;
    thisCart.dom.totalPrice.textContent = thisCart.totalPrice;
    thisCart.dom.priceSum.textContent = thisCart.totalPrice;
    thisCart.dom.totalNumber.textContent = totalNumber;
  }

  remove(cartProduct) {
    const thisCart = this;

    thisCart.products = thisCart.products.filter(
      (product) => product.id !== cartProduct.id
    );
    thisCart.dom.productList.removeChild(cartProduct.dom.wrapper);
    thisCart.update();
  }
}

export default Cart;