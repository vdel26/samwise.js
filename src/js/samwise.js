const samwise = (() => {

  'use strict';

  /**
   * Defaults
   */

  const defaults = new Map();

  /**
   * Datastore
   */

  const store = new Map();

  /**
   * Helper functions
   */

  const compose = (...funcs) => value => funcs.reduce((a, b) => b(a), value);
  const create = (tag, classes) => {
    let el = document.createElement(tag);
    if (classes) classes.forEach((cls) => el.classList.add(cls));
    return el;
  };
  const createFragment = () => document.createDocumentFragment();
  const hasProp = (prop, obj) => Object.prototype.hasOwnProperty.call(obj, prop);
  const createEvent = (() => {
    if (typeof window.Event === 'function') {
      return (type) => new Event(type);
    }
    else {
      // IE8/9 support
      return (type) => {
        let ev = document.createEvent('Event');
        ev.initEvent(type, true, true);
      };
    }
  })();

  /**
   * Base view class
   */

  class View {
    constructor() {
      this._view = null;
    }

    get view () {
      return this._view;
    }

    set view(elem) {
      this._view = elem;
    }

    addSubview(subview) {
      this._view.appendChild(subview);
    }
  }

  /**
   * Full screen background
   */

  class OuterView extends View {
    constructor(options) {
      super();
      this.render();
    }

    render() {
      let outerContainer = create('div', ['sw-outerContainer']);
      let frame = new FrameView();
      outerContainer.appendChild(frame.view);
      this.view = outerContainer;
    }
  }

  /**
   * Main widget window
   */

  class FrameView extends View {
    constructor(options) {
      super();
      this.render();
    }

    createHeader() {

    }

    createFooter() {
      let links = store.get('footer');
      let buttons = links.map((item) => new ButtonView({ url: item.url, name: item.name }))
                         .map((item) => item.view);
      let frag = createFragment();
      buttons.forEach((elem) => frag.appendChild(elem));
      return frag;
    }

    render() {
      let frame = create('div', ['sw']);

      let header = create('header', ['sw-header']);
      let h1 = create('h1');
      let div = create('div', ['sw-closeButton', 'js-close']);
      h1.textContent = store.get('section');
      header.appendChild(div);
      header.appendChild(h1);

      let content = new ContentView();
      let footer = create('footer', ['sw-footer']);
      footer.appendChild(this.createFooter());

      frame.appendChild(header);
      frame.appendChild(content.view);
      frame.appendChild(footer);

      this.view = frame;
    }
  }

  /**
   * Content box
   */

  class ContentView extends View {
    constructor(options) {
      super();
      this.render();
    }

    createListElems(leftCol, rightCol) {
      let data = store.get('data');
      let items = data.articles
                      .map((item) => new ListElemView({ url: item.url, name: item.name }))
                      .map((item) => item.view);
      let frag = createFragment();
      items.forEach((elem) => frag.appendChild(elem));
      leftCol.appendChild(frag);
    }

    render() {
      let main = create('div', ['sw-main']);

      let mainContent = create('div', ['sw-content']);
      let leftCol = create('ul', ['sw-column', 'sw-column--left']);
      let rightCol = create('ul', ['sw-column', 'sw-column--left']);

      this.createListElems(leftCol, rightCol);

      mainContent.appendChild(leftCol);
      mainContent.appendChild(rightCol);
      main.appendChild(mainContent);

      this.view = main;
    }
  }

  /**
   * Button
   */

  class ButtonView extends View {
    constructor(options) {
      super();
      this.url = options.url;
      this.name = options.name;
      this.render();
    }

    render() {
      let a = create('a', ['sw-button']);
      a.href = this.url;
      a.textContent = this.name;
      this.view = a;
    }
  }

  /**
   * Link to a document
   */

  class ListElemView extends View {
    constructor(options) {
      super();
      this.url = options.url;
      this.name = options.name;
      this.render();
    }
    render() {
      let li = create('li', ['sw-listElem']);
      let a = create('a');
      a.href = this.url;
      a.textContent = this.name;
      li.appendChild(a);
      this.view = li;
    }
  }


  /**
   * DOM structure
   * <div class="sw-outerContainer">
   *   <div class="sw">
   *     <header class="sw-header">
   *       <h1 class="sw-title"></h1>
   *     </header>
   *     <div class="sw-main">
   *       <div class="sw-content">
   *         <ul class="sw-column sw-column--left">
   *           <li><a href=""></a></li>
   *         </ul>
   *         <ul class="sw-column sw-column--right"></ul>
   *       </div>
   *     </div>
   *     <footer class="sw-footer"></footer>
   *   </div>
   * </div>
   */


  const getSection = (arr, section) => {
    return arr.sections.filter((sec) => sec.section === section)[0];
  };

  const toggleVisibility = (elem) => {
    elem.classList.toggle('is-visible');
  };

  const bindEvents = (triggerEl, root) => {
    let close = document.querySelector('.js-close');

    triggerEl.addEventListener('click', toggleVisibility.bind(null, root));

    close.addEventListener('click', (evt) => toggleVisibility(root));
    close.addEventListener('mousedown', (evt) => close.classList.add('is-pressed'));
    close.addEventListener('mouseup', (evt) => close.classList.remove('is-pressed'));

    root.addEventListener('click', (evt) => {
      if (evt.target === root) toggleVisibility(root);
    });
    document.addEventListener('keyup', (evt) => {
      if (root.classList.contains('is-visible') && evt.keyCode === 27)
        toggleVisibility(root);
    });
  };

  const validateParams = (params) => {
    if (!hasProp('section', params))
      throw new Error("Missing parameter 'section'");
    if (!hasProp('elem', params))
      throw new Error("Missing parameter 'elem'");
    if (!hasProp('url', params) && !hasProp('data', params))
      throw new Error("Missing param: either 'url' or 'data' have to be present");
    return true;
  };

  const initApp = (triggerEl, params) => {
    const mode = (() => {
      if (hasProp('url', params))
        return 'url';
      else if (hasProp('data', params))
        return 'data';
    })();

    const data = (() => {
      if (mode === 'data')
        return getSection(params.data, params.section);
      else console.log('No URL mode yet');
    })();

    store.set('data', data);
    store.set('section', data.title);
    store.set('footer', params.data.footer);

    // insert the whole widget HTML tree to the DOM
    let app = new OuterView();
    const root = document.body.appendChild(app.view);

    bindEvents(triggerEl, root);
  };

  /**
   * Public interface
   *
   * @param {Object} params
   * @param {String}   params.section - section name (required)
   * @param {HTMLElement} params.elem - element that triggers the widget (required)
   * @param {String}       params.url - data endpoint (required if "data" not present)
   * @param {Object}      params.data - JSON data (required if "url" not present)
   */

  return (params) => {
    console.log(params);
    let button = document.querySelector(params.elem);
    validateParams(params);
    initApp(button, params);
  };

})();
