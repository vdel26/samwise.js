const samwise = (() => {

  'use strict';

  /**
   * Defaults
   */

  const defaults = {};

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
  const bindEvent = (type, elem, cb) => elem.addEventListener(type, cb);

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
      let frag = createFragment();
      frag.appendChild(elem);
      this._view = frag;
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

  const mountApp = () => {
    const bg = new BgView();
    document.body.appendChild(bg.view);
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
    const button = document.querySelector(params.elem);
    button.addEventListener('click', mountApp);
  };

})();
