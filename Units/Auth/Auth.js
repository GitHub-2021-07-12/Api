// 15.05.2024

import {Rest} from '../Rest/Rest.js';


export class Auth {
    _rest = new Rest();
    _token = '';


    name = '';
    password = '';
    registration_data = {};


    _token__remove() {
        localStorage.removeItem('Auth.token');
    }

    _token__restore() {
        this._token = localStorage.getItem('Auth.token');
    }

    _token__save() {
        localStorage.setItem('Auth.token', this._token);
    }


    constructor(url) {
        this._rest.data__get = () => ({token: this._token});
        this._rest.url = url;

        this._token__restore();
    }

    async logIn() {
        let {result} = await this._rest.call('logIn', this.name, this.password);

        this._token = result || '';
        this._token__save();
    }

    async logOut() {
        await this._rest.call('logOut', this._token);

        this._token = '';
        this._token__remove();
    }

    async register() {
        let {result} = await this._rest.call('register', this.name, this.password, this.registration_data);

        this._token = result || '';
        this._token__save();
    }

    async verify() {
        if (!this._token) return false;

        let {result} = await this._rest.call('verify', this._token);

        return !!result;
    }
}
