// 28.11.2023


export class Storage extends EventTarget {
    _items = new Map();
    _items_initial = new Map();
    _key_new = -1;


    events_dispatch = true;
    items_cloning = false;
    key_props = ['id'];
    key_separator = '|';
    prop_default = 'data';


    _item__create(item) {
        if (!(item instanceof Object)) {
            item = {[this.prop_default]: item};
        }
        else if (this.items_cloning) {
            item = structuredClone(item);
        }

        let key = this._key__build(item);

        if (this._items.has(key)) return null;

        this._items.set(key, item);

        return [key, item];
    }

    _item__delete(key) {
        key = this._key__proc(key);

        if (!this._items.has(key)) return null;

        let item = this._items.get(key);
        this._items.delete(key);
        this._items_initial.delete(key);

        return [key, item];
    }

    _items__compare(item, item_new) {
        if (!item || !item_new) return false;

        for (let k in item_new) {
            let item_prop = item[k];
            let item_new_prop = item_new[k];

            if (
                item_prop === item_new_prop
                || item_prop instanceof Date && item_new_prop instanceof Date && +item_prop == +item_new_prop
            ) continue;

            return false;
        }

        return true;
    }

    _key__build(item) {
        let key_parts = [];

        for (let key_prop of this.key_props) {
            let key_part = item[key_prop];

            if (key_part == null || key_part < 0) {
                let key = key_part ?? this._key_new--;

                for (let key_prop of this.key_props) {
                    item[key_prop] ??= key;
                }

                return key + '';
            }

            key_parts.push(key_part);
        }

        return key_parts.join(this.key_separator);
    }

    _key__proc(key) {
        return key instanceof Array ? key.join(this.key_separator) : key + '';
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
            this.dispatchEvent(new CustomEvent('added', {detail: {items: items_added}}));
        }

        return items_added;
    }

    clear() {
        this._items.clear();
        this._items_initial.clear();

        if (!this.events_dispatch) return;

        this.dispatchEvent(new CustomEvent('cleared'));
    }

    commit(keys = new Map()) {

    }

    constructor(opts = {}) {
        super();

        if (!opts) return;

        this.init(opts);
    }

    delete(arg) {
        let items_deleted = new Map();

        if (arg instanceof Function) {
            let filter = arg;

            for (let [key, item] of [...this._items]) {
                if (!filter(key, item)) continue;

                let entry = this._item__delete(key);
                items_deleted.set(...entry);
            }
        }
        else {
            let keys = arg instanceof Array ? arg : [arg];

            for (let key of keys) {
                let entry = this._item__delete(key);

                if (!entry) continue;

                items_deleted.set(...entry);
            }
        }

        if (this.events_dispatch && items_deleted.size) {
            this.dispatchEvent(new CustomEvent('deleted', {detail: {items: items_deleted}}));
        }

        return items_deleted;
    }

    fill(items) {
        this._items.clear();
        this._items_initial.clear();

        for (let item of items) {
            this._item__create(item);
        }

        if (!this.events_dispatch) return;

        this.dispatchEvent(new CustomEvent('filled'));
    }

    get(key) {
        key = this._key__proc(key);

        return this._items.get(key);
    }

    init({
        items = [],
        items_cloning = this.items_cloning,
        key_props = this.key_props,
        key_separator = this.key_separator,
    } = {}) {
        this.items_cloning = items_cloning;
        this.key_props = key_props;
        this.key_separator = key_separator;
        this.fill(items);
    }

    update(key, item_props) {
        key = this._key__proc(key);

        if (!this._items.has(key)) return;

        let item = this._items.get(key);
        // let item_prev = Object.assign({}, item);
        let item_prev = {...item};
        Object.assign(item, item_props);
        let key_new = this._key__build(item);

        if (key != key_new) {
            this._items.delete(key);
            this._items.set(key_new, item);
            this._items_initial.delete(key);
        }
        else if (!(key < 0)) {
            let item_initial = this._items_initial.get(key);

            if (this._items__compare(item_initial || item_prev, item)) {
                this._items_initial.delete(key);
            }
            else if (!item_initial) {
                item_initial = Object.assign({}, item_prev);
                this._items_initial.set(key, item_initial);
            }
        }

        if (!this.events_dispatch) return;

        let event_detail = {
            item,
            item_prev,
            key: key_new,
            key_prev: key,
        };
        this.dispatchEvent(new CustomEvent('updated', {detail: event_detail}));
    }
}
