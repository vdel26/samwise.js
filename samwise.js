'use strict';

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var samwise = (function () {

  'use strict';

  /**
   * Datastore
   */

  var store = new Map();

  /**
   * Public methods
   */

  var exported = {};

  /**
   * Helper functions
   */

  var extend = function extend(target, source) {
    return Object.keys(source).forEach(function (prop) {
      return target[prop] = source[prop];
    });
  };
  var pipeline = function pipeline() {
    for (var _len = arguments.length, funcs = Array(_len), _key = 0; _key < _len; _key++) {
      funcs[_key] = arguments[_key];
    }

    return function (value) {
      return funcs.reduce(function (a, b) {
        return b(a);
      }, value);
    };
  };
  var create = function create(tag, classes) {
    var el = document.createElement(tag);
    if (classes) classes.forEach(function (cls) {
      return el.classList.add(cls);
    });
    return el;
  };
  var createFragment = function createFragment() {
    return document.createDocumentFragment();
  };
  var hasProp = function hasProp(prop, obj) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  };
  var createEvent = (function () {
    if (typeof window.Event === 'function') {
      return function (type) {
        return new Event(type);
      };
    } else {
      // IE8/9 support
      return function (type) {
        var ev = document.createEvent('Event');
        ev.initEvent(type, true, true);
      };
    }
  })();
  var listen = function listen(elem, event, handler) {
    elem.addEventListener(event, handler);
    if (!elem.swListeners) elem.swListeners = new Map();
    if (!elem.swListeners.has(event)) elem.swListeners.set(event, handler);
  };
  var unlisten = function unlisten(elem, event, handler) {
    elem.removeEventListener(event, handler);
    elem.swListeners['delete'](event);
  };

  /**
   * Base view class
   */

  var View = (function () {
    function View() {
      _classCallCheck(this, View);

      this._view = null;
    }

    _createClass(View, [{
      key: 'view',
      get: function () {
        return this._view;
      },
      set: function (elem) {
        this._view = elem;
      }
    }, {
      key: 'remove',
      value: function remove() {
        this._view = null;
      }
    }, {
      key: 'addSubview',
      value: function addSubview(subview) {
        this._view.appendChild(subview);
      }
    }]);

    return View;
  })();

  /**
   * Full screen background
   */

  var OuterView = (function (_View) {
    function OuterView(options) {
      _classCallCheck(this, OuterView);

      _get(Object.getPrototypeOf(OuterView.prototype), 'constructor', this).call(this);
      this.render();
    }

    _inherits(OuterView, _View);

    _createClass(OuterView, [{
      key: 'render',
      value: function render() {
        var outerContainer = create('div', ['sw-outerContainer']);
        var frame = new FrameView();
        outerContainer.appendChild(frame.view);
        this.view = outerContainer;
      }
    }]);

    return OuterView;
  })(View);

  /**
   * Main widget window
   */

  var FrameView = (function (_View2) {
    function FrameView(options) {
      _classCallCheck(this, FrameView);

      _get(Object.getPrototypeOf(FrameView.prototype), 'constructor', this).call(this);
      this.render();
    }

    _inherits(FrameView, _View2);

    _createClass(FrameView, [{
      key: 'createFooter',
      value: function createFooter() {
        var links = store.get('footer');
        var buttons = links.map(function (item) {
          return new ButtonView({ url: item.url, name: item.name });
        }).map(function (item) {
          return item.view;
        });
        var frag = createFragment();
        buttons.forEach(function (elem) {
          return frag.appendChild(elem);
        });
        return frag;
      }
    }, {
      key: 'render',
      value: function render() {
        var frame = create('div', ['sw']);

        var header = create('header', ['sw-header']);
        var h1 = create('h1');
        var div = create('div', ['sw-closeButton', 'js-close']);
        h1.textContent = store.get('section');
        header.appendChild(div);
        header.appendChild(h1);

        var content = new ContentView();
        var footer = create('footer', ['sw-footer']);
        footer.appendChild(this.createFooter());

        frame.appendChild(header);
        frame.appendChild(content.view);
        frame.appendChild(footer);

        this.view = frame;
      }
    }]);

    return FrameView;
  })(View);

  /**
   * Content box
   */

  var ContentView = (function (_View3) {
    function ContentView(options) {
      _classCallCheck(this, ContentView);

      _get(Object.getPrototypeOf(ContentView.prototype), 'constructor', this).call(this);
      this.render();
    }

    _inherits(ContentView, _View3);

    _createClass(ContentView, [{
      key: 'createListElems',
      value: function createListElems(leftCol, rightCol) {
        var data = store.get('data');
        var items = data.articles.map(function (item) {
          return new ListElemView({ url: item.url, name: item.name });
        }).map(function (item) {
          return item.view;
        });
        var frag = createFragment();
        items.forEach(function (elem) {
          return frag.appendChild(elem);
        });
        leftCol.appendChild(frag);
      }
    }, {
      key: 'render',
      value: function render() {
        var main = create('div', ['sw-main']);

        var mainContent = create('div', ['sw-content']);
        var leftCol = create('ul', ['sw-column', 'sw-column--left']);
        var rightCol = create('ul', ['sw-column', 'sw-column--left']);

        this.createListElems(leftCol, rightCol);

        mainContent.appendChild(leftCol);
        mainContent.appendChild(rightCol);
        main.appendChild(mainContent);

        this.view = main;
      }
    }]);

    return ContentView;
  })(View);

  /**
   * Button
   */

  var ButtonView = (function (_View4) {
    function ButtonView(options) {
      _classCallCheck(this, ButtonView);

      _get(Object.getPrototypeOf(ButtonView.prototype), 'constructor', this).call(this);
      this.url = options.url;
      this.name = options.name;
      this.render();
    }

    _inherits(ButtonView, _View4);

    _createClass(ButtonView, [{
      key: 'render',
      value: function render() {
        var a = create('a', ['sw-button']);
        a.href = this.url;
        a.textContent = this.name;
        this.view = a;
      }
    }]);

    return ButtonView;
  })(View);

  /**
   * Link to a document
   */

  var ListElemView = (function (_View5) {
    function ListElemView(options) {
      _classCallCheck(this, ListElemView);

      _get(Object.getPrototypeOf(ListElemView.prototype), 'constructor', this).call(this);
      this.url = options.url;
      this.name = options.name;
      this.render();
    }

    _inherits(ListElemView, _View5);

    _createClass(ListElemView, [{
      key: 'render',
      value: function render() {
        var li = create('li', ['sw-listElem']);
        var a = create('a');
        a.href = this.url;
        a.textContent = this.name;
        li.appendChild(a);
        this.view = li;
      }
    }]);

    return ListElemView;
  })(View);

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

  var getSection = function getSection(arr, section) {
    return arr.sections.filter(function (sec) {
      return sec.section === section;
    })[0];
  };

  var fetchData = function fetchData(url, cb) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function (e) {
      cb(JSON.parse(xhr.responseText));
    };
    xhr.onerror = function (e) {
      throw new Error(xhr.statusText);
    };
    xhr.open('GET', url, true);
    xhr.send();
  };

  var toggleVisibility = function toggleVisibility(elem) {
    elem.classList.toggle('is-visible');
  };

  var bindEvents = function bindEvents(triggerEl, rootEl, closeEl) {
    var toggleRootVisibility = function toggleRootVisibility() {
      return toggleVisibility(rootEl);
    };
    var escapeKeyUpListener = function escapeKeyUpListener(evt) {
      if (rootEl.classList.contains('is-visible') && evt.keyCode === 27) toggleRootVisibility();
    };
    var outsideClickListener = function outsideClickListener(evt) {
      if (evt.target === rootEl) toggleRootVisibility();
    };

    listen(triggerEl, 'click', toggleRootVisibility);
    listen(closeEl, 'click', toggleRootVisibility);
    listen(rootEl, 'click', outsideClickListener);
    listen(document, 'keyup', escapeKeyUpListener);

    exported.toggle = toggleRootVisibility;
  };

  var unbindEvents = function unbindEvents(triggerEl, rootEl, closeEl) {
    unlisten(triggerEl, 'click', triggerEl.swListeners.get('click'));
    unlisten(closeEl, 'click', closeEl.swListeners.get('click'));
    unlisten(rootEl, 'click', rootEl.swListeners.get('click'));
    unlisten(document, 'keyup', document.swListeners.get('keyup'));
  };

  var validateParams = function validateParams(params) {
    if (!hasProp('section', params)) throw new Error('Missing parameter \'section\'');
    if (!hasProp('elem', params)) throw new Error('Missing parameter \'elem\'');
    if (!hasProp('url', params) && !hasProp('data', params)) throw new Error('Missing parameter: either \'url\' or \'data\' have to be present');
    return true;
  };

  var storeData = function storeData(data, sectionName) {
    var section = getSection(data, sectionName);
    store.set('data', section);
    store.set('section', section.title);
    store.set('footer', data.footer);
  };

  var mountApp = function mountApp(params) {
    var app = new OuterView();
    var rootEl = document.body.appendChild(app.view);
    var button = document.querySelector(params.elem);
    var closeEl = document.querySelector('.js-close');
    bindEvents(button, rootEl, closeEl);
  };

  var unmountApp = function unmountApp(params) {
    var rootEl = document.querySelector('.sw-outerContainer');
    var button = document.querySelector(params.elem);
    var closeEl = document.querySelector('.js-close');
    rootEl.parentNode.removeChild(rootEl);
    unbindEvents(button, rootEl, closeEl);
  };

  /**
   * Get data and initialize widget
   */

  var initApp = function initApp(params) {
    var launch = function launch(mode) {
      if (mode === 'data') {
        return function () {
          storeData(params.data, params.section);
          mountApp(params);
        };
      }
      if (mode === 'url') {
        return function (apiResponse) {
          storeData(apiResponse, params.section);
          mountApp(params);
        };
      }
    };

    if (hasProp('data', params)) launch('data')();else if (hasProp('url', params)) fetchData(params.url, launch('url'));
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

  return function (params) {
    if (samwise.mounted) unmountApp(params);
    validateParams(params);
    initApp(params);
    samwise.mounted = true;
    extend(samwise, exported);
  };
})();