import { templates } from '../settings.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    // thisBooking.getElements(element);
    thisBooking.render(element);
    thisBooking.initWidgets();
  }

  render(element) {
    const thisBooking = this;

    thisBooking.dom = {};
    const generatedHTML = templates.bookingWidget();
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
  }

  initWidgets() {
    console.log('initWidgets');
  }

  // getElements(element) {
  //   const thisBooking = this;

  //   thisBooking.dom = {};
  //   thisBooking.dom.wrapper = element;
  // }
}

export default Booking;
