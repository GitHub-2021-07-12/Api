import {Component} from '../Component/Component.js';
import {Edit} from '../Edit/Edit.js';
import {Flickable} from '../Flickable/Flickable.js';
import {Repeater} from '../Repeater/Repeater.js';


export class Select extends Component {
    static _components = [Edit, Flickable, Repeater];

    static _attributes = {
        ...super._attributes,

        editable: false,
        open: false,
    };

    static _elements = {
        edit: '',
        flickable: '',
        list: '',
        repeater: '',
    };

    static _eventListeners = {
        focusin: '_on_focusIn',
        focusout: '_on_focusOut',
    };

    static _eventListeners_elements = {
        repeater: {
            define: '_repeater__on_define',
        },
    };


    static css_url = true;
    static html_url = true;
    static url = import.meta.url;


    static {
        this.define();
    }


    get editable() {
        return this._attributes.editable;
    }
    set editable(editable) {
        this._attribute__set('editable', editable);
        this._elements.edit.disabled = !this.editable;
    }

    get open() {
        return this._attributes.open;
    }
    set open(open) {
        this._attribute__set('open', open);
    }


    _init() {
        // this._elements.repeater.delegate = this.querySelector('[Select__delegate]');
        // this._elements.repeater.model = 10;
        this._elements.repeater.model = this.querySelector('[Select__model]');

        this._elements.edit.value = 'Item_0';

        this.props__sync('editable');
        this.refresh();
    }

    _on_focusIn() {
        this.open = true;
        this._elements.flickable.refresh();
    }

    _on_focusOut() {
        this.open = false;
    }

    _repeater__on_define() {
        this._elements.flickable.refresh();
    }


    async refresh() {
        await this._elements.repeater.refresh();
        this._elements.flickable.refresh();
    }
}
