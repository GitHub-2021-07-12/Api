// 02.06.2024


import {Component} from '../Component/Component.js';

import {Common} from '../../Units/Common/Common.js';
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

    static _eventListeners_model = {
        add: '_model__on_add',
        clear: '_model__on_clear',
        delete: '_model__on_delete',
        filter: '_model__on_filter',
        order: '_model__on_order',
        update: '_model__on_update',
    };


    static Manager = class Manager {
        static _elements = {};
        static _eventListeners = {};
        static _eventListeners_elements = {};


        _elements = {};
        _item = null;
        _model = null;
        _model_item = null;


        constructor({item, model, model_item} = {}) {
            this._item = item;
            this._elements = Component.elements__get(this._item, this.constructor._elements);
            this._eventListeners = Component.eventListeners__proc(this, this.constructor._eventListeners, true);
            this._eventListeners_elements = Component.eventListeners__proc(this, this.constructor._eventListeners_elements, true);
            this._model = model;
            this._model_item = model_item;
            Component.eventListeners__apply(this._item, this._eventListeners);
            Component.eventListeners_grouped__apply(this._elements, this._eventListeners_elements);
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
    _eventListeners_model = {};
    _item_template = document.createElement('template');
    _items = new Map();
    _model = null;
    _target = this;


    Manager = this.constructor.Manager;


    get delegate() {
        return this._delegate;
    }
    set delegate(delegate) {
        if (delegate instanceof HTMLTemplateElement) {
            this._delegate = delegate.content.firstElementChild;

            let script = delegate.content.querySelector('script');

            if (script) {
                this.Manager = Common.execute_expression(script.text, {Repeater: this.constructor}) || this.Manager;
            }
        }
        else {
            this._delegate = delegate;
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
            this.model.eventListeners__remove(this._eventListeners_model);
        }

        if (model instanceof HTMLTemplateElement) {

        }

        this._model = model || new Model();
        this._attribute__set('model', this._model);

        if (this.model instanceof Model) {
            this.model.eventListeners__add(this._eventListeners_model);
        }
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
            let target_selector = target;

            try {
                target = this.parentElement.querySelector(target_selector);
            }
            catch {
                target = null;
            }

            this._target = target || this;
            this._attribute__set('target', target && target_selector);
        }
    }


    _content_initial__define() {
        let template = document.createElement('template');
        template.innerHTML = this.innerHTML;
        this._content_initial = template.content;
        this.textContent = '';
    }

    _eventListeners__define() {
        super._eventListeners__define();

        this._eventListeners_model = this._eventListeners__proc(this.constructor._eventListeners_model, true);
    }

    async _init() {
        this._content_initial__define();
        this.props__sync('model', 'target');

        this.delegate = this._content_initial.querySelector('[Repeater__delegate]');
        this._model_data__define();

        if (!(this.model instanceof Model)) {
            await this._items__define();
        }
    }

    _item__create(model_item) {
        let item = null;

        if (this.interpolation) {
            this._item_template.innerHTML = this.constructor.interpolate(this._delegate_html, this.interpolation, model_item);
            item = this._item_template.content.firstElementChild;
        }
        else {
            item = this.delegate.cloneNode(true);
        }

        item.Repeater__manager = new this.Manager({
            item,
            model: this.model,
            model_item,
        });
        this._items.set(model_item, item);

        return item;
    }

    _item__update(model_item) {
        if (!this.delegate) return;

        if (this.interpolation) {
            let item_prev = this._items.get(model_item);
            let item = this._item__create(model_item);
            item_prev.replaceWith(item);
        }
        else if (this.model instanceof Model) {
            let item = this._items.get(model_item);
            item.Repeater__manager.data__apply();
        }
    }

    async _items__add(model_items) {
        if (!this.delegate) return;

        let index = Infinity;
        let items = [];

        for (let model_item of model_items) {
            index = Math.min(index, model_item._index);
            let item = this._item__create(model_item);
            items.push(item);
        }

        let item = this.target.children[index];
        item ? item.before(...items) : this.target.append(...items);
        await this._items__await(items);
        this._items__init(items);
        this._items_indexes__apply();
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

        this._items__clear();

        if (this.model instanceof Model) {
            for (let model_item of this.model._items) {
                this._item__create(model_item);
            }
        }
        else {
            for (let i = 0; i < this.model; i++) {
                let model_item = {
                    _index: i,
                    data: i + 1,
                };
                this._item__create(model_item);
            }
        }

        if (!this._items.size) return;

        let items = [...this._items.values()]
        this.target.append(...items);
        await this._items__await(items);
        this._items__init(items);
        this.event__dispatch('define', {items});
    }

    _items__delete(model_items) {
        if (this.interpolation) {
            this._items__define();

            return;
        }

        for (let model_item of model_items) {
            let item = this._items.get(model_item);
            item.remove();

            this._items.delete(model_item);
        }

        this._items_indexes__apply();
        this.event__dispatch('delete');
    }

    _items__filter() {
        for (let [model_item, item] of this._items) {
            this.constructor.attribute__set(item, '_Repeater__filtered', model_item._filtered);
        }

        this.event__dispatch('filter');
    }

    _items__init(items) {
        for (let item of items) {
            item.Repeater__manager.init();
        }
    }

    _items__order() {
        if (this.interpolation) {
            this._items__define();

            return;
        }

        let items = this.model._items.map((model_item) => this._items.get(model_item));
        this.target.textContent = '';
        this.target.append(...items);

        this._items_indexes__apply();
        this.event__dispatch('order');
    }

    _items_indexes__apply() {
        for (let item of this._items.values()) {
            item.Repeater__manager.index__apply();
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

    _model__on_filter() {
        this._items__filter();
    }

    _model__on_order() {
        this._items__order();
    }

    _model__on_update(event) {
        this._item__update(event.detail.item);
    }

    _model_data__define() {
        if (!(this.model instanceof Model)) return;

        let template = this._content_initial.querySelector('[Repeater__model]');
        let script = template?.content.firstElementChild;

        if (!script) return;

        let items = Common.execute_expression(script.text);

        if (!items) return;

        this.model.add(items);
    }


    async refresh() {
        await this._items__define();
    }
}
