import {Component} from '../Component/Component.js';


export class Svg extends Component {
    static _attributes = {
        url: '',
    };
    // static _elements = {};
    // static _eventListeners = {};

    // static css_url = true;
    // static html_url = true;
    // static url = import.meta.url;


    static {
        this.define();
    }


    _resource = null;


    get url() {
        return this._attributes.url;
    }
    set url(url) {
        if (!url) return;

        this._attribute__set('url', url);
        this._resource__load();
    }


    _init() {
        this._resource__create();
        this.props__sync('url');
    }

    _resource__create() {
        this._resource = document.createElement('object');
        this._resource.style.display = 'block';
        this._resource.style.height = '0';
        this._resource.style.width = '0';
        this._resource.addEventListener('load', this._resource__on_load.bind(this));
    }

    _resource__load() {
        this._resource.data = this.url;
        this.append(this._resource);
    }

    _resource__on_load() {
        this._resource_content__extract();
    }

    _resource_content__extract() {
        let svg = this._resource.contentDocument.documentElement;
        let svg_id = this.url.match(/#\S+$/)?.[0];

        if (svg_id) {
            svg = svg.querySelector(svg_id);
        }

        this.textContent = '';
        this.append(svg);
    }
}
