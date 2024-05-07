// 25.12.2020; 06.05.2024


import {Class} from '../../Units/Class/Class.js';
import {Common} from '../../Units/Common/Common.js';
import {EventManager} from '../../Units/EventManager/EventManager.js';


export class Component extends Class.mix(HTMLElement, EventManager) {
    static _attributes = {};
    static _components = [];
    static _defined = null;
    static _dom = null;
    static _html = '';
    static _html_url = '';
    static _interpolation_regExp = /{{\s*(?<key>.*?)(?:\s*:\s*(?<value>.*?))?\s*}}/g;
    static _resources = {};
    static _shadow_opts = {mode: 'closed'};
    static _tag_prefix = 'x';
    // static _url = '';


    static observedAttributes = [];


    static async _components_defined__await() {
        let promises = this._components.map((item) => item._defined);
        await Promise.all(promises);
    }

    static async _dom__create() {
        let html = '';

        if (this._html) {
            html = this._html;
        }
        else if (this._html_url) {
            let response = await fetch(this._html_url);
            html = await response.text();
        }

        if (!html) return;

        let template = document.createElement('template');
        template.innerHTML = this._interpolate(html, this._resources);
        this._dom = template.content;
    }

    static _interpolate(string, interpolations) {
        let f = (match, key, value = '') => {
            let interpolation = interpolations[key];

            return interpolation instanceof Function ? interpolation(value) : interpolation ?? match;
        };

        return string.replace(this._interpolation_regExp, f);
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

    static async init({
        html = this._html,
        html_url = this._html_url,
        // url = this._url,
    } = {}) {
        // this._url = url;
        this._html = html;
        this._html_url = html_url;
        this._observedAttributes__define();

        let defined_resolve = null;
        this._defined = new Promise((resolve) => defined_resolve = resolve);

        // await this._components_defined__await();
        await this._dom__create();

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


    // static {
    //     this.init();
    // }


    _attributes = null;
    _attributes_observing = false;
    _built = null;
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

    async _build() {
        if (this._built) return;

        let built_resolve = null;
        this._built = new Promise((resolve) => built_resolve = resolve);

        if (this.constructor._dom) {
            this._shadow = this.attachShadow(this.constructor._shadow_opts);
            this._shadow.append(this.constructor._dom.cloneNode(true));

            this._slots__define();
            await Promise.all([
                this._elements__define(),
                this._resources__await(),
            ]);
        }

        this._attributes__init();
        this._init();
        // this._attributes_observing = true;

        built_resolve();
    }

    async _elements__define() {
        let elements = this._shadow.querySelectorAll('[id]');
        let promises = [];
        this._elements = {};

        for (let element of elements) {
            this._elements[element.id] = element;

            if (!element._built) continue;

            promises.push(element._built);
        }

        await Promise.all(promises);
    }

    _init() {}

    async _resources__await() {
        let promises = [];
        let resources = this._shadow.querySelectorAll('[component__awaited]');

        for (let resource of resources) {
            let promise_resolve = null;
            let promise = new Promise((resolve) => promise_resolve = resolve);
            promises.push(promise);

            resource.addEventListener('load', () => promise_resolve(), {once: true});
        }

        await Promise.all(promises);
    }

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
        if (!this._attributes_observing || attribute_value == attribute_value_prev) return;

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
