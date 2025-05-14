import { templates, select } from '../settings.js';

class Home {
  constructor(thisApp, element) {
    const thisHome = this;

    thisHome.render(element);
    thisHome.initPlugins();

    thisHome.initNavigation(thisApp);
  }

  initNavigation(thisApp) {
    const featuresLinks = document.querySelectorAll(select.home.featuresLinks);
    const localNavLinks = [...thisApp.navLinks, ...featuresLinks];
    thisApp.navLinks = localNavLinks;

    for (let link of thisApp.navLinks) {
      link.addEventListener('click', function (event) {
        const clickedElement = this;
        event.preventDefault();

        const id = clickedElement.getAttribute('href').replace('#', '');

        thisApp.activatePage(id);

        window.location.hash = '#/' + id;
      });
    }
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
      autoPlay: 3000,
      fullscreen: true,
    });
  }
}

export default Home;
