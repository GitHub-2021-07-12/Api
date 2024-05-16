// 15.05.2024

import {Rest} from '../Rest/Rest.js';


export class Auth {
    _rest = new Rest(`./${this.constructor.name}.php`);
    _token = '';


    data = {};
    name = '';
    password = '';


    _token__remove() {
        localStorage.removeItem('Auth.token');
    }

    _token__restore() {
        this._token = localStorage.getItem('Auth.token');
    }

    _token__save() {
        localStorage.setItem('Auth.token', this._token);
    }


    constructor() {
        this._token__restore();
    }

    async logIn() {
        let {result} = await this._rest.call('logIn', this.name, this.password);

        this._token = result?.token ?? '';
        this._token__save();
    }

    async logOut() {
        let {result} = await this._rest.call('logOut', this._token);

        this._token__remove();
    }

    async register() {
        let {result} = await this._rest.call('register', this.name, this.password, this.data);

        this._token = result?.token ?? '';
        this._token__save();
    }

    async verify() {
        let {result} = await this._rest.call('verify', this._token);

        return !!result;
    }
}
