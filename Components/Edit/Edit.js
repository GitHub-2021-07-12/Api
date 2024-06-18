// 10.04.2024


import {Component} from '../Component/Component.js';


export class Edit extends Component {
    static _attributes = {
        ...super._attributes,

        _focused: false,
        _invalid: false,
        _notEmpty: false,

        button_clear: false,
        button_mask: false,
        disabled: false,
        dragAndDrop: false,
        length_max: {
            default: Infinity,
            range: [0, Infinity],
        },
        mask_char: '●',
        masked: false,
        placeholder: '',
        regExp: '',
        template: '',
        template_char: '_',
    };

    static _elements = {
        button_clear: '',
        button_mask: '',
        input: '',
    };


    static css_url = true;
    static html_url = true;
    static url = import.meta.url;

    static resources = {
        button_clear: new URL(`${this.name}.svg#cross`, this.url),
        button_mask__off: new URL(`${this.name}.svg#eye_open`, this.url),
        button_mask__on: new URL(`${this.name}.svg#eye_closed`, this.url),
    };


    static {
        this.define();
    }


    _chars = [];
    _dragTarget = null;
    _event_data = '';
    _history = [];
    _input_value = '';
    _regExp = new RegExp();
    _selection_begin = -1;
    _selection_end = -1;
    _value = '';


    get _focused() {
        return this._attributes._focused;
    }
    set _focused(focused) {
        this._attribute__set('_focused', focused);
    }

    get _invalid() {
        return this._attributes._invalid;
    }
    set _invalid(invalid) {
        this._attribute__set('_invalid', invalid);
    }

    get _notEmpty() {
        return this._attributes._notEmpty;
    }
    set _notEmpty(notEmpty) {
        this._attribute__set('_notEmpty', notEmpty);
    }


    get button_clear() {
        return this._attributes.button_clear;
    }
    set button_clear(button_clear) {
        this._attribute__set('button_clear', button_clear);
    }

    get button_mask() {
        return this._attributes.button_mask;
    }
    set button_mask(button_mask) {
        this._attribute__set('button_mask', button_mask);
    }

    get disabled() {
        return this._attributes.disabled;
    }
    set disabled(disabled) {
        this._attribute__set('disabled', disabled);
        this._elements.input.disabled = this.disabled;
    }

    get dragAndDrop() {
        return this._attributes.dragAndDrop;
    }
    set dragAndDrop(dragAndDrop) {
        this._attribute__set('dragAndDrop', dragAndDrop);
    }

    get length_max() {
        return this._attributes.length_max;
    }
    set length_max(length_max) {
        this._attribute__set('length_max', length_max);
    }

    get mask_char() {
        return this._attributes.mask_char;
    }
    set mask_char(mask_char) {
        if (mask_char != null) {
            mask_char = this._string_chars__get(mask_char + '')[0];
        }

        this._attribute__set('mask_char', mask_char);

        if (this.masked) {
            this._elements.input.value = this._value_masked__get();
        }
    }

    get masked() {
        return this._attributes.masked;
    }
    set masked(masked) {
        this._attribute__set('masked', masked);
        this.value = this.value;
    }

    get placeholder() {
        return this._attributes.placeholder;
    }
    set placeholder(placeholder) {
        this._attribute__set('placeholder', placeholder);
        this._elements.input.placeholder = this.placeholder;
    }

    get regExp() {
        return this._regExp;
    }
    set regExp(regExp) {
        if (regExp instanceof RegExp) {
            this._regExp = regExp;
            this._attribute__set('regExp', this._regExp.toString().replace(/^\/|\/\w*$/g, ''));
        }
        else {
            regExp ??= '';
            this._regExp = new RegExp(regExp);
            this._attribute__set('regExp', regExp);
        }
    }

    get template() {
        return this._attributes.template;
    }
    set template(template) {
        this._attribute__set('template', template);
    }

    get template_char() {
        return this._attributes.template_char;
    }
    set template_char(template_char) {
        template_char = this._string_chars__get(template_char + '')[0];
        this._attribute__set('template_char', template_char);
    }

    get value() {
        return this._value;
    }
    set value(value) {
        this._value = value + '';
        this._chars = this._string_chars__get(this._value);
        this._elements.input.value = this.masked ? this._value_masked__get() : this._value;

        this._invalid = false;
        this._notEmpty = !!this._value;
    }


    async _button_clear__on_pointerDown(event) {
        event.preventDefault();

        this.value = '';
    }

    _button_mask__on_pointerDown(event) {
        event.preventDefault();

        this.masked = !this.masked;
    }

    _eventListeners__define() {
        this.addEventListener('touchstart', this._on_touchStart);
        this._elements.button_clear.addEventListener('pointerdown', this._button_clear__on_pointerDown.bind(this));
        this._elements.button_mask.addEventListener('pointerdown', this._button_mask__on_pointerDown.bind(this));
        this.constructor.eventListeners__add(
            this._elements.input,
            {
                beforeinput: this._input__on_beforeInput.bind(this),
                blur: this._input__on_blur.bind(this),
                compositionend: this._input__on_compositionEnd.bind(this),
                compositionstart: this._input__on_compositionStart.bind(this),
                dragend: this._input__on_dragEnd.bind(this),
                dragstart: this._input__on_dragStart.bind(this),
                drop: this._input__on_drop.bind(this),
                focus: this._input__on_focus.bind(this),
                input: this._input__on_input.bind(this),
                pointerdown: this._input__on_pointerDown.bind(this),
            },
        );
    }

    _init() {
        this.props__sync('disabled', 'mask_char', 'placeholder', 'regExp', 'template_char');
    }

    _input__on_beforeInput(event) {
        if (event.inputType == 'insertCompositionText' || event.inputType.startsWith('history')) {
            event.preventDefault();

            return;
        }

        this._event_data = event.data;
        this._input_value = this._elements.input.value;
        this._selection_begin = this._elements.input.selectionStart;
        this._selection_end = this._elements.input.selectionEnd;
    }

    _input__on_blur() {
        this._focused = false;
    }

    _input__on_compositionEnd(event) {
        if (!event.data) return;

        this._value__change(event.data, event.inputType);
    }

    _input__on_compositionStart() {
        this._input_value = this._elements.input.value;
        this._selection_begin = this._elements.input.selectionStart;
        this._selection_end = this._elements.input.selectionEnd;
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

    _input__on_input(event) {
        if (event.inputType == 'insertCompositionText') return;

        this._value__change(this._event_data, event.inputType);
    }

    _input__on_pointerDown(event) {
        if (this.dragAndDrop || !event.ctrlKey) return;

        this._elements.input.setSelectionRange(0, 0);
    }

    _on_touchStart(event) {
        event.stopPropagation();
    }

    _string_chars__get(string, position_begin = 0, position_end = undefined) {
        return string?.slice(position_begin, position_end).match(/\p{RGI_Emoji}|./gv) || [];
    }

    _value__change(data, inputType = '') {
        let input_chars_left = this._string_chars__get(this._input_value, 0, this._selection_begin);
        let input_chars_right = this._string_chars__get(this._input_value, this._selection_end);
        let chars_left = this._chars.slice(0, input_chars_left.length);
        let chars_right = this._chars.slice(this._chars.length - input_chars_right.length);

        if (this._selection_begin == this._selection_end) {
            if (inputType == 'deleteContentBackward') {
                chars_left.pop();
            }
            else if (inputType == 'deleteContentForward') {
                chars_right.shift();
            }
            else if (this._chars.length >= this.length_max) {
                data = '';
            }
        }

        chars_left.push(...this._string_chars__get(data));
        this.value = [...chars_left, ...chars_right].slice(0, this.length_max).join('');
        this._elements.input.selectionStart = this.masked ? chars_left.length * this.mask_char.length : chars_left.join('').length;
        this._elements.input.selectionEnd = this._elements.input.selectionStart;
    }

    _value_masked__get() {
        return Array(this._chars.length + 1).join(this.mask_char);
    }


    blur() {
        this._elements.input.blur();
    }

    focus() {
        this._elements.input.focus();
    }

    validate() {
        let valid = this.regExp.test(this.value);
        this._invalid = !valid;

        return valid;
    }
}
