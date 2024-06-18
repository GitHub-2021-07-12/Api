// 25.12.2020; 06.05.2024


import {Class} from '../../Units/Class/Class.js';
import {Common} from '../../Units/Common/Common.js';
import {EventManager} from '../../Units/EventManager/EventManager.js';
import {ExternalPromise} from '../../Units/ExternalPromise/ExternalPromise.js';


export class Component extends Class.mix(HTMLElement, EventManager) {
    static _components = [];
    static _defined = null;
    static _dom = null;
    static _elements = {};
    static _tag = '';

    static _attributes = {
        _building: false,
    };


    static css = '';
    static css_url = '';
    static elements_classes = {};
    static html = '';
    static html_url = '';
    static interpolation_regExp = /{{\s*(?<key>.*?)(?:\s*:\s*(?<value>.*?))?\s*}}/g;
    static observedAttributes = [];
    static resource_awaited_selector = 'link, style';
    static resources = {};
    static shadow_opts = {mode: 'closed'};
    static tag_prefix = 'x';
    static url = '';


    static async _components__await() {
        let promises = this._components.map((item) => item?._defined);
        await Promise.all(promises);
    }

    static async _dom__create() {
        let html = '';

        if (this.html) {
            html = this.html;
        }
        else if (this.html_url) {
            let html_url = this.html_url === true ? new URL(`${this.name}.html`, this.url) : this.html_url;
            let response = await fetch(html_url);
            html = await response.text();
        }

        if (!html) return;

        let template = document.createElement('template');
        template.innerHTML = this.interpolate(html, 'resource', this.resources);
        this._dom = template.content;

        this._elements_classes__define();
        this._dom_style__create();
    }

    static _dom_style__create() {
        if (this.css) {
            let style = document.createElement('style');
            style.textContent = this.css;
            this._dom.prepend(style);
        }
        else if (this.css_url) {
            let link = document.createElement('link');
            link.href = this.css_url === true ? new URL(`${this.name}.css`, this.url) : this.css_url;
            link.rel = 'stylesheet';
            this._dom.prepend(link);
        }
    }

    static _elements_classes__define() {
        let elements = this.elements__get(this._dom, this._elements);

        for (let [key, value] of Object.entries(this.elements_classes)) {
            let element = elements[key];
            let cssClasses = value.split?.(/\s+/) || value;

            for (let cssClass of cssClasses) {
                element.classList.add(cssClass);
            }
        }
    }

    static _observedAttributes__define() {
        this.observedAttributes = [];

        for (let attribute_name of Object.keys(this._attributes)) {
            if (attribute_name.startsWith('_')) continue;

            let attribute_name_lowerCase = attribute_name.toLowerCase();
            this.observedAttributes[attribute_name_lowerCase] = attribute_name;
            this.observedAttributes.push(attribute_name_lowerCase);
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

    static coords__get(element) {
        let domRect = element.getBoundingClientRect();

        return {
            x: domRect.x + window.scrollX - this.css_numeric__get('marginLeft'),
            y: domRect.y + window.scrollY - this.css_numeric__get('marginTop'),
        };
    }

    static css__get(element, prop_name) {
        return getComputedStyle(element)[prop_name];
    }

    static css_numeric__get(element, prop_name) {
        let prop_value = this.css__get(element, prop_name);

        return parseFloat(prop_value);
    }

    static async define() {
        if (customElements.getName(this)) return;

        this._tag = `${this.tag_prefix}-${this.name}`.toLowerCase();
        this._defined = customElements.whenDefined(this._tag);
        this._observedAttributes__define();

        await new Promise(setTimeout);

        await Promise.all([
            this._components__await(),
            this._dom__create(),
        ]);
        customElements.define(this._tag, this);
    }

    static elements__get(dom, elements_descriptors) {
        let elements = {};

        for (let [key, value] of Object.entries(elements_descriptors)) {
            if (value instanceof Array) {
                let elements_sub = [];
                let selectors = value;

                for (let selector of selectors) {
                    elements_sub.push(...dom.querySelectorAll(selector));
                }

                elements[key] = elements_sub;
            }
            else {
                let selector = value;

                if (!selector) {
                    selector = `.${key}`;
                }
                else if (selector.length == 1) {
                    selector = `${selector}${key}`;
                }

                elements[key] = dom.querySelector(selector);
            }
        }

        return elements;
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

    static identifier__to_camel(identifier) {
        return identifier.replace(/-([a-z])/gi, (match, char) => char.toUpperCase());
    }

    static identifier__to_hyphen(identifier) {
        return identifier.replace(/[A-Z]/g, '-$&').toLowerCase();
    }

    static interpolate(string, key, interpolations) {
        let f = (match, string_key, string_value) => {
            if (string_key != key) return match;

            return Common.extract(interpolations, string_value) ?? '';
        };

        return string.replace(this.interpolation_regExp, f);
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

    static async resources__await(elements) {
        let promises = [];

        for (let element of elements) {
            let resource_url = element.href || element.src;

            if (!resource_url || resource_url == location.href) continue;

            let promise = new ExternalPromise();
            promises.push(promise);

            let resource__on_error = () => promise.reject();
            let resource__on_load = () => {
                element.removeEventListener('error', resource__on_error);
                promise.fulfill();
            };

            element.addEventListener('error', resource__on_error, {once: true});
            element.addEventListener('load', resource__on_load, {once: true});
        }

        await Promise.allSettled(promises);
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
        return !!(element.offsetHeight && element.offsetWidth);
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
        this.define();
    }


    _attributes = {};
    _attributes_observing = false;
    _built = new ExternalPromise();
    _elements = {};
    _slots = {};
    _shadow = null;


    get _building() {
        return this._attributes._building;
    }
    set _building(building) {
        this._attribute__set('_building', building);
    }


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

        let attributes_observing = this._attributes_observing;
        this._attributes_observing = false;
        this.attribute__set(attribute_name, attribute_value);
        this._attributes_observing = attributes_observing;
    }

    _attributes__init() {
        this._attributes = {};

        for (let attribute_name of Object.keys(this.constructor._attributes)) {
            this._attribute__set(attribute_name, this._attribute__get(attribute_name));
        }
    }

    async _build() {
        if (this._attributes_observing) return;

        this._attributes_observing = true;
        this._attributes__init();
        this._building = true;

        if (this.constructor._dom) {
            this._shadow = this.attachShadow(this.constructor.shadow_opts);
            this._shadow.append(this.constructor._dom.cloneNode(true));

            this._elements = this.constructor.elements__get(this._shadow, this.constructor._elements);
            this._slots__define();

            await Promise.all([
                this._elements__await(),
                this.constructor.resources__await(this._shadow.querySelectorAll(this.constructor.resource_awaited_selector)),
            ]);
        }

        await this._init();
        this._eventListeners__define();

        this._building = false;
        this._built.fulfill(true);
    }

    async _elements__await() {
        let elements = [];

        for (let component of this.constructor._components) {
            let component_elements = this._shadow.querySelectorAll(component._tag);
            elements.push(...component_elements);
        }

        let promises = elements.map((item) => item?._built);
        await Promise.all(promises);
    }

    _eventListeners__define() {}

    _eventListeners_shadow__add(eventListeners, opts = null) {
        let eventTarget = this._shadow ?? this;
        this.constructor.eventListeners__add(eventTarget, eventListeners, opts);
    }

    _eventListeners_shadow__remove(eventListeners, opts = null) {
        let eventTarget = this._shadow ?? this;
        this.constructor.eventListeners__remove(eventTarget, eventListeners, opts);
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

    coords__get() {
        return this.constructor.coords__get(this);
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
