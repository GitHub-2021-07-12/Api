// 02.06.2024


import {Common} from '../Common/Common.js';
import {EventManager} from '../EventManager/EventManager.js';


export class Model extends EventManager {
    static item_prop_default = 'data';


    _items = [];
    _items_filter = this._items_filter.bind(this);
    _items_sorter = this._items_sorter.bind(this);


    filter_prop = this.constructor.item_prop_default;
    filter_regExp = null;
    sort_order = 1;
    sort_prop = this.constructor.item_prop_default;


    _item__proc(item) {
        if (!(item instanceof Object)) {
            item = {[this.constructor.item_prop_default]: item};
        }

        item._filtered = false;
        item._index = NaN;

        return item;
    }

    _items_filter(item) {
        return !!this.filter_regExp.test(item[this.filter_prop]);
    }

    _items_indexes__define(index_begin = 0) {
        for (let i = index_begin; i < this._items.length; i++) {
            this._items[i]._index = i;
        }
    }

    _items_sorter(item_1, item_2) {
        let prop_1 = item_1[this.sort_prop];
        let prop_2 = item_2[this.sort_prop];

        return prop_1 > prop_2 ? this.sort_order : (prop_1 < prop_2 ? -this.sort_order : !prop_1);
    }


    add(items, index = Infinity) {
        index = Common.to_range(index, 0, this._items.length);
        items = items instanceof Array ? items : [items];

        if (!items.length) return;

        items = items.map((item) => this._item__proc(item));
        this._items.splice(index, 0, ...items);
        this._items_indexes__define(index);

        this.event__dispatch('add', {index, items});
    }

    clear() {
        this._items.length = 0;

        this.event__dispatch('clear');
    }

    delete(indexes) {
        if (!this._items.length) return;

        indexes = indexes instanceof Array ? indexes : [indexes];

        let items = [];

        for (let index of indexes) {
            let item = this._items[index];

            if (!item) continue;

            items.push(item);

            delete this._items[index];
        }

        if (!items.length) return;

        this._items = this._items.flat();
        this._items_indexes__define();

        this.event__dispatch('delete', {items});
    }

    delete_group(index, count = 1) {
        if (!this._items.length) return;

        count = Common.to_range(count, 1, this._items.length);
        index = Common.to_range(index, 0, this._items.length - count);

        let items = this._items.splice(index, count);
        this._items_indexes__define(index);

        this.event__dispatch('delete', {items});
    }

    filter(filter = this._items_filter) {
        if (!this._items.length || filter == this._items_filter && (!this.filter_prop || !this.filter_regExp)) return;

        for (let item of this._items) {
            item._filtered = !filter(item);
        }

        this.event__dispatch('filter');
    }

    get(index) {
        index = Common.to_range(index, 0, this._items.length - 1);

        return this._items[index];
    }

    move(index_from, index_to, count = 1) {
        if (this._items.length < 2) return;

        count = Common.to_range(count, 1, this._items.length);
        let index_max = this._items.length - count;
        index_from = Common.to_range(index_from, 0, index_max);
        index_to = Common.to_range(index_to, 0, index_max);

        if (index_from == index_to) return;

        let items = this._items.splice(index_from, count);
        this._items.splice(index_to, 0, ...items);
        this._items_indexes__define(Math.min(index_from, index_to));

        this.event__dispatch('order');
    }

    sort(sorter = this._items_sorter) {
        if (!this._items.length || sorter == this._items_sorter && (!this.sort_order || !this.sort_prop)) return;

        this._items.sort(sorter);
        this._items_indexes__define();

        this.event__dispatch('order');
    }

    update(index, props) {
        let item = this.get(index);

        if (!item) return;

        let changed = false;
        let item_props_prev = {...item};

        for (let k in props) {
            if (item[k] === props[k] || k.startsWith('_')) continue;

            changed = true;
            item[k] = props[k];
        }

        if (!changed) return;

        this.event__dispatch('update', {item, item_props_prev});
    }
}
