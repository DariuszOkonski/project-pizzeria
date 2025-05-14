/* eslint-disable */
import { templates } from '../settings.js';

class Home {
  constructor(element) {
    const thisHome = this;

    thisHome.render(element);
    thisHome.initPlugins();
  }

  render(element) {
    const thisHome = this;
    thisHome.dom = {};

    const generatedHTML = templates.homePage();
    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.innerHTML = generatedHTML;
  }

  initPlugins() {
    const elem = document.querySelector('.main-carousel');
    new Flickity(elem, {
      cellAlign: 'left',
      contain: true,
      autoPlay: 1500,
      fullscreen: true,
    });
  }
}

export default Home;
