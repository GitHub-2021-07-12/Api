import {Class} from '/Api/Common/Class.js';
import {Css} from '/Api/Common/Css.js';
import {Dom} from '/Api/Common/Dom.js';




export class Component extends Class.mask(HTMLElement) {
  static define(shadow = false, superTag = undefined) {
    this._shadow = shadow;
    
    let tag = 'c' + this.name.replace(/[A-Z]/g, '-$&').toLowerCase();
    
    customElements.define(tag, this, {extends: superTag});
    
    if (!shadow) {
      document.head.append(this.css);
    }
  }
  
  
  
  
  _build() {
    this._root = this;
    
    if (this.constructor._shadow) {
      this._root = this.attachShadow({mode: 'open'});
      
      this._root.append(this.constructor.css.cloneNode(true));
    }
    else if (this.hasChildNodes()) {
      return;
    }
    
    this.classList.add(this.constructor.name);
    
    this._root.append(this.constructor.dom.cloneNode(true));
  }
  
  
  _defineElements(elementSelectors) {
    this._elements = {};
    
    for (let elementName in elementSelectors) {
      let elementSelector = elementSelectors[elementName];
      
      if (!elementSelector) {
        this._elements[elementName] = this._root.querySelector(`.${elementName}`);
      }
      else if (elementSelector instanceof Array) {
        this._elements[elementName] = this._root.querySelectorAll(elementSelector);
      }
      else {
        this._elements[elementName] = this._root.querySelector(elementSelector);
      }
    }
  }
  
  
  
  
  constructor() {
    super();
    
    this._elements = null;
    this._root = null;
  }
}


Component._shadow = false;

Component.css = new Css();
Component.dom = new Dom();




Component.define(true);

