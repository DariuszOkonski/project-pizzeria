import { select } from '../settings.js';
import AmountWidget from './AmountWidget.js';

class CartProduct {
  constructor(menuProduct, element) {
    const thisCartProduct = this;

    // TODO: remove this line at final version
    // thisCartProduct.id = menuProduct.id;
    thisCartProduct.id = crypto.randomUUID();
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.params = menuProduct.params;
    thisCartProduct.dom = {};

    this.getElements(element);
    this.initAmountWidget();
    this.initActions();
  }

  getData() {
    const thisCartProduct = this;
    const { id, amount, price, priceSingle, name, params } = thisCartProduct;

    return { id, amount, price, priceSingle, name, params };
  }

  getElements(element) {
    const thisCartProduct = this;
    thisCartProduct.dom.wrapper = element;
    thisCartProduct.dom.amountWidget = element.querySelector(
      select.cartProduct.amountWidget
    );
    thisCartProduct.dom.price = element.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = element.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = element.querySelector(
      select.cartProduct.remove
    );
  }

  initAmountWidget() {
    const thisCartProduct = this;
    thisCartProduct.amountWidget = new AmountWidget(
      thisCartProduct.dom.amountWidget
    );
    thisCartProduct.dom.amountWidget.addEventListener('updated', function () {
      const price =
        thisCartProduct.amountWidget.value * thisCartProduct.priceSingle;
      thisCartProduct.price = price;
      thisCartProduct.amount = thisCartProduct.amountWidget.value;
      thisCartProduct.dom.price.textContent = price;
    });
  }

  initActions() {
    const thisCartProduct = this;

    thisCartProduct.dom.edit.addEventListener('click', function (e) {
      e.preventDefault();
      console.log('EDIT');
    });

    thisCartProduct.dom.remove.addEventListener('click', function (e) {
      e.preventDefault();
      thisCartProduct.remove();
    });
  }

  remove() {
    const thisCartProduct = this;

    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      },
    });

    thisCartProduct.dom.wrapper.dispatchEvent(event);
  }
}

export default CartProduct;
