import {Component} from '../Component/Component.js';


export class Svg extends Component {
    static _attributes = {
        ...super._attributes,

        _loading: false,


        url: '',
    };

    static _elements = {
        content: '',
        resource: '',
    };

    static _eventListeners_elements = {
        resource: {
            load: '_resource__on_load',
        },
    };


    static css_url = true;
    static html_url = true;
    static url = import.meta.url;


    static {
        this.define();
    }


    _resource = null;
    _resource_root = null;


    get _loading() {
        return this._attributes._loading;
    }
    set _loading(loading) {
        this._attribute__set('_loading', loading);
    }


    get url() {
        return this._attributes.url;
    }
    set url(url) {
        if (!url) return;

        this._loading = true;
        this._elements.resource.data = url;
        this._attribute__set('url', this._elements.resource.data);
    }


    _init() {
        this.props__sync('url');
    }

    _resource__on_load() {
        this._loading = false;
        this._resource_content__extract();
        this.event__dispatch('load');
    }

    _resource_content__extract() {
        this._resource_root = this._elements.resource.contentDocument.rootElement;
        this._elements.resource.data = '';

        if (!this._resource_root) return;

        let element = this._resource_root;
        let element_id = this.url.match(/#\S+$/)?.[0];

        if (element_id) {
            element = this._resource_root.querySelector(element_id);
        }

        this._elements.content.textContent = '';
        this._elements.content.append(element);
    }
}
