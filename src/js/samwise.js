const samwise = (() => {

  'use strict';

  /**
   * Defaults
   */

  const defaults = {};

  /**
   * Params
   */

  const params = new Map();

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
      // let frag = createFragment();
      // frag.appendChild(elem);
      this._view = elem;
    }

    addSubview(subview) {
      this._view.appendChild(subview);
    }
  }

  /**
   * Full screen background
   */

  class BgView extends View {
    constructor() {
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

    render() {
      let frame = create('div', ['sw']);

      let header = create('header');
      let content = new ContentView();
      let footer = create('footer', ['sw-footer']);

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

    createLink(name, url) {
      let listEl = create('li');
      let ref = create('a');
      a.href = url;
      a.textContent = name;
      listEl.appendChild(ref);
      return listEl;
    }

    render() {
      let main = create('div', ['sw-main']);

      let mainContent = create('div', ['sw-content']);
      let leftCol = create('ul', ['sw-column', 'sw-column--left']);
      let rightCol = create('ul', ['sw-column', 'sw-column--left']);



      mainContent.appendChild(leftCol);
      mainContent.appendChild(rightCol);
      main.appendChild(mainContent);

      this.view = main;
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
      let li = create('li', ['sw-listElem'])
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
    arr.sections.filter((sec) => sec.section === section)[0];
  }

  const toggleVisibility = (elem) => {
    elem.classList.toggle('is-visible');
  }

  const bindEvents = (triggerEl, root) => {
    triggerEl.addEventListener('click', toggleVisibility.bind(null, root));
    // other events:
    //    - dismiss with keyboard esc
    //    - dismiss with click on sw-closeButton
  }

  const initApp = (triggerEl, params) => {
    const mode = (() => {
      if (hasProp('url', params))
        return 'url';
      else if (hasProp('data', params) && hasProp('section', params))
        return 'data';
      throw new Error("Missing param: you have to supply either 'url' or 'data' and 'section'");
    })();

    const data = (() => {
      if (mode === 'data')
        return getSection(params.data, params.section);
      else console.log('No URL mode yet');
    })();

    // insert the whole widget HTML tree to the DOM
    let bg = new BgView();
    const root = document.body.appendChild(bg.view);

    bindEvents(triggerEl, root);
  }

  /**
   * Public interface
   *
   * @param {Object} params
   *   - el: selector of the element that triggers the widget
   *   - url: endpoint to fetch the data
   *   - data: required if thre is no 'url'
   *   - section: only necessary if 'url' is present. Is
   */

  return (params) => {
    console.log(params);
    let button = document.querySelector(params.elem);
    initApp(button, params);
  };

})();
