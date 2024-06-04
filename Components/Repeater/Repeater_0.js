// 15.04.2023; 02.2024


import {Common} from '../../Units/Common/Common.js';
import {Component} from '../Component/Component.js';
import {Model} from '../../Units/Model/Model.js';


export class Repeater extends Component {
    static _attributes = {
        ...super._attributes,

        interpolation: '',
        model: {
            default: 0,
            range: [1, Infinity],
        },
        target: '',
    };


    static delegate_selector = 'template[Repeater__delegate]';
    static item_filtered_attribute = '_Repeater__filtered';
    static model_selector = 'template[Repeater__model]';

    static Manager = class Manager {
        _elements = null;
        _item = null;
        _key = null;
        _model = null;
        _model_item = null;


        _elements__define() {
            let elements = this._item.querySelectorAll('[id]');
            this._elements = {};

            for (let element of elements) {
                this._elements[element.id] = element;
            }
        }


        constructor({item, key, model} = {}) {
            this._item = item;
            this._key = key;
            this._model = model;
            this._model_item = this._model.get(this._key);
            this._elements__define();
        }

        data__apply() {}

        data__update() {}

        index__apply() {}

        init() {}
    };


    static {
        this.define();
    }


    _content_initial = null;
    _delegate = null;
    _delegate_html = '';
    _item_template = document.createElement('template');
    _items = new Map();
    _model = null;
    _target = this;

    _model_eventListeners = {
        add: this._model__on_add.bind(this),
        clear: this._model__on_clear.bind(this),
        delete: this._model__on_delete.bind(this),
        fill: this._model__on_fill.bind(this),
        filter: this._model__on_filter.bind(this),
        order: this._model__on_order.bind(this),
        update: this._model__on_update.bind(this),
    };


    Manager = this.constructor.Manager;


    get delegate() {
        return this._delegate;
    }
    set delegate(arg) {
        if (arg instanceof HTMLTemplateElement) {
            let [delegate, script] = arg.content.children;

            this._delegate = delegate || null;

            if (script) {
                this.Manager = Common.execute_expression(script.text, {Repeater: this.constructor}) || this.Manager;
            }
        }
        else {
            this._delegate = arg;
        }

        this._delegate_html = this.interpolation && this._delegate?.outerHTML || '';
    }

    get interpolation() {
        return this._attributes.interpolation;
    }
    set interpolation(interpolation) {
        this._attribute__set('interpolation', interpolation);
    }

    get model() {
        return this._model;
    }
    set model(model) {
        if (this.model instanceof Model) {
            this.model.eventListeners__remove(this._model_eventListeners);
        }

        this._model = model || new Model();
        this._attribute__set('model', this._model);

        if (this.model instanceof Model) {
            this.model.eventListeners__add(this._model_eventListeners);
        }

        this.refresh();
    }

    get target() {
        return this._target;
    }
    set target(target) {
        this.target.textContent = '';

        if (target instanceof HTMLElement) {
            this._target = target;
            this._attribute__set('target');
        }
        else {
            try {
                this._target = this.parentElement.querySelector(target);
            }
            catch {
                this._target = null;
            }

            if (this._target) {
                this._attribute__set('target', target);
            }
            else {
                this._target = this;
                this._attribute__set('target');
            }
        }

        // this.refresh();
    }


    _content_initial__define() {
        let template = document.createElement('template');
        template.innerHTML = this.innerHTML;
        this._content_initial = template.content;
        this.textContent = '';
    }

    _init() {
        this._content_initial__define();
        this.props__sync('model', 'target');

        this.delegate = this._content_initial.querySelector(this.constructor.delegate_selector);
        this._model_data__define();

        this.refresh();
    }

    _item__create(key, model_item = null) {
        model_item ||= this.model.get(key);

        let item = null;

        if (this.interpolation) {
            this._item_template.innerHTML = this.constructor.interpolate(this._delegate_html, this.interpolation, model_item);
            item = this._item_template.content.children[0];
        }
        else {
            item = this.delegate.cloneNode(true);
        }

        if (this.model instanceof Model) {
            item.Repeater__manager = new this.Manager({item, key, model: this.model});
            this.constructor.attribute__set(item, this.constructor.item_filtered_attribute, model_item._filtered);
        }

        this._items.set(key, item);

        return item;
    }

    _item__update(key) {
        if (!this.delegate) return;

        if (this.interpolation) {
            let item_prev = this._items.get(key);
            let item = this._item__create(key);
            item_prev ? item_prev.replaceWith(item) : this.target.append(item);
        }
        else {
            let item = this._items.get(key);
            item.Repeater__manager?.data__apply();
        }
    }

    async _items__add(model_items) {
        if (!this.delegate) return;

        let items = [];

        for (let key of model_items.keys()) {
            let item = this._item__create(key);
            items.push(item);
        }

        this.target.append(...items);
        await this._items__await(items);

        for (let item of items) {
            item.Repeater__manager?.init();
        }

        // let promises = items.map((item) => item.Repeater__manager?.init());
        // await Promise.allSettled(promises);

        this.event__dispatch('add', {items});
    }

    async _items__await(items) {
        let promises = items.map((item) => item._built);
        await Promise.all(promises);
    }

    _items__clear() {
        this.target.textContent = '';
        this._items.clear();
    }

    async _items__define() {
        if (!this.delegate) return;

        let items = [];
        this._items__clear();

        if (this.model instanceof Model) {
            for (let key of this.model._items_keys) {
                let item = this._item__create(key);
                items.push(item);
            }
        }
        else {
            for (let i = 0; i < this.model; i++) {
                let model_item = {
                    _index: i,
                    data: i + 1,
                };
                let item = this._item__create(i, model_item);
                items.push(item);
            }
        }

        this.target.append(...items);
        await this._items__await(items);

        for (let item of items) {
            item.Repeater__manager?.init();
        }

        // let promises = items.map((item) => item.Repeater__manager?.init());
        // await Promise.allSettled(promises);

        this.event__dispatch('define', {items});
    }

    _items__delete(model_items) {
        if (this.interpolation) {
            this._items__define();

            return;
        }

        for (let key of model_items.keys()) {
            let item = this._items.get(key);

            if (!item) continue;

            item.remove();
            this._items.delete(key);
        }

        this._items_indexes__apply();

        this.event__dispatch('delete');
    }

    _items__filter() {
        for (let [key, item] of this._items) {
            let model_item = this.model.get(key);
            this.constructor.attribute__set(item, this.constructor.item_filtered_attribute, model_item._filtered);
        }

        this.event__dispatch('filter');
    }

    _items__order() {
        if (this.interpolation) {
            this._items__define();

            return;
        }

        let items = [];

        for (let key of this.model._items_keys) {
            let item = this._items.get(key);
            items.push(item);
        }

        this.target.textContent = '';
        this.target.append(...items);

        this._items_indexes__apply();

        this.event__dispatch('order');
    }

    _items_indexes__apply() {
        for (let item of this._items.values()) {
            item.Repeater__manager?.index__apply();
        }
    }

    _model__on_add(event) {
        this._items__add(event.detail.items);
    }

    _model__on_clear() {
        this._items__clear();
    }

    _model__on_delete(event) {
        this._items__delete(event.detail.items);
    }

    _model__on_fill() {
        this._items__define();
    }

    _model__on_filter() {
        this._items__filter();
    }

    _model__on_order() {
        this._items__order();
    }

    _model__on_update(event) {
        this._item__update(event.detail.key);
    }

    _model_data__define() {
        if (!(this.model instanceof Model)) return;

        let template = this._content_initial.querySelector(this.constructor.model_selector);
        let script = template?.content.children[0];

        if (!script) return;

        let items = Common.execute_expression(script.text) || [];
        this.model.fill(items);
    }


    refresh() {
        this._items__define();
    }
}
