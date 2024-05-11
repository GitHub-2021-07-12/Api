// 23.04.2023


import {EventManager} from '../../Units/EventManager/EventManager.js';


export class Model extends EventManager {
    static item_prop_default = 'data';


    _items = new Map();
    _items_filter = this._items_filter.bind(this);
    _items_keys = [];
    _items_sorter = this._items_sorter.bind(this);
    _key_new = 0;


    events_dispatch = true;
    filter_prop = this.constructor.item_prop_default;
    filter_regExp = null;
    sort_order = 1;
    sort_prop = this.constructor.item_prop_default;


    _item__create(item) {
        if (!(item instanceof Object)) {
            item = {[this.constructor.item_prop_default]: item};
        }

        item = {
            _filtered: false,
            _index: this._items.size,
            ...item,
        }
        let key = this._key_new++;
        this._items.set(key, item);
        this._items_keys.push(key);

        return [key, item];
    }

    _items_filter(item) {
        if (!this.filter_regExp) return true;

        return this.filter_regExp.test(item[this.filter_prop]) || false;
    }

    _items_indexes__define() {
        for (let i = 0; i < this._items_keys.length; i++) {
            let key = this._items_keys[i];
            let item = this._items.get(key);
            item._index = i;
        }
    }

    _items_sorter(key_1, key_2) {
        let prop_1 = this._items.get(key_1)[this.sort_prop];
        let prop_2 = this._items.get(key_2)[this.sort_prop];

        return prop_1 > prop_2 ? this.sort_order : (prop_1 < prop_2 ? -this.sort_order : !prop_1);
    }


    add(arg) {
        let items = arg instanceof Array ? arg : [arg];
        let items_added = new Map();

        for (let item of items) {
            let entry = this._item__create(item);

            if (!entry) continue;

            items_added.set(...entry);
        }

        if (this.events_dispatch && items_added.size) {
            this.event__dispatch('add', {items: items_added});
        }

        return items_added;
    }

    clear() {
        this._items.clear();
        this._items_keys.length = 0;
        this._key_new = 0;
        this.filter_regExp = null;

        if (!this.events_dispatch) return;

        this.event__dispatch('clear');
    }

    delete(arg) {
        let items_deleted = new Map();
        let keys = arg instanceof Array ? arg : [arg];

        for (let key of keys) {
            if (!this._items.has(key)) continue;

            let item = this._items.get(key);
            this._items.delete(key);
            this._items_keys[item._index] = undefined;

            items_deleted.set(key, item);
        }

        if (items_deleted.size) {
            let items_keys = this._items_keys.filter((item) => item !== undefined);
            this._items_keys.length = 0;
            this._items_keys.push(...items_keys);

            this._items_indexes__define();
        }

        if (this.events_dispatch) {
            this.event__dispatch('delete', {items: items_deleted});
        }

        return items_deleted;
    }

    fill(items) {
        this.clear();

        for (let item of items) {
            this._item__create(item);
        }

        if (!this.events_dispatch) return;

        this.event__dispatch('fill');
    }

    filter(filter = this._items_filter) {
        for (let item of this._items.values()) {
            item._filtered = !filter(item);
        }

        if (!this.events_dispatch) return;

        this.event__dispatch('filter');
    }

    get(key) {
        return this._items.get(key);
    }

    move(index_from, index_to, count = 1) {
        index_from = Math.min(index_from || 0, this._items_keys.length - 1);
        index_to = index_to < 0 ? this._items_keys.length + index_to : index_to || 0;

        if (index_from == index_to) return false;

        let items_keys = this._items_keys.splice(index_from, count);
        this._items_keys.splice(index_to, 0, ...items_keys);
        this._items_indexes__define();

        if (!this.events_dispatch) return;

        this.event__dispatch('order');
    }

    sort(sorter = this._items_sorter) {
        if (!this.sort_order || !this.sort_prop) return;

        this._items_keys.sort(sorter);
        this._items_indexes__define();

        if (!this.events_dispatch) return;

        this.event__dispatch('order');
    }

    update(key, props) {
        let changed = false;
        let item = this._items.get(key);
        let props_prev = {...item};

        for (let k in props) {
            if (item[k] === props[k] || k.startsWith('_')) continue;

            changed = true;
            item[k] = props[k];
        }

        if (!this.events_dispatch || !changed) return;

        this.event__dispatch('update', {key, props, props_prev});
    }
}
