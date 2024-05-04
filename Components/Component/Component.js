// 25.12.2020


import {Class} from '../../Units/Class/Class.js';
import {Common} from '../../Units/Common/Common.js';
import {EventManager} from '../../Units/EventManager/EventManager.js';


export class Component extends Class.mix(HTMLElement, EventManager) {
    static _attributes = {};
    static _components = [];
    static _css = '';
    static _defined = null;
    static _dom = null;
    static _html = '';
    static _interpolation_regExp = /\${\s*(?<key>.*?)\s*:\s*(?<value>.+?)\s*}/g;
    static _shadow_opts = {mode: 'closed'};
    static _tag_prefix = 'x';
    static _url = '';


    static observedAttributes = [];


    static _dom__create() {
        if (typeof this._css != 'string') {
            this._css = '';
        }

        if (typeof this._html != 'string') {
            this._html = '';
        }

        if (!this._css && !this._html) return;

        let template = document.createElement('template');

        if (this._html) {
            template.innerHTML = this._html;
        }

        if (this._css) {
            let style = document.createElement('style');
            style.textContent = this._css;
            template.content.append(style);
        }

        this._dom = template.content;
    }

    static _observedAttributes__define() {
        this.observedAttributes = [];

        for (let attribute_name of Object.keys(this._attributes)) {
            if (attribute_name.startsWith('_')) continue;

            let attribute_name_lowCase = attribute_name.toLowerCase();
            this.observedAttributes[attribute_name_lowCase] = attribute_name;
            this.observedAttributes.push(attribute_name_lowCase);
        }
    }

    static _resource_content__proc(resource_content) {
        let f = (match, key, value) => {
            if (key == 'url') {
                return `${this._url}/${value}`;
            }
        };

        return resource_content.replace(this._interpolation_regExp, f);
    }

    static async _resources__define() {
        if (!this._url || !this._css && !this._html) return;

        let promises = [];

        if (this._css === true) {
            promises[0] = fetch(`${this._url}/${this.name}.css`).then((response) => response.text());
        }

        if (this._html === true) {
            promises[1] = fetch(`${this._url}/${this.name}.html`).then((response) => response.text());
        }

        let promises_results = await Promise.allSettled(promises);
        let css = promises_results[0]?.value || this._css;
        let html = promises_results[1]?.value || this._html;

        this._css = this._resource_content__proc(css);
        this._html = this._resource_content__proc(html);
    }


    static attribute__get(element, attribute_name, attribute_constructor = null) {
        let attribute_value = element.getAttribute(attribute_name);

        if (attribute_value == null) return null;

        if (attribute_constructor == Boolean) {
            attribute_value = attribute_value != null;
        }
        else if (attribute_constructor == Number) {
            attribute_value = +attribute_value;
        }

        return attribute_value;
    }

    static attribute__set(element, attribute_name, attribute_value = null) {
        if (attribute_value === false || attribute_value == null) {
            element.removeAttribute(attribute_name);

            return;
        }

        if (attribute_value === true) {
            attribute_value = '';
        }

        element.setAttribute(attribute_name, attribute_value);
    }

    static css__get(element, prop_name) {
        return getComputedStyle(element)[prop_name];
    }

    static css_numeric__get(element, prop_name) {
        let prop_value = this.css__get(element, prop_name);

        return parseFloat(prop_value);
    }

    static height_inner__get(element) {
        return element.clientHeight - this.css_numeric__get(element, 'paddingTop') - this.css_numeric__get(element, 'paddingBottom');
    }

    static height_inner__set(element, height = null) {
        if (!height && height !== 0) {
            element.style.height = '';

            return;
        }

        let css_height = height;

        if (this.css__get(element, 'boxSizing') == 'border-box') {
            css_height += this.css_numeric__get(element, 'borderTopWidth') + this.css_numeric__get(element, 'borderBottomWidth') + this.css_numeric__get(element, 'paddingTop') + this.css_numeric__get(element, 'paddingBottom');
        }

        element.style.height = `${css_height}px`;
    }

    static height_outer__get(element) {
        if (!this.visible__get(element)) return 0;

        return element.offsetHeight + this.css_numeric__get(element, 'marginTop') + this.css_numeric__get(element, 'marginBottom');
    }

    static height_outer__set(element, height = null) {
        if (!height && height !== 0) {
            element.style.height = '';

            return;
        }

        let css_height = height - this.css_numeric__get(element, 'marginTop') - this.css_numeric__get(element, 'marginBottom');

        if (this.css__get(element, 'boxSizing') != 'border-box') {
            css_height -= this.css_numeric__get(element, 'borderTopWidth') + this.css_numeric__get(element, 'borderBottomWidth') + this.css_numeric__get(element, 'paddingTop') + this.css_numeric__get(element, 'paddingBottom');
        }

        css_height = Math.max(css_height, 0);
        element.style.height = `${css_height}px`;
    }

    static async init() {
        if (customElements.getName(this)) return;

        this._url = this._url.replace(/\/[^/]+$/, '');
        this._observedAttributes__define();

        let defined_resolve = null;
        this._defined = new Promise((resolve) => defined_resolve = resolve);

        await this._resources__define();
        this._dom__create();

        let components_defined = this._components.map((item) => item._defined);
        await Promise.all(components_defined);

        let tag = `${this._tag_prefix}-${this.name.toLowerCase()}`;
        customElements.define(tag, this);

        defined_resolve();
    }

    static left__get(element) {
        if (!element.offsetParent) return 0;

        return element.offsetLeft - this.css_numeric__get(element, 'marginLeft') - this.css_numeric__get(element.offsetParent, 'paddingLeft');
    }

    static left__set(element, left = null) {
        if (!left && left !== 0) {
            element.style.left = '';

            return;
        }

        let css_left_prev = this.css_numeric__get(element, 'left');
        let left_prev = this.left__get(element);

        if (css_left_prev == 'auto') {
            css_left_prev = this.css__get(element, 'position') == 'relative' ? 0 : left_prev;
        }

        let css_left = css_left_prev + left - left_prev;
        element.style.left = `${css_left}px`;
    }

    static path__get(element, root = null) {
        let path = [];
        let aim = element;

        while (aim && aim != root) {
            path.push(aim);
            aim = aim.parentElement;
        }

        path.reverse();

        return path;
    }

    static top__get(element) {
        if (!element.offsetParent) return 0;

        return element.offsetTop - this.css_numeric__get(element, 'marginTop') - this.css_numeric__get(element.offsetParent, 'paddingTop');
    }

    static top__set(element, top = null) {
        if (!top && top !== 0) {
            element.style.top = '';

            return;
        }

        let css_top_prev = this.css_numeric__get(element, 'top');
        let top_prev = this.top__get(element);

        if (css_top_prev == 'auto') {
            css_top_prev = this.css__get(element, 'position') == 'relative' ? 0 : top_prev;
        }

        let css_top = css_top_prev + top - top_prev;
        element.style.top = `${css_top}px`;
    }

    static visible__get(element) {
        return element.offsetHeight && element.offsetWidth;
    }

    static width_inner__get(element) {
        return element.clientWidth - this.css_numeric__get(element, 'paddingLeft') - this.css_numeric__get(element, 'paddingRight');
    }

    static width_inner__set(element, width = null) {
        if (!width && width !== 0) {
            element.style.width = '';

            return;
        }

        let css_width = width;

        if (this.css__get(element, 'boxSizing') == 'border-box') {
            css_width += this.css_numeric__get(element, 'borderLeftWidth') + this.css_numeric__get(element, 'borderRightWidth') + this.css_numeric__get(element, 'paddingLeft') + this.css_numeric__get(element, 'paddingRight');
        }

        element.style.width = `${css_width}px`;
    }

    static width_outer__get(element) {
        if (!this.visible__get(element)) return 0;

        return element.offsetWidth + this.css_numeric__get(element, 'marginLeft') + this.css_numeric__get(element, 'marginRight');
    }

    static width_outer__set(element, width = null) {
        if (!width && width !== 0) {
            element.style.width = '';

            return;
        }

        let css_width = width - this.css_numeric__get(element, 'marginLeft') - this.css_numeric__get(element, 'marginRight');

        if (this.css__get(element, 'boxSizing') != 'border-box') {
            css_width -= this.css_numeric__get(element, 'borderLeftWidth') + this.css_numeric__get(element, 'borderRightWidth') + this.css_numeric__get(element, 'paddingLeft') + this.css_numeric__get(element, 'paddingRight');
        }

        css_width = Math.max(css_width, 0);
        element.style.width = `${css_width}px`;
    }


    static {
        this.init();
    }


    _attributes = null;
    _attributes_observing = true;
    _built = false;
    _elements = null;
    _slots = null;
    _shadow = null;


    _attribute__get(attribute_name) {
        let attribute_descriptor = this.constructor._attributes[attribute_name];
        let attribute_value_default = attribute_descriptor instanceof Object ? attribute_descriptor.default : attribute_descriptor;

        return this.attribute__get(attribute_name, attribute_value_default?.constructor);
    }

    _attribute__set(attribute_name, attribute_value = null) {
        let attribute_descriptor = this.constructor._attributes[attribute_name];

        let attribute_value_default = attribute_descriptor instanceof Object ? attribute_descriptor.default : attribute_descriptor;

        if (attribute_value == null) {
            attribute_value = attribute_value_default;
        }
        else {
            let attribute_constructor = attribute_value_default?.constructor;

            if (attribute_constructor == Boolean) {
                attribute_value = !!attribute_value;
            }
            else if (attribute_constructor == Number) {
                attribute_value = +attribute_value;
            }
            else {
                attribute_value += '';
            }

            if (
                attribute_descriptor?.enum && !attribute_descriptor.enum.includes(attribute_value)
                || attribute_descriptor?.range && !Common.in_range(attribute_value, ...attribute_descriptor.range)
            ) {
                attribute_value = attribute_value_default;
            }
        }

        this._attributes[attribute_name] = attribute_value;

        if (!attribute_descriptor?.persistent && attribute_value == attribute_value_default && attribute_value !== true) {
            attribute_value = null;
        }

        this._attributes_observing = false;
        this.attribute__set(attribute_name, attribute_value);
        this._attributes_observing = true;
    }

    _attributes__init() {
        this._attributes = {};

        for (let attribute_name of Object.keys(this.constructor._attributes)) {
            this._attribute__set(attribute_name, this._attribute__get(attribute_name));
        }
    }

    _build() {
        if (this._built) return;

        let dom = this.constructor._dom?.cloneNode(true);

        if (dom) {
            this._shadow = this.attachShadow(this.constructor._shadow_opts);
            this._shadow.append(dom);
            this._elements__define();
            this._slots__define();
        }

        this._attributes__init();
        this._init();

        this._built = true;
    }

    _elements__define() {
        let elements = this._shadow.querySelectorAll('[id]');
        this._elements = {};

        for (let element of elements) {
            this._elements[element.id] = element;
        }
    }

    _init() {}

    _slots__define() {
        let slots = this._shadow.querySelectorAll('slot');
        this._slots = {};

        for (let slot of slots) {
            let elements_assigned = slot.assignedElements();
            let elements = elements_assigned.length ? elements_assigned : slot.children;
            this._slots[slot.name] = elements.length > 1 ? elements : elements[0];
        }
    }


    attributeChangedCallback(attribute_name, attribute_value_prev, attribute_value) {
        if (!this._attributes_observing || !this._built || attribute_value == attribute_value_prev) return;

        attribute_name = this.constructor.observedAttributes[attribute_name];
        this[attribute_name] = this._attribute__get(attribute_name);
    }

    attribute__get(attribute_name, attribute_constructor = null) {
        return this.constructor.attribute__get(this, attribute_name, attribute_constructor);
    }

    attribute__set(attribute_name, attribute_value = null) {
        this.constructor.attribute__set(this, attribute_name, attribute_value);
    }

    connectedCallback() {
        this._build();
    }

    css__get(prop_name) {
        return this.constructor.css__get(this, prop_name);
    }

    css_numeric__get(prop_name) {
        return this.constructor.css_numeric__get(this, prop_name);
    }

    height_inner__get() {
        return this.constructor.height_inner__get(this);
    }

    height_inner__set(height = null) {
        return this.constructor.height_inner__set(this, height);
    }

    height_outer__get() {
        return this.constructor.height_outer__get(this);
    }

    height_outer__set(height = null) {
        return this.constructor.height_outer__set(this, height);
    }

    left__get() {
        return this.constructor.left__get(this);
    }

    left__set(left = null) {
        return this.constructor.left__set(this, left);
    }

    path__get(root = null) {
        return this.constructor.path__get(this, root);
    }

    props__sync(...props_names) {
        props_names = props_names.length ? props_names : Object.keys(this.constructor._attributes);

        for (let prop_name of props_names) {
            this[prop_name] = this._attributes[prop_name];
        }
    }

    top__get() {
        return this.constructor.top__get(this);
    }

    top__set(top = null) {
        return this.constructor.top__set(this, top);
    }

    visible__get() {
        return this.constructor.visible__get(this);
    }

    width_inner__get() {
        return this.constructor.width_inner__get(this);
    }

    width_inner__set(width = null) {
        return this.constructor.width_inner__set(this, width);
    }

    width_outer__get() {
        return this.constructor.width_outer__get(this);
    }

    width_outer__set(width = null) {
        return this.constructor.width_outer__set(this, width);
    }
}
