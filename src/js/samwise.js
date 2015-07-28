const samwise = (() => {

  'use strict';

  /**
   * Datastore
   */

  const store = new Map();

  /**
   * Public methods
   */

  const exported = {};

  /**
   * Helper functions
   */

  const extend = (target, source) => Object.keys(source).forEach(prop => target[prop] = source[prop]);
  const pipeline = (...funcs) => value => funcs.reduce((a, b) => b(a), value);
  const create = (tag, classes) => {
    let el = document.createElement(tag);
    if (classes) classes.forEach((cls) => el.classList.add(cls));
    return el;
  };
  const createFragment = () => document.createDocumentFragment();
  const hasProp = (prop, obj) => Object.prototype.hasOwnProperty.call(obj, prop);
  const createEvent = (() => {
    if (typeof window.Event === 'function') { return (type) => new Event(type); }
    else {
      // IE8/9 support
      return (type) => {
        let ev = document.createEvent('Event');
        ev.initEvent(type, true, true);
      };
    }
  })();
  const listen = (elem, event, handler) => {
    elem.addEventListener(event, handler);
    if (!elem.swListeners) elem.swListeners = new Map();
    if (!elem.swListeners.has(event)) elem.swListeners.set(event, handler);
  };
  const unlisten = (elem, event, handler) => {
    elem.removeEventListener(event, handler);
    elem.swListeners.delete(event);
  };

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

    remove() {
      this._view = null;
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

  const fetchData = (url, cb) => {
    let xhr = new XMLHttpRequest();
    xhr.onload = (e) => {
      cb(JSON.parse(xhr.responseText));
    };
    xhr.onerror = (e) => {
      throw new Error(xhr.statusText);
    };
    xhr.open('GET', url, true);
    xhr.send();
  };

  const toggleVisibility = (elem) => {
    elem.classList.toggle('is-visible');
  };

  const bindEvents = (triggerEl, rootEl, closeEl) => {
    const toggleRootVisibility = () => toggleVisibility(rootEl);
    const escapeKeyUpListener = (evt) => {
      if (rootEl.classList.contains('is-visible') && evt.keyCode === 27)
        toggleRootVisibility();
    };
    const outsideClickListener = (evt) => { if (evt.target === rootEl) toggleRootVisibility(); };

    listen(triggerEl, 'click', toggleRootVisibility);
    listen(closeEl, 'click', toggleRootVisibility);
    listen(rootEl, 'click', outsideClickListener);
    listen(document, 'keyup', escapeKeyUpListener);

    exported.toggle = toggleRootVisibility;
  };

  const unbindEvents = (triggerEl, rootEl, closeEl) => {
    unlisten(triggerEl, 'click', triggerEl.swListeners.get('click'));
    unlisten(closeEl, 'click', closeEl.swListeners.get('click'));
    unlisten(rootEl, 'click', rootEl.swListeners.get('click'));
    unlisten(document, 'keyup', document.swListeners.get('keyup'));
  };

  const validateParams = (params) => {
    if (!hasProp('section', params))
      throw new Error("Missing parameter 'section'");
    if (!hasProp('elem', params))
      throw new Error("Missing parameter 'elem'");
    if (!hasProp('url', params) && !hasProp('data', params))
      throw new Error("Missing parameter: either 'url' or 'data' have to be present");
    return true;
  };

  const storeData = (data, sectionName) => {
    const section = getSection(data, sectionName);
    store.set('data', section);
    store.set('section', section.title);
    store.set('footer', data.footer);
  };

  const mountApp = (params) => {
    let app = new OuterView();
    let rootEl = document.body.appendChild(app.view);
    let button = document.querySelector(params.elem);
    let closeEl = document.querySelector('.js-close');
    bindEvents(button, rootEl, closeEl);
  };

  const unmountApp = (params) => {
    let rootEl = document.querySelector('.sw-outerContainer');
    let button = document.querySelector(params.elem);
    let closeEl = document.querySelector('.js-close');
    rootEl.parentNode.removeChild(rootEl);
    unbindEvents(button, rootEl, closeEl);
  };

  /**
   * Get data and initialize widget
   */

  const initApp = (params) => {
    const launch = (mode) => {
      if (mode === 'data') {
        return () => {
          storeData(params.data, params.section);
          mountApp(params);
        };
      }
      if (mode === 'url') {
        return (apiResponse) => {
          storeData(apiResponse, params.section);
          mountApp(params);
        };
      }
    };

    if (hasProp('data', params))
      launch('data')();
    else if (hasProp('url', params))
      fetchData(params.url, launch('url'));
  };

  /**
   * Public interface
   *
   * @param {Object} params
   * @param {String}   params.section - section name (required)
   * @param {String}   params.elem    - CSS selector of the element that opens the widget (required)
   * @param {String}   params.url     - data endpoint (required if "data" not present)
   * @param {Object}   params.data    - JSON data (required if "url" not present)
   */

  return (params) => {
    if (samwise.mounted) unmountApp(params);
    validateParams(params);
    initApp(params);
    samwise.mounted = true;
    extend(samwise, exported);
  };

})();
