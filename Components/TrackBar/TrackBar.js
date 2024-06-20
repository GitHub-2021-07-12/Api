// 18.03.2021


import {Component} from '../Component/Component.js';
import {Draggable} from '../Draggable/Draggable.js';

import {Common} from '../../Units/Common/Common.js';


export class TrackBar extends Component {
    static _components = [Draggable];

    static _attributes = {
        ...super._attributes,

        disabled: false,
        gain: {
            default: 1,
            range: [0, Infinity],
        },
        shift: {
            default: 1,
            range: [1, Infinity],
        },
        shift_jump: false,
        value_max: {
            default: 0,
            persistent: true,
        },
        value_min: {
            default: 0,
            persistent: true,
        },
        value: {
            default: 0,
            persistent: true,
        },
        vertical: false,
    };

    static _elements = {
        puck: '',
        track: '',
    };


    static css_url = true;
    static html_url = true;
    static url = import.meta.url;


    static {
        this.define();
    }


    _puck_length = 0;
    _track_length = 0;


    get disabled() {
        return this._attributes.disabled;
    }
    set disabled(disabled) {
        this._attribute__set('disabled', disabled);
        this._elements.puck.disabled = this.disabled;
    }

    get gain() {
        return this._attributes.gain;
    }
    set gain(gain) {
        this._attribute__set('gain', gain);
        this._elements.puck.gain = this.gain;
    }

    get shift() {
        return this._attributes.shift;
    }
    set shift(shift) {
        this._attribute__set('shift', shift);
        this._elements.puck.shift = this.shift;
    }

    get shift_jump() {
        return this._attributes.shift_jump;
    }
    set shift_jump(shift_jump) {
        this._attribute__set('shift_jump', shift_jump);
        this._elements.puck.shift_jump = this.shift_jump;
    }

    get value() {
        return this._attributes.value;
    }
    set value(value) {
        value = Common.to_range(Math.round(value), this.value_min, this.value_max);
        this._attribute__set('value', value);
        this._puck_position__define();
    }

    get value_max() {
        return this._attributes.value_max;
    }
    set value_max(value_max) {
        let freeSpace_length = this._track_length - this._puck_length;

        if (value_max > this.value_min) {
            value_max = Math.min(value_max, this.value_min + freeSpace_length);
            this._attribute__set('value_max', value_max);

            this._puck_step__define();
            this.value = this.value;
        }
        else {
            this._attribute__set('value_max', freeSpace_length);

            if (this.value_max) {
                this.value_min = 0;
            }
            else {
                this.value = 0;
            }
        }
    }

    get value_min() {
        return this._attributes.value_min;
    }
    set value_min(value_min) {
        let freeSpace_length = this._track_length - this._puck_length;

        if (value_min < this.value_max) {
            value_min = Math.max(value_min, this.value_max - freeSpace_length);
            this._attribute__set('value_min', value_min);

            this._puck_step__define();
            this.value = this.value;
        }
        else {
            this.value_max = freeSpace_length;
            this._attribute__set('value_min', 0);
        }
    }

    get vertical() {
        return this._attributes.vertical;
    }
    set vertical(vertical) {
        this._attribute__set('vertical', vertical);
        this._elements.puck.axis = this.vertical ? 'y' : 'x';
        this._puck_position__define();
    }

    _eventListeners__define() {
        this._elements.puck.addEventListener('drag', this._puck__on_drag.bind(this));
    }

    _init() {
        this.props__sync('vertical');
        this.refresh();
    }

    _puck__on_drag() {
        let puck_position = this.vertical ? this._elements.puck._position.y : this._elements.puck._position.x;
        this.value = this.value_min + puck_position / this._elements.puck.step;

        this.event__dispatch('change');
    }

    _puck_position__define() {
        let puck_position = Math.round(this._elements.puck.step * (this.value - this.value_min));

        if (this.vertical) {
            this._elements.puck.left__set();
            this._elements.puck.top__set(puck_position);
        }
        else {
            this._elements.puck.left__set(puck_position);
            this._elements.puck.top__set();
        }
    }

    _puck_step__define() {
        this._elements.puck.step = this.value_max > this.value_min ? (this._track_length - this._puck_length) / (this.value_max - this.value_min) : 1;
    }


    puck_length__define() {
        this._puck_length = this.vertical ? this._elements.puck.height_outer__get() : this._elements.puck.width_outer__get();
    }

    refresh() {
        if (!this.visible__get()) return;

        this.puck_length__define();
        this.track_length__define();
        this.props__sync('value_max', 'value_min');
    }

    track_length__define() {
        this._track_length = this.vertical ? this.constructor.height_inner__get(this._elements.track) : this.constructor.width_inner__get(this._elements.track);
    }
}
