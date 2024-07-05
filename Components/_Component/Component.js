import {Component} from '../Component/Component.js';


export class Component_new extends Component {
    static _attributes = {};
    static _elements = {};
    static _eventListeners = {};

    static css_url = true;
    static html_url = true;
    static url = import.meta.url;


    static {
        this.define();
    }


    _init() {

    }
}
