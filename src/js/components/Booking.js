import { classNames, select, settings, templates } from '../settings.js';
import { utils } from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.selectedTable = null;
    thisBooking.phone = '';
    thisBooking.address = '';

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  getData() {
    const thisBooking = this;

    const startDateParam = `${settings.db.dateStartParamKey}=${utils.dateToStr(
      thisBooking.datePicker.minDate
    )}`;
    const endDateParam = `${settings.db.dateEndParamKey}=${utils.dateToStr(
      thisBooking.datePicker.maxDate
    )}`;

    const params = {
      booking: [startDateParam, endDateParam],
      eventsCurrent: [settings.db.notRepeatParam, startDateParam, endDateParam],
      eventsRepeat: [settings.db.repeatParam, endDateParam],
    };

    const urls = {
      booking: `${settings.db.url}/${
        settings.db.bookings
      }?${params.booking.join('&')}`,
      eventsCurrent: `${settings.db.url}/${
        settings.db.events
      }?${params.eventsCurrent.join('&')}`,
      eventsRepeat: `${settings.db.url}/${
        settings.db.events
      }?${params.eventsRepeat.join('&')}`,
    };

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function (allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];

        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat === 'daily') {
        for (
          let loopDate = minDate;
          loopDate <= maxDate;
          loopDate = utils.addDays(loopDate, 1)
        ) {
          thisBooking.makeBooked(
            utils.dateToStr(loopDate),
            item.hour,
            item.duration,
            item.table
          );
        }
      }
    }

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] === 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (
      let hourBlock = startHour;
      hourBlock < startHour + duration;
      hourBlock += 0.5
    ) {
      if (typeof thisBooking.booked[date][hourBlock] === 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if (
      typeof thisBooking.booked[thisBooking.date] == 'undefined' ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] ==
        'undefined'
    ) {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);

      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (
        !allAvailable &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  render(element) {
    const thisBooking = this;

    thisBooking.dom = {};
    const generatedHTML = templates.bookingWidget();
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.peopleAmount
    );
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.hoursAmount
    );

    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(
      select.widgets.datePicker.wrapper
    );

    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(
      select.widgets.hourPicker.wrapper
    );

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(
      select.booking.tables
    );

    thisBooking.dom.tablesContainer = thisBooking.dom.wrapper.querySelector(
      select.booking.tablesContainer
    );

    thisBooking.dom.buttonBookTable = thisBooking.dom.wrapper.querySelector(
      select.booking.buttonBookTable
    );

    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(
      select.booking.phone
    );
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(
      select.booking.address
    );
  }

  initTables(event) {
    const thisBooking = this;
    const dataTable = parseInt(
      event.target.getAttribute(settings.booking.tableIdAttribute)
    );

    if (event.target.classList.contains(classNames.booking.tableBooked)) {
      return alert('Table unavailable!!!');
    }

    if (dataTable !== thisBooking.selectedTable) {
      thisBooking.clearSelectedTables();
      thisBooking.selectedTable = null;
    }

    event.target.classList.toggle(classNames.booking.selected);
    thisBooking.selectedTable = dataTable;
  }

  clearSelectedTables() {
    const thisBooking = this;
    for (let item of thisBooking.dom.tables) {
      if (item.classList.contains(classNames.booking.selected)) {
        item.classList.remove(classNames.booking.selected);
        thisBooking.selectedTable = null;
      }
    }
  }

  sendBooking(event) {
    event.preventDefault();
    const thisBooking = this;

    const bookingObject = {
      date: thisBooking.datePicker.correctValue,
      hour: thisBooking.hourPicker.correctValue,
      table: thisBooking.selectedTable,
      duration: thisBooking.hoursWidget.correctValue,
      ppl: thisBooking.peopleWidget.correctValue,
      starters: [],
      phone: thisBooking.phone,
      address: thisBooking.address,
    };

    if (
      !bookingObject.phone ||
      !bookingObject.address ||
      !bookingObject.table ||
      !bookingObject.date
    ) {
      return alert('Fill all fields!!!');
    }

    console.group('send booking: ');
    console.log('thisBooking: ', thisBooking);
    console.log('bookingObject: ', bookingObject);
    console.groupEnd();
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.dom.peopleAmount.addEventListener('click', function () {
      thisBooking.clearSelectedTables();
    });

    thisBooking.hoursWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.hoursAmount.addEventListener('click', function () {
      thisBooking.clearSelectedTables();
    });

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.dom.datePicker.addEventListener('change', function () {
      thisBooking.clearSelectedTables();
    });

    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    thisBooking.hourPicker.dom.input.addEventListener('input', function () {
      thisBooking.clearSelectedTables();
    });

    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDOM();
    });

    thisBooking.dom.tablesContainer.addEventListener('click', (event) =>
      thisBooking.initTables(event)
    );

    thisBooking.dom.phone.addEventListener('input', (event) => {
      thisBooking.phone = event.target.value;
    });

    thisBooking.dom.address.addEventListener('input', (event) => {
      thisBooking.address = event.target.value;
    });

    thisBooking.dom.buttonBookTable.addEventListener('click', (event) => {
      thisBooking.sendBooking(event);
    });
  }
}

export default Booking;
