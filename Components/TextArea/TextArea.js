// 23.04.2024


import {Component} from '../Component/Component.js';
import {Flickable} from '../Flickable/Flickable.js';

import {Common} from '../../Units/Common/Common.js';


export class TextArea extends Component {
    static _components = [Flickable];

    static _attributes = {
        ...super._attributes,

        _focused: false,

        disabled: false,
        dragAndDrop: false,
        placeholder: '',
        spellCheck: false,
    };

    static _elements = {
        flickable: '',
        input: '',
    };


    static css_url = true;
    static html_url = true;
    static url = import.meta.url;


    static {
        this.define();
    }


    _dragTarget = null;
    _input_scrollHeight_prev = 0;
    _input_scrollWidth_prev = 0;


    get _focused() {
        return this._attributes._focused;
    }
    set _focused(focused) {
        this._attribute__set('_focused', focused);
    }


    get dragAndDrop() {
        return this._attributes.dragAndDrop;
    }
    set dragAndDrop(dragAndDrop) {
        this._attribute__set('dragAndDrop', dragAndDrop);
    }

    get disabled() {
        return this._attributes.disabled;
    }
    set disabled(disabled) {
        this._attribute__set('disabled', disabled);
        this._elements.input.disabled = this.disabled;
    }

    get placeholder() {
        return this._attributes.placeholder;
    }
    set placeholder(placeholder) {
        this._attribute__set('placeholder', placeholder);
        this._elements.input.placeholder = this.placeholder;
    }

    get spellCheck() {
        return this._attributes.spellCheck;
    }
    set spellCheck(spellCheck) {
        this._attribute__set('spellCheck', spellCheck);
        this._elements.input.spellcheck = this.spellCheck;
    }

    get value() {
        return this._elements.input.value;
    }
    set value(value) {
        this._elements.input.value = value;
        this.refresh();
    }


    _eventListeners__define() {
        this.addEventListener('touchstart', this._on_touchStart);
        this.constructor.eventListeners__add(
            this._elements.input,
            {
                beforeinput: this._input__on_beforeInput.bind(this),
                blur: this._input__on_blur.bind(this),
                dragend: this._input__on_dragEnd.bind(this),
                dragstart: this._input__on_dragStart.bind(this),
                drop: this._input__on_drop.bind(this),
                focus: this._input__on_focus.bind(this),
                input: this._input__on_input.bind(this),
                pointerdown: this._input__on_pointerDown.bind(this),
            },
        );
    }

    _height__define() {
        this.constructor.height_outer__set(this._elements.input, 1);
        this.height_outer__set(this._elements.input.scrollHeight);
        this.constructor.height_outer__set(this._elements.input);
    }

    _init() {
        this.props__sync('disabled', 'placeholder', 'spellCheck');
        this.refresh();
    }

    _input__on_beforeInput() {
        this._input_scrollHeight_prev = this._elements.input.scrollHeight;
        this._input_scrollWidth_prev = this._elements.input.scrollWidth;
    }

    _input__on_blur() {
        this._focused = false;
    }

    _input__on_dragEnd() {
        this._dragTarget = null;
    }

    _input__on_dragStart(event) {
        if (!this.dragAndDrop) {
            event.preventDefault();

            return;
        }

        this._dragTarget = event.target;
    }

    _input__on_drop(event) {
        if (event.target != this._dragTarget) return;

        event.preventDefault();
    }

    _input__on_focus() {
        this._focused = true;
    }

    _input__on_input() {
        this._height__define();
        this.event__dispatch('input');

        if (this._elements.input.scrollHeight == this._input_scrollHeight_prev && this._elements.input.scrollWidth == this._input_scrollWidth_prev) return;

        this._elements.flickable.refresh();
        this.event__dispatch('resize');
    }

    _input__on_pointerDown(event) {
        if (this.dragAndDrop || !event.ctrlKey) return;

        this._elements.input.setSelectionRange(0, 0);
    }

    _on_touchStart(event) {
        event.stopPropagation();
    }


    refresh() {
        this._height__define();
        this._elements.flickable.refresh();
    }
}
