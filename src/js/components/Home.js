import { select, templates } from '../settings.js';
// import Flickity from 'flickity';

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
    console.log('initPlugins');
    // const carouselContainer = document.querySelector(select.home.carousel);

    // const flickity = new Flickity(carouselContainer, {
    //   cellAlign: 'left',
    //   contain: true,
    // });

    var elem = document.querySelector('.main-carousel');
    var flkty = new Flickity(elem, {
      // options
      cellAlign: 'left',
      contain: true,
      autoPlay: 1000,
    });
  }
}

export default Home;
