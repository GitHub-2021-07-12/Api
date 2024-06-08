import {Component} from '../Component/Component.js';
import {Edit} from '../Edit/Edit.js';
import {Flickable} from '../Flickable/Flickable.js';
import {Repeater} from '../Repeater/Repeater.js';


export class Select extends Component {
    static _components = [Edit, Flickable, Repeater];

    static _elements = {
        edit: '',
        repeater: '',
    };


    static css_url = true;
    static html_url = true;
    static url = import.meta.url;


    static {
        this.define();
    }


    _eventListeners__define() {

    }

    _init() {
        this._elements.repeater.delegate = this.querySelector('[Select__delegate]');
        this._elements.repeater.refresh();

        this._elements.repeater.model = 10;
    }
}
