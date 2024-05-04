// 07.12.2023


export class OrderMap extends Map {
    _indexes = new Map();
    _keys = [];


    sort_order = 1;
    sorter = this._sorter.bind(this);


    _indexes__define() {
        for (let i = 0; i < this.size; i++) {
            let key = this._keys[i];
            this._indexes.set(key, i);
        }
    }

    _sorter(key_1, key_2) {
        let value_1 = this.get(key_1);
        let value_2 = this.get(key_2);

        return value_1 > value_2 ? this.sort_order : (value_1 < value_2 ? -this.sort_order : 0);
    }


    clear() {
        super.clear();
        this._keys.length = 0;
        this._indexes.clear();
    }

    constructor(entries = []) {
        super();

        this.fill(entries);
    }

    delete(arg) {
        let items_deleted = new Map();
        let keys = arg instanceof Array ? arg : [arg];

        for (let key of keys) {
            if (!this.has(key)) continue;

            let item = this.get(key);
            items_deleted.set(key, item);

            super.delete(key);
            this._keys[this._indexes.get(key)] = undefined;
            this._indexes.delete(key);
        }

        if (items_deleted.size) {
            keys = this._keys.filter((item) => item !== undefined);
            this._keys.length = 0;
            this._keys.push(...keys);
        }

        return items_deleted;
    }

    delete_index(arg) {
        let indexes = arg instanceof Array ? arg : [arg];
        let keys = indexes.map((item) => this._keys[index]);

        return this.delete(keys);
    }

    fill(entries) {
        this.clear();

        for (let [key, value] of entries) {
            this.set(key, value);
        }
    }

    get_index(index) {
        return this.get(this._keys[index]);
    }

    index__get(key) {
        return this._indexes.get(key);
    }

    key__get(index) {
        return this._keys[index];
    }

    move(index_from, index_to, count = 1) {
        index_from = Math.min(index_from || 0, this.size - 1);
        index_to = index_to < 0 ? this.size + index_to : index_to || 0;

        if (index_from == index_to) return false;

        let keys = this._keys.splice(index_from, count);
        this._keys.splice(index_to, 0, ...keys);
        this._indexes__define();

        return true;
    }

    move_key(key_from, key_to, count = 1) {
        let index_from = this._indexes.get(key_from);
        let index_to = this._indexes.get(key_to);
        this.move(index_from, index_to, count);
    }

    // set(key, value) {
    //     let b = this.has(key);
    //     super.set(key, value);

    //     if (!b) {
    //         this._indexes.set(key, this.size - 1);
    //         this._keys.push(key);
    //     }

    //     return this;
    // }

    set(arg_1, arg_2 = null, arg_3 = null) {
        let entries = null;
        let index = null;

        if (arg_1 instanceof Array) {
            entries = arg_1;
            index = arg_2;
        }
        else {
            entries = [[arg_1, arg_2]];
            index = arg_3;
        }

        index ??= Infinity;

        let keys_new = [];

        for (let [key, value] of entries) {
            let b = this.has(key);
            super.set(key, value);

            if (b) continue;

            keys_new.push(key);
        }

        if (!keys_new.length) return;

        this._keys.splice(index, 0, ...keys_new);
        this._indexes__define();
    }

    sort(sorter = null) {
        this._keys.sort(sorter || this.sorter);
        this._indexes__define();
    }
}
