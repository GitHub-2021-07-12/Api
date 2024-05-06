import {Component} from '../Component_new.js';


export class A extends Component {
    static _attributes = {};
    // static _html_url = `${import.meta.url}/../${this.name}.html`;
    static _html_url = new URL(`${this.name}.html`, import.meta.url);
    // static _url = import.meta.url;

    static _resources = {
        // 'resource.css': () => `${import.meta.url}/../${this.name}.css`,
        'resource.css': () => new URL(`${this.name}.css`, import.meta.url),
    };


    _init() {
        console.log(this.css__get('color'))
    }
}
