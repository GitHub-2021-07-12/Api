import {Component} from '../Component/Component.js';
import {Edit} from '../Edit/Edit.js';
import {Flickable} from '../Flickable/Flickable.js';
import {Repeater} from '../Repeater/Repeater.js';


export class Select extends Component {
    // static _components = [Edit, Flickable, Repeater];
    static _components = [Edit, Flickable];

    static _attributes = {
        ...super._attributes,

        open: false,
    };

    static _elements = {
        edit: '',
        flickable: '',
        list: '',
        repeater: '',

        // dialog: 'dialog',
        // popover: '[popover]',
    };


    static css_url = true;
    static html_url = true;
    static url = import.meta.url;


    static {
        this.define();
    }


    get open() {
        return this._attributes.open;
    }
    set open(open) {
        this._attribute__set('open', open);
    }


    _eventListeners__define() {
        // this._elements.list.addEventListener('blur', () => {
        //     // console.log(document.activeElement)

        //     if (document.activeElement == this._elements.edit._elements.input) return;

        //     // this._elements.dialog.close();
        // });
        this.addEventListener('focusin', (event) => {
            // this._elements.dialog.show();
            // this._elements.edit.focus();
            // requestAnimationFrame(() => this._elements.popover.showPopover());

            // this._elements.popover.popover = 'manual';
            // this._elements.popover.showPopover();
            // this._elements.dialog.style.display = 'block';
            // this._elements.popover.togglePopover(true);
            // this._elements.popover.popover = 'auto';
            // setTimeout(() => this._elements.popover.popover = 'auto', 1e3);

            // console.log(document.activeElement)

            // event.preventDefault()

            this.open = true;
        });
        // this._elements.list.addEventListener('focusin', (event) => {
        //     console.log(1)
        // });
        this.addEventListener('focusout', (event) => {
            // this._elements.dialog.style.display = '';
            this.open = false;
            // console.log(2)
        });
        // this._elements.edit.addEventListener('blur', (event) => {
        //     // this._elements.dialog.style.display = '';
        //     this.open = false;
        //     console.log(2)
        // });
    }

    _init() {
        this._elements.repeater.delegate = this.querySelector('[Select__delegate]');
        this._elements.repeater.model = 10;
        this._elements.repeater.refresh();

        this._elements.flickable.refresh();

        // this._elements.popover.showPopover();
    }
}
